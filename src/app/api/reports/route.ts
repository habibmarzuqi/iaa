/**
 * GET /api/reports?type=members|events|certificates|library|archives&from=&to=&format=json|csv
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function csvEscape(s: any): string {
  if (s == null) return ''
  const str = String(s)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCSV(rows: Record<string, any>[], headers?: string[]): string {
  if (rows.length === 0) return headers ? headers.join(',') : ''
  const cols = headers ?? Object.keys(rows[0])
  const lines = [cols.join(',')]
  for (const r of rows) {
    lines.push(cols.map((c) => csvEscape(r[c])).join(','))
  }
  return lines.join('\n')
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const type = url.searchParams.get('type') || 'members'
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const format = url.searchParams.get('format') || 'json'

  const dateFilter: any = {}
  if (from) dateFilter.gte = new Date(from)
  if (to) {
    const t = new Date(to)
    t.setHours(23, 59, 59, 999)
    dateFilter.lte = t
  }

  let data: any = {}
  let csvRows: Record<string, any>[] = []
  let csvHeaders: string[] | undefined
  let filename = `report-${type}-${new Date().toISOString().slice(0, 10)}`

  if (type === 'members') {
    const members = await db.member.findMany({
      include: { user: { select: { email: true, role: true, lastLoginAt: true } } },
      orderBy: { memberNumber: 'asc' },
    })
    data = {
      title: 'Laporan Daftar Anggota IAA',
      generatedAt: new Date().toISOString(),
      generatedBy: user.name,
      total: members.length,
      members: members.map((m) => ({
        memberNumber: m.memberNumber,
        fullName: m.fullName,
        nip: m.nip,
        email: m.user.email,
        position: m.position,
        workUnit: m.workUnit,
        arsiparisLevel: m.arsiparisLevel,
        status: m.status,
        education: m.education,
        joinDate: m.joinDate,
      })),
    }
    csvRows = data.members
    csvHeaders = ['memberNumber', 'fullName', 'nip', 'email', 'position', 'workUnit', 'arsiparisLevel', 'status', 'joinDate']
    filename = `laporan-anggota-iaa`
  } else if (type === 'events') {
    const events = await db.event.findMany({
      where: from || to ? { startDate: dateFilter } : undefined,
      include: {
        organizer: { select: { name: true } },
        _count: { select: { registrations: true, certificates: true } },
      },
      orderBy: { startDate: 'desc' },
    })
    data = {
      title: 'Laporan Kegiatan IAA',
      generatedAt: new Date().toISOString(),
      generatedBy: user.name,
      total: events.length,
      events: events.map((e) => ({
        title: e.title,
        eventType: e.eventType,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        quota: e.quota,
        registeredCount: e.registeredCount,
        registrations: e._count.registrations,
        certificatesIssued: e._count.certificates,
        organizer: e.organizer.name,
        isRegistrationOpen: e.isRegistrationOpen,
      })),
    }
    csvRows = data.events
    csvHeaders = ['title', 'eventType', 'location', 'startDate', 'quota', 'registeredCount', 'registrations', 'certificatesIssued', 'organizer']
    filename = `laporan-kegiatan-iaa`
  } else if (type === 'certificates') {
    const certs = await db.certificate.findMany({
      where: from || to ? { issuedAt: dateFilter } : undefined,
      include: {
        member: { select: { fullName: true, memberNumber: true, arsiparisLevel: true } },
        event: { select: { title: true } },
        issuedBy: { select: { name: true } },
      },
      orderBy: { issuedAt: 'desc' },
    })
    data = {
      title: 'Laporan Penerbitan Sertifikat IAA',
      generatedAt: new Date().toISOString(),
      generatedBy: user.name,
      total: certs.length,
      certificates: certs.map((c) => ({
        certificateNumber: c.certificateNumber,
        title: c.title,
        memberName: c.member.fullName,
        memberNumber: c.member.memberNumber,
        arsiparisLevel: c.member.arsiparisLevel,
        event: c.event?.title ?? null,
        issuedBy: c.issuedBy.name,
        issuedAt: c.issuedAt,
        template: c.template,
      })),
    }
    csvRows = data.certificates
    csvHeaders = ['certificateNumber', 'title', 'memberName', 'memberNumber', 'arsiparisLevel', 'event', 'issuedBy', 'issuedAt', 'template']
    filename = `laporan-sertifikat-iaa`
  } else if (type === 'library') {
    const items = await db.libraryItem.findMany({
      where: from || to ? { createdAt: dateFilter } : undefined,
      orderBy: { downloadCount: 'desc' },
    })
    data = {
      title: 'Laporan Digital Library IAA',
      generatedAt: new Date().toISOString(),
      generatedBy: user.name,
      total: items.length,
      totalDownloads: items.reduce((s, i) => s + i.downloadCount, 0),
      totalViews: items.reduce((s, i) => s + i.viewCount, 0),
      items: items.map((i) => ({
        title: i.title,
        category: i.category,
        author: i.author,
        year: i.year,
        pages: i.pages,
        downloadCount: i.downloadCount,
        viewCount: i.viewCount,
      })),
    }
    csvRows = data.items
    csvHeaders = ['title', 'category', 'author', 'year', 'pages', 'downloadCount', 'viewCount']
    filename = `laporan-digital-library-iaa`
  } else if (type === 'archives') {
    const archives = await db.archive.findMany({
      include: {
        uploadedBy: { select: { name: true } },
        _count: { select: { versions: true, accesses: true } },
      },
      orderBy: { documentDate: 'desc' },
    })
    data = {
      title: 'Laporan Arsip Digital Organisasi IAA',
      generatedAt: new Date().toISOString(),
      generatedBy: user.name,
      total: archives.length,
      archives: archives.map((a) => ({
        archiveNumber: a.archiveNumber,
        title: a.title,
        category: a.category,
        documentDate: a.documentDate,
        source: a.source,
        classification: a.classification,
        accessLevel: a.accessLevel,
        currentVersion: a.currentVersion,
        versionCount: a._count.versions,
        accessCount: a._count.accesses,
        uploadedBy: a.uploadedBy.name,
      })),
    }
    csvRows = data.archives
    csvHeaders = ['archiveNumber', 'title', 'category', 'documentDate', 'source', 'classification', 'accessLevel', 'currentVersion', 'versionCount', 'accessCount', 'uploadedBy']
    filename = `laporan-arsip-organisasi-iaa`
  } else {
    return NextResponse.json({ error: 'Tipe laporan tidak valid' }, { status: 400 })
  }

  if (format === 'csv') {
    const csv = toCSV(csvRows, csvHeaders)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    })
  }

  return NextResponse.json(data)
}
