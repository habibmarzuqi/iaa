/**
 * IAA Digital — Auth login endpoint
 * POST /api/auth/login { email, password } → { user } | error
 * GET  /api/auth/login → current session user (from cookie)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/helpers'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { member: true },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Akun Anda belum aktif. Hubungi pengurus untuk persetujuan pendaftaran.' }, { status: 401 })
    }
    if (user.password !== hashPassword(password)) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    await db.auditLog.create({
      data: { userId: user.id, action: 'LOGIN', description: `User ${user.email} logged in` },
    })

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar ?? null,
      memberId: user.member?.id,
      memberNumber: user.member?.memberNumber,
      arsiparisLevel: user.member?.arsiparisLevel ?? undefined,
      position: user.member?.position ?? undefined,
      workUnit: user.member?.workUnit ?? undefined,
    }

    const res = NextResponse.json({ user: sessionUser })
    res.cookies.set('iaa_session', user.id, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return NextResponse.json({ user: null })

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { member: true },
  })
  if (!user || !user.isActive) return NextResponse.json({ user: null })

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar ?? null,
      memberId: user.member?.id,
      memberNumber: user.member?.memberNumber,
      arsiparisLevel: user.member?.arsiparisLevel ?? undefined,
      position: user.member?.position ?? undefined,
      workUnit: user.member?.workUnit ?? undefined,
    },
  })
}
