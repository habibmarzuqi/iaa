import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Number(url.searchParams.get('limit') ?? '20')
  const category = url.searchParams.get('category')

  const items = await db.libraryItem.findMany({
    where: {
      isPublished: true,
      ...(category && category !== 'ALL' ? { category: category as any } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return NextResponse.json({ items })
}
