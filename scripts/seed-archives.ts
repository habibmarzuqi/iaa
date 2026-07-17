/* IAA Digital — Seed Arsip Digital + Sample data for new modules
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Arsip Digital + Chat seed...')

  // Get existing users
  const superAdmin = await db.user.findUnique({ where: { email: 'superadmin@iaa-anri.go.id' } })
  const admin = await db.user.findUnique({ where: { email: 'admin@iaa-anri.go.id' } })
  const pengurus = await db.user.findUnique({ where: { email: 'pengurus@iaa-anri.go.id' } })
  if (!superAdmin || !admin || !pengurus) {
    console.error('Run base seed first (scripts/seed.ts)')
    process.exit(1)
  }

  // Clear existing archives
  await db.archiveAccess.deleteMany()
  await db.archiveVersion.deleteMany()
  await db.archive.deleteMany()

  const archives = [
    {
      archiveNumber: 'ARC-SK-2026-001',
      title: 'SK Pengurus Pusat IAA Periode 2024-2027',
      description: 'Surat Keputusan pengangkatan pengurus pusat Ikatan Arsiparis ANRI periode 2024-2027 yang ditetapkan dalam Rapat Pleno Dewan Pembina.',
      category: 'SK',
      documentDate: new Date('2024-01-15'),
      source: 'Dewan Pembina IAA',
      classification: 'PUBLIK',
      accessLevel: 'PUBLIK',
      tags: 'sk,pengurus,periode 2024-2027',
      isPinned: true,
      uploadedById: superAdmin.id,
      versions: [
        { version: 1, fileName: 'SK-Pengurus-2024-v1.pdf', fileSize: 245000, mimeType: 'application/pdf', changeLog: 'Versi awal pengangkatan', uploadedById: superAdmin.id, createdAt: new Date('2024-01-15') },
        { version: 2, fileName: 'SK-Pengurus-2024-v2.pdf', fileSize: 251000, mimeType: 'application/pdf', changeLog: 'Revisi pasal 5 tentang tugas bendahara', uploadedById: admin.id, createdAt: new Date('2024-03-10') },
      ],
    },
    {
      archiveNumber: 'ARC-ADART-2024-001',
      title: 'Anggaran Dasar dan Rumah Tangga IAA',
      description: 'AD/ART Ikatan Arsiparis ANRI hasil amandemen Kongres VI tahun 2024. Dokumen dasar organisasi yang mengatur tata kelola, keanggotaan, dan kepengurusan.',
      category: 'AD_ART',
      documentDate: new Date('2024-11-20'),
      source: 'Kongres VI IAA',
      classification: 'PUBLIK',
      accessLevel: 'PUBLIK',
      tags: 'ad,art,kongres,amandemen',
      isPinned: true,
      uploadedById: superAdmin.id,
      versions: [
        { version: 1, fileName: 'AD-ART-IAA-2024.pdf', fileSize: 580000, mimeType: 'application/pdf', changeLog: 'Hasil amandemen Kongres VI', uploadedById: superAdmin.id, createdAt: new Date('2024-11-20') },
      ],
    },
    {
      archiveNumber: 'ARC-MOU-2026-001',
      title: 'MoU IAA - Perpustakaan Nasional RI',
      description: 'Nota Kesepahaman antara Ikatan Arsiparis ANRI dan Perpustakaan Nasional RI tentang pengembangan ekosistem digital library terintegrasi. Masa berlaku 5 tahun.',
      category: 'MOU',
      documentDate: new Date('2026-05-20'),
      source: 'Sekretariat IAA',
      destination: 'Perpustakaan Nasional RI',
      classification: 'INTERNAL',
      accessLevel: 'PENGURUS',
      tags: 'mou,perpusnas,digital library,kerja sama',
      isPinned: false,
      uploadedById: superAdmin.id,
      versions: [
        { version: 1, fileName: 'MoU-IAA-Perpusnas-2026.pdf', fileSize: 320000, mimeType: 'application/pdf', changeLog: 'Versi awal penandatanganan', uploadedById: superAdmin.id, createdAt: new Date('2026-05-20') },
      ],
    },
    {
      archiveNumber: 'ARC-SURAT-M-2026-045',
      title: 'Undangan Rakornas Arsiparis 2026 dari ANRI',
      description: 'Surat undangan resmi dari Kepala ANRI kepada IAA untuk berpartisipasi dalam Rapat Koordinasi Nasional Arsiparis 2026.',
      category: 'SURAT_MASUK',
      documentDate: new Date('2026-02-10'),
      source: 'Kepala ANRI',
      destination: 'Ketua Umum IAA',
      classification: 'INTERNAL',
      accessLevel: 'PENGURUS',
      tags: 'undangan,rakornas,2026',
      isPinned: false,
      uploadedById: admin.id,
      versions: [
        { version: 1, fileName: 'Undangan-Rakornas-2026.pdf', fileSize: 145000, mimeType: 'application/pdf', changeLog: 'Surat masuk original', uploadedById: admin.id, createdAt: new Date('2026-02-10') },
      ],
    },
    {
      archiveNumber: 'ARC-SURAT-K-2026-028',
      title: 'Surat Balasan IAA ke Perpusnas',
      description: 'Surat balasan resmi IAA kepada Perpustakaan Nasional RI mengenai persiapan implementasi MoU pengembangan digital library.',
      category: 'SURAT_KELUAR',
      documentDate: new Date('2026-06-05'),
      source: 'Sekretaris Jenderal IAA',
      destination: 'Perpustakaan Nasional RI',
      classification: 'INTERNAL',
      accessLevel: 'PENGURUS',
      tags: 'surat keluar,perpusnas,mou',
      isPinned: false,
      uploadedById: pengurus.id,
      versions: [
        { version: 1, fileName: 'Surat-Balasan-Perpusnas.pdf', fileSize: 98000, mimeType: 'application/pdf', changeLog: 'Draft awal', uploadedById: pengurus.id, createdAt: new Date('2026-06-05') },
        { version: 2, fileName: 'Surat-Balasan-Perpusnas-v2.pdf', fileSize: 102000, mimeType: 'application/pdf', changeLog: 'Revisi penanggalan dan tanda tangan', uploadedById: pengurus.id, createdAt: new Date('2026-06-08') },
      ],
    },
    {
      archiveNumber: 'ARC-RAPAT-2026-012',
      title: 'Notula Rapat Pleno Pengurus Pusat Triwulan II 2026',
      description: 'Dokumentasi notula rapat pleno pengurus pusat IAA triwulan II 2026 yang membahas evaluasi kegiatan, laporan keuangan, dan persiapan Harwanas.',
      category: 'DOKUMEN_RAPAT',
      documentDate: new Date('2026-07-05'),
      source: 'Sekretariat IAA',
      classification: 'INTERNAL',
      accessLevel: 'PENGURUS',
      tags: 'notula,rapat pleno,tw ii 2026',
      isPinned: false,
      uploadedById: pengurus.id,
      versions: [
        { version: 1, fileName: 'Notula-Rapat-Pleno-TW2-2026.pdf', fileSize: 187000, mimeType: 'application/pdf', changeLog: 'Notula final', uploadedById: pengurus.id, createdAt: new Date('2026-07-05') },
      ],
    },
    {
      archiveNumber: 'ARC-SK-2026-008',
      title: 'SK Panitia Harwanas ke-53 Tahun 2026',
      description: 'Surat Keputusan pembentukan panitia pelaksana Peringatan Hari Arsip Nasional ke-53 tahun 2026.',
      category: 'SK',
      documentDate: new Date('2026-05-01'),
      source: 'Ketua Umum IAA',
      classification: 'PUBLIK',
      accessLevel: 'ANGGOTA',
      tags: 'sk,panitia,harwanas 2026',
      isPinned: false,
      uploadedById: superAdmin.id,
      versions: [
        { version: 1, fileName: 'SK-Panitia-Harwanas-2026.pdf', fileSize: 156000, mimeType: 'application/pdf', changeLog: 'Versi awal', uploadedById: superAdmin.id, createdAt: new Date('2026-05-01') },
      ],
    },
    {
      archiveNumber: 'ARC-ORG-2025-003',
      title: 'Laporan Tahunan IAA 2025',
      description: 'Laporan tahunan Ikatan Arsiparis ANRI tahun 2025 mencakup kegiatan, keuangan, keanggotaan, dan pencapaian organisasi.',
      category: 'DOKUMEN_ORGANISASI',
      documentDate: new Date('2026-01-30'),
      source: 'Sekretariat IAA',
      classification: 'PUBLIK',
      accessLevel: 'PUBLIK',
      tags: 'laporan,tahunan,2025',
      isPinned: false,
      uploadedById: admin.id,
      versions: [
        { version: 1, fileName: 'Laporan-Tahunan-IAA-2025.pdf', fileSize: 1240000, mimeType: 'application/pdf', changeLog: 'Versi publikasi', uploadedById: admin.id, createdAt: new Date('2026-01-30') },
      ],
    },
  ]

  for (const a of archives) {
    const { versions, ...archiveData } = a
    const archive = await db.archive.create({ data: archiveData as any })
    for (const v of versions) {
      await db.archiveVersion.create({
        data: {
          ...v,
          archiveId: archive.id,
        } as any,
      })
    }
  }

  // Seed some archive accesses for demo
  const allArchives = await db.archive.findMany({ take: 5 })
  for (const arc of allArchives) {
    await db.archiveAccess.create({
      data: {
        archiveId: arc.id,
        userId: pengurus.id,
        action: 'VIEW',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      },
    })
    await db.archiveAccess.create({
      data: {
        archiveId: arc.id,
        userId: admin.id,
        action: 'DOWNLOAD',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      },
    })
  }

  console.log(`✅ Seeded ${archives.length} archives with versions + accesses`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await db.$disconnect() })
