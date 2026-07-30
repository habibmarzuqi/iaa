import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 30

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'gallery')
const MAX_SIZE = 10 * 1024 * 1024 // 10MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

async function getSessionUser(req: NextRequest) {
  const id = req.cookies.get('iaa_session')?.value
  return id ? db.user.findUnique({ where: { id } }) : null
}

function guessExt(m: string) {
  return {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
  }[m] || ''
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const fd = await req.formData()
    const file = fd.get('file') as File | null
    const albumId = fd.get('albumId') as string | null
    const titleInput = fd.get('title') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File foto wajib diunggah' }, { status: 400 })
    }
    if (!albumId) {
      return NextResponse.json({ error: 'albumId wajib diisi' }, { status: 400 })
    }

    const album = await db.galleryAlbum.findUnique({ where: { id: albumId } })
    if (!album) {
      return NextResponse.json({ error: 'Album galeri tidak ditemukan' }, { status: 404 })
    }

    const isVercel = !!process.env.VERCEL
    const max = isVercel ? 1 * 1024 * 1024 : MAX_SIZE
    if (file.size > max) {
      return NextResponse.json(
        { error: `Ukuran foto melebihi ${isVercel ? '1MB' : '10MB'}` },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Format file tidak didukung: ${file.type}` },
        { status: 400 }
      )
    }

    const buf = Buffer.from(await file.arrayBuffer())
    let url: string
    let storedName: string

    if (isVercel) {
      let out = buf
      let mime = file.type
      if (file.size > 200 * 1024 && file.type !== 'image/svg+xml') {
        try {
          out = Buffer.from(
            await sharp(buf)
              .resize(1920, null, { withoutEnlargement: true })
              .webp({ quality: 82 })
              .toBuffer()
          )
          mime = 'image/webp'
        } catch {}
      }
      url = `data:${mime};base64,${out.toString('base64')}`
      storedName = `vercel-gallery-${Date.now()}${guessExt(mime)}`
    } else {
      if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true })
      }
      const ext = path.extname(file.name) || guessExt(file.type)
      storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
      await writeFile(path.join(UPLOAD_DIR, storedName), buf)
      url = `/uploads/gallery/${storedName}`
    }

    const title = titleInput?.trim() || file.name.replace(/\.[^/.]+$/, '')

    // Create gallery photo record
    const photo = await db.galleryPhoto.create({
      data: {
        albumId,
        title: title || null,
        url,
      },
    })

    // If album does not have cover image yet, auto-set coverImage to this photo
    if (!album.coverImage) {
      await db.galleryAlbum.update({
        where: { id: albumId },
        data: { coverImage: url },
      })
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'GALLERY_PHOTO_UPLOAD',
        description: `Uploaded photo "${title}" to album "${album.title}"`,
      },
    })

    return NextResponse.json({ photo, url }, { status: 201 })
  } catch (e: any) {
    console.error('Gallery photo upload error:', e)
    return NextResponse.json({ error: 'Gagal upload foto galeri: ' + (e.message || 'unknown') }, { status: 500 })
  }
}
