/**
 * CMS API — Events (Kegiatan)
 * GET  /api/events?limit=10            — public list (upcoming, published)
 * GET  /api/events?slug=xxx            — public detail by slug
 * GET  /api/events?admin=true          — admin list (incl. unpublished)
 * GET  /api/events?id=xxx              — admin detail by ID
 * POST /api/events                     — create (admin+)
 * PATCH /api/events?id=xxx             — update (admin+)
 * DELETE /api/events?id=xxx            — delete (admin+)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

const ALLOWED_EVENT_TYPES = ['SEMINAR', 'WORKSHOP', 'WEBINAR', 'RAPAT', 'PELATIHAN', 'LOMBA']

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const slug = url.searchParams.get('slug')
  const id = url.searchParams.get('id')
  const limit = Number(url.searchParams.get('limit') ?? '10')
  const admin = url.searchParams.get('admin') === 'true'

  // Admin detail by ID
  if (id) {
    const user = await getSessionUser(req)
    if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const event = await db.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { name: true, email: true } },
        registrations: {
          include: {
            member: { select: { fullName: true, memberNumber: true, arsiparisLevel: true } },
          },
        },
      },
    })
    if (!event) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ event })
  }

  // Public detail by slug
  if (slug) {
    const event = await db.event.findUnique({
      where: { slug },
      include: {
        organizer: { select: { name: true, email: true } },
        registrations: {
          include: {
            member: { select: { fullName: true, memberNumber: true, arsiparisLevel: true } },
          },
        },
      },
    })
    if (!event || (!event.isPublished && !admin)) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ event })
  }

  // Admin list — include unpublished
  if (admin) {
    const user = await getSessionUser(req)
    if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const search = url.searchParams.get('search') || ''
    const eventType = url.searchParams.get('eventType') || ''
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'))
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '20')))
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (eventType) where.eventType = eventType
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        include: { organizer: { select: { name: true } } },
        orderBy: { startDate: 'desc' },
        skip,
        take: pageSize,
      }),
      db.event.count({ where }),
    ])
    return NextResponse.json({
      events,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  }

  // Public list
  const events = await db.event.findMany({
    where: { isPublished: true },
    orderBy: { startDate: 'asc' },
    take: limit,
  })
  return NextResponse.json({ events })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden — minimal Pengurus' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const {
      title,
      slug: bodySlug,
      description,
      eventType,
      location,
      startDate,
      endDate,
      quota,
      isRegistrationOpen,
      isPublished,
      isPublicEvent,
      coverImage,
    } = body

    if (!title || !description || !eventType || !location || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'title, description, eventType, location, startDate, endDate wajib diisi' },
        { status: 400 },
      )
    }

    if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: 'eventType tidak valid' }, { status: 400 })
    }

    // Generate unique slug
    let baseSlug = slugify(bodySlug || title)
    if (!baseSlug) baseSlug = `event-${Date.now()}`
    let slug = baseSlug
    let counter = 1
    while (await db.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`
    }

    const event = await db.event.create({
      data: {
        slug,
        title,
        description,
        eventType: eventType as any,
        coverImage: coverImage || null,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        quota: typeof quota === 'number' ? quota : 100,
        isRegistrationOpen: isRegistrationOpen !== false,
        isPublished: isPublished !== false,
        isPublicEvent: isPublicEvent === true,
        organizerId: user.id,
      },
      include: { organizer: { select: { name: true } } },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'EVENT_CREATE', description: `Created event: ${title}` },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (e: any) {
    console.error('Event create error:', e)
    return NextResponse.json({ error: 'Gagal membuat event' }, { status: 500 })
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

  const existing = await db.event.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const {
      title,
      slug: bodySlug,
      description,
      eventType,
      location,
      startDate,
      endDate,
      quota,
      isRegistrationOpen,
      isPublished,
      isPublicEvent,
      coverImage,
    } = body

    if (eventType && !ALLOWED_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json({ error: 'eventType tidak valid' }, { status: 400 })
    }

    // If slug changed, ensure unique
    let newSlug = existing.slug
    if (bodySlug && bodySlug !== existing.slug) {
      newSlug = slugify(bodySlug)
      const conflict = await db.event.findUnique({ where: { slug: newSlug } })
      if (conflict && conflict.id !== id) {
        return NextResponse.json({ error: 'Slug sudah digunakan event lain' }, { status: 400 })
      }
    }

    const updated = await db.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(bodySlug !== undefined && { slug: newSlug }),
        ...(description !== undefined && { description }),
        ...(eventType !== undefined && { eventType: eventType as any }),
        ...(location !== undefined && { location }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(quota !== undefined && { quota }),
        ...(isRegistrationOpen !== undefined && { isRegistrationOpen }),
        ...(isPublished !== undefined && { isPublished }),
        ...(isPublicEvent !== undefined && { isPublicEvent }),
        ...(coverImage !== undefined && { coverImage }),
      },
      include: { organizer: { select: { name: true } } },
    })

    await db.auditLog.create({
      data: { userId: user.id, action: 'EVENT_UPDATE', description: `Updated event: ${existing.title}` },
    })

    return NextResponse.json({ event: updated })
  } catch (e: any) {
    console.error('Event update error:', e)
    return NextResponse.json({ error: 'Gagal update event' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.event.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })

  await db.event.delete({ where: { id } })
  await db.auditLog.create({
    data: { userId: user.id, action: 'EVENT_DELETE', description: `Deleted event: ${existing.title}` },
  })

  return NextResponse.json({ ok: true })
}
