/**
 * Admin Members API - Full CRUD
 * GET    /api/members-admin              — list all members (admin+)
 * GET    /api/members-admin?id=xxx       — get single member
 * POST   /api/members-admin              — create member (with user account)
 * PATCH  /api/members-admin?id=xxx       — update member
 * DELETE /api/members-admin?id=xxx       — delete member
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash } from 'crypto'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 80)
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const search = url.searchParams.get('search') || ''
  const role = url.searchParams.get('role') || ''
  const status = url.searchParams.get('status') || ''
  const level = url.searchParams.get('level') || ''
  const workUnit = url.searchParams.get('workUnit') || ''
  const education = url.searchParams.get('education') || ''
  const sortBy = url.searchParams.get('sortBy') || 'memberNumber'
  const sortOrder = url.searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc'

  // Pagination params
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? url.searchParams.get('pageSize') ?? '20')))
  const skip = (page - 1) * pageSize

  if (id) {
    const member = await db.member.findUnique({
      where: { id },
      include: { user: { select: { email: true, role: true, avatar: true, lastLoginAt: true } } },
    })
    if (!member) return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ member })
  }

  // Build where clause
  const where: any = {}
  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { memberNumber: { contains: search } },
      { nip: { contains: search } },
      { workUnit: { contains: search } },
      { position: { contains: search } },
      { education: { contains: search } },
      { user: { email: { contains: search } } },
    ]
  }
  if (role) where.user = { ...where.user, role: role as any }
  if (status) where.status = status as any
  if (level) where.arsiparisLevel = level as any
  if (workUnit) where.workUnit = { contains: workUnit }
  if (education) where.education = { contains: education }

  // Sorting
  let orderBy: any = { memberNumber: sortOrder }
  if (sortBy === 'fullName') orderBy = { fullName: sortOrder }
  if (sortBy === 'joinDate') orderBy = { joinDate: sortOrder }
  if (sortBy === 'arsiparisLevel') orderBy = { arsiparisLevel: sortOrder }
  if (sortBy === 'createdAt') orderBy = { createdAt: sortOrder }

  const [members, total, rawWorkUnits] = await Promise.all([
    db.member.findMany({
      where,
      include: { user: { select: { email: true, role: true, avatar: true } } },
      orderBy,
      skip,
      take: pageSize,
    }),
    db.member.count({ where }),
    db.member.findMany({
      select: { workUnit: true },
      where: { workUnit: { not: null } },
      distinct: ['workUnit'],
    }),
  ])

  const availableWorkUnits = rawWorkUnits
    .map((w) => w.workUnit)
    .filter((w): w is string => !!w && w.trim() !== '')
    .sort()

  return NextResponse.json({
    members,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    availableWorkUnits,
  })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { email, password, name, role, memberNumber, nip, fullName, photo, workUnit, position, arsiparisLevel, education, trainingHistory, certificationHistory, status, joinDate } = body

    if (!email || !password || !name || !memberNumber || !fullName) {
      return NextResponse.json({ error: 'Email, password, name, memberNumber, fullName wajib diisi' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    // Check if memberNumber already exists
    const existingMember = await db.member.findUnique({ where: { memberNumber } })
    if (existingMember) {
      return NextResponse.json({ error: 'Nomor anggota sudah terdaftar' }, { status: 400 })
    }

    // Create user
    const newUser = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashPassword(password),
        name,
        role: role || 'ANGGOTA',
        avatar: photo || null,
        isActive: true,
      },
    })

    // Create member
    const member = await db.member.create({
      data: {
        userId: newUser.id,
        memberNumber,
        nip: nip || null,
        fullName,
        photo: photo || null,
        workUnit: workUnit || null,
        position: position || null,
        arsiparisLevel: arsiparisLevel || null,
        education: education || null,
        trainingHistory: trainingHistory || null,
        certificationHistory: certificationHistory || null,
        status: status || 'AKTIF',
        joinDate: joinDate ? new Date(joinDate) : new Date(),
      },
      include: { user: { select: { email: true, role: true } } },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'MEMBER_CREATE', description: `Created member: ${fullName} (${memberNumber})` },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (e: any) {
    console.error('Member create error:', e)
    return NextResponse.json({ error: 'Gagal membuat anggota: ' + e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.member.findUnique({ where: { id }, include: { user: true } })
  if (!existing) return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 })

  try {
    const action = url.searchParams.get('action')

    // Handle Approve Member Registration
    if (action === 'approve') {
      let memberNumber = existing.memberNumber
      if (!memberNumber) {
        const year = new Date().getFullYear()
        const count = await db.member.count({ where: { memberNumber: { not: '' } } })
        const seq = (count + 1).toString().padStart(4, '0')
        memberNumber = `IAA-${year}-${seq}`

        // Ensure uniqueness
        const dup = await db.member.findUnique({ where: { memberNumber } })
        if (dup) {
          memberNumber = `IAA-${year}-${Date.now().toString().slice(-4)}`
        }
      }

      await db.user.update({
        where: { id: existing.userId },
        data: { isActive: true },
      })

      const approved = await db.member.update({
        where: { id },
        data: {
          status: 'AKTIF',
          memberNumber,
        },
        include: { user: { select: { email: true, role: true } } },
      })

      try {
        await db.notification.create({
          data: {
            userId: existing.userId,
            type: 'REGISTRATION_STATUS',
            title: 'Pendaftaran Anggota Disetujui! 🎉',
            message: `Selamat! Pengajuan anggota Anda telah disetujui. Nomor Anggota IAA Anda: ${memberNumber}`,
            link: 'member-dashboard',
          },
        })
      } catch {}

      await db.auditLog.create({
        data: { userId: user.id, action: 'MEMBER_APPROVE', description: `Approved member: ${existing.fullName} (${memberNumber})` },
      })

      return NextResponse.json({ member: approved, message: 'Pendaftaran anggota berhasil disetujui' })
    }

    // Handle Reject Member Registration
    if (action === 'reject') {
      await db.user.update({
        where: { id: existing.userId },
        data: { isActive: false },
      })

      const rejected = await db.member.update({
        where: { id },
        data: { status: 'REJECTED' as any },
        include: { user: { select: { email: true, role: true } } },
      })

      try {
        await db.notification.create({
          data: {
            userId: existing.userId,
            type: 'REGISTRATION_STATUS',
            title: 'Pengajuan Pendaftaran Anggota Ditolak',
            message: `Mohon maaf, pengajuan pendaftaran anggota Anda belum dapat disetujui. Hubungi pengurus untuk informasi lebih lanjut.`,
            link: 'public',
          },
        })
      } catch {}

      await db.auditLog.create({
        data: { userId: user.id, action: 'MEMBER_REJECT', description: `Rejected member: ${existing.fullName}` },
      })

      return NextResponse.json({ member: rejected, message: 'Pengajuan pendaftaran ditolak' })
    }

    const body = await req.json()
    const { memberNumber, nip, fullName, photo, workUnit, position, arsiparisLevel, education, trainingHistory, certificationHistory, status, joinDate, email, name, role, isActive } = body

    // Update user if email/name/role provided
    if (email || name || role !== undefined || isActive !== undefined) {
      await db.user.update({
        where: { id: existing.userId },
        data: {
          ...(email && { email: email.toLowerCase().trim() }),
          ...(name && { name }),
          ...(role && { role }),
          ...(isActive !== undefined && { isActive }),
          ...(photo !== undefined && { avatar: photo }),
        },
      })
    }

    const updated = await db.member.update({
      where: { id },
      data: {
        ...(memberNumber !== undefined && { memberNumber }),
        ...(nip !== undefined && { nip }),
        ...(fullName !== undefined && { fullName }),
        ...(photo !== undefined && { photo }),
        ...(workUnit !== undefined && { workUnit }),
        ...(position !== undefined && { position }),
        ...(arsiparisLevel !== undefined && { arsiparisLevel }),
        ...(education !== undefined && { education }),
        ...(trainingHistory !== undefined && { trainingHistory }),
        ...(certificationHistory !== undefined && { certificationHistory }),
        ...(status !== undefined && { status }),
        ...(joinDate !== undefined && { joinDate: new Date(joinDate) }),
      },
      include: { user: { select: { email: true, role: true } } },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'MEMBER_UPDATE', description: `Updated member: ${existing.fullName}` },
    })

    return NextResponse.json({ member: updated })
  } catch (e: any) {
    console.error('Member update error:', e)
    return NextResponse.json({ error: 'Gagal update anggota: ' + e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — Super Admin only' }, { status: 403 })
  }

  const existing = await db.member.findUnique({ where: { id }, include: { user: true } })
  if (!existing) return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 })

  await db.member.delete({ where: { id } })
  await db.user.delete({ where: { id: existing.userId } })

  await db.auditLog.create({
    data: { userId: user.id, action: 'MEMBER_DELETE', description: `Deleted member: ${existing.fullName} (${existing.memberNumber})` },
  })

  return NextResponse.json({ ok: true })
}
