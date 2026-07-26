/**
 * One-time migration endpoint to add new columns to production Postgres DB.
 * GET /api/migrate-schema
 *
 * Auth: SUPER_ADMIN only
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden — Super Admin only' }, { status: 403 })
  }

  const results: string[] = []

  const migrations = [
    { table: 'Event', column: 'isPublicEvent', sql: `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "isPublicEvent" BOOLEAN NOT NULL DEFAULT false` },
    { table: 'Registration', column: 'memberId_nullable', sql: `ALTER TABLE "Registration" ALTER COLUMN "memberId" DROP NOT NULL` },
    { table: 'Registration', column: 'isMember', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "isMember" BOOLEAN NOT NULL DEFAULT true` },
    { table: 'Registration', column: 'participantName', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "participantName" TEXT` },
    { table: 'Registration', column: 'participantEmail', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "participantEmail" TEXT` },
    { table: 'Registration', column: 'participantPhone', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "participantPhone" TEXT` },
    { table: 'Registration', column: 'participantInstitution', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "participantInstitution" TEXT` },
    { table: 'Registration', column: 'drop_unique', sql: `ALTER TABLE "Registration" DROP CONSTRAINT IF EXISTS "Registration_eventId_memberId_key"` },
    { table: 'Certificate', column: 'memberId_nullable', sql: `ALTER TABLE "Certificate" ALTER COLUMN "memberId" DROP NOT NULL` },
    { table: 'Certificate', column: 'participantName', sql: `ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "participantName" TEXT` },
    { table: 'Certificate', column: 'participantEmail', sql: `ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "participantEmail" TEXT` },
    { table: 'Certificate', column: 'participantInstitution', sql: `ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "participantInstitution" TEXT` },
    { table: 'Certificate', column: 'registrationId', sql: `ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "registrationId" TEXT` },
    { table: 'MemberStatus', column: 'add_pending', sql: `ALTER TYPE "MemberStatus" ADD VALUE IF NOT EXISTS 'PENDING'` },
  ]

  for (const m of migrations) {
    try {
      await db.$executeRawUnsafe(m.sql)
      results.push(`✅ ${m.table}.${m.column}`)
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate') || e.message?.includes('already has')) {
        results.push(`⏭️ ${m.table}.${m.column} (already exists)`)
      } else {
        results.push(`⚠️ ${m.table}.${m.column}: ${e.message?.slice(0, 200)}`)
      }
    }
  }

  // Add indexes for new columns
  const indexes = [
    `CREATE INDEX IF NOT EXISTS "Registration_memberId_idx" ON "Registration"("memberId")`,
    `CREATE INDEX IF NOT EXISTS "Registration_participantEmail_idx" ON "Registration"("participantEmail")`,
    `CREATE INDEX IF NOT EXISTS "Certificate_participantEmail_idx" ON "Certificate"("participantEmail")`,
  ]

  for (const idx of indexes) {
    try {
      await db.$executeRawUnsafe(idx)
      results.push(`✅ Index created`)
    } catch (e: any) {
      results.push(`⚠️ Index: ${e.message?.slice(0, 100)}`)
    }
  }

  return NextResponse.json({
    ok: true,
    results,
    message: 'Migration complete.',
  })
}
