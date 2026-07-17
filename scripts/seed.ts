/* IAA Digital — Seed script
 * Seeds: roles, super admin, pengurus, members, articles, events, library, gallery, announcements
 */
import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const db = new PrismaClient()

function hashPassword(password: string): string {
  // Simple deterministic hash for demo (NOT for production — use bcrypt/argon2 in Laravel)
  return createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('🌱 Seeding IAA Digital...')

  // Clear existing
  await db.contactMessage.deleteMany()
  await db.auditLog.deleteMany()
  await db.certificate.deleteMany()
  await db.registration.deleteMany()
  await db.libraryItem.deleteMany()
  await db.galleryPhoto.deleteMany()
  await db.galleryAlbum.deleteMany()
  await db.announcement.deleteMany()
  await db.organizationMember.deleteMany()
  await db.event.deleteMany()
  await db.article.deleteMany()
  await db.member.deleteMany()
  await db.user.deleteMany()

  // ===== USERS =====
  const superAdmin = await db.user.create({
    data: {
      email: 'superadmin@iaa-anri.go.id',
      password: hashPassword('iaa12345'),
      name: 'Dr. Bambang Sutrisno, M.Si.',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  })

  const admin = await db.user.create({
    data: {
      email: 'admin@iaa-anri.go.id',
      password: hashPassword('iaa12345'),
      name: 'Siti Nurhaliza, S.Kom.',
      role: 'ADMINISTRATOR',
      isActive: true,
    },
  })

  const pengurus = await db.user.create({
    data: {
      email: 'pengurus@iaa-anri.go.id',
      password: hashPassword('iaa12345'),
      name: 'Drs. Ahmad Fauzi, M.Ars.',
      role: 'PENGURUS',
      isActive: true,
    },
  })

  const member1User = await db.user.create({
    data: {
      email: 'anggota@iaa-anri.go.id',
      password: hashPassword('iaa12345'),
      name: 'Rina Wijayanti, S.Sos.',
      role: 'ANGGOTA',
      isActive: true,
    },
  })

  const member2User = await db.user.create({
    data: {
      email: 'budi.santoso@iaa-anri.go.id',
      password: hashPassword('iaa12345'),
      name: 'Budi Santoso, S.Hum.',
      role: 'ANGGOTA',
      isActive: true,
    },
  })

  const member3User = await db.user.create({
    data: {
      email: 'dewi.lestari@iaa-anri.go.id',
      password: hashPassword('iaa12345'),
      name: 'Dewi Lestari, M.Ars.',
      role: 'ANGGOTA',
      isActive: true,
    },
  })

  // ===== MEMBERS =====
  const member1 = await db.member.create({
    data: {
      userId: member1User.id,
      memberNumber: 'IAA-2024-0001',
      nip: '198503152010012001',
      fullName: 'Rina Wijayanti, S.Sos.',
      workUnit: 'ANRI - Pusat Konservasi Arsip',
      position: 'Arsiparis Muda',
      arsiparisLevel: 'MUDA',
      education: 'S1 - Ilmu Perpustakaan UI (2008)',
      trainingHistory: JSON.stringify([
        { name: 'Pelatihan Konservasi Arsip Digital', year: 2022, organizer: 'ANRI' },
        { name: 'Workshop Manajemen Records', year: 2023, organizer: 'IAA' },
      ]),
      certificationHistory: JSON.stringify([
        { name: 'Sertifikasi Arsiparis Muda', year: 2021, number: 'AR-M-2021-045' },
      ]),
      status: 'AKTIF',
      joinDate: new Date('2024-01-15'),
    },
  })

  const member2 = await db.member.create({
    data: {
      userId: member2User.id,
      memberNumber: 'IAA-2024-0002',
      nip: '198811202012011002',
      fullName: 'Budi Santoso, S.Hum.',
      workUnit: 'ANRI - Direktorat Layanan Arsip',
      position: 'Arsiparis Pemula',
      arsiparisLevel: 'PEMULA',
      education: 'S1 - Sejarah UGM (2011)',
      trainingHistory: JSON.stringify([
        { name: 'Pelatihan Dasar Kearsipan', year: 2023, organizer: 'ANRI' },
      ]),
      certificationHistory: '[]',
      status: 'AKTIF',
      joinDate: new Date('2024-02-10'),
    },
  })

  const member3 = await db.member.create({
    data: {
      userId: member3User.id,
      memberNumber: 'IAA-2023-0156',
      nip: '198006152008012003',
      fullName: 'Dewi Lestari, M.Ars.',
      workUnit: 'ANRI - Pusat Penelitian Kearsipan',
      position: 'Arsiparis Madya',
      arsiparisLevel: 'MADYA',
      education: 'S2 - Ilmu Informasi UI (2015)',
      trainingHistory: JSON.stringify([
        { name: 'Pelatihan Manajemen Arsip Elektronik', year: 2022, organizer: 'IRMT' },
        { name: 'Workshop Digital Preservation', year: 2023, organizer: 'ICA' },
      ]),
      certificationHistory: JSON.stringify([
        { name: 'Sertifikasi Arsiparis Muda', year: 2018, number: 'AR-M-2018-112' },
        { name: 'Sertifikasi Arsiparis Madya', year: 2023, number: 'AR-MD-2023-028' },
      ]),
      status: 'AKTIF',
      joinDate: new Date('2023-08-20'),
    },
  })

  const pengurusMember = await db.member.create({
    data: {
      userId: pengurus.id,
      memberNumber: 'IAA-2020-0089',
      nip: '197504102003121002',
      fullName: 'Drs. Ahmad Fauzi, M.Ars.',
      workUnit: 'ANRI - Sekretariat Utama',
      position: 'Arsiparis Utama',
      arsiparisLevel: 'UTAMA',
      education: 'S2 - Manajemen Pemerintahan LAN (2010)',
      trainingHistory: JSON.stringify([
        { name: 'Pelatihan Kepemimpinan Administrasi', year: 2019, organizer: 'LAN' },
      ]),
      certificationHistory: JSON.stringify([
        { name: 'Sertifikasi Arsiparis Utama', year: 2020, number: 'AR-U-2020-012' },
      ]),
      status: 'AKTIF',
      joinDate: new Date('2020-03-01'),
    },
  })

  // ===== ORGANIZATION STRUCTURE =====
  const orgMembers = [
    { name: 'Dr. H. M. Asman, M.Si.', position: 'Ketua Umum', category: 'Pengurus Pusat', order: 1 },
    { name: 'Dra. Tati Suharti, M.Ars.', position: 'Wakil Ketua Umum', category: 'Pengurus Pusat', order: 2 },
    { name: 'Drs. Ahmad Fauzi, M.Ars.', position: 'Sekretaris Jenderal', category: 'Pengurus Pusat', order: 3 },
    { name: 'Rina Wijayanti, S.Sos.', position: 'Bendahara Umum', category: 'Pengurus Pusat', order: 4 },
    { name: 'Dewi Lestari, M.Ars.', position: 'Ketua Bidang Profesional', category: 'Bidang', order: 5 },
    { name: 'Budi Santoso, S.Hum.', position: 'Ketua Bidang Litbang', category: 'Bidang', order: 6 },
    { name: 'Prof. Dr. Endang S., M.Hum.', position: 'Pembina', category: 'Dewan Pembina', order: 7 },
    { name: 'Dr. Ir. Hendro W., M.M.', position: 'Pembina', category: 'Dewan Pembina', order: 8 },
  ]
  for (const om of orgMembers) {
    await db.organizationMember.create({ data: om })
  }

  // ===== ARTICLES / BERITA =====
  const articles = [
    {
      slug: 'rapat-koordinasi-nasional-arsiparis-2026',
      title: 'Rapat Koordinasi Nasional Arsiparis 2026 Diselenggarakan di Jakarta',
      excerpt: 'IAA menggelar Rakornas arsiparis dengan tema "Transformasi Digital Kearsipan untuk Indonesia Emas 2045".',
      content: `Jakarta — Ikatan Arsiparis ANRI (IAA) sukses menyelenggarakan Rapat Koordinasi Nasional (Rakornas) Arsiparis 2026 di Hotel Bidakara, Jakarta, pada 12-14 Maret 2026. Kegiatan ini diikuti oleh lebih dari 350 arsiparis dari seluruh Indonesia.

Mengusung tema "Transformasi Digital Kearsipan untuk Indonesia Emas 2045", Rakornas tahun ini membahas empat isu strategis: implementasi sistem manajemen arsip elektronik, standardisasi sertifikasi arsiparis profesional, penguatan kapasitas kelembagaan organisasi, dan pengembangan ekosistem digital library nasional.

Ketua Umum IAA, Dr. H. M. Asman, M.Si., dalam sambutan pembukaannya menekankan pentingnya adaptasi arsiparis terhadap teknologi digital. "Kearsipan modern bukan sekadar menyimpan, tetapi mengelola informasi sebagai aset strategis bangsa. Digitalisasi adalah keniscayaan, bukan pilihan," tegasnya.

Rakornas juga menghasilkan beberapa keputusan penting, antara lain penerapan skema sertifikasi arsiparis berjenjang yang baru, kerja sama dengan Kementerian Kominfo untuk pengembangan platform nasional arsip digital, serta program pertukaran arsiparis antar daerah.`,
      category: 'Kegiatan',
      tags: 'rakornas,arsiparis,jakarta,digitalisasi',
      isFeatured: true,
      authorId: pengurus.id,
      publishedAt: new Date('2026-03-15'),
    },
    {
      slug: 'pelatihan-sertifikasi-arsiparis-madya-batch-12',
      title: 'Pelatihan dan Sertifikasi Arsiparis Madya Batch 12 Resmi Dibuka',
      excerpt: 'Program pelatihan intensif 3 bulan untuk peningkatan kompetensi arsiparis muda menuju madya dibuka untuk 60 peserta.',
      content: `IAA bersama Pusat Pengembangan Sumber Daya Manusia (PPSDM) ANRI resmi membuka pendaftaran Pelatihan dan Sertifikasi Arsiparis Madya Batch ke-12. Program ini dirancang sebagai jenjang karir profesional bagi arsiparis muda yang ingin naik ke level madya.

Program pelatihan berdurasi 3 bulan, terdiri dari 12 modul pembelajaran yang mencakup: manajemen arsip elektronik, kuratorial digital, preservasi digital jangka panjang, etika profesi arsiparis, tata kelola records center, audit sistem kearsipan, dan metodologi penelitian kearsipan.

Pelatihan menggunakan pendekatan blended learning — kombinasi kelas tatap muka di Jakarta, sesi webinar interaktif, dan praktik lapangan di lembaga arsip terpilih. Setiap peserta juga akan mendapat mentorship dari arsiparis utama selama 6 bulan pasca pelatihan.

"Kami berkomitmen menghasilkan arsiparis madya yang tidak hanya kompeten secara teknis, tetapi juga memiliki visi strategis dalam tata kelola informasi publik," ujar Ketua Bidang Profesional IAA, Dewi Lestari, M.Ars.

Pendaftaran ditutup pada 30 April 2026. Informasi lengkap dapat diakses melalui portal IAA Digital.`,
      category: 'Pelatihan',
      tags: 'pelatihan,sertifikasi,arsiparis madya',
      isFeatured: true,
      authorId: admin.id,
      publishedAt: new Date('2026-04-05'),
    },
    {
      slug: 'kerja-sama-iaa-dengan-perpustakaan-nasional',
      title: 'IAA dan Perpustakaan Nasional Tandatangani MoU Pengembangan Digital Library',
      excerpt: 'Kerja sama strategis untuk membangun ekosistem digital library terintegrasi antara arsip dan perpustakaan nasional.',
      content: `Jakarta — Ikatan Arsiparis ANRI (IAA) dan Perpustakaan Nasional RI (Perpusnas) menandatangani Nota Kesepahaman (MoU) untuk pengembangan ekosistem digital library terintegrasi. Penandatanganan dilakukan di kantor Perpusnas, Selasa (20/05/2026).

MoU ini mencakup tiga pilar kerja sama: pertama, integrasi katalog digital antara Arsip Nasional dan Perpusnas; kedua, pengembangan platform pencarian semantik lintas-domain; dan ketiga, program joint research di bidang preservasi digital.

Kerja sama ini diharapkan menjadi blueprint bagi kolaborasi antar-lembaga informasi nasional. Masyarakat dapat mengakses koleksi arsip dan perpustakaan dari satu portal terpadu, memungkinkan riset lintas-disiplin yang lebih efisien.

"Kolaborasi ini sejalan dengan visi digitalisasi nasional. Arsip dan perpustakaan adalah dua sisi mata uang yang sama — keduanya adalah memori kolektif bangsa," kata Kepala Perpusnas dalam sambutannya.

Implementasi tahap pertama akan dimulai Q3 2026 dengan pilot project integrasi katalog koleksi kolonial.`,
      category: 'Kerja Sama',
      tags: 'mou,perpusnas,digital library,kerja sama',
      isFeatured: false,
      authorId: superAdmin.id,
      publishedAt: new Date('2026-05-21'),
    },
    {
      slug: 'workshop-digital-preservation-strategi',
      title: 'Workshop Digital Preservation: Strategi dan Tantangan Era Cloud',
      excerpt: 'IAA menggelar workshop dua hari mengupas strategi preservasi digital di era komputasi awan.',
      content: `Bandung — IAA menyelenggarakan workshop "Digital Preservation: Strategi dan Tantangan Era Cloud" di Hotel Savoy Homann, Bandung, 8-9 Juni 2026. Workshop diikuti 75 peserta dari berbagai lembaga kearsipan pemerintah dan swasta.

Workshop membahas empat topik utama: model OAIS (Open Archival Information System) untuk era cloud, strategi migrasi format file jangka panjang, manajemen metadata otomatis dengan AI, dan audit kepatuhan ISO 16363 untuk Trusted Digital Repository.

Pemateri utama adalah Prof. Dr. Luciana Duranti dari University of British Columbia, pakar internasional kearsipan digital. Beliau menekankan bahwa preservasi digital bukan sekadar teknis, tetapi menyangkut tata kelola, kebijakan, dan keberlanjutan finansial.

"Cloud bukan solusi tunggal. Ia adalah infrastruktur yang membutuhkan strategi yang matang. Tanpa governance yang kuat, data Anda di cloud bisa hilang lebih cepat daripada arsip fisik," katanya.

Workshop menghasilkan rekomendasi 12 poin untuk pengembangan framework preservasi digital nasional yang akan diteruskan ke ANRI.`,
      category: 'Workshop',
      tags: 'workshop,digital preservation,bandung,cloud',
      isFeatured: false,
      authorId: pengurus.id,
      publishedAt: new Date('2026-06-10'),
    },
    {
      slug: 'hari-arsip-nasional-2026',
      title: 'Peringatan Hari Arsip Nasional ke-53 Tahun 2026',
      excerpt: 'IAA merayakan Hari Arsip Nasional dengan rangkaian kegiatan refleksi profesi dan penghargaan arsiparis berprestasi.',
      content: `Jakarta — Ikatan Arsiparis ANRI (IAA) bersama ANRI merayakan Hari Arsip Nasional (Harwanas) ke-53 pada 18 Juni 2026. Tema tahun ini: "Arsip sebagai Jembatan Peradaban: Membangun Indonesia yang Berkarakter".

Rangkaian acara meliputi: upacara bendera di kompleks ANRI, penganugerahan penghargaan Arsiparis Berprestasi Nasional, pameran arsip koleksi sejarah Nusantara, seminar nasional, dan gala dinner arsiparis.

Penghargaan Arsiparis Berprestasi Nasional 2026 diberikan kepada lima kategori: Pengabdian Seumur Hidup, Inovasi Digital, Pelayanan Publik, Riset & Publikasi, serta Arsiparis Muda Berbakat. Total 23 nominator dari 17 provinsi masuk ke tahap final.

"Hari Arsip Nasional adalah momen refleksi. Bukan sekadar merayakan, tetapi mengevaluasi kontribusi kita bagi bangsa. Setiap arsip yang kita kelola adalah benang merah peradaban Indonesia," kata Ketua Panitia Harwanas 2026.

IAA juga meluncurkan kampanye "Satu Arsiparis, Satu Cerita" — inisiatif dokumentasi lisan sejarah lokal oleh anggota IAA di seluruh Indonesia.`,
      category: 'Kegiatan',
      tags: 'harwanas,peringatan,arsip nasional',
      isFeatured: true,
      authorId: superAdmin.id,
      publishedAt: new Date('2026-06-18'),
    },
  ]
  for (const a of articles) {
    await db.article.create({ data: a })
  }

  // ===== EVENTS =====
  const events = [
    {
      slug: 'webinar-transformasi-digital-kearsipan',
      title: 'Webinar: Transformasi Digital Kearsipan — Peluang & Tantangan',
      description: 'Webinar nasional membahas roadmap transformasi digital kearsipan Indonesia 2025-2030. Pemateri: Dirjen Kearsipan ANRI, Pakar Internasional, dan Praktisi Industri.',
      eventType: 'WEBINAR',
      location: 'Zoom Webinar',
      startDate: new Date('2026-07-25T09:00:00'),
      endDate: new Date('2026-07-25T12:00:00'),
      quota: 500,
      registeredCount: 312,
      isRegistrationOpen: true,
      organizerId: pengurus.id,
    },
    {
      slug: 'pelatihan-manajemen-arsip-elektronik',
      title: 'Pelatihan Manajemen Arsip Elektronik Berbasis Srikandi',
      description: 'Pelatihan praktis penggunaan aplikasi Srikandi (Sistem Informasi Kearsipan Dinamis Terintegrasi) untuk manajemen arsip dinamis.',
      eventType: 'PELATIHAN',
      location: 'Pusdiklat ANRI, Jakarta',
      startDate: new Date('2026-08-10T08:00:00'),
      endDate: new Date('2026-08-12T16:00:00'),
      quota: 60,
      registeredCount: 48,
      isRegistrationOpen: true,
      organizerId: admin.id,
    },
    {
      slug: 'workshop-kurasi-digital',
      title: 'Workshop Kurasi Digital: Dari Metadata ke Knowledge Graph',
      description: 'Workshop intensif tentang teknik kurasi digital, penerapan linked data, dan pembangunan knowledge graph untuk koleksi arsip.',
      eventType: 'WORKSHOP',
      location: 'Hotel Harris, Bandung',
      startDate: new Date('2026-08-22T09:00:00'),
      endDate: new Date('2026-08-23T17:00:00'),
      quota: 40,
      registeredCount: 35,
      isRegistrationOpen: true,
      organizerId: pengurus.id,
    },
    {
      slug: 'seminar-nasional-kearsipan-2026',
      title: 'Seminar Nasional Kearsipan 2026: Arsip & Kecerdasan Artifisial',
      description: 'Seminar nasional tahunan membahas integrasi AI dalam manajemen arsip: otomasi klasifikasi, OCR cerdas, semantic search, dan tantangan etika.',
      eventType: 'SEMINAR',
      location: 'Balai Kartini, Jakarta',
      startDate: new Date('2026-09-18T08:30:00'),
      endDate: new Date('2026-09-18T16:00:00'),
      quota: 300,
      registeredCount: 187,
      isRegistrationOpen: true,
      organizerId: superAdmin.id,
    },
    {
      slug: 'rapat-pleno-pengurus-pusat',
      title: 'Rapat Pleno Pengurus Pusat IAA — Triwulan III 2026',
      description: 'Rapat pleno pengurus pusat untuk evaluasi program triwulan III dan persiapan program kerja 2027.',
      eventType: 'RAPAT',
      location: 'Kantor Pusat IAA, Jakarta',
      startDate: new Date('2026-10-15T09:00:00'),
      endDate: new Date('2026-10-15T15:00:00'),
      quota: 25,
      registeredCount: 22,
      isRegistrationOpen: false,
      organizerId: superAdmin.id,
    },
  ]
  const createdEvents: { id: string }[] = []
  for (const e of events) {
    const ev = await db.event.create({ data: e })
    createdEvents.push(ev)
  }

  // ===== REGISTRATIONS =====
  await db.registration.create({
    data: { eventId: createdEvents[0].id, memberId: member1.id, status: 'APPROVED', registeredAt: new Date('2026-07-01') },
  })
  await db.registration.create({
    data: { eventId: createdEvents[1].id, memberId: member1.id, status: 'APPROVED', registeredAt: new Date('2026-07-10') },
  })
  await db.registration.create({
    data: { eventId: createdEvents[3].id, memberId: member1.id, status: 'PENDING', registeredAt: new Date('2026-07-15') },
  })
  await db.registration.create({
    data: { eventId: createdEvents[2].id, memberId: member3.id, status: 'APPROVED', registeredAt: new Date('2026-07-08') },
  })

  // ===== CERTIFICATES =====
  await db.certificate.create({
    data: {
      certificateNumber: 'IAA-CERT-2026-0001',
      eventId: createdEvents[0].id,
      memberId: member1.id,
      issuedById: pengurus.id,
      title: 'Peserta Webinar Transformasi Digital Kearsipan',
      description: 'Diberikan kepada peserta yang telah mengikuti Webinar Transformasi Digital Kearsipan secara penuh.',
      issuedAt: new Date('2026-07-25'),
    },
  })
  await db.certificate.create({
    data: {
      certificateNumber: 'IAA-CERT-2025-0048',
      memberId: member1.id,
      issuedById: superAdmin.id,
      title: 'Sertifikat Sertifikasi Arsiparis Muda',
      description: 'Sertifikat resmi kelulusan sertifikasi arsiparis jenjang Muda.',
      issuedAt: new Date('2025-11-20'),
    },
  })
  await db.certificate.create({
    data: {
      certificateNumber: 'IAA-CERT-2026-0012',
      eventId: createdEvents[2].id,
      memberId: member3.id,
      issuedById: pengurus.id,
      title: 'Peserta Workshop Kurasi Digital',
      description: 'Diberikan kepada peserta Workshop Kurasi Digital.',
      issuedAt: new Date('2026-08-23'),
    },
  })

  // ===== LIBRARY ITEMS =====
  const library = [
    { title: 'Modul Manajemen Arsip Dinamis', slug: 'modul-manajemen-arsip-dinamis', description: 'Modul pembelajaran dasar manajemen arsip dinamis untuk arsiparis pemula. Mencakup siklus hidup arsip, klasifikasi, dan penjadwalan retensi.', category: 'PEDOMAN', author: 'IAA - Bidang Profesional', publisher: 'IAA Digital Press', year: 2025, pages: 184, tags: 'manajemen,arsip dinamis,pemula', downloadCount: 1240, viewCount: 3420 },
    { title: 'Undang-Undang Nomor 43 Tahun 2009 tentang Kearsipan', slug: 'uu-43-2009-kearsipan', description: 'Teks lengkap UU 43/2009 yang menjadi dasar hukum sistem kearsipan nasional Indonesia.', category: 'REGULASI', author: 'Republik Indonesia', publisher: 'Lembaran Negara RI', year: 2009, pages: 56, tags: 'uu,regulasi,hukum', downloadCount: 5680, viewCount: 12400 },
    { title: 'Pedoman Sistem Informasi Kearsipan (Srikandi)', slug: 'pedoman-srikandi', description: 'Buku pedoman lengkap penggunaan aplikasi Srikandi untuk manajemen arsip dinamis di instansi pemerintah.', category: 'SOP', author: 'ANRI', publisher: 'ANRI Press', year: 2024, pages: 220, tags: 'srikandi,sistem informasi,panduan', downloadCount: 2890, viewCount: 8760 },
    { title: 'Jurnal Kearsipan Vol. 18 No. 1 (2026)', slug: 'jurnal-kearsipan-v18n1-2026', description: 'Edisi terbaru jurnal ilmiah kearsipan berisi 8 artikel penelitian tentang preservasi digital, AI dalam kearsipan, dan manajemen records.', category: 'JURNAL', author: 'Berbagai penulis', publisher: 'IAA - Bidang Litbang', year: 2026, pages: 156, tags: 'jurnal,riset,akademik', downloadCount: 856, viewCount: 2150 },
    { title: 'Ebook: Digital Preservation for Archivists', slug: 'ebook-digital-preservation', description: 'Ebook komprehensif tentang preservasi digital dengan pendekatan praktis. Disusun oleh pakar internasional dan diterjemahkan oleh IAA.', category: 'EBOOK', author: 'Luciana Duranti', publisher: 'IAA Digital Press', year: 2025, pages: 320, tags: 'preservasi,digital,internasional', downloadCount: 1920, viewCount: 5340 },
    { title: 'Template SK Penjadwalan Retensi Arsip', slug: 'template-sk-retensi', description: 'Template dokumen standar untuk penyusunan Surat Keputusan penjadwalan retensi arsip di instansi pemerintah.', category: 'TEMPLATE', author: 'IAA - Bidang Profesional', publisher: 'IAA Digital', year: 2026, pages: 24, tags: 'template,sk,retensi', downloadCount: 3450, viewCount: 6120 },
  ]
  for (const lib of library) {
    await db.libraryItem.create({ data: lib })
  }

  // ===== GALLERY =====
  const album1 = await db.galleryAlbum.create({ data: { title: 'Rakornas Arsiparis 2026', description: 'Dokumentasi kegiatan Rapat Koordinasi Nasional Arsiparis 2026 di Jakarta.' } })
  const album2 = await db.galleryAlbum.create({ data: { title: 'Harwanas ke-53 Tahun 2026', description: 'Peringatan Hari Arsip Nasional ke-53 tahun 2026.' } })
  for (let i = 1; i <= 6; i++) {
    await db.galleryPhoto.create({ data: { albumId: album1.id, title: `Sesi Rakornas - Foto ${i}`, url: `https://images.unsplash.com/photo-1591${11400000 + i * 1000}-8b3d1e8aaa${i}?w=800` } })
  }
  for (let i = 1; i <= 4; i++) {
    await db.galleryPhoto.create({ data: { albumId: album2.id, title: `Harwanas 2026 - Foto ${i}`, url: `https://images.unsplash.com/photo-1492${21000000 + i * 1000}-8c4d1f9aaa${i}?w=800` } })
  }

  // ===== ANNOUNCEMENTS =====
  await db.announcement.create({
    data: { title: 'Pendaftaran Anggota Baru IAA 2026 Dibuka!', content: 'Pendaftaran anggota baru Ikatan Arsiparis ANRI periode 2026 telah dibuka. Segera daftarkan diri Anda melalui portal IAA Digital.', type: 'BANNER', isPinned: true, endDate: new Date('2026-12-31') },
  })
  await db.announcement.create({
    data: { title: 'Selamat Hari Arsip Nasional 2026', content: 'Selamat Hari Arsip Nasional ke-53. Mari kita tingkatkan dedikasi untuk memori kolektif bangsa.', type: 'RUNNING_TEXT', endDate: new Date('2026-07-31') },
  })

  console.log('✅ Seed completed!')
  console.log('🔑 Demo credentials (password: iaa12345):')
  console.log('   - superadmin@iaa-anri.go.id (SUPER_ADMIN)')
  console.log('   - admin@iaa-anri.go.id (ADMINISTRATOR)')
  console.log('   - pengurus@iaa-anri.go.id (PENGURUS)')
  console.log('   - anggota@iaa-anri.go.id (ANGGOTA)')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await db.$disconnect() })
