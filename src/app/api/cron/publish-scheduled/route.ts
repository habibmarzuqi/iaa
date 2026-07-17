/**
 * Cron: Auto-publish scheduled articles
 * GET /api/cron/publish-scheduled?token=SECRET
 *
 * Finds all articles with publishStatus=SCHEDULED and scheduledAt <= now,
 * updates them to PUBLISHED.
 *
 * In production, set up external cron job (e.g. Vercel Cron, GitHub Actions,
 * or system cron) to hit this endpoint every 15 minutes.
 *
 * Token is read from env CRON_SECRET (fallback: "iaa-cron-secret-dev")
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const expectedToken = process.env.CRON_SECRET || 'iaa-cron-secret-dev'

  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized — invalid token' }, { status: 401 })
  }

  try {
    const now = new Date()

    // Find all scheduled articles that should be published
    const dueArticles = await db.article.findMany({
      where: {
        publishStatus: 'SCHEDULED',
        scheduledAt: { lte: now },
      },
      select: { id: true, title: true, slug: true, scheduledAt: true },
    })

    if (dueArticles.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No scheduled articles due',
        published: 0,
        checkedAt: now.toISOString(),
      })
    }

    // Bulk update to PUBLISHED
    const result = await db.article.updateMany({
      where: {
        id: { in: dueArticles.map((a) => a.id) },
      },
      data: {
        publishStatus: 'PUBLISHED',
        isPublished: true,
        publishedAt: now,
      },
    })

    // Create audit log entries
    for (const article of dueArticles) {
      await db.auditLog.create({
        data: {
          action: 'ARTICLE_AUTO_PUBLISH',
          description: `Auto-published scheduled article: ${article.title} (was scheduled for ${article.scheduledAt?.toISOString()})`,
        },
      })

      // Notify author
      const fullArticle = await db.article.findUnique({
        where: { id: article.id },
        select: { authorId: true, title: true },
      })
      if (fullArticle) {
        await db.notification.create({
          data: {
            userId: fullArticle.authorId,
            type: 'SYSTEM',
            title: 'Artikel Anda Telah Dipublikasi',
            message: `Artikel "${fullArticle.title}" yang dijadwalkan telah otomatis dipublikasi pada ${now.toLocaleString('id-ID')}.`,
            link: 'news-list',
          },
        })
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Auto-published ${result.count} scheduled article(s)`,
      published: result.count,
      articles: dueArticles.map((a) => ({ id: a.id, title: a.title, slug: a.slug })),
      checkedAt: now.toISOString(),
    })
  } catch (e: any) {
    console.error('Cron publish-scheduled error:', e)
    return NextResponse.json({ error: 'Gagal menjalankan cron: ' + e.message }, { status: 500 })
  }
}
