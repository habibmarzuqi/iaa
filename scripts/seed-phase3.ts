/* IAA Digital — Phase 3 seed: Notifications + Announcements */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Phase 3: Notifications...')

  const superAdmin = await db.user.findUnique({ where: { email: 'superadmin@iaa-anri.go.id' } })
  const admin = await db.user.findUnique({ where: { email: 'admin@iaa-anri.go.id' } })
  const pengurus = await db.user.findUnique({ where: { email: 'pengurus@iaa-anri.go.id' } })
  const anggota = await db.user.findUnique({ where: { email: 'anggota@iaa-anri.go.id' } })
  const budi = await db.user.findUnique({ where: { email: 'budi.santoso@iaa-anri.go.id' } })
  const dewi = await db.user.findUnique({ where: { email: 'dewi.lestari@iaa-anri.go.id' } })

  if (!superAdmin || !anggota || !pengurus) {
    console.error('Run base seed first')
    process.exit(1)
  }

  // Clear existing
  await db.notification.deleteMany()
  await db.announcement.deleteMany()

  // ===== NOTIFICATIONS =====
  const notifs = [
    // Untuk anggota (Rina)
    { userId: anggota.id, type: 'CERTIFICATE_ISSUED', title: 'Sertifikat Baru Diterbitkan', message: 'Sertifikat "Peserta Webinar Transformasi Digital Kearsipan" (IAA-CERT-2026-0001) telah diterbitkan untuk Anda.', link: 'member-dashboard', data: JSON.stringify({ certNumber: 'IAA-CERT-2026-0001' }) },
    { userId: anggota.id, type: 'EVENT_REMINDER', title: 'Pengingat: Webinar Besok', message: 'Webinar "Transformasi Digital Kearsipan" akan dimulai besok pukul 09.00 WIB via Zoom. Jangan lupa untuk check-in 15 menit sebelum mulai.', link: 'event-detail', data: JSON.stringify({ eventSlug: 'webinar-transformasi-digital-kearsipan' }) },
    { userId: anggota.id, type: 'REGISTRATION_STATUS', title: 'Pendaftaran Diterima', message: 'Pendaftaran Anda untuk "Pelatihan Manajemen Arsip Elektronik Berbasis Srikandi" telah disetujui.', link: 'member-dashboard' },
    { userId: anggota.id, type: 'REGISTRATION_STATUS', title: 'Menunggu Approval', message: 'Pendaftaran Anda untuk "Seminar Nasional Kearsipan 2026" sedang menunggu persetujuan pengurus.', link: 'member-dashboard' },
    { userId: anggota.id, type: 'ANNOUNCEMENT', title: 'Selamat Hari Arsip Nasional!', message: 'Selamat Hari Arsip Nasional ke-53. Mari tingkatkan dedikasi untuk memori kolektif bangsa.', link: 'public' },
    { userId: anggota.id, type: 'SYSTEM', title: 'Kartu Anggota Digital Aktif', message: 'Digital Membership Card Anda (IAA-2024-0001) telah aktif. Unduh melalui dashboard anggota.', link: 'member-dashboard' },

    // Untuk super admin
    { userId: superAdmin.id, type: 'SYSTEM', title: 'Backup Database Berhasil', message: 'Backup otomatis database berhasil pada 03:00 WIB. File: iaa-backup-2026-07-17-0300.json (2.4 MB, 1,247 records).', link: 'admin-reports' },
    { userId: superAdmin.id, type: 'REGISTRATION_STATUS', title: '3 Pendaftaran Menunggu Approval', message: 'Ada 3 pendaftaran kegiatan baru yang memerlukan approval. Tinjau sekarang untuk menghindari penundaan.', link: 'admin-events' },
    { userId: superAdmin.id, type: 'ANNOUNCEMENT', title: 'Laporan Bulanan Siap', message: 'Laporan aktivitas organisasi bulan Juni 2026 telah dibuat otomatis. Lihat di menu Laporan.', link: 'admin-reports' },

    // Untuk pengurus
    { userId: pengurus.id, type: 'EVENT_REMINDER', title: 'Rapat Pleno Besok', message: 'Rapat Pleno Pengurus Pusat Triwulan III 2026 besok pukul 09.00 WIB di Kantor Pusat IAA. Bawa notula rapat sebelumnya.', link: 'admin-events' },
    { userId: pengurus.id, type: 'SYSTEM', title: 'Arsip Baru Diunggah', message: 'Dokumen "MoU IAA - Perpustakaan Nasional RI" telah diunggah ke Arsip Digital dengan klasifikasi INTERNAL.', link: 'admin-archives' },

    // Untuk Dewi
    { userId: dewi.id, type: 'CERTIFICATE_ISSUED', title: 'Sertifikat Workshop Diterbitkan', message: 'Sertifikat "Peserta Workshop Kurasi Digital" (IAA-CERT-2026-0012) telah diterbitkan untuk Anda.', link: 'member-dashboard' },

    // Untuk Budi
    { userId: budi.id, type: 'ANNOUNCEMENT', title: 'Pelatihan Sertifikasi Madya Batch 12', message: 'Pendaftaran Pelatihan dan Sertifikasi Arsiparis Madya Batch 12 dibuka. Kuota terbatas 60 peserta.', link: 'event-list' },
  ]

  for (const n of notifs) {
    const created = await db.notification.create({
      data: {
        userId: n.userId,
        type: n.type as any,
        title: n.title,
        message: n.message,
        link: n.link || null,
        data: n.data || null,
        // Make some read
        isRead: Math.random() > 0.6,
        readAt: Math.random() > 0.6 ? new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)) : null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      },
    })
  }

  // ===== ANNOUNCEMENTS (banner, popup, running text) =====
  const announcements = [
    {
      title: 'Pendaftaran Anggota Baru IAA 2026 Dibuka!',
      content: 'Pendaftaran anggota baru Ikatan Arsiparis ANRI periode 2026 telah dibuka. Segera daftarkan diri Anda melalui portal IAA Digital. Kuota terbatas untuk arsiparis dari seluruh Indonesia.',
      type: 'BANNER',
      isPinned: true,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-12-31'),
    },
    {
      title: 'Selamat Hari Arsip Nasional ke-53',
      content: 'Selamat Hari Arsip Nasional 2026. Tema tahun ini: "Arsip sebagai Jembatan Peradaban: Membangun Indonesia yang Berkarakter". Mari tingkatkan dedikasi untuk memori kolektif bangsa.',
      type: 'RUNNING_TEXT',
      startDate: new Date('2026-06-18'),
      endDate: new Date('2026-07-31'),
    },
    {
      title: 'Webinar Transformasi Digital Kearsipan — Besok!',
      content: 'Jangan lewatkan webinar nasional besok (25 Juli 2026, 09.00 WIB) membahas roadmap transformasi digital kearsipan Indonesia 2025-2030. Pemateri: Dirjen Kearsipan ANRI. Daftar sekarang!',
      type: 'POPUP',
      isPopup: true,
      startDate: new Date('2026-07-20'),
      endDate: new Date('2026-07-25'),
    },
    {
      title: 'Maintenance Sistem: Sabtu 25 Jul 2026 23.00-02.00 WIB',
      content: 'Sistem IAA Digital akan menjalani maintenance terjadwal. Layanan mungkin tidak tersedia sementara. Mohon maaf atas ketidaknyamanannya.',
      type: 'PINNED',
      isPinned: true,
      startDate: new Date('2026-07-22'),
      endDate: new Date('2026-07-26'),
    },
  ]

  for (const a of announcements) {
    await db.announcement.create({ data: a as any })
  }

  // ===== BACKUP HISTORY (sample) =====
  await db.backupHistory.deleteMany()
  const backups = [
    { type: 'scheduled', status: 'success', fileName: 'iaa-backup-2026-07-17-0300.json', fileSize: 2458624, recordCount: 1247, notes: 'Auto backup harian 03:00 WIB', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    { type: 'scheduled', status: 'success', fileName: 'iaa-backup-2026-07-16-0300.json', fileSize: 2451234, recordCount: 1245, notes: 'Auto backup harian 03:00 WIB', createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000) },
    { type: 'scheduled', status: 'success', fileName: 'iaa-backup-2026-07-15-0300.json', fileSize: 2448901, recordCount: 1244, notes: 'Auto backup harian 03:00 WIB', createdAt: new Date(Date.now() - 54 * 60 * 60 * 1000) },
    { type: 'manual', status: 'success', fileName: 'iaa-backup-2026-07-14-1510.json', fileSize: 2445234, recordCount: 1242, triggeredById: superAdmin.id, notes: 'Manual backup sebelum update sistem', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { type: 'scheduled', status: 'success', fileName: 'iaa-backup-2026-07-14-0300.json', fileSize: 2443123, recordCount: 1242, notes: 'Auto backup harian 03:00 WIB', createdAt: new Date(Date.now() - 78 * 60 * 60 * 1000) },
    { type: 'scheduled', status: 'failed', fileName: 'iaa-backup-2026-07-13-0300.json', fileSize: 0, recordCount: 0, notes: 'Failed: Disk space insufficient (resolved at 04:30)', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { type: 'scheduled', status: 'success', fileName: 'iaa-backup-2026-07-12-0300.json', fileSize: 2438901, recordCount: 1240, notes: 'Auto backup harian 03:00 WIB', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  ]
  for (const b of backups) {
    await db.backupHistory.create({ data: b as any })
  }

  console.log(`✅ Seeded ${notifs.length} notifications, ${announcements.length} announcements, ${backups.length} backups`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await db.$disconnect() })
