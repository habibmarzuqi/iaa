/**
 * Bulk Issue Certificates API
 * POST /api/certificates/bulk-issue
 *
 * Body: { eventId, title, description?, template?, issuedAt? }
 *
 * Issues certificates to ALL approved participants of an event:
 * - Members: issue with memberId
 * - Non-members: issue with participantName/Email/Institution
 * - Skips participants who already have a cert for this event
 * - Notifies each participant via system notification
 *
 * Returns: { issued, skipped, errors, total }
 *
 * Auth: ADMINISTRATOR+
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

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
    const { eventId, title, description, template, issuedAt } = body

    if (!eventId || !title) {
      return NextResponse.json({ error: 'eventId dan title wajib diisi' }, { status: 400 })
    }

    const event = await db.event.findUnique({ where: { id: eventId } })
    if (!event) {
      return NextResponse.json({ error: 'Kegiatan tidak ditemukan' }, { status: 404 })
    }

    // Get all approved registrations for this event
    const registrations = await db.registration.findMany({
      where: { eventId, status: 'APPROVED' },
      include: {
        member: { select: { id: true, fullName: true, memberNumber: true, arsiparisLevel: true, userId: true } },
      },
      orderBy: { registeredAt: 'asc' },
    })

    if (registrations.length === 0) {
      return NextResponse.json({ error: 'Tidak ada peserta dengan status APPROVED untuk kegiatan ini' }, { status: 400 })
    }

    // Get existing certs for this event to skip duplicates
    const existingCerts = await db.certificate.findMany({
      where: { eventId },
      select: { memberId: true, registrationId: true, participantEmail: true },
    })
    const existingMemberIds = new Set(existingCerts.filter((c) => c.memberId).map((c) => c.memberId))
    const existingRegIds = new Set(existingCerts.filter((c) => c.registrationId).map((c) => c.registrationId))
    const existingEmails = new Set(existingCerts.filter((c) => c.participantEmail).map((c) => c.participantEmail?.toLowerCase()))

    const issueDate = issuedAt ? new Date(issuedAt) : new Date()
    const year = issueDate.getFullYear()

    // Get starting sequence number
    const existingCount = await db.certificate.count({
      where: { certificateNumber: { startsWith: `IAA-CERT-${year}-` } },
    })
    let seq = existingCount + 1

    const result = {
      issued: 0,
      skipped: 0,
      errors: [] as string[],
      total: registrations.length,
      certNumbers: [] as string[],
    }

    const notifications: any[] = []

    for (const reg of registrations) {
      try {
        // Check for duplicates
        if (reg.isMember && reg.memberId && existingMemberIds.has(reg.memberId)) {
          result.skipped++
          continue
        }
        if (reg.registrationId && existingRegIds.has(reg.registrationId)) {
          result.skipped++
          continue
        }
        if (!reg.isMember && reg.participantEmail && existingEmails.has(reg.participantEmail.toLowerCase())) {
          result.skipped++
          continue
        }

        const certNumber = `IAA-CERT-${year}-${String(seq).padStart(4, '0')}`
        seq++

        const certData: any = {
          certificateNumber: certNumber,
          eventId,
          registrationId: reg.id,
          issuedById: user.id,
          title,
          description: description || null,
          template: template || 'default',
          issuedAt: issueDate,
        }

        if (reg.isMember && reg.memberId) {
          certData.memberId = reg.memberId
          // Add to member's notification
          if (reg.member?.userId) {
            notifications.push({
              userId: reg.member.userId,
              type: 'CERTIFICATE_ISSUED',
              title: `Sertifikat Baru: ${title.slice(0, 60)}`,
              message: `Sertifikat ${certNumber} telah diterbitkan untuk kegiatan "${event.title}". Login untuk melihat & download.`,
              link: 'member-dashboard',
              data: JSON.stringify({ certificateNumber: certNumber, eventId }),
            })
          }
        } else {
          certData.participantName = reg.participantName
          certData.participantEmail = reg.participantEmail
          certData.participantInstitution = reg.participantInstitution
          // Non-member: no user account to notify, but we track it
        }

        await db.certificate.create({ data: certData })
        result.issued++
        result.certNumbers.push(certNumber)

        // Track for dedup
        if (reg.memberId) existingMemberIds.add(reg.memberId)
        if (reg.registrationId) existingRegIds.add(reg.registrationId)
        if (reg.participantEmail) existingEmails.add(reg.participantEmail.toLowerCase())
      } catch (e: any) {
        result.errors.push(`${reg.participantName || reg.member?.fullName || 'Unknown'}: ${e.message}`)
      }
    }

    // Send notifications in bulk
    if (notifications.length > 0) {
      try {
        await db.notification.createMany({ data: notifications })
      } catch (e) {
        console.error('Notification error:', e)
      }
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CERTIFICATE_BULK_ISSUE',
        description: `Bulk issued ${result.issued} certificates for event "${event.title}" (${result.skipped} skipped)`,
      },
    })

    return NextResponse.json({
      ...result,
      message: `Berhasil! ${result.issued} sertifikat diterbitkan, ${result.skipped} dilewati (sudah ada).`,
    }, { status: 201 })
  } catch (e: any) {
    console.error('Bulk issue error:', e)
    return NextResponse.json({ error: 'Gagal: ' + (e.message || 'unknown') }, { status: 500 })
  }
}
