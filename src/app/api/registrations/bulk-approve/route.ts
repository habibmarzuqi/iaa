/**
 * Bulk Approve Registrations API
 * POST /api/registrations/bulk-approve
 *
 * Body: { eventId?, status?: 'APPROVED' | 'REJECTED' }
 *
 * Approve or reject ALL pending registrations (optionally filtered by event).
 * Auth: PENGURUS+
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 60

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { eventId, status = 'APPROVED' } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Status harus APPROVED atau REJECTED' }, { status: 400 })
    }

    const where: any = { status: 'PENDING' }
    if (eventId) where.eventId = eventId

    const pendingRegs = await db.registration.findMany({
      where,
      include: { event: { select: { title: true } } },
    })

    if (pendingRegs.length === 0) {
      return NextResponse.json({ error: 'Tidak ada pendaftaran PENDING untuk disetujui' }, { status: 400 })
    }

    let processed = 0
    let quotaAdjusted = 0

    for (const reg of pendingRegs) {
      await db.registration.update({
        where: { id: reg.id },
        data: { status },
      })

      // If REJECTED, decrement quota
      if (status === 'REJECTED') {
        await db.event.update({
          where: { id: reg.eventId },
          data: { registeredCount: { decrement: 1 } },
        })
        quotaAdjusted++
      }

      processed++
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: `REGISTRATION_BULK_${status}`,
        description: `Bulk ${status} ${processed} registrations${eventId ? ` for event` : ''}`,
      },
    })

    return NextResponse.json({
      ok: true,
      processed,
      quotaAdjusted,
      message: `Berhasil! ${processed} pendaftaran ${status === 'APPROVED' ? 'disetujui' : 'ditolak'} sekaligus.`,
    })
  } catch (e: any) {
    console.error('Bulk approve error:', e)
    return NextResponse.json({ error: 'Gagal: ' + (e.message || 'unknown') }, { status: 500 })
  }
}
