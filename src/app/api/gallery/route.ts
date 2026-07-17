/**
 * CMS API — Gallery (Album & Foto)
 * GET    /api/gallery                       — public list (albums + recent photos)
 * GET    /api/gallery?admin=true           — admin list (all albums with photos)
 * GET    /api/gallery?id=albumId           — admin/public album detail with photos
 * POST   /api/gallery                       — create album (admin+)
 * PATCH  /api/gallery?id=albumId            — update album (admin+)
 * DELETE /api/gallery?id=albumId            — delete album cascade (admin+)
 * POST   /api/gallery?action=add-photo      — add photo to album (admin+)
 * DELETE /api/gallery?action=photo&id=photoId — delete single photo (admin+)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function isAdmin(user: any) {
  return !!user && ['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const admin = url.searchParams.get('admin') === 'true'

  // Admin list — include photos in each album
  if (admin) {
    const user = await getSessionUser(req)
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const albums = await db.galleryAlbum.findMany({
      include: {
        photos: { orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] },
        _count: { select: { photos: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ albums, total: albums.length })
  }

  // Album detail by ID (public — anyone can view existing albums)
  if (id) {
    const album = await db.galleryAlbum.findUnique({
      where: { id },
      include: {
        photos: { orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] },
      },
    })
    if (!album) return NextResponse.json({ error: 'Album tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ album })
  }

  // Public list (default)
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

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden — minimal Pengurus' }, { status: 403 })
  }

  // Add photo to album
  if (action === 'add-photo') {
    try {
      const body = await req.json()
      const { albumId, title, url: photoUrl } = body

      if (!albumId || !photoUrl) {
        return NextResponse.json({ error: 'albumId dan url wajib diisi' }, { status: 400 })
      }

      const album = await db.galleryAlbum.findUnique({ where: { id: albumId } })
      if (!album) return NextResponse.json({ error: 'Album tidak ditemukan' }, { status: 404 })

      const photo = await db.galleryPhoto.create({
        data: {
          albumId,
          title: title || null,
          url: photoUrl,
        },
      })

      await db.auditLog.create({
        data: {
          userId: user!.id,
          action: 'GALLERY_PHOTO_ADD',
          description: `Added photo to album: ${album.title}`,
        },
      })

      return NextResponse.json({ photo }, { status: 201 })
    } catch (e: any) {
      console.error('Gallery photo add error:', e)
      return NextResponse.json({ error: 'Gagal menambah foto' }, { status: 500 })
    }
  }

  // Create album (default)
  try {
    const body = await req.json()
    const { title, description, coverImage } = body

    if (!title) {
      return NextResponse.json({ error: 'title wajib diisi' }, { status: 400 })
    }

    const album = await db.galleryAlbum.create({
      data: {
        title,
        description: description || null,
        coverImage: coverImage || null,
      },
      include: { _count: { select: { photos: true } } },
    })

    await db.auditLog.create({
      data: { userId: user!.id, action: 'GALLERY_ALBUM_CREATE', description: `Created album: ${title}` },
    })

    return NextResponse.json({ album }, { status: 201 })
  } catch (e: any) {
    console.error('Gallery album create error:', e)
    return NextResponse.json({ error: 'Gagal membuat album' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.galleryAlbum.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Album tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { title, description, coverImage } = body

    const updated = await db.galleryAlbum.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
      },
      include: { _count: { select: { photos: true } } },
    })

    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'GALLERY_ALBUM_UPDATE',
        description: `Updated album: ${existing.title}`,
      },
    })

    return NextResponse.json({ album: updated })
  } catch (e: any) {
    console.error('Gallery album update error:', e)
    return NextResponse.json({ error: 'Gagal update album' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const action = url.searchParams.get('action')
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Delete single photo
  if (action === 'photo') {
    const photo = await db.galleryPhoto.findUnique({ where: { id }, include: { album: { select: { title: true } } } })
    if (!photo) return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 })

    await db.galleryPhoto.delete({ where: { id } })
    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'GALLERY_PHOTO_DELETE',
        description: `Deleted photo from album: ${photo.album?.title ?? '-'}`,
      },
    })

    return NextResponse.json({ ok: true })
  }

  // Delete album (cascade photos)
  const existing = await db.galleryAlbum.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Album tidak ditemukan' }, { status: 404 })

  await db.galleryAlbum.delete({ where: { id } })
  await db.auditLog.create({
    data: {
      userId: user!.id,
      action: 'GALLERY_ALBUM_DELETE',
      description: `Deleted album: ${existing.title}`,
    },
  })

  return NextResponse.json({ ok: true })
}
