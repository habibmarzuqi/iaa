/**
 * IAA Digital — Auth login endpoint
 * POST /api/auth/login { email, password } → { user } | error
 * GET  /api/auth/login → current session user (from cookie)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, hashPassword } from '@/lib/password'
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 })
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1'
    const normalizedEmail = email.toLowerCase().trim()
    const rateLimitKey = `login:${clientIp}:${normalizedEmail}`

    // 1. Check rate limit (max 5 failed attempts per 15 minutes)
    const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)
    if (!rateCheck.allowed) {
      const minutesLeft = Math.ceil((rateCheck.remainingMs || 0) / 60000)
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login gagal. Akses dikunci sementara demi keamanan. Silakan coba lagi dalam ${minutesLeft} menit.` },
        { status: 429 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { member: true },
    })

    if (!user || !user.isActive) {
      recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000)
      return NextResponse.json({ error: 'Email atau password salah / Akun belum aktif.' }, { status: 401 })
    }

    // 2. Verify password (bcrypt or legacy SHA-256 fallback)
    const { isValid, isLegacySha256 } = await verifyPassword(password, user.password)
    if (!isValid) {
      const failed = recordFailedAttempt(rateLimitKey, 5, 15 * 60 * 1000)
      const remaining = 5 - failed.attempts
      const msg = failed.blocked
        ? 'Terlalu banyak percobaan login gagal. Akses dikunci selama 15 menit.'
        : `Email atau password salah. (Sisa percobaan: ${remaining})`
      return NextResponse.json({ error: msg }, { status: 401 })
    }

    // 3. Reset rate limit on successful authentication
    resetRateLimit(rateLimitKey)

    // 4. Auto-upgrade legacy SHA-256 password hash to Bcrypt
    if (isLegacySha256) {
      try {
        const bcryptHash = await hashPassword(password)
        await db.user.update({
          where: { id: user.id },
          data: { password: bcryptHash, lastLoginAt: new Date() },
        })
      } catch (e) {
        console.error('Failed to auto-upgrade password hash to bcrypt:', e)
      }
    } else {
      await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        description: `User ${user.email} logged in successfully from IP ${clientIp}`,
      },
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
