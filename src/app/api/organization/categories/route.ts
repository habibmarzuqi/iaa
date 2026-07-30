/**
 * CMS API — Organization Categories (Kategori Pengurus)
 * GET    /api/organization/categories             — list all categories
 * POST   /api/organization/categories             — create category (admin+)
 * PATCH  /api/organization/categories?id=xxx      — update category (admin+)
 * DELETE /api/organization/categories?id=xxx      — delete category (admin+)
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
  try {
    const categories = await db.orgCategory.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    // Seed default categories if empty
    if (categories.length === 0) {
      const defaults = [
        { name: 'Pengurus Pusat', description: 'Ketua Umum, Sekretaris Jenderal, Bendahara Umum', order: 1 },
        { name: 'Dewan Pembina', description: 'Dewan Pembina Ikatan Arsiparis Indonesia', order: 2 },
        { name: 'Dewan Kehormatan', description: 'Dewan Kehormatan & Kode Etik Arsiparis', order: 3 },
        { name: 'Bidang', description: 'Pengurus Bidang & Departemen Kearsipan', order: 4 },
      ]
      for (const d of defaults) {
        await db.orgCategory.upsert({
          where: { name: d.name },
          update: {},
          create: d,
        })
      }
      const seeded = await db.orgCategory.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      })
      return NextResponse.json({ categories: seeded })
    }

    return NextResponse.json({ categories })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal mengambil data kategori pengurus' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { name, description, order } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })
    }

    const existing = await db.orgCategory.findUnique({ where: { name: name.trim() } })
    if (existing) {
      return NextResponse.json({ error: 'Kategori dengan nama ini sudah ada' }, { status: 400 })
    }

    const category = await db.orgCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        order: typeof order === 'number' ? order : 0,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'ORG_CATEGORY_CREATE',
        description: `Created org category: ${category.name}`,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (e: any) {
    console.error('Org category create error:', e)
    return NextResponse.json({ error: 'Gagal membuat kategori pengurus' }, { status: 500 })
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

  const existing = await db.orgCategory.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { name, description, order } = body

    if (name && name.trim() !== existing.name) {
      const conflict = await db.orgCategory.findUnique({ where: { name: name.trim() } })
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ error: 'Kategori dengan nama ini sudah ada' }, { status: 400 })
      }
    }

    const updated = await db.orgCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(order !== undefined && { order: Number(order) || 0 }),
      },
    })

    // If category name changed, update string category on members for backwards compatibility
    if (name && name.trim() !== existing.name) {
      await db.organizationMember.updateMany({
        where: { category: existing.name },
        data: { category: name.trim() },
      })
    }

    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'ORG_CATEGORY_UPDATE',
        description: `Updated org category: ${existing.name} -> ${updated.name}`,
      },
    })

    return NextResponse.json({ category: updated })
  } catch (e: any) {
    console.error('Org category update error:', e)
    return NextResponse.json({ error: 'Gagal update kategori pengurus' }, { status: 500 })
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

  const existing = await db.orgCategory.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 })

  await db.orgCategory.delete({ where: { id } })

  await db.auditLog.create({
    data: {
      userId: user!.id,
      action: 'ORG_CATEGORY_DELETE',
      description: `Deleted org category: ${existing.name}`,
    },
  })

  return NextResponse.json({ ok: true })
}
