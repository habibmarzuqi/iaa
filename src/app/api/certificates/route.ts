/**
 * GET  /api/certificates                — list all (admin+)
 * GET  /api/certificates?verify=NUMBER  — public verification by number
 * POST /api/certificates                — create new (admin+)
 *        body: { memberId, eventId?, title, description?, template?, issuedAt? }
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
  const url = new URL(req.url)
  const verify = url.searchParams.get('verify')

  // PUBLIC VERIFICATION — no auth required
  if (verify) {
    const cert = await db.certificate.findUnique({
      where: { certificateNumber: verify.toUpperCase().trim() },
      include: {
        member: { select: { fullName: true, memberNumber: true, arsiparisLevel: true, status: true } },
        event: { select: { title: true, startDate: true, location: true } },
        issuedBy: { select: { name: true } },
      },
    })
    if (!cert) {
      return NextResponse.json({ valid: false, error: 'Nomor sertifikat tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({
      valid: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        title: cert.title,
        description: cert.description,
        issuedAt: cert.issuedAt,
        template: cert.template,
        member: cert.member,
        event: cert.event,
        issuedBy: cert.issuedBy,
      },
    })
  }

  // Admin list — requires auth
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const certificates = await db.certificate.findMany({
    include: {
      member: { select: { fullName: true, memberNumber: true, arsiparisLevel: true } },
      event: { select: { title: true, startDate: true } },
      issuedBy: { select: { name: true } },
    },
    orderBy: { issuedAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ certificates, total: certificates.length })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { memberId, eventId, title, description, template, issuedAt } = body

    if (!memberId || !title) {
      return NextResponse.json({ error: 'Member dan title wajib diisi' }, { status: 400 })
    }

    const member = await db.member.findUnique({ where: { id: memberId } })
    if (!member) return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })

    // Generate cert number: IAA-CERT-{YEAR}-{SEQ}
    const year = new Date().getFullYear()
    const seq = await db.certificate.count({
      where: { certificateNumber: { startsWith: `IAA-CERT-${year}-` } },
    }) + 1
    const certificateNumber = `IAA-CERT-${year}-${String(seq).padStart(4, '0')}`

    const cert = await db.certificate.create({
      data: {
        certificateNumber,
        memberId,
        eventId: eventId || null,
        issuedById: user.id,
        title,
        description: description || null,
        template: template || 'default',
        issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
      },
      include: {
        member: { select: { fullName: true, memberNumber: true } },
        event: { select: { title: true } },
      },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'CERTIFICATE_CREATE', description: `Issued cert ${certificateNumber} to ${member.fullName}` },
    })

    return NextResponse.json({ certificate: cert }, { status: 201 })
  } catch (e: any) {
    console.error('Certificate create error:', e)
    return NextResponse.json({ error: 'Gagal membuat sertifikat' }, { status: 500 })
  }
}
