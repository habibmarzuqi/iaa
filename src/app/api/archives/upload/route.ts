/**
 * Upload file untuk Archive Version
 * POST /api/archives/upload  — multipart/form-data with file
 * Returns: { url, fileName, fileSize, mimeType }
 *
 * File disimpan ke /public/uploads/archives/ dengan unique filename.
 * Max 50MB. Accept: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, images, video, text, CSV, ZIP.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const maxDuration = 30

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'archives')
const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm',
  'text/plain', 'text/csv',
  'application/zip', 'application/x-zip-compressed',
]

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

    if (!file) {
      return NextResponse.json({ error: 'File wajib diunggah' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `Ukuran file melebihi ${MAX_SIZE / 1024 / 1024}MB` }, { status: 400 })
    }

    const mimeType = file.type || 'application/octet-stream'

    // Ensure dir exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ''
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filePath = path.join(UPLOAD_DIR, storedName)

    // Write file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(filePath, buffer)

    const url = `/uploads/archives/${storedName}`

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'ARCHIVE_FILE_UPLOAD',
        description: `Uploaded archive file ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      },
    })

    return NextResponse.json({
      url,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
    }, { status: 201 })
  } catch (e: any) {
    console.error('Archive upload error:', e)
    return NextResponse.json({ error: 'Gagal mengunggah file: ' + e.message }, { status: 500 })
  }
}
