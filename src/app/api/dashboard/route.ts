/**
 * GET /api/dashboard/stats — admin/pengurus dashboard statistics
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    totalMembers,
    activeMembers,
    totalArticles,
    totalEvents,
    totalLibrary,
    totalCertificates,
    pendingRegistrations,
    recentMembers,
    recentArticles,
    upcomingEvents,
  ] = await Promise.all([
    db.member.count(),
    db.member.count({ where: { status: 'AKTIF' } }),
    db.article.count({ where: { isPublished: true } }),
    db.event.count({ where: { isPublished: true } }),
    db.libraryItem.count({ where: { isPublished: true } }),
    db.certificate.count(),
    db.registration.count({ where: { status: 'PENDING' } }),
    db.member.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true } } } }),
    db.article.findMany({ take: 5, orderBy: { publishedAt: 'desc' }, include: { author: { select: { name: true } } } }),
    db.event.findMany({ where: { startDate: { gte: new Date() } }, orderBy: { startDate: 'asc' }, take: 5 }),
  ])

  const byLevel = await db.member.groupBy({ by: ['arsiparisLevel'], _count: { _all: true } })
  const byStatus = await db.member.groupBy({ by: ['status'], _count: { _all: true } })

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  const certs = await db.certificate.findMany({
    where: { issuedAt: { gte: sixMonthsAgo } },
    select: { issuedAt: true },
  })
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const certByMonth: { label: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const label = `${monthLabels[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
    const count = certs.filter((c) =>
      c.issuedAt.getMonth() === d.getMonth() && c.issuedAt.getFullYear() === d.getFullYear()
    ).length
    certByMonth.push({ label, count })
  }

  return NextResponse.json({
    totals: {
      members: totalMembers,
      activeMembers,
      articles: totalArticles,
      events: totalEvents,
      library: totalLibrary,
      certificates: totalCertificates,
      pendingRegistrations,
    },
    byLevel: byLevel.map((b) => ({ level: b.arsiparisLevel ?? 'Tidak Berjenjang', count: b._count._all })),
    byStatus: byStatus.map((b) => ({ status: b.status, count: b._count._all })),
    certByMonth,
    recentMembers,
    recentArticles,
    upcomingEvents,
  })
}
