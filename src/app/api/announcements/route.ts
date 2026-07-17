/**
 * CMS API — Announcements (Pengumuman)
 * GET    /api/announcements                  — public list (active only)
 * GET    /api/announcements?admin=true       — admin list (all, incl. expired)
 * GET    /api/announcements?id=xxx           — admin detail by ID
 * POST   /api/announcements                   — create (admin+)
 * PATCH  /api/announcements?id=xxx            — update (admin+)
 * DELETE /api/announcements?id=xxx            — delete (admin+)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function isAdmin(user: any) {
  return !!user && ['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)
}

const ALLOWED_TYPES = ['BANNER', 'POPUP', 'RUNNING_TEXT', 'PINNED']

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const id = url.searchParams.get('id')
  const admin = url.searchParams.get('admin') === 'true'
  const now = new Date()

  // Admin detail by ID
  if (id) {
    const user = await getSessionUser(req)
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const announcement = await db.announcement.findUnique({ where: { id } })
    if (!announcement) return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ announcement })
  }

  // Admin list — include all (incl. expired)
  if (admin) {
    const user = await getSessionUser(req)
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const where: any = {}
    if (type) where.type = type
    const announcements = await db.announcement.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ announcements, total: announcements.length })
  }

  // Public list (active only)
  const where: any = {
    startDate: { lte: now },
    OR: [{ endDate: null }, { endDate: { gte: now } }],
  }
  if (type) where.type = type

  const announcements = await db.announcement.findMany({
    where,
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ announcements })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden — minimal Pengurus' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, content, type, isPinned, isPopup, startDate, endDate } = body

    if (!title || !content || !type) {
      return NextResponse.json({ error: 'title, content, type wajib diisi' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: 'type tidak valid' }, { status: 400 })
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        type: type as any,
        isPinned: !!isPinned,
        isPopup: !!isPopup,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'ANNOUNCEMENT_CREATE',
        description: `Created announcement: ${title}`,
      },
    })

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (e: any) {
    console.error('Announcement create error:', e)
    return NextResponse.json({ error: 'Gagal membuat pengumuman' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.announcement.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { title, content, type, isPinned, isPopup, startDate, endDate } = body

    if (type && !ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: 'type tidak valid' }, { status: 400 })
    }

    const updated = await db.announcement.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(type !== undefined && { type: type as any }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isPopup !== undefined && { isPopup }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'ANNOUNCEMENT_UPDATE',
        description: `Updated announcement: ${existing.title}`,
      },
    })

    return NextResponse.json({ announcement: updated })
  } catch (e: any) {
    console.error('Announcement update error:', e)
    return NextResponse.json({ error: 'Gagal update pengumuman' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.announcement.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Pengumuman tidak ditemukan' }, { status: 404 })

  await db.announcement.delete({ where: { id } })
  await db.auditLog.create({
    data: {
      userId: user!.id,
      action: 'ANNOUNCEMENT_DELETE',
      description: `Deleted announcement: ${existing.title}`,
    },
  })

  return NextResponse.json({ ok: true })
}
