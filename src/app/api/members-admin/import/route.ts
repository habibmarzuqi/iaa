/**
 * Members Admin — Excel Bulk Import
 * POST /api/members-admin/import  (multipart/form-data, field: "file")
 *
 * Reads an .xlsx file (template format) and creates User + Member rows.
 * Returns { imported, skipped, errors, total }.
 *
 * Required auth: ADMINISTRATOR+ (PENGURUS cannot bulk import)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createHash } from 'crypto'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const maxDuration = 60

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

const VALID_ROLES = ['ANGGOTA', 'PENGURUS', 'ADMINISTRATOR', 'SUPER_ADMIN']
const VALID_LEVELS = ['PEMULA', 'MUDA', 'MADYA', 'UTAMA']
const VALID_STATUSES = ['AKTIF', 'TIDAK_AKTIF', 'PENSIUN', 'MENINGGAL']

interface RowData {
  [key: string]: string | number | undefined
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden — Administrator only' },
      { status: 403 },
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'File wajib diunggah' }, { status: 400 })
    }

    // Validate file type
    const fileName = file.name.toLowerCase()
    const isXlsx =
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    if (!isXlsx) {
      return NextResponse.json(
        { error: 'File harus format .xlsx atau .xls' },
        { status: 400 },
      )
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file melebihi 5MB' },
        { status: 400 },
      )
    }

    // Read & parse Excel
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const wb = XLSX.read(buffer, { type: 'buffer' })

    // Use first sheet (Template)
    const sheetName = wb.SheetNames[0]
    if (!sheetName) {
      return NextResponse.json({ error: 'File Excel tidak memiliki sheet' }, { status: 400 })
    }
    const sheet = wb.Sheets[sheetName]
    const rows: RowData[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Sheet kosong — tidak ada data untuk diimport' }, { status: 400 })
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { error: `Maksimal 500 baris per import. File berisi ${rows.length} baris.` },
        { status: 400 },
      )
    }

    // Normalize header keys (strip whitespace, lowercase, remove asterisk)
    const normalizeKey = (k: string) =>
      k.toString().trim().toLowerCase().replace(/\*/g, '').replace(/\s+/g, '')

    const normalizedRows = rows.map((r) => {
      const out: Record<string, string> = {}
      for (const [k, v] of Object.entries(r)) {
        out[normalizeKey(k)] = (v ?? '').toString().trim()
      }
      return out
    })

    // Pre-fetch existing emails & memberNumbers for fast lookup
    const allEmails = new Set(
      (await db.user.findMany({ select: { email: true } })).map((u) => u.email.toLowerCase()),
    )
    const allMemberNumbers = new Set(
      (await db.member.findMany({ select: { memberNumber: true } })).map((m) => m.memberNumber),
    )

    const result = {
      imported: 0,
      skipped: 0,
      errors: [] as { row: number; email: string; reason: string }[],
      total: rows.length,
    }

    // Track emails/memberNumbers we are about to insert in this batch (to detect dupes within file)
    const seenEmailsInFile = new Set<string>()
    const seenMemberNumbersInFile = new Set<string>()

    for (let i = 0; i < normalizedRows.length; i++) {
      const row = normalizedRows[i]
      const rowNum = i + 2 // +1 for header, +1 for 1-indexed
      const email = (row.email || '').toLowerCase()
      const password = row.password || ''
      const name = row.name || ''
      const memberNumber = row.membernumber || ''
      const fullName = row.fullname || ''
      const role = (row.role || 'ANGGOTA').toUpperCase()
      const nip = row.nip || ''
      const workUnit = row.workunit || ''
      const position = row.position || ''
      const arsiparisLevel = (row.arsiparislevel || '').toUpperCase()
      const education = row.education || ''
      const status = (row.status || 'AKTIF').toUpperCase()
      const joinDateRaw = row.joindate || ''

      // Validate required fields
      if (!email || !password || !name || !memberNumber || !fullName) {
        result.errors.push({
          row: rowNum,
          email: email || '(kosong)',
          reason: 'Field wajib (*) kosong: email, password, name, memberNumber, fullName',
        })
        result.skipped++
        continue
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        result.errors.push({ row: rowNum, email, reason: 'Format email tidak valid' })
        result.skipped++
        continue
      }

      // Validate role
      if (role && !VALID_ROLES.includes(role)) {
        result.errors.push({
          row: rowNum,
          email,
          reason: `Role "${role}" tidak valid. Pilihan: ${VALID_ROLES.join(', ')}`,
        })
        result.skipped++
        continue
      }

      // Validate arsiparisLevel
      if (arsiparisLevel && !VALID_LEVELS.includes(arsiparisLevel)) {
        result.errors.push({
          row: rowNum,
          email,
          reason: `arsiparisLevel "${arsiparisLevel}" tidak valid. Pilihan: ${VALID_LEVELS.join(', ')}`,
        })
        result.skipped++
        continue
      }

      // Validate status
      if (status && !VALID_STATUSES.includes(status)) {
        result.errors.push({
          row: rowNum,
          email,
          reason: `status "${status}" tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}`,
        })
        result.skipped++
        continue
      }

      // Check duplicate in DB
      if (allEmails.has(email)) {
        result.errors.push({ row: rowNum, email, reason: 'Email sudah terdaftar di database' })
        result.skipped++
        continue
      }
      if (allMemberNumbers.has(memberNumber)) {
        result.errors.push({
          row: rowNum,
          email,
          reason: `memberNumber "${memberNumber}" sudah terdaftar di database`,
        })
        result.skipped++
        continue
      }

      // Check duplicate within same file
      if (seenEmailsInFile.has(email)) {
        result.errors.push({ row: rowNum, email, reason: 'Email duplikat dalam file ini' })
        result.skipped++
        continue
      }
      if (seenMemberNumbersInFile.has(memberNumber)) {
        result.errors.push({
          row: rowNum,
          email,
          reason: `memberNumber "${memberNumber}" duplikat dalam file ini`,
        })
        result.skipped++
        continue
      }

      // Parse joinDate
      let joinDate: Date = new Date()
      if (joinDateRaw) {
        const parsed = new Date(joinDateRaw)
        if (!isNaN(parsed.getTime())) {
          joinDate = parsed
        }
      }

      // Create User + Member (transaction)
      try {
        await db.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email,
              password: hashPassword(password),
              name,
              role: role as any,
              isActive: true,
            },
          })

          await tx.member.create({
            data: {
              userId: newUser.id,
              memberNumber,
              nip: nip || null,
              fullName,
              photo: null,
              workUnit: workUnit || null,
              position: position || null,
              arsiparisLevel: (arsiparisLevel || null) as any,
              education: education || null,
              trainingHistory: null,
              certificationHistory: null,
              status: (status || 'AKTIF') as any,
              joinDate,
            },
          })
        })

        // Track for in-file dedupe
        seenEmailsInFile.add(email)
        seenMemberNumbersInFile.add(memberNumber)
        allEmails.add(email)
        allMemberNumbers.add(memberNumber)
        result.imported++
      } catch (e: any) {
        result.errors.push({
          row: rowNum,
          email,
          reason: `DB error: ${e.message?.slice(0, 200) || 'unknown'}`,
        })
        result.skipped++
      }
    }

    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'MEMBER_BULK_IMPORT',
        description: `Imported ${result.imported} members from Excel (${result.skipped} skipped, ${result.errors.length} errors)`,
      },
    })

    return NextResponse.json({
      ...result,
      message: `Import selesai: ${result.imported} anggota baru, ${result.skipped} dilewati`,
    }, { status: 201 })
  } catch (e: any) {
    console.error('Member import error:', e)
    return NextResponse.json(
      { error: 'Gagal import: ' + (e.message || 'unknown error') },
      { status: 500 },
    )
  }
}
