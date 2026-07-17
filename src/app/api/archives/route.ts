/**
 * GET  /api/archives           — list (with role-based filtering)
 * GET  /api/archives?id=xxx    — detail with versions + accesses
 * POST /api/archives           — create new archive (admin+)
 * PATCH /api/archives?id=xxx   — update archive
 * DELETE /api/archives?id=xxx  — delete (super_admin only)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const ROLE_LEVEL: Record<string, number> = {
  ANGGOTA: 1, PENGURUS: 2, ADMINISTRATOR: 3, SUPER_ADMIN: 4,
}
const ACCESS_LEVEL: Record<string, number> = {
  PUBLIK: 0, ANGGOTA: 1, PENGURUS: 2, ADMIN: 3, SUPER_ADMIN: 4,
}

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const category = url.searchParams.get('category')
  const search = url.searchParams.get('search')
  const limit = Number(url.searchParams.get('limit') ?? '50')

  const user = await getSessionUser(req)
  const userLevel = user ? ROLE_LEVEL[user.role] ?? 0 : 0

  if (id) {
    const archive = await db.archive.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { name: true, email: true } },
        versions: {
          include: { uploadedBy: { select: { name: true } } },
          orderBy: { version: 'desc' },
        },
        accesses: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })
    if (!archive) return NextResponse.json({ error: 'Arsip tidak ditemukan' }, { status: 404 })

    // Access control
    if (ACCESS_LEVEL[archive.accessLevel] > userLevel) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses ke arsip ini' }, { status: 403 })
    }

    // Log access (VIEW)
    if (user) {
      await db.archiveAccess.create({
        data: { archiveId: archive.id, userId: user.id, action: 'VIEW', ipAddress: req.headers.get('x-forwarded-for') || undefined },
      })
    }

    return NextResponse.json({ archive })
  }

  // List with role-based filtering
  const where: any = {}
  if (category && category !== 'ALL') where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { archiveNumber: { contains: search } },
      { description: { contains: search } },
    ]
  }

  // Filter by access level
  const allowedLevels = Object.entries(ACCESS_LEVEL)
    .filter(([_, lvl]) => lvl <= userLevel)
    .map(([k]) => k)
  where.accessLevel = { in: allowedLevels }

  const archives = await db.archive.findMany({
    where,
    include: {
      uploadedBy: { select: { name: true } },
      versions: {
        select: { id: true, version: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true, createdAt: true },
        orderBy: { version: 'desc' },
      },
      _count: { select: { versions: true, accesses: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { documentDate: 'desc' }],
    take: limit,
  })

  return NextResponse.json({ archives, total: archives.length })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — minimal Pengurus' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, description, category, documentDate, source, destination, classification, accessLevel, tags } = body

    if (!title || !category || !documentDate) {
      return NextResponse.json({ error: 'Title, category, dan documentDate wajib diisi' }, { status: 400 })
    }

    // Generate archive number: ARC-{CAT}-{YEAR}-{SEQ}
    const year = new Date(documentDate).getFullYear()
    const cat = String(category).slice(0, 8)
    const seq = await db.archive.count({
      where: { category: category as any, documentDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${year + 1}-01-01`) } },
    }) + 1
    const archiveNumber = `ARC-${cat}-${year}-${String(seq).padStart(3, '0')}`

    const archive = await db.archive.create({
      data: {
        archiveNumber,
        title,
        description: description || null,
        category: category as any,
        documentDate: new Date(documentDate),
        source: source || null,
        destination: destination || null,
        classification: classification || 'PUBLIK',
        accessLevel: accessLevel || 'PUBLIK',
        tags: tags || null,
        uploadedById: user.id,
      },
    })

    await db.archiveAccess.create({
      data: { archiveId: archive.id, userId: user.id, action: 'UPLOAD', ipAddress: req.headers.get('x-forwarded-for') || undefined },
    })
    await db.auditLog.create({
      data: { userId: user.id, action: 'ARCHIVE_CREATE', description: `Created archive ${archive.archiveNumber}: ${title}` },
    })

    return NextResponse.json({ archive }, { status: 201 })
  } catch (e: any) {
    console.error('Archive create error:', e)
    return NextResponse.json({ error: 'Gagal membuat arsip' }, { status: 500 })
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

  try {
    const body = await req.json()
    const { title, description, category, documentDate, source, destination, classification, accessLevel, tags, isPinned, versionData } = body

    const existing = await db.archive.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Arsip tidak ditemukan' }, { status: 404 })

    const updated = await db.archive.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category: category as any }),
        ...(documentDate !== undefined && { documentDate: new Date(documentDate) }),
        ...(source !== undefined && { source }),
        ...(destination !== undefined && { destination }),
        ...(classification !== undefined && { classification: classification as any }),
        ...(accessLevel !== undefined && { accessLevel: accessLevel as any }),
        ...(tags !== undefined && { tags }),
        ...(isPinned !== undefined && { isPinned }),
        ...(versionData && { currentVersion: { increment: 1 } }),
      },
    })

    // Add new version if provided
    if (versionData) {
      await db.archiveVersion.create({
        data: {
          archiveId: id,
          version: updated.currentVersion,
          fileName: versionData.fileName || null,
          fileUrl: versionData.fileUrl || null,
          fileSize: versionData.fileSize || null,
          mimeType: versionData.mimeType || null,
          changeLog: versionData.changeLog || null,
          uploadedById: user.id,
        },
      })
    }

    await db.archiveAccess.create({
      data: { archiveId: id, userId: user.id, action: 'EDIT' },
    })
    await db.auditLog.create({
      data: { userId: user.id, action: 'ARCHIVE_UPDATE', description: `Updated archive ${existing.archiveNumber}` },
    })

    return NextResponse.json({ archive: updated })
  } catch (e: any) {
    console.error('Archive update error:', e)
    return NextResponse.json({ error: 'Gagal update arsip' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden — Super Admin only' }, { status: 403 })
  }

  const existing = await db.archive.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Arsip tidak ditemukan' }, { status: 404 })

  await db.archive.delete({ where: { id } })
  await db.auditLog.create({
    data: { userId: user.id, action: 'ARCHIVE_DELETE', description: `Deleted archive ${existing.archiveNumber}: ${existing.title}` },
  })

  return NextResponse.json({ ok: true })
}
