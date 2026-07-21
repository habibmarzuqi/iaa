/**
 * Upload certificate template file (image or PDF)
 * POST /api/cert-templates/upload — multipart with file + type (image|file)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const maxDuration = 30

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'cert-templates')
const MAX_SIZE = 10 * 1024 * 1024

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'File wajib diunggah' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: `Max ${MAX_SIZE / 1024 / 1024}MB` }, { status: 400 })

    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true })

    const ext = path.extname(file.name) || ''
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(UPLOAD_DIR, storedName), buffer)

    const url = `/uploads/cert-templates/${storedName}`

    return NextResponse.json({ url, fileName: file.name, fileSize: file.size, mimeType: file.type }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal upload: ' + e.message }, { status: 500 })
  }
}
