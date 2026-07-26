/** Approve Member — POST /api/members-admin/approve?id=xxx */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const runtime = 'nodejs'
async function getSessionUser(req: NextRequest) { const id = req.cookies.get('iaa_session')?.value; return id ? db.user.findUnique({ where: { id } }) : null }
export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN','ADMINISTRATOR','PENGURUS'].includes(user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 })
  const m = await db.member.findUnique({ where: { id }, include: { user: true } })
  if (!m) return NextResponse.json({ error: 'Anggota tidak ditemukan' }, { status: 404 })
  if (m.status !== 'PENDING') return NextResponse.json({ error: `Status saat ini: ${m.status} (bukan PENDING)` }, { status: 400 })
  await db.$transaction([db.member.update({ where: { id }, data: { status: 'AKTIF' } }), db.user.update({ where: { id: m.userId }, data: { isActive: true } })])
  await db.notification.create({ data: { userId: m.userId, type: 'SYSTEM', title: 'Pendaftaran Disetujui', message: `Selamat datang di IAA Digital! Akun Anda disetujui oleh ${user.name}. Nomor anggota: ${m.memberNumber}.`, link: 'login' } })
  await db.auditLog.create({ data: { userId: user.id, action: 'MEMBER_APPROVE', description: `Approved: ${m.fullName} (${m.memberNumber})` } })
  return NextResponse.json({ ok: true, message: `Anggota "${m.fullName}" disetujui.` })
}
