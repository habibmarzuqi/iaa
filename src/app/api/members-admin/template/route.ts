/**
 * Members Admin — Excel Template Download
 * GET /api/members-admin/template
 *
 * Returns an .xlsx file with:
 *   - Sheet "Template": column headers + 2 example rows
 *   - Sheet "Instruksi": field descriptions, allowed values, rules
 *
 * Required auth: PENGURUS+
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const maxDuration = 30

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

  // ----- Sheet 1: Template -----
  const templateHeaders = [
    'email*',
    'password*',
    'name*',
    'role',
    'memberNumber*',
    'nip',
    'fullName*',
    'workUnit',
    'position',
    'arsiparisLevel',
    'education',
    'status',
    'joinDate',
  ]

  const exampleRows = [
    [
      'budi.santoso@anri.go.id',
      'password123',
      'Budi Santoso',
      'ANGGOTA',
      'IAA-2020-0001',
      '198501012010011001',
      'Budi Santoso, S.Sos',
      'ANRI - Pusat Penelitian Kearsipan',
      'Arsiparis Muda',
      'MUDA',
      'S1 Kearsipan - Universitas Indonesia',
      'AKTIF',
      '2020-03-15',
    ],
    [
      'siti.rahma@anri.go.id',
      'password456',
      'Siti Rahma',
      'ANGGOTA',
      'IAA-2018-0012',
      '198706152011012002',
      'Siti Rahma, M.Hum',
      'ANRI - Direktorat Preservasi',
      'Arsiparis Madya',
      'MADYA',
      'S2 Manajemen Arsip - UI',
      'AKTIF',
      '2018-09-01',
    ],
  ]

  const templateSheet = XLSX.utils.aoa_to_sheet([templateHeaders, ...exampleRows])

  // Set column widths for readability
  templateSheet['!cols'] = [
    { wch: 30 }, // email
    { wch: 15 }, // password
    { wch: 25 }, // name
    { wch: 15 }, // role
    { wch: 18 }, // memberNumber
    { wch: 22 }, // nip
    { wch: 30 }, // fullName
    { wch: 35 }, // workUnit
    { wch: 22 }, // position
    { wch: 18 }, // arsiparisLevel
    { wch: 35 }, // education
    { wch: 14 }, // status
    { wch: 14 }, // joinDate
  ]

  // ----- Sheet 2: Instruksi -----
  const instruksiData = [
    ['PANDUAN IMPORT ANGGOTA IAA DIGITAL'],
    [''],
    ['Kolom', 'Wajib', 'Deskripsi', 'Format / Nilai yang Diperbolehkan'],
    ['email*', 'YA', 'Email login anggota (harus unik)', 'Format email valid, contoh: nama@anri.go.id'],
    ['password*', 'YA', 'Password awal anggota', 'Min 6 karakter. Anggota dapat mengganti sendiri setelah login.'],
    ['name*', 'YA', 'Nama singkat untuk akun (tanpa gelar)', 'Contoh: Budi Santoso'],
    ['role', 'TIDAK', 'Role akun di sistem', 'ANGGOTA (default) | PENGURUS | ADMINISTRATOR'],
    ['memberNumber*', 'YA', 'Nomor anggota (harus unik)', 'Contoh: IAA-2020-0001'],
    ['nip', 'TIDAK', 'NIP pegawai Negeri', '18 digit angka'],
    ['fullName*', 'YA', 'Nama lengkap dengan gelar', 'Contoh: Dr. Budi Santoso, M.Si.'],
    ['workUnit', 'TIDAK', 'Unit kerja', 'Contoh: ANRI - Pusat Penelitian Kearsipan'],
    ['position', 'TIDAK', 'Jabatan struktural/fungsional', 'Contoh: Arsiparis Muda'],
    ['arsiparisLevel', 'TIDAK', 'Jenjang arsiparis', 'PEMULA | MUDA | MADYA | UTAMA'],
    ['education', 'TIDAK', 'Pendidikan terakhir', 'Contoh: S1 Kearsipan - UI'],
    ['status', 'TIDAK', 'Status keanggotaan', 'AKTIF (default) | TIDAK_AKTIF | PENSIUN | MENINGGAL'],
    ['joinDate', 'TIDAK', 'Tanggal bergabung', 'Format: YYYY-MM-DD, contoh: 2020-03-15'],
    [''],
    ['CATATAN PENTING:'],
    ['1. Baris dengan email atau memberNumber yang sudah ada di database akan dilewati (tidak diimport).'],
    ['2. Baris dengan field wajib (*) kosong akan dilewati dan dicatat sebagai error.'],
    ['3. Format tanggal: YYYY-MM-DD (ISO). Contoh: 2026-01-31'],
    ['4. Nilai enum harus persis seperti di kolom "Nilai yang Diperbolehkan" (huruf besar).'],
    ['5. Maksimal 500 baris per import. Untuk lebih banyak, lakukan bertahap.'],
    ['6. Setelah import berhasil, anggota dapat login dengan email + password yang diisi.'],
  ]
  const instruksiSheet = XLSX.utils.aoa_to_sheet(instruksiData)
  instruksiSheet['!cols'] = [{ wch: 22 }, { wch: 8 }, { wch: 40 }, { wch: 55 }]

  // Merge title row
  instruksiSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
  ]

  // ----- Build workbook -----
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, templateSheet, 'Template')
  XLSX.utils.book_append_sheet(wb, instruksiSheet, 'Instruksi')

  // Write to buffer
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  // Return as downloadable file
  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-import-anggota-iaa.xlsx"',
      'Content-Length': String(buf.length),
    },
  })
}
