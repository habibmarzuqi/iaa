/**
 * Upload branding assets (logo, favicon, icon)
 * POST /api/settings/upload  — multipart/form-data with file + type (logo|favicon|icon192|icon512|ogImage)
 * Returns: { url, type }
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 30

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'branding')
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

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
    const type = formData.get('type') as string | null

    if (!file || !type) {
      return NextResponse.json({ error: 'File dan type wajib diisi' }, { status: 400 })
    }

    const allowedTypes = ['logo', 'favicon', 'icon192', 'icon512', 'ogImage']
    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'Type tidak valid' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Ukuran file melebihi ${MAX_SIZE / 1024 / 1024}MB` }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Hanya file gambar yang diizinkan' }, { status: 400 })
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let url: string
    let processedBuffer: Buffer = buffer

    if (type === 'favicon') {
      // Convert to ICO-compatible PNG (32x32)
      const favName = `favicon-${Date.now()}.png`
      processedBuffer = await sharp(buffer).resize(32, 32, { fit: 'cover' }).png().toBuffer()
      await writeFile(path.join(UPLOAD_DIR, favName), processedBuffer)
      url = `/uploads/branding/${favName}`
    } else if (type === 'icon192') {
      // Generate 192x192 icon
      const iconName = `icon192-${Date.now()}.png`
      processedBuffer = await sharp(buffer).resize(192, 192, { fit: 'cover' }).png().toBuffer()
      await writeFile(path.join(UPLOAD_DIR, iconName), processedBuffer)
      url = `/uploads/branding/${iconName}`
    } else if (type === 'icon512') {
      // Generate 512x512 icon
      const iconName = `icon512-${Date.now()}.png`
      processedBuffer = await sharp(buffer).resize(512, 512, { fit: 'cover' }).png().toBuffer()
      await writeFile(path.join(UPLOAD_DIR, iconName), processedBuffer)
      url = `/uploads/branding/${iconName}`
    } else if (type === 'logo') {
      // Keep logo as-is but convert to PNG for compatibility
      const logoName = `logo-${Date.now()}.png`
      if (file.type !== 'image/png' && file.type !== 'image/svg+xml') {
        processedBuffer = await sharp(buffer).png().toBuffer()
      }
      await writeFile(path.join(UPLOAD_DIR, logoName), processedBuffer)
      url = `/uploads/branding/${logoName}`
    } else {
      // ogImage: resize to 1200x630
      const ogName = `og-image-${Date.now()}.jpg`
      processedBuffer = await sharp(buffer).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer()
      await writeFile(path.join(UPLOAD_DIR, ogName), processedBuffer)
      url = `/uploads/branding/${ogName}`
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'BRANDING_UPLOAD',
        description: `Uploaded ${type}: ${file.name}`,
      },
    })

    return NextResponse.json({ url, type }, { status: 201 })
  } catch (e: any) {
    console.error('Branding upload error:', e)
    return NextResponse.json({ error: 'Gagal mengunggah file: ' + e.message }, { status: 500 })
  }
}
