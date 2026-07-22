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
    const search = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '20')))
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        include: { author: { select: { name: true } } },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      db.article.count({ where }),
    ])
    return NextResponse.json({
      articles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
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
    const {
      title, excerpt, content, category, tags, isFeatured, isPublished,
      publishedAt, featuredImage,
      // New Phase 4 fields:
      publishStatus, scheduledAt, metaDescription, ogTitle, ogImage, authorId,
    } = body

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

    // Determine isPublished from publishStatus
    const effectiveIsPublished = publishStatus === 'PUBLISHED' ? true : (publishStatus === 'DRAFT' || publishStatus === 'SCHEDULED' ? false : isPublished !== false)

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
        isPublished: effectiveIsPublished,
        publishStatus: publishStatus || 'PUBLISHED',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        authorId: authorId || user.id,
        metaDescription: metaDescription || null,
        ogTitle: ogTitle || null,
        ogImage: ogImage || null,
      },
      include: { author: { select: { name: true, email: true } } },
    })

    // Create initial revision (version 1)
    await db.articleRevision.create({
      data: {
        articleId: article.id,
        version: 1,
        title, excerpt: excerpt || '', content,
        editedById: user.id,
        changeLog: 'Versi awal',
      },
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
    const {
      title, excerpt, content, category, tags, isFeatured, isPublished,
      publishedAt, featuredImage, slug,
      // Phase 4 fields
      publishStatus, scheduledAt, metaDescription, ogTitle, ogImage, authorId,
      changeLog, // optional note for revision
    } = body

    // If slug changed, ensure unique
    let newSlug = existing.slug
    if (slug && slug !== existing.slug) {
      newSlug = slugify(slug)
      const conflict = await db.article.findUnique({ where: { slug: newSlug } })
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ error: 'Slug sudah digunakan artikel lain' }, { status: 400 })
      }
    }

    // Determine isPublished from publishStatus if provided
    let effectiveIsPublished: boolean | undefined = isPublished
    if (publishStatus) {
      effectiveIsPublished = publishStatus === 'PUBLISHED'
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
        ...(effectiveIsPublished !== undefined && { isPublished: effectiveIsPublished }),
        ...(publishStatus !== undefined && { publishStatus }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(publishedAt !== undefined && { publishedAt: new Date(publishedAt) }),
        ...(featuredImage !== undefined && { featuredImage }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription || null }),
        ...(ogTitle !== undefined && { ogTitle: ogTitle || null }),
        ...(ogImage !== undefined && { ogImage: ogImage || null }),
        ...(authorId !== undefined && { authorId }),
      },
      include: { author: { select: { name: true, email: true } } },
    })

    // Auto-create revision if content/excerpt/title changed
    if (title !== undefined || excerpt !== undefined || content !== undefined) {
      const lastRevision = await db.articleRevision.findFirst({
        where: { articleId: id },
        orderBy: { version: 'desc' },
      })
      const nextVersion = (lastRevision?.version ?? 0) + 1
      await db.articleRevision.create({
        data: {
          articleId: id,
          version: nextVersion,
          title: title ?? existing.title,
          excerpt: excerpt ?? existing.excerpt,
          content: content ?? existing.content,
          editedById: user.id,
          changeLog: changeLog || null,
        },
      })
    }

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
