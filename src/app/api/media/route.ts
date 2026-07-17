/**
 * Media Library API
 * GET  /api/media              — list media assets (admin+)
 * POST /api/media              — upload new media (multipart/form-data)
 * PATCH /api/media?id=xxx      — update alt/caption
 * DELETE /api/media?id=xxx     — delete media (file + record)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const maxDuration = 30

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'application/pdf',
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/ogg',
]

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const limit = Number(url.searchParams.get('limit') ?? '50')
  const type = url.searchParams.get('type') // image | document | video | audio

  const where: any = {}
  if (type === 'image') where.mimeType = { startsWith: 'image/' }
  else if (type === 'document') where.mimeType = { startsWith: 'application/' }
  else if (type === 'video') where.mimeType = { startsWith: 'video/' }
  else if (type === 'audio') where.mimeType = { startsWith: 'audio/' }

  const assets = await db.mediaAsset.findMany({
    where,
    include: { uploadedBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 200),
  })

  return NextResponse.json({ assets, total: assets.length })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const alt = formData.get('alt') as string | null
    const caption = formData.get('caption') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File wajib diunggah' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Ukuran file melebihi ${MAX_SIZE / 1024 / 1024}MB` }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Tipe file tidak didukung: ${file.type}` }, { status: 400 })
    }

    // Ensure uploads dir exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Generate unique filename
    const ext = path.extname(file.name) || guessExt(file.type)
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filePath = path.join(UPLOAD_DIR, storedName)

    // Write file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filePath, buffer)

    // Get image dimensions if applicable
    let width: number | null = null
    let height: number | null = null
    if (file.type.startsWith('image/')) {
      // Simple dimension extraction for SVG/JPEG/PNG headers
      try {
        const dims = getImageDimensions(buffer, file.type)
        if (dims) { width = dims.width; height = dims.height }
      } catch {}
    }

    const url = `/uploads/${storedName}`

    const asset = await db.mediaAsset.create({
      data: {
        filename: file.name,
        storedName,
        url,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        alt: alt || null,
        caption: caption || null,
        uploadedById: user.id,
      },
      include: { uploadedBy: { select: { name: true } } },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'MEDIA_UPLOAD', description: `Uploaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)` },
    })

    return NextResponse.json({ asset }, { status: 201 })
  } catch (e: any) {
    console.error('Media upload error:', e)
    return NextResponse.json({ error: 'Gagal mengunggah file: ' + e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.mediaAsset.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { alt, caption } = body

    const updated = await db.mediaAsset.update({
      where: { id },
      data: {
        ...(alt !== undefined && { alt }),
        ...(caption !== undefined && { caption }),
      },
    })

    return NextResponse.json({ asset: updated })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal update media' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const existing = await db.mediaAsset.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 })

  // Delete file from disk
  const filePath = path.join(UPLOAD_DIR, existing.storedName)
  try {
    if (existsSync(filePath)) await unlink(filePath)
  } catch (e) {
    console.error('Failed to delete file:', e)
  }

  await db.mediaAsset.delete({ where: { id } })
  await db.auditLog.create({
    data: { userId: user.id, action: 'MEDIA_DELETE', description: `Deleted media ${existing.filename}` },
  })

  return NextResponse.json({ ok: true })
}

// Helpers
function guessExt(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/ogg': '.ogg',
  }
  return map[mimeType] || ''
}

function getImageDimensions(buffer: Buffer, mimeType: string): { width: number; height: number } | null {
  try {
    if (mimeType === 'image/png') {
      // PNG header: width at offset 16, height at offset 20 (big endian)
      if (buffer.length < 24) return null
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
    }
    if (mimeType === 'image/jpeg') {
      // JPEG: scan for SOF marker (0xFFC0-0xFFCF)
      let i = 2
      while (i < buffer.length - 1) {
        if (buffer[i] !== 0xFF) { i++; continue }
        const marker = buffer[i + 1]
        if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
          const height = buffer.readUInt16BE(i + 5)
          const width = buffer.readUInt16BE(i + 7)
          return { width, height }
        }
        i += 2 + buffer.readUInt16BE(i + 2)
      }
      return null
    }
    if (mimeType === 'image/gif') {
      // GIF: width at offset 6, height at offset 8 (little endian)
      if (buffer.length < 10) return null
      return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) }
    }
    return null
  } catch {
    return null
  }
}
