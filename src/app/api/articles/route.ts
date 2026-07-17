/**
 * CMS API — Articles (Berita)
 * GET  /api/articles?limit=10&featured=true&slug=xxx           — public list/detail
 * GET  /api/articles?admin=true                                 — admin list (incl. drafts)
 * GET  /api/articles?id=xxx                                     — admin detail by ID
 * POST /api/articles                                            — create (admin+)
 * PATCH /api/articles?id=xxx                                    — update (admin+)
 * DELETE /api/articles?id=xxx                                   — delete (admin+)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  const id = url.searchParams.get('id')
  const limit = Number(url.searchParams.get('limit') ?? '10')
  const featured = url.searchParams.get('featured')
  const admin = url.searchParams.get('admin') === 'true'

  // Admin detail by ID
  if (id) {
    const user = await getSessionUser(req)
    if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const article = await db.article.findUnique({
      where: { id },
      include: { author: { select: { name: true, email: true } } },
    })
    if (!article) return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ article })
  }

  // Public detail by slug
  if (slug) {
    const article = await db.article.findUnique({
      where: { slug },
      include: { author: { select: { name: true, email: true } } },
    })
    if (!article || (!article.isPublished && !admin)) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }
    if (article.isPublished) {
      await db.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
    }
    return NextResponse.json({ article: { ...article, viewCount: article.viewCount + 1 } })
  }

  // Admin list — include unpublished
  if (admin) {
    const user = await getSessionUser(req)
    if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const articles = await db.article.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(limit, 200),
    })
    return NextResponse.json({ articles, total: articles.length })
  }

  // Public list
  const articles = await db.article.findMany({
    where: {
      isPublished: true,
      ...(featured === 'true' ? { isFeatured: true } : {}),
    },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })
  return NextResponse.json({ articles })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — minimal Pengurus' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, excerpt, content, category, tags, isFeatured, isPublished, publishedAt, featuredImage } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title dan content wajib diisi' }, { status: 400 })
    }

    // Generate unique slug
    let baseSlug = slugify(body.slug || title)
    if (!baseSlug) baseSlug = `artikel-${Date.now()}`
    let slug = baseSlug
    let counter = 1
    while (await db.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const article = await db.article.create({
      data: {
        slug,
        title,
        excerpt: excerpt || '',
        content,
        featuredImage: featuredImage || null,
        category: category || 'Umum',
        tags: tags || null,
        isFeatured: !!isFeatured,
        isPublished: isPublished !== false,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        authorId: user.id,
      },
      include: { author: { select: { name: true } } },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'ARTICLE_CREATE', description: `Created article: ${title}` },
    })

    return NextResponse.json({ article }, { status: 201 })
  } catch (e: any) {
    console.error('Article create error:', e)
    return NextResponse.json({ error: 'Gagal membuat artikel' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.article.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { title, excerpt, content, category, tags, isFeatured, isPublished, publishedAt, featuredImage, slug } = body

    // If slug changed, ensure unique
    let newSlug = existing.slug
    if (slug && slug !== existing.slug) {
      newSlug = slugify(slug)
      const conflict = await db.article.findUnique({ where: { slug: newSlug } })
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ error: 'Slug sudah digunakan artikel lain' }, { status: 400 })
      }
    }

    const updated = await db.article.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug: newSlug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isPublished !== undefined && { isPublished }),
        ...(publishedAt !== undefined && { publishedAt: new Date(publishedAt) }),
        ...(featuredImage !== undefined && { featuredImage }),
      },
      include: { author: { select: { name: true } } },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'ARTICLE_UPDATE', description: `Updated article: ${existing.title}` },
    })

    return NextResponse.json({ article: updated })
  } catch (e: any) {
    console.error('Article update error:', e)
    return NextResponse.json({ error: 'Gagal update artikel' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.article.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })

  await db.article.delete({ where: { id } })
  await db.auditLog.create({
    data: { userId: user.id, action: 'ARTICLE_DELETE', description: `Deleted article: ${existing.title}` },
  })

  return NextResponse.json({ ok: true })
}
