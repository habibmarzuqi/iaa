import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const members = await db.organizationMember.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json({ members })
}
