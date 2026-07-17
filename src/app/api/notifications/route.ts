/**
 * GET  /api/notifications              — list current user's notifications
 * POST /api/notifications              — create (admin+)
 * PATCH /api/notifications?id=xxx      — mark as read / mark all as read
 * DELETE /api/notifications?id=xxx     — delete one
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await db.notification.findMany({
    where: {
      OR: [
        { userId: user.id },
        { userId: null }, // broadcast
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return NextResponse.json({ notifications, unreadCount, total: notifications.length })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { userId, type, title, message, link, data, broadcast } = body

    if (!title || !message || !type) {
      return NextResponse.json({ error: 'type, title, message wajib diisi' }, { status: 400 })
    }

    let created
    if (broadcast) {
      // Broadcast: create one notification per user
      const users = await db.user.findMany({ where: { isActive: true } })
      created = await Promise.all(
        users.map((u) =>
          db.notification.create({
            data: {
              userId: u.id,
              type: type as any,
              title, message,
              link: link || null,
              data: data ? JSON.stringify(data) : null,
            },
          })
        )
      )
      return NextResponse.json({ created: created.length, broadcast: true })
    }

    created = await db.notification.create({
      data: {
        userId: userId || null,
        type: type as any,
        title, message,
        link: link || null,
        data: data ? JSON.stringify(data) : null,
      },
    })
    return NextResponse.json({ notification: created }, { status: 201 })
  } catch (e: any) {
    console.error('Notification create error:', e)
    return NextResponse.json({ error: 'Gagal membuat notifikasi' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const action = url.searchParams.get('action')

  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Mark all as read
  if (action === 'read-all') {
    await db.notification.updateMany({
      where: { OR: [{ userId: user.id }, { userId: null }], isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    return NextResponse.json({ ok: true })
  }

  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  // Mark single as read
  const existing = await db.notification.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Notifikasi tidak ditemukan' }, { status: 404 })
  if (existing.userId && existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updated = await db.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  })
  return NextResponse.json({ notification: updated })
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')

  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const existing = await db.notification.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Notifikasi tidak ditemukan' }, { status: 404 })
  if (existing.userId && existing.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.notification.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
