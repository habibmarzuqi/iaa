import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 30

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'branding')
const MAX_SIZE = 10 * 1024 * 1024 // 10MB limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']

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
    'image/x-icon': '.ico',
    'image/vnd.microsoft.icon': '.ico',
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
    const type = (fd.get('type') as string) || 'branding'

    if (!file) {
      return NextResponse.json({ error: 'File gambar wajib diunggah' }, { status: 400 })
    }

    const isVercel = !!process.env.VERCEL
    const max = isVercel ? 1 * 1024 * 1024 : MAX_SIZE
    if (file.size > max) {
      return NextResponse.json(
        { error: `Ukuran file melebihi ${isVercel ? '1MB' : '10MB'}` },
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
      if (file.size > 200 * 1024 && !['image/svg+xml', 'image/x-icon'].includes(file.type)) {
        try {
          out = Buffer.from(
            await sharp(buf)
              .resize(1200, null, { withoutEnlargement: true })
              .webp({ quality: 85 })
              .toBuffer()
          )
          mime = 'image/webp'
        } catch {}
      }
      url = `data:${mime};base64,${out.toString('base64')}`
      storedName = `vercel-branding-${type}-${Date.now()}${guessExt(mime)}`
    } else {
      if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true })
      }
      const ext = path.extname(file.name) || guessExt(file.type)
      const cleanType = type.toLowerCase().replace(/[^a-z0-9_-]/g, '')
      storedName = `${cleanType}-${Date.now()}${ext}`
      await writeFile(path.join(UPLOAD_DIR, storedName), buf)
      url = `/uploads/branding/${storedName}`
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'BRANDING_IMAGE_UPLOAD',
        description: `Uploaded branding image (${type}): ${file.name}`,
      },
    })

    return NextResponse.json({ url, filename: file.name }, { status: 201 })
  } catch (e: any) {
    console.error('Settings upload error:', e)
    return NextResponse.json({ error: 'Gagal upload file branding: ' + (e.message || 'unknown') }, { status: 500 })
  }
}
