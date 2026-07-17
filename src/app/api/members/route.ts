/**
 * GET /api/members?sub=certificates|registrations  — current member data (requires session)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { member: true },
  })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const sub = url.searchParams.get('sub')

  if (!user.member) {
    return NextResponse.json({ error: 'Anda bukan anggota terdaftar' }, { status: 403 })
  }

  if (sub === 'certificates') {
    const certificates = await db.certificate.findMany({
      where: { memberId: user.member.id },
      include: { event: { select: { title: true, startDate: true } } },
      orderBy: { issuedAt: 'desc' },
    })
    return NextResponse.json({ certificates })
  }

  if (sub === 'registrations') {
    const registrations = await db.registration.findMany({
      where: { memberId: user.member.id },
      include: { event: true },
      orderBy: { registeredAt: 'desc' },
    })
    return NextResponse.json({ registrations })
  }

  return NextResponse.json({
    member: user.member,
    user: { name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  })
}
