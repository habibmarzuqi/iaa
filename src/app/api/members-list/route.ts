/**
 * GET /api/members-list — list all members for admin selects
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const members = await db.member.findMany({
    where: { status: 'AKTIF' },
    select: {
      id: true,
      memberNumber: true,
      fullName: true,
      arsiparisLevel: true,
      position: true,
      workUnit: true,
    },
    orderBy: { fullName: 'asc' },
    take: 200,
  })

  return NextResponse.json({ members })
}
