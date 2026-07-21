/**
 * Events Admin Upload API — Banner/Cover Image Upload
 * POST /api/events-admin/upload   (multipart/form-data, field: "file")
 *
 * Accepts real image files (jpg/png/webp/gif/svg) up to 5 MB.
 * Saves to /public/uploads/events/ and returns { url, filename, size, width, height }.
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
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

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

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file melebihi ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 },
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung: ${file.type}. Hanya JPG, PNG, WebP, GIF, SVG.` },
        { status: 400 },
      )
    }

    // Ensure uploads/events dir exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Generate unique filename
    const ext = path.extname(file.name) || guessExt(file.type)
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const storedName = `${baseName}${ext}`
    const filePath = path.join(UPLOAD_DIR, storedName)

    // Write file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filePath, buffer)

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

    const url = `/uploads/events/${storedName}`

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'EVENT_BANNER_UPLOAD',
        description: `Uploaded event banner: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      },
    })

    return NextResponse.json({
      url,
      filename: file.name,
      storedName,
      size: file.size,
      width,
      height,
    }, { status: 201 })
  } catch (e: any) {
    console.error('Event banner upload error:', e)
    return NextResponse.json({ error: 'Gagal mengunggah banner: ' + e.message }, { status: 500 })
  }
}
