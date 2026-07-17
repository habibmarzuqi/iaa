import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('iaa_session')
  return res
}
