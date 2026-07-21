// vercel-prebuild.mjs
// Swap Prisma datasource provider from "sqlite" to "postgresql" so the
// Vercel build uses the Postgres database provided by the Prisma integration.
// This keeps local dev on SQLite (per .env) without modifying the source schema.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')
const original = readFileSync(schemaPath, 'utf8')

if (original.includes('provider = "sqlite"')) {
  const swapped = original.replace(
    /provider\s*=\s*"sqlite"/,
    'provider = "postgresql"',
  )
  writeFileSync(schemaPath, swapped)
  console.log('✅ Swapped Prisma provider: sqlite -> postgresql')
} else {
  console.log('ℹ️  Prisma provider already non-sqlite, no swap needed')
}

// Also write a .env file so prisma db push during build picks up DATABASE_URL
// (Vercel exposes the integration-stored env vars at build time)
console.log('✅ Prebuild complete')
