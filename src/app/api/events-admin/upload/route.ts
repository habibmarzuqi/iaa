/**
 * Events Admin Upload API — Banner/Cover Image Upload
 * POST /api/events-admin/upload   (multipart/form-data, field: "file")
 *
 * Multi-environment support:
 * - Local dev (SQLite): saves file to /public/uploads/events/
 * - Vercel serverless (Postgres, read-only fs): returns base64 data URL
 *   (file size limited to 500KB to keep DB/network efficient)
 *
 * Accepts image files (jpg/png/webp/gif/svg) up to 5 MB local / 500KB Vercel.
 * Returns { url, filename, storedName, size, width, height }.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 30

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'events')
const LOCAL_MAX_SIZE = 5 * 1024 * 1024 // 5 MB for local
const VERCEL_MAX_SIZE = 500 * 1024 // 500 KB for Vercel base64 fallback
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

// Detect Vercel serverless (read-only filesystem, no /public writes)
function isVercelServerless(): boolean {
  return !!process.env.VERCEL || !!process.env.VERCEL_ENV
}

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function guessExt(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
  }
  return map[mimeType] || ''
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File wajib diunggah' }, { status: 400 })
    }

    const max = isVercelServerless() ? VERCEL_MAX_SIZE : LOCAL_MAX_SIZE
    const maxLabel = isVercelServerless() ? '500KB (Vercel)' : '5MB'

    if (file.size > max) {
      return NextResponse.json(
        { error: `Ukuran file melebihi ${maxLabel}. Di Vercel, batas upload banner adalah 500KB — gunakan URL gambar eksternal untuk file lebih besar.` },
        { status: 400 },
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung: ${file.type}. Hanya JPG, PNG, WebP, GIF, SVG.` },
        { status: 400 },
      )
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get image dimensions if applicable
    let width: number | null = null
    let height: number | null = null

    if (file.type !== 'image/svg+xml') {
      try {
        const metadata = await sharp(buffer).metadata()
        width = metadata.width ?? null
        height = metadata.height ?? null
      } catch {
        // ignore — dimensions optional
      }
    }

    let url: string
    let storedName: string

    if (isVercelServerless()) {
      // ----- Vercel path: base64 data URL -----
      // Compress/re-encode to JPEG/WEBP if too large to keep data URL reasonable
      let outputBuffer: Buffer = buffer
      let outputMime: string = file.type

      // Re-encode images > 200KB as WebP to reduce size
      if (file.size > 200 * 1024 && file.type !== 'image/svg+xml') {
        try {
          outputBuffer = Buffer.from(
            await sharp(buffer)
              .resize(1600, null, { withoutEnlargement: true })
              .webp({ quality: 80 })
              .toBuffer()
          )
          outputMime = 'image/webp'
        } catch {
          // fallback to original
        }
      }

      const base64 = outputBuffer.toString('base64')
      url = `data:${outputMime};base64,${base64}`
      storedName = `vercel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${guessExt(outputMime)}`
    } else {
      // ----- Local dev path: write to /public/uploads/events/ -----
      if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true })
      }
      const ext = path.extname(file.name) || guessExt(file.type)
      const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      storedName = `${baseName}${ext}`
      const filePath = path.join(UPLOAD_DIR, storedName)
      await writeFile(filePath, buffer)
      url = `/uploads/events/${storedName}`
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'EVENT_BANNER_UPLOAD',
        description: `Uploaded event banner: ${file.name} (${(file.size / 1024).toFixed(1)} KB)${isVercelServerless() ? ' [base64]' : ''}`,
      },
    })

    return NextResponse.json({
      url,
      filename: file.name,
      storedName,
      size: file.size,
      width,
      height,
      storage: isVercelServerless() ? 'base64' : 'file',
    }, { status: 201 })
  } catch (e: any) {
    console.error('Event banner upload error:', e)
    return NextResponse.json({ error: 'Gagal mengunggah banner: ' + e.message }, { status: 500 })
  }
}
