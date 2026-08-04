/**
 * CMS API — Digital Library (Perpustakaan Digital)
 * GET  /api/library?limit=20&category=BUKU   — public list with optional category filter
 * GET  /api/library?slug=xxx                  — public detail by slug
 * GET  /api/library?admin=true                — admin list (incl. unpublished)
 * GET  /api/library?id=xxx                    — admin detail by ID
 * POST /api/library                            — create (admin+)
 * PATCH /api/library?id=xxx                    — update (admin+)
 * DELETE /api/library?id=xxx                   — delete (admin+)
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

const ALLOWED_CATEGORIES = [
  'BUKU',
  'EBOOK',
  'JURNAL',
  'PEDOMAN',
  'REGULASI',
  'SOP',
  'TEMPLATE',
  'PRESENTASI',
  'MAJALAH',
  'VIDEO',
  'AUDIO',
]

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  const id = url.searchParams.get('id')
  const limit = Number(url.searchParams.get('limit') ?? '20')
  const category = url.searchParams.get('category')
  const admin = url.searchParams.get('admin') === 'true'

  // Helper to fetch direct accessLevel values from database
  const getRawAccessMap = async (): Promise<Map<string, string>> => {
    const map = new Map<string, string>()
    try {
      const rows: any[] = await db.$queryRaw`SELECT id, accessLevel FROM LibraryItem`
      for (const r of rows) {
        if (r.id && r.accessLevel) map.set(r.id, String(r.accessLevel))
      }
    } catch {}
    return map
  }

  // Admin detail by ID
  if (id) {
    const user = await getSessionUser(req)
    if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const item: any = await db.libraryItem.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })
    const accessMap = await getRawAccessMap()
    item.accessLevel = item.accessLevel || accessMap.get(item.id) || 'PUBLIK'
    return NextResponse.json({ item })
  }

  // Public detail by slug
  if (slug) {
    const item: any = await db.libraryItem.findUnique({ where: { slug } })
    if (!item || (!item.isPublished && !admin)) {
      return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })
    }
    const accessMap = await getRawAccessMap()
    item.accessLevel = item.accessLevel || accessMap.get(item.id) || 'PUBLIK'
    if (item.isPublished) {
      await db.libraryItem.update({ where: { id: item.id }, data: { viewCount: { increment: 1 } } })
    }
    return NextResponse.json({ item: { ...item, viewCount: item.viewCount + 1 } })
  }

  // Admin list — include unpublished
  if (admin) {
    const user = await getSessionUser(req)
    if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const items = await db.libraryItem.findMany({
      where: category && category !== 'ALL' ? { category: category as any } : {},
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200),
    })
    const accessMap = await getRawAccessMap()
    const mapped = items.map((i: any) => ({
      ...i,
      accessLevel: i.accessLevel || accessMap.get(i.id) || 'PUBLIK',
    }))
    return NextResponse.json({ items: mapped, total: items.length })
  }

  // Public list
  const items = await db.libraryItem.findMany({
    where: {
      isPublished: true,
      ...(category && category !== 'ALL' ? { category: category as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  const accessMap = await getRawAccessMap()
  const mapped = items.map((i: any) => ({
    ...i,
    accessLevel: i.accessLevel || accessMap.get(i.id) || 'PUBLIK',
  }))
  return NextResponse.json({ items: mapped })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — minimal Pengurus' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const {
      title,
      slug: bodySlug,
      description,
      category,
      author,
      publisher,
      year,
      pages,
      tags,
      coverImage,
      fileUrl,
      fileSize,
    } = body

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'title, description, category wajib diisi' }, { status: 400 })
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'category tidak valid' }, { status: 400 })
    }

    // Generate unique slug
    let baseSlug = slugify(bodySlug || title)
    if (!baseSlug) baseSlug = `library-${Date.now()}`
    let slug = baseSlug
    let counter = 1
    while (await db.libraryItem.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    let item: any
    const accessLvl = body.accessLevel || 'PUBLIK'

    try {
      item = await db.libraryItem.create({
        data: {
          slug,
          title,
          description,
          category: category as any,
          author: author || null,
          publisher: publisher || null,
          year: typeof year === 'number' ? year : null,
          pages: typeof pages === 'number' ? pages : null,
          tags: tags || null,
          coverImage: coverImage || null,
          fileUrl: fileUrl || null,
          fileSize: typeof fileSize === 'number' ? fileSize : null,
          isPublished: body.isPublished !== false,
          accessLevel: accessLvl as any,
        },
      })
    } catch {
      item = await db.libraryItem.create({
        data: {
          slug,
          title,
          description,
          category: category as any,
          author: author || null,
          publisher: publisher || null,
          year: typeof year === 'number' ? year : null,
          pages: typeof pages === 'number' ? pages : null,
          tags: tags || null,
          coverImage: coverImage || null,
          fileUrl: fileUrl || null,
          fileSize: typeof fileSize === 'number' ? fileSize : null,
          isPublished: body.isPublished !== false,
        },
      })
    }

    // Always ensure accessLevel column in DB is updated
    try {
      await db.$executeRaw`UPDATE LibraryItem SET accessLevel = ${accessLvl} WHERE id = ${item.id}`
      item.accessLevel = accessLvl
    } catch {}

    await db.auditLog.create({
      data: { userId: user.id, action: 'LIBRARY_CREATE', description: `Created library item: ${title}` },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (e: any) {
    console.error('Library create error:', e)
    return NextResponse.json({ error: 'Gagal membuat item library: ' + (e.message || 'unknown error') }, { status: 500 })
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

  const existing = await db.libraryItem.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const {
      title,
      slug: bodySlug,
      description,
      category,
      author,
      publisher,
      year,
      pages,
      tags,
      coverImage,
      fileUrl,
      fileSize,
      isPublished,
      accessLevel,
    } = body

    if (category && !ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'category tidak valid' }, { status: 400 })
    }

    // If slug changed, ensure unique
    let newSlug = existing.slug
    if (bodySlug && bodySlug !== existing.slug) {
      newSlug = slugify(bodySlug)
      const conflict = await db.libraryItem.findUnique({ where: { slug: newSlug } })
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ error: 'Slug sudah digunakan item lain' }, { status: 400 })
      }
    }

    const updateData: any = {
      ...(title !== undefined && { title }),
      ...(bodySlug !== undefined && { slug: newSlug }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category: category as any }),
      ...(author !== undefined && { author }),
      ...(publisher !== undefined && { publisher }),
      ...(year !== undefined && { year }),
      ...(pages !== undefined && { pages }),
      ...(tags !== undefined && { tags }),
      ...(coverImage !== undefined && { coverImage }),
      ...(fileUrl !== undefined && { fileUrl }),
      ...(fileSize !== undefined && { fileSize }),
      ...(isPublished !== undefined && { isPublished }),
    }

    let updated: any
    try {
      updated = await db.libraryItem.update({
        where: { id },
        data: {
          ...updateData,
          ...(accessLevel !== undefined && { accessLevel: accessLevel as any }),
        },
      })
    } catch {
      updated = await db.libraryItem.update({
        where: { id },
        data: updateData,
      })
    }

    if (accessLevel !== undefined) {
      try {
        await db.$executeRaw`UPDATE LibraryItem SET accessLevel = ${accessLevel} WHERE id = ${id}`
        updated.accessLevel = accessLevel
      } catch {}
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LIBRARY_UPDATE',
        description: `Updated library item: ${existing.title}`,
      },
    })

    return NextResponse.json({ item: updated })
  } catch (e: any) {
    console.error('Library update error:', e)
    return NextResponse.json({ error: 'Gagal update item library: ' + (e.message || 'unknown error') }, { status: 500 })
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

  const existing = await db.libraryItem.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 })

  await db.libraryItem.delete({ where: { id } })
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'LIBRARY_DELETE',
      description: `Deleted library item: ${existing.title}`,
    },
  })

  return NextResponse.json({ ok: true })
}
