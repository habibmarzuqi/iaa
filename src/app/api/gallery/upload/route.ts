/**
 * Upload foto untuk Gallery Album
 * POST /api/gallery/upload  — multipart/form-data with file + albumId + optional title
 * Returns: { photo: { id, albumId, title, url } }
 *
 * File disimpan ke /public/uploads/gallery/ dengan unique filename.
 * Max 10MB. Accept: image/* only.
 * Auto-generate thumbnail variant dengan sharp (200x200 webp).
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 30

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'gallery')
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const albumId = formData.get('albumId') as string | null
    const title = formData.get('title') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File wajib diunggah' }, { status: 400 })
    }

    if (!albumId) {
      return NextResponse.json({ error: 'albumId wajib diisi' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Ukuran file melebihi ${MAX_SIZE / 1024 / 1024}MB` }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Hanya file gambar yang diizinkan' }, { status: 400 })
    }

    // Verify album exists
    const album = await db.galleryAlbum.findUnique({ where: { id: albumId } })
    if (!album) {
      return NextResponse.json({ error: 'Album tidak ditemukan' }, { status: 404 })
    }

    // Ensure dir exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Generate unique filename
    const ext = path.extname(file.name) || (file.type === 'image/png' ? '.png' : file.type === 'image/gif' ? '.gif' : '.jpg')
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const storedName = `${baseName}${ext}`
    const filePath = path.join(UPLOAD_DIR, storedName)

    // Write original file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filePath, buffer)

    const url = `/uploads/gallery/${storedName}`

    // Generate thumbnail variant (200x200 cover webp) for non-SVG
    let thumbUrl: string | null = null
    if (file.type !== 'image/svg+xml') {
      try {
        const thumbName = `${baseName}-thumb.webp`
        await sharp(buffer)
          .resize(200, 200, { fit: 'cover', position: 'center' })
          .webp({ quality: 80 })
          .toFile(path.join(UPLOAD_DIR, thumbName))
        thumbUrl = `/uploads/gallery/${thumbName}`
      } catch (e) {
        console.error('Thumbnail generation error:', e)
      }
    }

    // Create photo record in database
    const photo = await db.galleryPhoto.create({
      data: {
        albumId,
        title: title || file.name,
        url,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'GALLERY_PHOTO_UPLOAD',
        description: `Uploaded photo "${file.name}" to album: ${album.title}`,
      },
    })

    return NextResponse.json({
      photo,
      thumbUrl,
      fileName: file.name,
      fileSize: file.size,
    }, { status: 201 })
  } catch (e: any) {
    console.error('Gallery upload error:', e)
    return NextResponse.json({ error: 'Gagal mengunggah foto: ' + e.message }, { status: 500 })
  }
}
