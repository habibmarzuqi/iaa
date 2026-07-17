/**
 * GET /api/announcements — list active announcements
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const type = url.searchParams.get('type')
  const now = new Date()

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
