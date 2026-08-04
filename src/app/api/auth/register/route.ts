/** Public Registration — POST /api/auth/register */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const { email, password, fullName, nip, phone, workUnit, position, education, agreedToAdArt } = b

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Email, password, dan nama lengkap wajib diisi' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }
    if (!agreedToAdArt) {
      return NextResponse.json({ error: 'Anda harus menyetujui AD/ART serta Kode Etik IAA' }, { status: 400 })
    }

    const e = email.toLowerCase().trim()
    const exist = await db.user.findUnique({ where: { email: e } })
    if (exist) {
      return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login atau gunakan email lain.' }, { status: 400 })
    }

    const name = fullName.split(',')[0].trim()
    const hashedPassword = await hashPassword(password)

    // User is created inactive until Pengurus approves
    const u = await db.user.create({
      data: {
        email: e,
        password: hashedPassword,
        name: name,
        role: 'ANGGOTA',
        isActive: false,
      },
    })

    // Member is created with PENDING status without memberNumber (generated on approval)
    const m = await db.member.create({
      data: {
        userId: u.id,
        fullName: fullName.trim(),
        nip: nip?.trim() || null,
        phone: phone?.trim() || null,
        workUnit: workUnit?.trim() || null,
        position: position?.trim() || null,
        education: education?.trim() || null,
        status: 'PENDING',
        joinDate: new Date(),
      },
    })

    try {
      const admins = await db.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'] }, isActive: true },
        select: { id: true },
      })
      if (admins.length) {
        await db.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            type: 'MESSAGE',
            title: `Pengajuan Anggota Baru: ${fullName.trim().slice(0, 50)}`,
            message: `${fullName.trim()} (${e}) mengajukan pendaftaran anggota. Tinjau di Manajemen Anggota.`,
            link: 'admin-members',
            data: JSON.stringify({ memberId: m.id }),
          })),
        })
      }
    } catch {}

    await db.auditLog.create({
      data: {
        userId: u.id,
        action: 'MEMBER_REGISTER',
        description: `New member registration request: ${fullName} (${e})`,
      },
    })

    return NextResponse.json(
      {
        ok: true,
        message: 'Pengajuan Pendaftaran Anda berhasil dikirim. Akun menunggu persetujuan pengurus IAA.',
        email: e,
        fullName: fullName.trim(),
        memberId: m.id,
      },
      { status: 201 }
    )
  } catch (e: any) {
    console.error('Register error:', e)
    return NextResponse.json({ error: 'Gagal mendaftar: ' + (e.message || 'unknown error') }, { status: 500 })
  }
}
