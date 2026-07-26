/** Public Registration — POST /api/auth/register */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash } from 'crypto'
export const runtime = 'nodejs'
function hashPassword(p: string) { return createHash('sha256').update(p).digest('hex') }
export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const { email, password, name, fullName, memberNumber, nip, workUnit, position, education } = b
    if (!email || !password || !name || !fullName) return NextResponse.json({ error: 'Email, password, nama, dan nama lengkap wajib diisi' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    const e = email.toLowerCase().trim()
    const exist = await db.user.findUnique({ where: { email: e } })
    if (exist) return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    let mn = (memberNumber || '').trim()
    if (!mn) { mn = `IAA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}` }
    const exM = await db.member.findUnique({ where: { memberNumber: mn } })
    if (exM) return NextResponse.json({ error: 'Nomor anggota sudah terdaftar' }, { status: 400 })
    const u = await db.user.create({ data: { email: e, password: hashPassword(password), name: name.trim(), role: 'ANGGOTA', isActive: false } })
    const m = await db.member.create({ data: { userId: u.id, memberNumber: mn, nip: nip?.trim() || null, fullName: fullName.trim(), workUnit: workUnit?.trim() || null, position: position?.trim() || null, education: education?.trim() || null, status: 'PENDING', joinDate: new Date() } })
    try {
      const admins = await db.user.findMany({ where: { role: { in: ['SUPER_ADMIN','ADMINISTRATOR','PENGURUS'] }, isActive: true }, select: { id: true } })
      if (admins.length) await db.notification.createMany({ data: admins.map(a => ({ userId: a.id, type: 'MESSAGE', title: `Pendaftaran anggota baru: ${fullName.trim().slice(0,60)}`, message: `${name.trim()} (${e}) mendaftar sebagai anggota. Tinjau di Manajemen Anggota.`, link: 'admin-members', data: JSON.stringify({ memberId: m.id }) })) })
    } catch {}
    await db.auditLog.create({ data: { userId: u.id, action: 'MEMBER_REGISTER', description: `New registration: ${fullName} (${e})` } })
    return NextResponse.json({ ok: true, message: 'Pendaftaran berhasil. Akun menunggu persetujuan pengurus.', memberNumber: mn, memberId: m.id }, { status: 201 })
  } catch (e: any) { console.error('Register error:', e); return NextResponse.json({ error: 'Gagal mendaftar: ' + (e.message||'unknown') }, { status: 500 }) }
}
