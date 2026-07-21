const { PrismaClient } = require('@prisma/client');
const { createHash } = require('crypto');
const db = new PrismaClient();
async function main() {
  const users = await db.user.findMany({ select: { email: true, role: true, password: true, isActive: true } });
  const hash = (p) => createHash('sha256').update(p).digest('hex');
  console.log('Expected hash for "iaa12345":', hash('iaa12345').substring(0, 20) + '...');
  console.log('Users in DB:');
  users.forEach(u => console.log(`  ${u.email} | ${u.role} | active=${u.isActive} | pwdLen=${u.password.length} | pwdPreview=${u.password.substring(0, 15)}...`));
}
main().catch(console.error).finally(() => db.$disconnect());
