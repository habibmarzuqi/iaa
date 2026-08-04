import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const maxDuration = 60

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'library')
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

async function getSessionUser(req: NextRequest) {
  const id = req.cookies.get('iaa_session')?.value
  return id ? db.user.findUnique({ where: { id } }) : null
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — minimal Pengurus' }, { status: 403 })
  }

  try {
    const fd = await req.formData()
    const file = fd.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'File wajib diunggah' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 50MB' }, { status: 400 })
    }

    const buf = Buffer.from(await file.arrayBuffer())

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const ext = path.extname(file.name) || '.bin'
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filePath = path.join(UPLOAD_DIR, storedName)

    await writeFile(filePath, buf)

    const url = `/uploads/library/${storedName}`

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LIBRARY_FILE_UPLOAD',
        description: `Uploaded library file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      },
    })

    return NextResponse.json(
      {
        url,
        filename: file.name,
        storedName,
        size: file.size,
        mimeType: file.type,
      },
      { status: 201 }
    )
  } catch (e: any) {
    console.error('Library file upload error:', e)
    return NextResponse.json({ error: 'Gagal mengunggah file: ' + (e.message || 'unknown error') }, { status: 500 })
  }
}
