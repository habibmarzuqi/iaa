/**
 * CMS API — Organization (Struktur Organisasi)
 * GET    /api/organization                  — public list (active members, ordered by `order`)
 * GET    /api/organization?admin=true       — admin list (all members, incl. inactive)
 * GET    /api/organization?id=xxx           — admin detail by ID
 * POST   /api/organization                   — create member (admin+)
 * PATCH  /api/organization?id=xxx            — update member (admin+)
 * DELETE /api/organization?id=xxx            — delete member (admin+)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function isAdmin(user: any) {
  return !!user && ['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const admin = url.searchParams.get('admin') === 'true'

  // Admin detail by ID
  if (id) {
    const user = await getSessionUser(req)
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const member = await db.organizationMember.findUnique({ where: { id } })
    if (!member) return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ member })
  }

  // Admin list — include inactive
  if (admin) {
    const user = await getSessionUser(req)
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const [members, categories] = await Promise.all([
      db.organizationMember.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      db.orgCategory.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    ])
    return NextResponse.json({ members, categories, total: members.length })
  }

  // Public list (active only, ordered by `order`)
  const [members, categories] = await Promise.all([
    db.organizationMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    db.orgCategory.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    }),
  ])
  return NextResponse.json({ members, categories })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden — minimal Pengurus' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { name, position, category, photo, bio, order, isActive } = body

    if (!name || !position || !category) {
      return NextResponse.json({ error: 'name, position, category wajib diisi' }, { status: 400 })
    }

    const member = await db.organizationMember.create({
      data: {
        name,
        position,
        category,
        photo: photo || null,
        bio: bio || null,
        order: typeof order === 'number' ? order : 0,
        isActive: isActive !== false,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'ORG_MEMBER_CREATE',
        description: `Created org member: ${name} (${position})`,
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (e: any) {
    console.error('Organization member create error:', e)
    return NextResponse.json({ error: 'Gagal membuat member organisasi' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.organizationMember.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { name, position, category, photo, bio, order, isActive } = body

    const updated = await db.organizationMember.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(position !== undefined && { position }),
        ...(category !== undefined && { category }),
        ...(photo !== undefined && { photo }),
        ...(bio !== undefined && { bio }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'ORG_MEMBER_UPDATE',
        description: `Updated org member: ${existing.name} (${existing.position})`,
      },
    })

    return NextResponse.json({ member: updated })
  } catch (e: any) {
    console.error('Organization member update error:', e)
    return NextResponse.json({ error: 'Gagal update member organisasi' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.organizationMember.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 })

  await db.organizationMember.delete({ where: { id } })
  await db.auditLog.create({
    data: {
      userId: user!.id,
      action: 'ORG_MEMBER_DELETE',
      description: `Deleted org member: ${existing.name} (${existing.position})`,
    },
  })

  return NextResponse.json({ ok: true })
}
