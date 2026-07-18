/**
 * Global Search API
 * GET /api/search?q=query&limit=10
 *
 * Searches across: articles, events, library items, archives, organization members
 * Returns grouped results by type with relevance scoring.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const ROLE_LEVEL: Record<string, number> = {
  ANGGOTA: 1, PENGURUS: 2, ADMINISTRATOR: 3, SUPER_ADMIN: 4,
}
const ACCESS_LEVEL: Record<string, number> = {
  PUBLIK: 0, ANGGOTA: 1, PENGURUS: 2, ADMIN: 3, SUPER_ADMIN: 4,
}

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q')?.trim() || ''
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '10'), 50)

  if (q.length < 2) {
    return NextResponse.json({
      results: [],
      total: 0,
      message: 'Query minimal 2 karakter',
    })
  }

  const user = await getSessionUser(req)
  const userLevel = user ? ROLE_LEVEL[user.role] ?? 0 : 0

  // Split query into words for multi-word search
  const words = q.split(/\s+/).filter(Boolean)
  const buildContains = (field: string) => words.map((w) => ({ [field]: { contains: w } }))

  try {
    const [articles, events, libraryItems, archives, orgMembers] = await Promise.all([
      // Articles
      db.article.findMany({
        where: {
          isPublished: true,
          OR: [
            ...buildContains('title'),
            ...buildContains('excerpt'),
            ...buildContains('content'),
            ...buildContains('tags'),
          ],
        },
        select: {
          id: true, slug: true, title: true, excerpt: true,
          category: true, publishedAt: true, viewCount: true,
          author: { select: { name: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      }),

      // Events
      db.event.findMany({
        where: {
          isPublished: true,
          OR: [
            ...buildContains('title'),
            ...buildContains('description'),
            ...buildContains('location'),
          ],
        },
        select: {
          id: true, slug: true, title: true, description: true,
          eventType: true, startDate: true, location: true,
        },
        orderBy: { startDate: 'desc' },
        take: limit,
      }),

      // Library items
      db.libraryItem.findMany({
        where: {
          isPublished: true,
          OR: [
            ...buildContains('title'),
            ...buildContains('description'),
            ...buildContains('author'),
            ...buildContains('tags'),
          ],
        },
        select: {
          id: true, slug: true, title: true, description: true,
          category: true, author: true, year: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),

      // Archives (filtered by access level)
      db.archive.findMany({
        where: {
          AND: [
            { accessLevel: { in: Object.entries(ACCESS_LEVEL).filter(([_, lvl]) => lvl <= userLevel).map(([k]) => k) as any } },
            {
              OR: [
                ...buildContains('title'),
                ...buildContains('description'),
                ...buildContains('archiveNumber'),
                ...buildContains('source'),
                ...buildContains('tags'),
              ],
            },
          ],
        },
        select: {
          id: true, archiveNumber: true, title: true, description: true,
          category: true, documentDate: true, classification: true,
        },
        orderBy: { documentDate: 'desc' },
        take: limit,
      }),

      // Organization members
      db.organizationMember.findMany({
        where: {
          isActive: true,
          OR: [
            ...buildContains('name'),
            ...buildContains('position'),
            ...buildContains('category'),
            ...buildContains('bio'),
          ],
        },
        select: {
          id: true, name: true, position: true, category: true, bio: true,
        },
        orderBy: { order: 'asc' },
        take: limit,
      }),
    ])

    // Build grouped results
    const results = {
      articles: articles.map((a) => ({
        type: 'article',
        id: a.id,
        title: a.title,
        description: a.excerpt,
        meta: a.category,
        meta2: formatDate(a.publishedAt),
        link: { name: 'news-detail' as const, slug: a.slug },
        icon: 'FileText',
      })),
      events: events.map((e) => ({
        type: 'event',
        id: e.id,
        title: e.title,
        description: e.description.slice(0, 150),
        meta: e.eventType,
        meta2: formatDate(e.startDate) + ' · ' + e.location,
        link: { name: 'event-detail' as const, slug: e.slug },
        icon: 'Calendar',
      })),
      library: libraryItems.map((l) => ({
        type: 'library',
        id: l.id,
        title: l.title,
        description: l.description.slice(0, 150),
        meta: l.category,
        meta2: [l.author, l.year].filter(Boolean).join(' · '),
        link: { name: 'library' as const },
        icon: 'BookOpen',
      })),
      archives: archives.map((a) => ({
        type: 'archive',
        id: a.id,
        title: a.title,
        description: (a.description || '').slice(0, 150),
        meta: a.category,
        meta2: a.archiveNumber + ' · ' + formatDate(a.documentDate),
        link: null, // archives only accessible from admin
        icon: 'Archive',
      })),
      members: orgMembers.map((m) => ({
        type: 'member',
        id: m.id,
        title: m.name,
        description: m.position,
        meta: m.category,
        meta2: '',
        link: { name: 'organization' as const },
        icon: 'Users',
      })),
    }

    const total = results.articles.length + results.events.length + results.library.length + results.archives.length + results.members.length

    return NextResponse.json({
      results,
      total,
      query: q,
    })
  } catch (e: any) {
    console.error('Search error:', e)
    return NextResponse.json({ error: 'Gagal melakukan pencarian' }, { status: 500 })
  }
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}
