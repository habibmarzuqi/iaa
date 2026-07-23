/**
 * User Groups & Permissions API
 *
 * GET    /api/groups                     — list all groups (with members count + permissions)
 * GET    /api/groups?id=xxx              — group detail (with members + permissions)
 * POST   /api/groups                     — create group { name, description, color }
 * PATCH  /api/groups?id=xxx              — update group { name?, description?, color?, isActive? }
 * DELETE /api/groups?id=xxx              — delete group (admin only)
 *
 * POST   /api/groups?id=xxx&action=addMember     — add member { userId }
 * POST   /api/groups?id=xxx&action=removeMember  — remove member { userId }
 * POST   /api/groups?id=xxx&action=setPermissions — set permissions { permissions: [{ module, canView, canCreate, canEdit, canDelete }] }
 *
 * GET    /api/groups?me=true             — current user's groups + permissions (for frontend access control)
 *
 * Auth: PENGURUS+ for read, ADMINISTRATOR+ for write, SUPER_ADMIN for delete.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

// All admin modules that can be permission-controlled
export const ADMIN_MODULES = [
  { key: 'admin-dashboard', label: 'Dashboard' },
  { key: 'admin-cms', label: 'Website Publik (CMS)' },
  { key: 'admin-menu', label: 'Manajemen Menu' },
  { key: 'admin-members', label: 'Manajemen Anggota' },
  { key: 'admin-groups', label: 'Manajemen Grup' },
  { key: 'admin-inbox', label: 'Pesan Masuk' },
  { key: 'admin-files', label: 'File Manager' },
  { key: 'admin-site-settings', label: 'Pengaturan Situs' },
  { key: 'admin-archives', label: 'Arsip Digital' },
  { key: 'admin-certificates', label: 'E-Certificate' },
  { key: 'admin-cert-templates', label: 'Template Sertifikat' },
  { key: 'admin-events', label: 'Event & Registrasi' },
  { key: 'admin-reports', label: 'Laporan' },
  { key: 'admin-settings', label: 'Pengaturan Sistem' },
]

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const me = url.searchParams.get('me') === 'true'

  // ===== Get current user's groups + permissions (for frontend) =====
  if (me) {
    const memberships = await db.userGroupMembership.findMany({
      where: { userId: user.id },
      include: {
        group: {
          include: {
            permissions: true,
          },
        },
      },
    })

    // Aggregate permissions across all groups user belongs to
    // (user can do X if ANY of their groups allows it)
    const moduleAccess: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {}
    for (const m of memberships) {
      if (!m.group.isActive) continue
      for (const p of m.group.permissions) {
        if (!moduleAccess[p.module]) {
          moduleAccess[p.module] = { canView: false, canCreate: false, canEdit: false, canDelete: false }
        }
        moduleAccess[p.module].canView = moduleAccess[p.module].canView || p.canView
        moduleAccess[p.module].canCreate = moduleAccess[p.module].canCreate || p.canCreate
        moduleAccess[p.module].canEdit = moduleAccess[p.module].canEdit || p.canEdit
        moduleAccess[p.module].canDelete = moduleAccess[p.module].canDelete || p.canDelete
      }
    }

    return NextResponse.json({
      groups: memberships.map((m) => ({
        id: m.group.id,
        name: m.group.name,
        color: m.group.color,
      })),
      permissions: moduleAccess,
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      isAdministrator: user.role === 'ADMINISTRATOR',
    })
  }

  // ===== Detail by id =====
  if (id) {
    if (!['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const group = await db.userGroup.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        permissions: true,
      },
    })
    if (!group) return NextResponse.json({ error: 'Grup tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ group })
  }

  // ===== List all groups =====
  if (!['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const groups = await db.userGroup.findMany({
    include: {
      _count: { select: { users: true, permissions: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ groups, modules: ADMIN_MODULES })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const action = url.searchParams.get('action')

  try {
    const body = await req.json()

    // ===== Add member to existing group =====
    if (id && action === 'addMember') {
      const { userId } = body
      if (!userId) return NextResponse.json({ error: 'userId wajib diisi' }, { status: 400 })

      const existing = await db.userGroupMembership.findUnique({
        where: { userId_groupId: { userId, groupId: id } },
      })
      if (existing) {
        return NextResponse.json({ error: 'User sudah ada di grup ini' }, { status: 400 })
      }

      await db.userGroupMembership.create({ data: { userId, groupId: id } })
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'GROUP_ADD_MEMBER',
          description: `Added user ${userId} to group ${id}`,
        },
      })
      return NextResponse.json({ ok: true })
    }

    // ===== Remove member from group =====
    if (id && action === 'removeMember') {
      const { userId } = body
      if (!userId) return NextResponse.json({ error: 'userId wajib diisi' }, { status: 400 })

      await db.userGroupMembership.deleteMany({
        where: { userId, groupId: id },
      })
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'GROUP_REMOVE_MEMBER',
          description: `Removed user ${userId} from group ${id}`,
        },
      })
      return NextResponse.json({ ok: true })
    }

    // ===== Set permissions for group =====
    if (id && action === 'setPermissions') {
      const { permissions } = body as {
        permissions: { module: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }[]
      }
      if (!Array.isArray(permissions)) {
        return NextResponse.json({ error: 'permissions array wajib diisi' }, { status: 400 })
      }

      // Delete existing permissions for this group, then recreate
      await db.groupPermission.deleteMany({ where: { groupId: id } })
      if (permissions.length > 0) {
        await db.groupPermission.createMany({
          data: permissions.map((p) => ({
            groupId: id,
            module: p.module,
            canView: !!p.canView,
            canCreate: !!p.canCreate,
            canEdit: !!p.canEdit,
            canDelete: !!p.canDelete,
          })),
        })
      }

      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'GROUP_SET_PERMISSIONS',
          description: `Updated permissions for group ${id}: ${permissions.length} modules`,
        },
      })
      return NextResponse.json({ ok: true, count: permissions.length })
    }

    // ===== Create new group =====
    const { name, description, color } = body
    if (!name) return NextResponse.json({ error: 'Nama grup wajib diisi' }, { status: 400 })

    const existing = await db.userGroup.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json({ error: 'Nama grup sudah digunakan' }, { status: 400 })
    }

    const group = await db.userGroup.create({
      data: {
        name,
        description: description || null,
        color: color || 'blue',
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'GROUP_CREATE',
        description: `Created group: ${name}`,
      },
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (e: any) {
    console.error('Group create error:', e)
    return NextResponse.json({ error: 'Gagal: ' + (e.message || 'unknown') }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const existing = await db.userGroup.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Grup tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { name, description, color, isActive } = body

    // Check name uniqueness if changed
    if (name && name !== existing.name) {
      const conflict = await db.userGroup.findUnique({ where: { name } })
      if (conflict) {
        return NextResponse.json({ error: 'Nama grup sudah digunakan' }, { status: 400 })
      }
    }

    const updated = await db.userGroup.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'GROUP_UPDATE',
        description: `Updated group: ${existing.name}`,
      },
    })

    return NextResponse.json({ group: updated })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal update grup' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden — Super Admin only' }, { status: 403 })
  }

  const existing = await db.userGroup.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Grup tidak ditemukan' }, { status: 404 })

  await db.userGroup.delete({ where: { id } })

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'GROUP_DELETE',
      description: `Deleted group: ${existing.name}`,
    },
  })

  return NextResponse.json({ ok: true })
}
