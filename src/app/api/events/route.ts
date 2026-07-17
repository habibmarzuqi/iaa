import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  const limit = Number(url.searchParams.get('limit') ?? '10')

  if (slug) {
    const event = await db.event.findUnique({
      where: { slug },
      include: {
        organizer: { select: { name: true, email: true } },
        registrations: { include: { member: { select: { fullName: true, memberNumber: true, arsiparisLevel: true } } } },
      },
    })
    if (!event || !event.isPublished) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ event })
  }

  const events = await db.event.findMany({
    where: { isPublished: true },
    orderBy: { startDate: 'asc' },
    take: limit,
  })
  return NextResponse.json({ events })
}
