/** My Certificates — GET /api/certificates/my?email=xxx (public) */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const runtime = 'nodejs'
export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get('email')?.toLowerCase().trim()
  if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
  const [nonMember, member] = await Promise.all([
    db.certificate.findMany({ where: { participantEmail: email }, include: { event: { select: { title: true, startDate: true, location: true } }, issuedBy: { select: { name: true } } }, orderBy: { issuedAt: 'desc' } }),
    db.certificate.findMany({ where: { member: { user: { email } } }, include: { member: { select: { fullName: true, memberNumber: true, arsiparisLevel: true } }, event: { select: { title: true, startDate: true, location: true } }, issuedBy: { select: { name: true } } }, orderBy: { issuedAt: 'desc' } }),
  ])
  const certs = [
    ...nonMember.map(c => ({ certificateNumber: c.certificateNumber, title: c.title, description: c.description, issuedAt: c.issuedAt, template: c.template, isMember: false, recipientName: c.participantName, recipientEmail: c.participantEmail, recipientInstitution: c.participantInstitution, event: c.event, issuedBy: c.issuedBy })),
    ...member.map(c => ({ certificateNumber: c.certificateNumber, title: c.title, description: c.description, issuedAt: c.issuedAt, template: c.template, isMember: true, recipientName: c.member?.fullName, recipientEmail: email, recipientInstitution: null, memberNumber: c.member?.memberNumber, arsiparisLevel: c.member?.arsiparisLevel, event: c.event, issuedBy: c.issuedBy })),
  ]
  return NextResponse.json({ certificates: certs, total: certs.length, email })
}
