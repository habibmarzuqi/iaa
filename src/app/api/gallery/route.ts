import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const albums = await db.galleryAlbum.findMany({
    include: { _count: { select: { photos: true } } },
    orderBy: { createdAt: 'desc' },
  })
  const photos = await db.galleryPhoto.findMany({
    take: 12,
    orderBy: { createdAt: 'desc' },
    include: { album: { select: { title: true } } },
  })
  return NextResponse.json({ albums, photos })
}
