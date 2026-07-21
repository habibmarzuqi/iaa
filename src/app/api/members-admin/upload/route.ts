/**
 * Upload member photo
 * POST /api/members-admin/upload — multipart with file
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 30

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'members')
const MAX_SIZE = 5 * 1024 * 1024

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
    if (!file) return NextResponse.json({ error: 'File wajib diunggah' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: `Max ${MAX_SIZE / 1024 / 1024}MB` }, { status: 400 })
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Hanya gambar' }, { status: 400 })

    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true })

    const ext = path.extname(file.name) || '.jpg'
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const buffer = Buffer.from(await file.arrayBuffer())

    // Save original
    await writeFile(path.join(UPLOAD_DIR, `${baseName}${ext}`), buffer)
    const url = `/uploads/members/${baseName}${ext}`

    // Generate thumbnail
    let thumbUrl: string | null = null
    if (file.type !== 'image/svg+xml') {
      try {
        await sharp(buffer).resize(200, 200, { fit: 'cover' }).webp({ quality: 80 }).toFile(path.join(UPLOAD_DIR, `${baseName}-thumb.webp`))
        thumbUrl = `/uploads/members/${baseName}-thumb.webp`
      } catch {}
    }

    return NextResponse.json({ url, thumbUrl, fileName: file.name, fileSize: file.size }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal upload: ' + e.message }, { status: 500 })
  }
}
