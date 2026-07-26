/**
 * Export Event Participants to Excel
 * GET /api/events/export-participants?id=xxx
 *
 * Returns .xlsx file with all registrations for the event.
 * Columns: No, Nama, Email, Telepon, Institusi, Tipe (Anggota/Non), Status, Checked-In, Tanggal Daftar
 *
 * Auth: PENGURUS+
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const eventId = url.searchParams.get('id')
  if (!eventId) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  const event = await db.event.findUnique({ where: { id: eventId } })
  if (!event) return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })

  const registrations = await db.registration.findMany({
    where: { eventId },
    include: {
      member: { select: { fullName: true, memberNumber: true, arsiparisLevel: true, position: true, workUnit: true } },
    },
    orderBy: { registeredAt: 'asc' },
  })

  // Build Excel data
  const headers = [
    'No', 'Nama', 'Tipe Peserta', 'Nomor Anggota', 'Email', 'Telepon',
    'Institusi/Unit Kerja', 'Jabatan', 'Jenjang', 'Status', 'Check-In', 'Tanggal Daftar',
  ]

  const rows = registrations.map((r, i) => {
    const isMember = r.isMember
    return [
      i + 1,
      isMember ? r.member?.fullName : r.participantName,
      isMember ? 'Anggota IAA' : 'Non-Anggota',
      isMember ? r.member?.memberNumber || '' : '',
      isMember ? '' : r.participantEmail || '',
      isMember ? '' : r.participantPhone || '',
      isMember ? r.member?.workUnit || '' : r.participantInstitution || '',
      isMember ? r.member?.position || '' : '',
      isMember ? r.member?.arsiparisLevel || '' : '',
      r.status,
      r.checkedIn ? 'Sudah' : 'Belum',
      new Date(r.registeredAt).toLocaleString('id-ID'),
    ]
  })

  // Summary sheet
  const summaryData = [
    ['DAFTAR PESERTA KEGIATAN'],
    [''],
    ['Nama Kegiatan', event.title],
    ['Jenis', event.eventType],
    ['Tanggal Mulai', new Date(event.startDate).toLocaleString('id-ID')],
    ['Tanggal Selesai', new Date(event.endDate).toLocaleString('id-ID')],
    ['Lokasi', event.location],
    ['Kuota', event.quota],
    ['Terdaftar', event.registeredCount],
    ['Total Peserta', registrations.length],
    ['Anggota IAA', registrations.filter((r) => r.isMember).length],
    ['Non-Anggota', registrations.filter((r) => !r.isMember).length],
    ['Approved', registrations.filter((r) => r.status === 'APPROVED').length],
    ['Pending', registrations.filter((r) => r.status === 'PENDING').length],
    ['Checked-In', registrations.filter((r) => r.checkedIn).length],
    [''],
    ['Dicetak oleh', user.name],
    ['Tanggal Cetak', new Date().toLocaleString('id-ID')],
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  ws1['!cols'] = [{ wch: 20 }, { wch: 50 }]
  ws1['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }]

  const ws2 = XLSX.utils.aoa_to_sheet([headers, ...rows])
  ws2['!cols'] = [
    { wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 30 },
    { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
    { wch: 10 }, { wch: 25 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan')
  XLSX.utils.book_append_sheet(wb, ws2, 'Daftar Peserta')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const safeTitle = event.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="peserta-${safeTitle}.xlsx"`,
      'Content-Length': String(buf.length),
    },
  })
}
