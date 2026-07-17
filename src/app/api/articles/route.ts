/**
 * GET /api/articles?limit=10&featured=true
 * GET /api/articles?slug=xxx
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  const limit = Number(url.searchParams.get('limit') ?? '10')
  const featured = url.searchParams.get('featured')

  if (slug) {
    const article = await db.article.findUnique({
      where: { slug },
      include: { author: { select: { name: true, email: true } } },
    })
    if (!article || !article.isPublished) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 })
    }
    await db.article.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
    return NextResponse.json({ article: { ...article, viewCount: article.viewCount + 1 } })
  }

  const articles = await db.article.findMany({
    where: {
      isPublished: true,
      ...(featured === 'true' ? { isFeatured: true } : {}),
    },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })
  return NextResponse.json({ articles })
}
