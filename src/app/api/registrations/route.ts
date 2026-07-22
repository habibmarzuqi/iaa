/**
 * GET  /api/registrations              — list all (admin+) with optional ?status=&eventId=
 * POST /api/registrations              — member registers to event { eventId }
 * PATCH /api/registrations?id=xxx      — update status { status: APPROVED|REJECTED|CANCELLED, action: 'checkin' }
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId }, include: { member: true } })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const status = url.searchParams.get('status')
  const eventId = url.searchParams.get('eventId')

  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // If anggota: only their registrations
  if (user.role === 'ANGGOTA') {
    if (!user.member) return NextResponse.json({ registrations: [] })
    const registrations = await db.registration.findMany({
      where: { memberId: user.member.id, ...(status ? { status: status as any } : {}) },
      include: { event: true },
      orderBy: { registeredAt: 'desc' },
    })
    return NextResponse.json({ registrations })
  }

  // Admin/pengurus: all registrations
  if (!['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const search = url.searchParams.get('search') || ''
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '20')))
  const skip = (page - 1) * pageSize

  const where: any = {}
  if (status) where.status = status
  if (eventId) where.eventId = eventId
  if (search) {
    where.OR = [
      { member: { fullName: { contains: search, mode: 'insensitive' } } },
      { member: { memberNumber: { contains: search, mode: 'insensitive' } } },
      { event: { title: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const [registrations, total] = await Promise.all([
    db.registration.findMany({
      where,
      include: {
        event: { select: { id: true, title: true, eventType: true, startDate: true, location: true, quota: true } },
        member: { select: { id: true, fullName: true, memberNumber: true, arsiparisLevel: true, position: true, workUnit: true } },
      },
      orderBy: { registeredAt: 'desc' },
      skip,
      take: pageSize,
    }),
    db.registration.count({ where }),
  ])

  return NextResponse.json({
    registrations,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.role !== 'ANGGOTA' || !user.member) {
    return NextResponse.json({ error: 'Hanya anggota yang dapat mendaftar kegiatan' }, { status: 403 })
  }

  try {
    const { eventId } = await req.json()
    if (!eventId) return NextResponse.json({ error: 'eventId wajib diisi' }, { status: 400 })

    const event = await db.event.findUnique({ where: { id: eventId } })
    if (!event || !event.isPublished) return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 })
    if (!event.isRegistrationOpen) return NextResponse.json({ error: 'Pendaftaran kegiatan ini sudah ditutup' }, { status: 400 })

    // Check existing
    const existing = await db.registration.findUnique({
      where: { eventId_memberId: { eventId, memberId: user.member.id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Anda sudah terdaftar di kegiatan ini', registration: existing }, { status: 400 })
    }

    // Determine status: APPROVED if quota available, WAITING_LIST if full
    const isFull = event.registeredCount >= event.quota
    const status = isFull ? 'WAITING_LIST' : 'PENDING'

    const registration = await db.registration.create({
      data: { eventId, memberId: user.member.id, status },
    })

    // Increment registered count (only if not waiting list)
    if (!isFull) {
      await db.event.update({
        where: { id: eventId },
        data: { registeredCount: { increment: 1 } },
      })
    }

    await db.auditLog.create({
      data: { userId: user.id, action: 'REGISTRATION_CREATE', description: `Registered to event ${event.title}` },
    })

    return NextResponse.json({ registration }, { status: 201 })
  } catch (e: any) {
    console.error('Registration error:', e)
    return NextResponse.json({ error: 'Gagal mendaftar' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const action = url.searchParams.get('action')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await db.registration.findUnique({
    where: { id },
    include: { event: true, member: true },
  })
  if (!existing) return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()

    // CHECK-IN action — admin/pengurus only
    if (action === 'checkin') {
      if (!['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden — only admin can check-in' }, { status: 403 })
      }
      if (existing.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Peserta belum di-approve' }, { status: 400 })
      }
      if (existing.checkedIn) {
        return NextResponse.json({ error: 'Sudah check-in sebelumnya', registration: existing }, { status: 400 })
      }
      const updated = await db.registration.update({
        where: { id },
        data: { checkedIn: true, checkedInAt: new Date() },
      })
      await db.auditLog.create({
        data: { userId: user.id, action: 'CHECKIN', description: `Check-in ${existing.member.fullName} to ${existing.event.title}` },
      })
      return NextResponse.json({ registration: updated })
    }

    // CANCEL — member cancels own
    if (body.status === 'CANCELLED') {
      if (user.role === 'ANGGOTA') {
        if (existing.memberId !== user.member?.id) {
          return NextResponse.json({ error: 'Anda hanya bisa membatalkan pendaftaran sendiri' }, { status: 403 })
        }
      } else if (!['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const updated = await db.registration.update({
        where: { id },
        data: { status: 'CANCELLED' },
      })
      // Decrement registered count if was approved/pending (not waiting list)
      if (existing.status === 'APPROVED' || existing.status === 'PENDING') {
        await db.event.update({
          where: { id: existing.eventId },
          data: { registeredCount: { decrement: 1 } },
        })
        // Promote first waiting list to pending
        const nextWaiting = await db.registration.findFirst({
          where: { eventId: existing.eventId, status: 'WAITING_LIST' },
          orderBy: { registeredAt: 'asc' },
        })
        if (nextWaiting) {
          await db.registration.update({
            where: { id: nextWaiting.id },
            data: { status: 'PENDING' },
          })
          await db.event.update({
            where: { id: existing.eventId },
            data: { registeredCount: { increment: 1 } },
          })
        }
      }
      await db.auditLog.create({
        data: { userId: user.id, action: 'REGISTRATION_CANCEL', description: `Cancelled registration ${existing.event.title}` },
      })
      return NextResponse.json({ registration: updated })
    }

    // APPROVE / REJECT — admin only
    if (body.status === 'APPROVED' || body.status === 'REJECTED') {
      if (!['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
        return NextResponse.json({ error: 'Forbidden — only admin can approve/reject' }, { status: 403 })
      }
      const updated = await db.registration.update({
        where: { id },
        data: { status: body.status },
      })
      await db.auditLog.create({
        data: { userId: user.id, action: `REGISTRATION_${body.status}`, description: `${body.status} registration for ${existing.member.fullName}` },
      })
      return NextResponse.json({ registration: updated })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (e: any) {
    console.error('Registration update error:', e)
    return NextResponse.json({ error: 'Gagal update pendaftaran' }, { status: 500 })
  }
}
