/**
 * Certificate Templates API
 * GET    /api/cert-templates              — list templates
 * POST   /api/cert-templates              — create template
 * PATCH  /api/cert-templates?id=xxx       — update template
 * DELETE /api/cert-templates?id=xxx       — delete template
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
  const search = url.searchParams.get('search') || ''
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '20')))
  const skip = (page - 1) * pageSize

  const where: any = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ]
  }

  const [templates, total] = await Promise.all([
    db.certificateTemplate.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip,
      take: pageSize,
    }),
    db.certificateTemplate.count({ where }),
  ])

  return NextResponse.json({
    templates,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { name, description, imageUrl, fileUrl, layoutConfig, isDefault } = body
    if (!name) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })

    // If setting as default, unset others
    if (isDefault) {
      await db.certificateTemplate.updateMany({ data: { isDefault: false } })
    }

    const template = await db.certificateTemplate.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        fileUrl: fileUrl || null,
        layoutConfig: typeof layoutConfig === 'object' ? JSON.stringify(layoutConfig) : (layoutConfig || null),
        isDefault: !!isDefault,
      },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'CERT_TEMPLATE_CREATE', description: `Created cert template: ${name}` },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal membuat template' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.certificateTemplate.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { name, description, imageUrl, fileUrl, layoutConfig, isDefault } = body

    if (isDefault) {
      await db.certificateTemplate.updateMany({ where: { id: { not: id } }, data: { isDefault: false } })
    }

    const updated = await db.certificateTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(layoutConfig !== undefined && {
          layoutConfig: typeof layoutConfig === 'object' ? JSON.stringify(layoutConfig) : layoutConfig,
        }),
        ...(isDefault !== undefined && { isDefault }),
      },
    })

    return NextResponse.json({ template: updated })
  } catch (e: any) {
    return NextResponse.json({ error: 'Gagal update template' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await db.certificateTemplate.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
