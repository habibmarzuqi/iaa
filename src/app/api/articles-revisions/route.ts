/**
 * Article Revisions API
 * GET  /api/articles-revisions?articleId=xxx       — list revisions for an article
 * GET  /api/articles-revisions?articleId=xxx&version=N  — get specific revision
 * POST /api/articles-revisions?articleId=xxx       — create new revision (auto on update)
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
  const url = new URL(req.url)
  const articleId = url.searchParams.get('articleId')
  const version = url.searchParams.get('version')

  if (!articleId) return NextResponse.json({ error: 'articleId wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (version) {
    const revision = await db.articleRevision.findUnique({
      where: { articleId_version: { articleId, version: Number(version) } },
      include: { editedBy: { select: { name: true } } },
    })
    if (!revision) return NextResponse.json({ error: 'Revisi tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ revision })
  }

  const revisions = await db.articleRevision.findMany({
    where: { articleId },
    include: { editedBy: { select: { name: true } } },
    orderBy: { version: 'desc' },
  })

  return NextResponse.json({ revisions, total: revisions.length })
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const articleId = url.searchParams.get('articleId')
  if (!articleId) return NextResponse.json({ error: 'articleId wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { title, excerpt, content, changeLog } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'title dan content wajib diisi' }, { status: 400 })
    }

    // Get next version number
    const lastRevision = await db.articleRevision.findFirst({
      where: { articleId },
      orderBy: { version: 'desc' },
    })
    const nextVersion = (lastRevision?.version ?? 0) + 1

    const revision = await db.articleRevision.create({
      data: {
        articleId,
        version: nextVersion,
        title,
        excerpt: excerpt || '',
        content,
        editedById: user.id,
        changeLog: changeLog || null,
      },
      include: { editedBy: { select: { name: true } } },
    })

    return NextResponse.json({ revision }, { status: 201 })
  } catch (e: any) {
    console.error('Revision create error:', e)
    return NextResponse.json({ error: 'Gagal menyimpan revisi' }, { status: 500 })
  }
}
