/** Reject Member — POST /api/members-admin/reject?id=xxx */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const runtime = 'nodejs'
async function getSessionUser(req: NextRequest) { const id = req.cookies.get('iaa_session')?.value; return id ? db.user.findUnique({ where: { id } }) : null }
export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN','ADMINISTRATOR','PENGURUS'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 })
  let reason = ''
  try { reason = (await req.json()).reason || '' } catch {}
  const m = await db.member.findUnique({ where: { id }, include: { user: true } })
  if (!m) return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })
  if (m.status !== 'PENDING') return NextResponse.json({ error: `Status: ${m.status} (bukan PENDING)` }, { status: 400 })
  await db.member.delete({ where: { id } })
  await db.user.delete({ where: { id: m.userId } })
  await db.auditLog.create({ data: { userId: user.id, action: 'MEMBER_REJECT', description: `Rejected: ${m.fullName}. Reason: ${reason||'tidak diberikan'}` } })
  return NextResponse.json({ ok: true, message: `Pendaftaran "${m.fullName}" ditolak. Akun dihapus.` })
}
