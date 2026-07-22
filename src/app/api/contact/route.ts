/**
 * Contact Messages API
 * POST   /api/contact              — public submit (no auth)
 * GET    /api/contact              — admin list (with optional ?unread=true)
 * GET    /api/contact?id=xxx       — admin detail by ID (also marks as read)
 * PATCH  /api/contact?id=xxx       — update (mark as read/unread)
 * DELETE /api/contact?id=xxx       — delete message (admin only)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

// ---------- PUBLIC: submit contact message ----------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Nama, email, subjek, dan pesan wajib diisi' },
        { status: 400 },
      )
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    // Limit message length
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Pesan terlalu panjang (maks 5000 karakter)' }, { status: 400 })
    }

    const msg = await db.contactMessage.create({
      data: {
        name: String(name).slice(0, 200),
        email: String(email).slice(0, 200).toLowerCase().trim(),
        phone: phone ? String(phone).slice(0, 50) : null,
        subject: String(subject).slice(0, 300),
        message: String(message).slice(0, 5000),
      },
    })

    // ===== Broadcast Notification to all admin/pengurus users =====
    // So the bell icon in the header rings when a new contact message arrives.
    try {
      const admins = await db.user.findMany({
        where: {
          role: { in: ['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'] },
          isActive: true,
        },
        select: { id: true },
      })

      if (admins.length > 0) {
        const notifTitle = `Pesan masuk: ${String(subject).slice(0, 80)}`
        const notifMessage = `${String(name).slice(0, 60)} (${String(email).slice(0, 60)}) mengirim pesan baru`

        await db.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            type: 'MESSAGE',
            title: notifTitle,
            message: notifMessage,
            link: 'admin-inbox',
            data: JSON.stringify({
              contactMessageId: msg.id,
              senderName: name,
              senderEmail: email,
              subject,
            }),
          })),
        })
      }
    } catch (notifErr) {
      // Notification is best-effort; do not fail the contact submission if it errors.
      console.error('Failed to create admin notification for contact message:', notifErr)
    }

    return NextResponse.json({ ok: true, id: msg.id }, { status: 201 })
  } catch (e: any) {
    console.error('Contact message create error:', e)
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 })
  }
}

// ---------- ADMIN: list / detail ----------
export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const unreadOnly = url.searchParams.get('unread') === 'true'
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '100'), 500)

  // Detail by ID (also marks as read)
  if (id) {
    const msg = await db.contactMessage.findUnique({ where: { id } })
    if (!msg) return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 })

    if (!msg.isRead) {
      await db.contactMessage.update({ where: { id }, data: { isRead: true } })
    }
    return NextResponse.json({ message: { ...msg, isRead: true } })
  }

  // List
  const search = url.searchParams.get('search') || ''
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '20')))
  const skip = (page - 1) * pageSize

  const where: any = unreadOnly ? { isRead: false } : {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [messages, total, unreadCount] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { isRead: false } }),
  ])

  return NextResponse.json({
    messages,
    total,
    unreadCount,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

// ---------- ADMIN: mark as read/unread ----------
export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.contactMessage.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { isRead } = body

    const updated = await db.contactMessage.update({
      where: { id },
      data: {
        ...(isRead !== undefined && { isRead: Boolean(isRead) }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CONTACT_MESSAGE_UPDATE',
        description: `Marked message "${existing.subject}" as ${isRead ? 'read' : 'unread'}`,
      },
    })

    return NextResponse.json({ message: updated })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal update pesan' }, { status: 500 })
  }
}

// ---------- ADMIN: delete ----------
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const existing = await db.contactMessage.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Pesan tidak ditemukan' }, { status: 404 })

  await db.contactMessage.delete({ where: { id } })
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'CONTACT_MESSAGE_DELETE',
      description: `Deleted message "${existing.subject}" from ${existing.email}`,
    },
  })

  return NextResponse.json({ ok: true })
}
