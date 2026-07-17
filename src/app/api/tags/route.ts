/**
 * GET /api/tags — list all distinct tags from articles (for autocomplete)
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const articles = await db.article.findMany({
    where: { tags: { not: null } },
    select: { tags: true },
  })

  // Collect all unique tags
  const tagSet = new Set<string>()
  for (const a of articles) {
    if (!a.tags) continue
    a.tags.split(',').forEach((t) => {
      const trimmed = t.trim()
      if (trimmed) tagSet.add(trimmed)
    })
  }

  // Sort alphabetically
  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b))

  return NextResponse.json({ tags, total: tags.length })
}
