/**
 * Reorder photos dalam album
 * PATCH /api/gallery/reorder  body: { photoIds: string[] } (urutan baru)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { photoIds } = await req.json()
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json({ error: 'photoIds array wajib diisi' }, { status: 400 })
    }

    // Update order for each photo
    await Promise.all(
      photoIds.map((id: string, index: number) =>
        db.galleryPhoto.update({ where: { id }, data: { order: index } })
      )
    )

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'GALLERY_PHOTO_REORDER',
        description: `Reordered ${photoIds.length} photos`,
      },
    })

    return NextResponse.json({ ok: true, reordered: photoIds.length })
  } catch (e: any) {
    console.error('Reorder error:', e)
    return NextResponse.json({ error: 'Gagal mengurutkan foto' }, { status: 500 })
  }
}
