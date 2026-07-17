import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  await db.announcement.updateMany({
    where: { type: 'POPUP' },
    data: { startDate: new Date('2026-07-10') },
  })
  await db.announcement.updateMany({
    where: { type: 'PINNED' },
    data: { startDate: new Date('2026-07-15') },
  })
  console.log('Updated popup & pinned startDate')
}
main().finally(() => db.$disconnect())
