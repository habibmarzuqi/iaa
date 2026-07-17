/**
 * Simulated Google OAuth flow
 * GET  /api/auth/google          — generates "Google consent screen" URL (simulated)
 * POST /api/auth/google/callback — handles "callback" with simulated Google user data
 *
 * NOTE: In production, replace with real google OAuth using NextAuth.js or @react-oauth/google
 * This implementation simulates the flow for demo purposes.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const SIMULATED_GOOGLE_USERS = [
  { providerAccountId: 'google-1084729104729', email: 'demo.arsiparis@gmail.com', name: 'Demo Arsiparis', avatar: 'https://lh3.googleusercontent.com/demo-avatar-1' },
  { providerAccountId: 'google-2038571029385', email: 'rina.w.arsiparis@gmail.com', name: 'Rina Wijayanti', avatar: 'https://lh3.googleusercontent.com/demo-avatar-2' },
]

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const callback = url.searchParams.get('callback') || '/'

  // In real OAuth, redirect to Google consent screen
  // Here we return a "consent screen URL" that's just a route in our app
  const state = Buffer.from(JSON.stringify({ callback, ts: Date.now() })).toString('base64url')
  return NextResponse.json({
    authUrl: `/api/auth/google/consent?state=${state}`,
    state,
    note: 'Simulated OAuth — in production, this would be https://accounts.google.com/o/oauth2/v2/auth?...',
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { state, simulatedUserIndex, linkToUserId } = body

    if (!state) return NextResponse.json({ error: 'State wajib diisi' }, { status: 400 })

    // Decode state
    let stateData: any
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    } catch {
      return NextResponse.json({ error: 'State tidak valid' }, { status: 400 })
    }

    // Pick simulated user
    const googleUser = SIMULATED_GOOGLE_USERS[simulatedUserIndex ?? 0]

    if (linkToUserId) {
      // LINK to existing user (when user is already logged in)
      const existingUser = await db.user.findUnique({ where: { id: linkToUserId } })
      if (!existingUser) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

      await db.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider: 'google',
          providerAccountId: googleUser.providerAccountId,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.avatar,
          accessToken: 'sim_access_' + Date.now(),
          refreshToken: 'sim_refresh_' + Date.now(),
          expiresAt: new Date(Date.now() + 3600 * 1000),
        },
      })

      await db.auditLog.create({
        data: { userId: existingUser.id, action: 'OAUTH_LINK', description: `Linked Google account ${googleUser.email}` },
      })

      return NextResponse.json({ ok: true, linked: true, email: googleUser.email })
    }

    // LOGIN flow: check if Google account already linked to a user
    let oauthAccount = await db.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider: 'google', providerAccountId: googleUser.providerAccountId } },
      include: { user: { include: { member: true } } },
    })

    if (oauthAccount) {
      // Existing link — login
      const user = oauthAccount.user
      await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
      await db.auditLog.create({
        data: { userId: user.id, action: 'OAUTH_LOGIN', description: `Google OAuth login as ${googleUser.email}` },
      })

      const sessionUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar ?? googleUser.avatar,
        memberId: user.member?.id,
        memberNumber: user.member?.memberNumber,
        arsiparisLevel: user.member?.arsiparisLevel ?? undefined,
        position: user.member?.position ?? undefined,
        workUnit: user.member?.workUnit ?? undefined,
      }

      const res = NextResponse.json({ user: sessionUser, callback: stateData.callback })
      res.cookies.set('iaa_session', user.id, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/' })
      return res
    }

    // Not linked — return Google user data so frontend can decide:
    // (a) link to existing account (with password), or
    // (b) create new account
    return NextResponse.json({
      googleUser: {
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.avatar,
        providerAccountId: googleUser.providerAccountId,
      },
      state,
      callback: stateData.callback,
      needsLinking: true,
    })
  } catch (e: any) {
    console.error('Google OAuth callback error:', e)
    return NextResponse.json({ error: 'Gagal memproses OAuth' }, { status: 500 })
  }
}
