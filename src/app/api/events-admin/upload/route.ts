import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'
export const runtime = 'nodejs'
export const maxDuration = 30
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'events')
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
async function getSessionUser(req: NextRequest) { const id = req.cookies.get('iaa_session')?.value; return id ? db.user.findUnique({ where: { id } }) : null }
function guessExt(m: string) { return { 'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif','image/svg+xml':'.svg' }[m] || '' }
export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN','ADMINISTRATOR','PENGURUS'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const fd = await req.formData()
    const file = fd.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'File wajib' }, { status: 400 })
    const isVercel = !!process.env.VERCEL
    const max = isVercel ? 500 * 1024 : MAX_SIZE
    if (file.size > max) return NextResponse.json({ error: `Ukuran melebihi ${isVercel ? '500KB' : '5MB'}` }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: `Tipe tidak didukung: ${file.type}` }, { status: 400 })
    const buf = Buffer.from(await file.arrayBuffer())
    let w: number | null = null, h: number | null = null
    if (file.type !== 'image/svg+xml') { try { const m = await sharp(buf).metadata(); w = m.width ?? null; h = m.height ?? null } catch {} }
    let url: string, storedName: string
    if (isVercel) {
      let out = buf; let mime = file.type
      if (file.size > 200 * 1024 && file.type !== 'image/svg+xml') { try { out = Buffer.from(await sharp(buf).resize(1600, null, { withoutEnlargement: true }).webp({ quality: 80 }).toBuffer()); mime = 'image/webp' } catch {} }
      url = `data:${mime};base64,${out.toString('base64')}`
      storedName = `vercel-${Date.now()}${guessExt(mime)}`
    } else {
      if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true })
      const ext = path.extname(file.name) || guessExt(file.type)
      storedName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`
      await writeFile(path.join(UPLOAD_DIR, storedName), buf)
      url = `/uploads/events/${storedName}`
    }
    await db.auditLog.create({ data: { userId: user.id, action: 'EVENT_BANNER_UPLOAD', description: `Uploaded: ${file.name} (${(file.size/1024).toFixed(1)}KB)` } })
    return NextResponse.json({ url, filename: file.name, storedName, size: file.size, width: w, height: h, storage: isVercel ? 'base64' : 'file' }, { status: 201 })
  } catch (e: any) { console.error('Upload error:', e); return NextResponse.json({ error: 'Gagal: ' + (e.message||'unknown') }, { status: 500 }) }
}
