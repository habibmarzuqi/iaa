/**
 * Menu Management API
 * GET  /api/menu              — public: get visible menu tree (no auth)
 * GET  /api/menu?admin=true   — admin: get all menu items (including hidden)
 * POST /api/menu              — admin: create new menu item
 * PATCH /api/menu?id=xxx      — admin: update menu item (label, view, url, icon, isVisible, order, parentId)
 * PATCH /api/menu?reorder=true — admin: bulk reorder { items: [{id, order, parentId}] }
 * DELETE /api/menu?id=xxx     — admin: delete menu item (cascade children)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const DEFAULT_MENUS = [
  { label: 'Beranda', labelKey: 'nav.beranda', view: 'public', icon: 'Home', order: 0 },
  { label: 'Tentang', labelKey: 'nav.tentangGroup', view: null, icon: 'Info', order: 1, children: [
    { label: 'Tentang IAA', labelKey: 'nav.tentang', view: 'about', icon: 'Info', order: 0 },
    { label: 'Struktur Pengurus', labelKey: 'nav.pengurus', view: 'organization', icon: 'Users', order: 1 },
  ]},
  { label: 'Informasi', labelKey: 'nav.informasi', view: null, icon: 'FileText', order: 2, children: [
    { label: 'Berita', labelKey: 'nav.berita', view: 'news-list', icon: 'FileText', order: 0 },
    { label: 'Agenda', labelKey: 'nav.agenda', view: 'event-list', icon: 'Calendar', order: 1 },
    { label: 'Galeri', labelKey: 'nav.galeri', view: 'gallery', icon: 'Image', order: 2 },
    { label: 'FAQ', labelKey: 'nav.faq', view: 'faq', icon: 'HelpCircle', order: 3 },
  ]},
  { label: 'Digital Library', labelKey: 'nav.library', view: 'library', icon: 'BookOpen', order: 3 },
  { label: 'Kontak', labelKey: 'nav.kontak', view: 'contact', icon: 'Mail', order: 4 },
]

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

// Seed default menus if none exist
async function ensureDefaults() {
  const count = await db.menuConfig.count()
  if (count > 0) return

  for (const item of DEFAULT_MENUS) {
    const { children, ...parentData } = item
    const parent = await db.menuConfig.create({
      data: { ...parentData, parentId: null } as any,
    })
    if (children) {
      for (const child of children) {
        await db.menuConfig.create({
          data: { ...child, parentId: parent.id } as any,
        })
      }
    }
  }
}

// Build tree from flat list
function buildTree(items: any[]) {
  const map = new Map<string, any>()
  const roots: any[] = []

  // Sort by order
  items.sort((a, b) => a.order - b.order)

  for (const item of items) {
    map.set(item.id, { ...item, children: [] })
  }

  for (const item of items) {
    const node = map.get(item.id)
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export async function GET(req: NextRequest) {
  await ensureDefaults()

  const url = new URL(req.url)
  const admin = url.searchParams.get('admin') === 'true'

  if (admin) {
    const user = await getSessionUser(req)
    if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const where = admin ? {} : { isVisible: true, isActive: true }
  const items = await db.menuConfig.findMany({
    where,
    orderBy: { order: 'asc' },
  })

  const tree = buildTree(items)
  return NextResponse.json({ menus: tree, total: items.length })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { label, labelKey, view, url, icon, parentId, isExternal } = body

    if (!label) {
      return NextResponse.json({ error: 'Label wajib diisi' }, { status: 400 })
    }

    // Get next order
    const maxOrder = await db.menuConfig.aggregate({
      _max: { order: true },
      where: { parentId: parentId || null },
    })
    const order = (maxOrder._max.order ?? -1) + 1

    const menu = await db.menuConfig.create({
      data: {
        label,
        labelKey: labelKey || null,
        view: view || null,
        url: url || null,
        icon: icon || null,
        parentId: parentId || null,
        isExternal: !!isExternal,
        order,
      },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'MENU_CREATE', description: `Created menu: ${label}` },
    })

    return NextResponse.json({ menu }, { status: 201 })
  } catch (e: any) {
    console.error('Menu create error:', e)
    return NextResponse.json({ error: 'Gagal membuat menu' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const reorder = url.searchParams.get('reorder') === 'true'

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Bulk reorder
  if (reorder) {
    try {
      const body = await req.json()
      const { items } = body as { items: { id: string; order: number; parentId: string | null }[] }

      if (!Array.isArray(items)) {
        return NextResponse.json({ error: 'items array wajib diisi' }, { status: 400 })
      }

      await Promise.all(
        items.map((item) =>
          db.menuConfig.update({
            where: { id: item.id },
            data: { order: item.order, parentId: item.parentId },
          })
        )
      )

      return NextResponse.json({ ok: true, reordered: items.length })
    } catch (e: any) {
      return NextResponse.json({ error: 'Gagal reorder menu' }, { status: 500 })
    }
  }

  // Single item update
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const existing = await db.menuConfig.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Menu tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { label, labelKey, view, url, icon, isVisible, isActive, isExternal, parentId, order } = body

    const updated = await db.menuConfig.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(labelKey !== undefined && { labelKey }),
        ...(view !== undefined && { view }),
        ...(url !== undefined && { url }),
        ...(icon !== undefined && { icon }),
        ...(isVisible !== undefined && { isVisible }),
        ...(isActive !== undefined && { isActive }),
        ...(isExternal !== undefined && { isExternal }),
        ...(parentId !== undefined && { parentId }),
        ...(order !== undefined && { order }),
      },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'MENU_UPDATE', description: `Updated menu: ${existing.label}` },
    })

    return NextResponse.json({ menu: updated })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal update menu' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const existing = await db.menuConfig.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Menu tidak ditemukan' }, { status: 404 })

  await db.menuConfig.delete({ where: { id } }) // cascade deletes children
  await db.auditLog.create({
    data: { userId: user.id, action: 'MENU_DELETE', description: `Deleted menu: ${existing.label}` },
  })

  return NextResponse.json({ ok: true })
}
