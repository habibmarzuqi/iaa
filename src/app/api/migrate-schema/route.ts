/**
 * One-time migration endpoint to add new columns to production Postgres DB.
 * GET /api/migrate-schema
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
    { name: 'Event.isPublicEvent', sql: `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "isPublicEvent" BOOLEAN NOT NULL DEFAULT false` },
    { name: 'Registration.memberId_nullable', sql: `ALTER TABLE "Registration" ALTER COLUMN "memberId" DROP NOT NULL` },
    { name: 'Registration.isMember', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "isMember" BOOLEAN NOT NULL DEFAULT true` },
    { name: 'Registration.participantName', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "participantName" TEXT` },
    { name: 'Registration.participantEmail', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "participantEmail" TEXT` },
    { name: 'Registration.participantPhone', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "participantPhone" TEXT` },
    { name: 'Registration.participantInstitution', sql: `ALTER TABLE "Registration" ADD COLUMN IF NOT EXISTS "participantInstitution" TEXT` },
    { name: 'Registration.drop_unique', sql: `ALTER TABLE "Registration" DROP CONSTRAINT IF EXISTS "Registration_eventId_memberId_key"` },
    { name: 'Certificate.memberId_nullable', sql: `ALTER TABLE "Certificate" ALTER COLUMN "memberId" DROP NOT NULL` },
    { name: 'Certificate.participantName', sql: `ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "participantName" TEXT` },
    { name: 'Certificate.participantEmail', sql: `ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "participantEmail" TEXT` },
    { name: 'Certificate.participantInstitution', sql: `ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "participantInstitution" TEXT` },
    { name: 'Certificate.registrationId', sql: `ALTER TABLE "Certificate" ADD COLUMN IF NOT EXISTS "registrationId" TEXT` },
  ]

  for (const m of migrations) {
    try {
      await db.$executeRawUnsafe(m.sql)
      results.push(`✅ ${m.name}`)
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
        results.push(`⏭️ ${m.name} (already exists)`)
      } else {
        results.push(`⚠️ ${m.name}: ${e.message?.slice(0, 200)}`)
      }
    }
  }

  // Add PENDING to MemberStatus enum - must be outside transaction
  // PostgreSQL requires ALTER TYPE ... ADD VALUE to not be in a transaction block
  try {
    await db.$executeRawUnsafe(`ALTER TYPE "MemberStatus" ADD VALUE IF NOT EXISTS 'PENDING'`)
    results.push('✅ MemberStatus.PENDING added')
  } catch (e: any) {
    if (e.message?.includes('already exists') || e.message?.includes('already')) {
      results.push('⏭️ MemberStatus.PENDING (already exists)')
    } else {
      // Try alternative: check if PENDING exists
      try {
        const check = await db.$queryRawUnsafe(`SELECT EXISTS(SELECT 1 FROM pg_enum WHERE enumlabel = 'PENDING' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MemberStatus'))`) as any[]
        if (check[0]?.exists) {
          results.push('⏭️ MemberStatus.PENDING (already exists)')
        } else {
          results.push(`⚠️ MemberStatus.PENDING: ${e.message?.slice(0, 200)}`)
        }
      } catch {
        results.push(`⚠️ MemberStatus.PENDING: ${e.message?.slice(0, 200)}`)
      }
    }
  }

  // Fix: Update any PENDING members to AKTIF (enum doesn't support PENDING yet)
  try {
    const updated = await db.$executeRawUnsafe(`UPDATE "Member" SET status = 'AKTIF' WHERE status = 'PENDING'`)
    results.push(`✅ Updated ${updated} PENDING members to AKTIF`)
  } catch (e: any) {
    results.push(`⚠️ Update PENDING members: ${e.message?.slice(0, 200)}`)
  }

  // Also fix: update PENDING registrations count to not include PENDING members
  try {
    await db.$executeRawUnsafe(`UPDATE "Event" SET "registeredCount" = GREATEST(0, "registeredCount" - 1) WHERE id IN (SELECT "eventId" FROM "Registration" WHERE status = 'REJECTED')`)
    results.push('✅ Fixed event registered counts')
  } catch (e: any) {
    results.push(`⚠️ Fix event counts: ${e.message?.slice(0, 200)}`)
  }

  // Add indexes
  const indexes = [
    `CREATE INDEX IF NOT EXISTS "Registration_memberId_idx" ON "Registration"("memberId")`,
    `CREATE INDEX IF NOT EXISTS "Registration_participantEmail_idx" ON "Registration"("participantEmail")`,
    `CREATE INDEX IF NOT EXISTS "Certificate_participantEmail_idx" ON "Certificate"("participantEmail")`,
  ]
  for (const idx of indexes) {
    try {
      await db.$executeRawUnsafe(idx)
      results.push('✅ Index created')
    } catch (e: any) {
      results.push(`⚠️ Index: ${e.message?.slice(0, 100)}`)
    }
  }

  return NextResponse.json({ ok: true, results, message: 'Migration complete.' })
}
