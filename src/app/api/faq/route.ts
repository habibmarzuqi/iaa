/**
 * CMS API — FAQ (Pertanyaan Umum)
 * GET    /api/faq                  — public list (published only, ordered by `order`)
 * GET    /api/faq?admin=true       — admin list (all items)
 * POST   /api/faq                  — create item (admin+)
 * PATCH  /api/faq?id=xxx           — update item (admin+)
 * DELETE /api/faq?id=xxx           — delete item (admin+)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

const DEFAULT_FAQS = [
  {
    question: 'Apa itu IAA Digital?',
    answer: 'IAA Digital adalah platform digital resmi Ikatan Arsiparis ANRI yang mengintegrasikan website publik, manajemen anggota, perpustakaan digital, arsip organisasi, registrasi kegiatan, e-certificate, dan dashboard organisasi dalam satu sistem terpadu. Platform ini dikembangkan dengan teknologi modern untuk mendukung transformasi digital kearsipan Indonesia.',
    category: 'Umum',
    order: 1,
  },
  {
    question: 'Bagaimana cara menjadi anggota IAA?',
    answer: 'Pendaftaran anggota baru dibuka setiap tahun. Anda dapat mendaftar melalui portal IAA Digital dengan mengisi formulir pendaftaran online, melampirkan dokumen pendukung (NIP, ijazah, SK pengangkatan), dan membayar iuran tahunan. Setelah diverifikasi oleh pengurus, Anda akan menerima nomor anggota dan dapat mengakses kartu keanggotaan digital.',
    category: 'Keanggotaan',
    order: 2,
  },
  {
    question: 'Apakah Digital Membership Card sah dan diakui?',
    answer: 'Ya, Digital Membership Card di IAA Digital memiliki QR Code yang terenkripsi dan dapat diverifikasi keasliannya melalui portal resmi. Kartu ini setara dengan kartu fisik dan diterima di seluruh kegiatan IAA maupun mitra kerja sama. Setiap kartu memiliki nomor unik dan masa berlaku sesuai status keanggotaan.',
    category: 'Keanggotaan',
    order: 3,
  },
  {
    question: 'Bagaimana cara mendaftar kegiatan (webinar, seminar, pelatihan)?',
    answer: 'Anggota dan publik dapat mendaftar kegiatan melalui menu Agenda di portal IAA Digital. Pilih kegiatan yang ingin diikuti, klik tombol "Daftar Sekarang", dan lengkapi formulir registrasi. Konfirmasi pendaftaran akan dikirim secara otomatis.',
    category: 'Kegiatan',
    order: 4,
  },
  {
    question: 'Apakah e-certificate yang diterbitkan memiliki verifikasi online?',
    answer: 'Ya, setiap e-certificate yang diterbitkan melalui IAA Digital memiliki nomor sertifikat unik dan QR Code verifikasi. Pemilik sertifikat dapat mengunduh PDF, dan pihak ketiga dapat memverifikasi keaslian sertifikat dengan memasukkan nomor atau memindai QR Code di portal publik IAA.',
    category: 'Sertifikat',
    order: 5,
  },
  {
    question: 'Apa saja koleksi yang tersedia di Digital Library?',
    answer: 'Digital Library IAA menyediakan beragam koleksi: buku referensi kearsipan, ebook, jurnal ilmiah, pedoman teknis, regulasi terkait arsip, SOP standar, template dokumen, serta materi pelatihan.',
    category: 'Layanan',
    order: 6,
  },
  {
    question: 'Apakah data anggota aman di platform ini?',
    answer: 'Keamanan data adalah prioritas utama. Platform IAA Digital mengimplementasikan enkripsi password, CSRF protection, rate limiting, audit trail untuk setiap aksi sensitif, serta backup otomatis harian.',
    category: 'Keamanan',
    order: 7,
  },
]

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

function isAdmin(user: any) {
  return !!user && ['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const admin = url.searchParams.get('admin') === 'true'

  try {
    // Admin list — all items
    if (admin) {
      const user = await getSessionUser(req)
      if (!isAdmin(user)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      const faqs = await db.fAQItem.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      })

      // Seed if empty
      if (faqs.length === 0) {
        for (const item of DEFAULT_FAQS) {
          await db.fAQItem.create({ data: item })
        }
        const seeded = await db.fAQItem.findMany({
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        })
        return NextResponse.json({ faqs: seeded, total: seeded.length })
      }

      return NextResponse.json({ faqs, total: faqs.length })
    }

    // Public list — published only
    const faqs = await db.fAQItem.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })

    // Seed if empty
    if (faqs.length === 0) {
      for (const item of DEFAULT_FAQS) {
        await db.fAQItem.create({ data: item })
      }
      const seeded = await db.fAQItem.findMany({
        where: { isPublished: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      })
      return NextResponse.json({ faqs: seeded })
    }

    return NextResponse.json({ faqs })
  } catch (e: any) {
    console.error('FAQ GET error:', e)
    return NextResponse.json({ error: 'Gagal mengambil data FAQ' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Forbidden — minimal Pengurus' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { question, answer, category, order, isPublished } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'Pertanyaan (question) dan jawaban (answer) wajib diisi' }, { status: 400 })
    }

    const faq = await db.fAQItem.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim() || 'Umum',
        order: typeof order === 'number' ? order : 0,
        isPublished: isPublished !== false,
      },
    })

    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'FAQ_CREATE',
        description: `Created FAQ item: "${question.slice(0, 40)}..."`,
      },
    })

    return NextResponse.json({ faq }, { status: 201 })
  } catch (e: any) {
    console.error('FAQ create error:', e)
    return NextResponse.json({ error: 'Gagal membuat FAQ' }, { status: 500 })
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

  const existing = await db.fAQItem.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'FAQ tidak ditemukan' }, { status: 404 })

  try {
    const body = await req.json()
    const { question, answer, category, order, isPublished } = body

    const updated = await db.fAQItem.update({
      where: { id },
      data: {
        ...(question !== undefined && { question: question.trim() }),
        ...(answer !== undefined && { answer: answer.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(order !== undefined && { order: Number(order) || 0 }),
        ...(isPublished !== undefined && { isPublished }),
      },
    })

    await db.auditLog.create({
      data: {
        userId: user!.id,
        action: 'FAQ_UPDATE',
        description: `Updated FAQ item: "${updated.question.slice(0, 40)}..."`,
      },
    })

    return NextResponse.json({ faq: updated })
  } catch (e: any) {
    console.error('FAQ update error:', e)
    return NextResponse.json({ error: 'Gagal update FAQ' }, { status: 500 })
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

  const existing = await db.fAQItem.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'FAQ tidak ditemukan' }, { status: 404 })

  await db.fAQItem.delete({ where: { id } })

  await db.auditLog.create({
    data: {
      userId: user!.id,
      action: 'FAQ_DELETE',
      description: `Deleted FAQ item: "${existing.question.slice(0, 40)}..."`,
    },
  })

  return NextResponse.json({ ok: true })
}
