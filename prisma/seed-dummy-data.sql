-- ============================================
-- IAA Digital - Dummy Data Lengkap (Semua Tabel)
-- ============================================
-- Import file ini SETELAH schema-mysql.sql
-- Via phpMyAdmin → Import → pilih file ini
--
-- Data mencakup:
-- - 10 Users (2 super admin, 2 admin, 3 pengurus, 3 anggota)
-- - 10 Members
-- - 10 Organization Members
-- - 15 Articles (dengan revision)
-- - 10 Events
-- - 15 Registrations
-- - 10 Certificates
-- - 15 Library Items
-- - 5 Gallery Albums + 20 Photos
-- - 6 Announcements
-- - 10 Notifications
-- - 10 Audit Logs
-- - 5 Contact Messages
-- - 8 Archives + 12 Versions + 15 Accesses
-- - 5 Chat Conversations + 20 Messages
-- - 2 OAuth Accounts
-- - 7 Backup History
-- - 28 Site Settings
-- - 5 Menu Config (parent) + 6 Menu Config (child)
-- - 10 Media Assets
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- USERS (10)
-- ============================================
INSERT INTO `User` (`id`, `email`, `password`, `name`, `role`, `avatar`, `isActive`, `lastLoginAt`, `createdAt`, `updatedAt`) VALUES
('usr-001', 'superadmin@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Dr. Bambang Sutrisno, M.Si.', 'SUPER_ADMIN', NULL, true, NOW(), '2024-01-01 00:00:00', NOW()),
('usr-002', 'admin@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Siti Nurhaliza, S.Kom.', 'ADMINISTRATOR', NULL, true, NOW(), '2024-01-01 00:00:00', NOW()),
('usr-003', 'pengurus@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Drs. Ahmad Fauzi, M.Ars.', 'PENGURUS', NULL, true, NOW(), '2024-01-01 00:00:00', NOW()),
('usr-004', 'anggota@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Rina Wijayanti, S.Sos.', 'ANGGOTA', NULL, true, NOW(), '2024-01-15 00:00:00', NOW()),
('usr-005', 'budi.santoso@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Budi Santoso, S.Hum.', 'ANGGOTA', NULL, true, NOW(), '2024-02-10 00:00:00', NOW()),
('usr-006', 'dewi.lestari@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Dewi Lestari, M.Ars.', 'ANGGOTA', NULL, true, NOW(), '2023-08-20 00:00:00', NOW()),
('usr-007', 'endang.s@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Prof. Dr. Endang Sulistyaningsih, M.Hum.', 'PENGURUS', NULL, true, NOW(), '2023-03-01 00:00:00', NOW()),
('usr-008', 'hendro.w@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Dr. Ir. Hendro Wijaya, M.M.', 'PENGURUS', NULL, true, NOW(), '2023-03-01 00:00:00', NOW()),
('usr-009', 'tri.handoko@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Tri Handoko, S.IP., M.Ars.', 'ANGGOTA', NULL, true, NOW(), '2024-03-05 00:00:00', NOW()),
('usr-010', 'sri.wahyuni@iaa-anri.go.id', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Sri Wahyuni, S.Sos., M.Ars.', 'ADMINISTRATOR', NULL, true, NOW(), '2024-01-01 00:00:00', NOW());

-- ============================================
-- MEMBERS (10)
-- ============================================
INSERT INTO `Member` (`id`, `userId`, `memberNumber`, `nip`, `fullName`, `photo`, `workUnit`, `position`, `arsiparisLevel`, `education`, `trainingHistory`, `certificationHistory`, `status`, `joinDate`, `createdAt`, `updatedAt`) VALUES
('mem-001', 'usr-004', 'IAA-2024-0001', '198503152010012001', 'Rina Wijayanti, S.Sos.', NULL, 'ANRI - Pusat Konservasi Arsip', 'Arsiparis Muda', 'MUDA', 'S1 - Ilmu Perpustakaan UI (2008)', '[{"name":"Pelatihan Konservasi Arsip Digital","year":2022,"organizer":"ANRI"},{"name":"Workshop Manajemen Records","year":2023,"organizer":"IAA"}]', '[{"name":"Sertifikasi Arsiparis Muda","year":2021,"number":"AR-M-2021-045"}]', 'AKTIF', '2024-01-15', NOW(), NOW()),
('mem-002', 'usr-005', 'IAA-2024-0002', '198811202012011002', 'Budi Santoso, S.Hum.', NULL, 'ANRI - Direktorat Layanan Arsip', 'Arsiparis Pemula', 'PEMULA', 'S1 - Sejarah UGM (2011)', '[{"name":"Pelatihan Dasar Kearsipan","year":2023,"organizer":"ANRI"}]', '[]', 'AKTIF', '2024-02-10', NOW(), NOW()),
('mem-003', 'usr-006', 'IAA-2023-0156', '198006152008012003', 'Dewi Lestari, M.Ars.', NULL, 'ANRI - Pusat Penelitian Kearsipan', 'Arsiparis Madya', 'MADYA', 'S2 - Ilmu Informasi UI (2015)', '[{"name":"Pelatihan Manajemen Arsip Elektronik","year":2022,"organizer":"IRMT"},{"name":"Workshop Digital Preservation","year":2023,"organizer":"ICA"}]', '[{"name":"Sertifikasi Arsiparis Muda","year":2018,"number":"AR-M-2018-112"},{"name":"Sertifikasi Arsiparis Madya","year":2023,"number":"AR-MD-2023-028"}]', 'AKTIF', '2023-08-20', NOW(), NOW()),
('mem-004', 'usr-003', 'IAA-2020-0089', '197504102003121002', 'Drs. Ahmad Fauzi, M.Ars.', NULL, 'ANRI - Sekretariat Utama', 'Arsiparis Utama', 'UTAMA', 'S2 - Manajemen Pemerintahan LAN (2010)', '[{"name":"Pelatihan Kepemimpinan Administrasi","year":2019,"organizer":"LAN"}]', '[{"name":"Sertifikasi Arsiparis Utama","year":2020,"number":"AR-U-2020-012"}]', 'AKTIF', '2020-03-01', NOW(), NOW()),
('mem-005', 'usr-007', 'IAA-2021-0034', '196805201995032001', 'Prof. Dr. Endang Sulistyaningsih, M.Hum.', NULL, 'Universitas Indonesia', 'Arsiparis Utama', 'UTAMA', 'S3 - Ilmu Informasi UI (2010)', '[{"name":"Pelatihan Kurasi Digital","year":2021,"organizer":"ICA"},{"name":"Workshop OAIS","year":2022,"organizer":"ANRI"}]', '[{"name":"Sertifikasi Arsiparis Utama","year":2015,"number":"AR-U-2015-008"}]', 'AKTIF', '2021-03-01', NOW(), NOW()),
('mem-006', 'usr-008', 'IAA-2021-0035', '196907151998031003', 'Dr. Ir. Hendro Wijaya, M.M.', NULL, 'ANRI - Pusat Pembinaan Arsip', 'Arsiparis Utama', 'UTAMA', 'S2 - Manajemen USU (2005)', '[{"name":"Pelatihan Audit Sistem Kearsipan","year":2020,"organizer":"ANRI"},{"name":"Workshop ISO 16363","year":2023,"organizer":"ICA"}]', '[{"name":"Sertifikasi Arsiparis Utama","year":2018,"number":"AR-U-2018-022"}]', 'AKTIF', '2021-03-01', NOW(), NOW()),
('mem-007', 'usr-009', 'IAA-2024-0003', '199001152015111001', 'Tri Handoko, S.IP., M.Ars.', NULL, 'ANRI - Direktorat Konservasi Arsip', 'Arsiparis Muda', 'MUDA', 'S2 - Administrasi Publik UGM (2018)', '[{"name":"Pelatihan Manajemen Arsip Digital","year":2023,"organizer":"ANRI"}]', '[{"name":"Sertifikasi Arsiparis Muda","year":2022,"number":"AR-M-2022-067"}]', 'AKTIF', '2024-03-05', NOW(), NOW()),
('mem-008', 'usr-010', 'IAA-2023-0202', '198512102011012004', 'Sri Wahyuni, S.Sos., M.Ars.', NULL, 'ANRI - Pusat Penelitian', 'Arsiparis Madya', 'MADYA', 'S2 - Ilmu Perpustakaan UI (2016)', '[{"name":"Pelatihan Semantic Search","year":2023,"organizer":"IAA"},{"name":"Workshop Linked Data","year":2024,"organizer":"W3C"}]', '[{"name":"Sertifikasi Arsiparis Madya","year":2022,"number":"AR-MD-2022-045"}]', 'AKTIF', '2023-09-01', NOW(), NOW()),
('mem-009', 'usr-001', 'IAA-2018-0012', '196503101990031002', 'Dr. Bambang Sutrisno, M.Si.', NULL, 'ANRI - Pusat Penelitian Kearsipan', 'Arsiparis Utama', 'UTAMA', 'S2 - Ilmu Informasi UI (2000)', '[{"name":"Pelatihan Kepemimpinan Nasional","year":2020,"organizer":"LAN"}]', '[{"name":"Sertifikasi Arsiparis Utama","year":2012,"number":"AR-U-2012-003"}]', 'AKTIF', '2018-01-01', NOW(), NOW()),
('mem-010', 'usr-002', 'IAA-2020-0045', '198708152012122005', 'Siti Nurhaliza, S.Kom.', NULL, 'ANRI - Pusat Teknologi Informasi', 'Arsiparis Muda', 'MUDA', 'S1 - Sistem Informasi ITB (2010)', '[{"name":"Pelatihan Srikandi","year":2022,"organizer":"ANRI"},{"name":"Workshop Digital Archive","year":2023,"organizer":"IAA"}]', '[{"name":"Sertifikasi Arsiparis Muda","year":2020,"number":"AR-M-2020-089"}]', 'AKTIF', '2020-02-01', NOW(), NOW());

-- ============================================
-- ORGANIZATION MEMBERS (10)
-- ============================================
INSERT INTO `OrganizationMember` (`id`, `name`, `position`, `photo`, `bio`, `order`, `category`, `isActive`, `createdAt`, `updatedAt`) VALUES
('org-001', 'Dr. H. M. Asman, M.Si.', 'Ketua Umum', NULL, 'Ketua Umum IAA periode 2024-2027. Pakar kearsipan dengan 30+ tahun pengalaman.', 1, 'Pengurus Pusat', true, NOW(), NOW()),
('org-002', 'Dra. Tati Suharti, M.Ars.', 'Wakil Ketua Umum', NULL, 'Wakil Ketua Umum, arsiparis utama dengan fokus pada pendidikan kearsipan.', 2, 'Pengurus Pusat', true, NOW(), NOW()),
('org-003', 'Drs. Ahmad Fauzi, M.Ars.', 'Sekretaris Jenderal', NULL, 'Sekjen IAA, bertanggung jawab atas administrasi dan koordinasi kegiatan.', 3, 'Pengurus Pusat', true, NOW(), NOW()),
('org-004', 'Rina Wijayanti, S.Sos.', 'Bendahara Umum', NULL, 'Bendahara IAA, mengelola keuangan organisasi.', 4, 'Pengurus Pusat', true, NOW(), NOW()),
('org-005', 'Dewi Lestari, M.Ars.', 'Ketua Bidang Profesional', NULL, 'Ketua Bidang Pengembangan Profesi, fokus pada sertifikasi dan pelatihan.', 5, 'Bidang', true, NOW(), NOW()),
('org-006', 'Budi Santoso, S.Hum.', 'Ketua Bidang Litbang', NULL, 'Ketua Bidang Penelitian dan Pengembangan.', 6, 'Bidang', true, NOW(), NOW()),
('org-007', 'Tri Handoko, S.IP., M.Ars.', 'Ketua Bidang Humas', NULL, 'Ketua Bidang Hubungan Masyarakat dan Publikasi.', 7, 'Bidang', true, NOW(), NOW()),
('org-008', 'Sri Wahyuni, S.Sos., M.Ars.', 'Ketua Bidang Teknologi', NULL, 'Ketua Bidang Teknologi Informasi Kearsipan.', 8, 'Bidang', true, NOW(), NOW()),
('org-009', 'Prof. Dr. Endang Sulistyaningsih, M.Hum.', 'Pembina', NULL, 'Dewan Pembina, akademisi kearsipan UI.', 9, 'Dewan Pembina', true, NOW(), NOW()),
('org-010', 'Dr. Ir. Hendro Wijaya, M.M.', 'Pembina', NULL, 'Dewan Pembina, pakar manajemen arsip.', 10, 'Dewan Pembina', true, NOW(), NOW());

-- ============================================
-- ARTICLES (15)
-- ============================================
INSERT INTO `Article` (`id`, `slug`, `title`, `excerpt`, `content`, `featuredImage`, `category`, `tags`, `isFeatured`, `isPublished`, `publishStatus`, `publishedAt`, `viewCount`, `authorId`, `metaDescription`, `ogTitle`, `ogImage`, `createdAt`, `updatedAt`) VALUES
('art-001', 'rapat-koordinasi-nasional-arsiparis-2026', 'Rapat Koordinasi Nasional Arsiparis 2026 Diselenggarakan di Jakarta', 'IAA menggelar Rakornas arsiparis dengan tema Transformasi Digital Kearsipan untuk Indonesia Emas 2045.', 'Jakarta — Ikatan Arsiparis ANRI (IAA) sukses menyelenggarakan Rapat Koordinasi Nasional (Rakornas) Arsiparis 2026 di Hotel Bidakara, Jakarta, pada 12-14 Maret 2026. Kegiatan ini diikuti oleh lebih dari 350 arsiparis dari seluruh Indonesia.\n\nMengusung tema "Transformasi Digital Kearsipan untuk Indonesia Emas 2045", Rakornas tahun ini membahas empat isu strategis: implementasi sistem manajemen arsip elektronik, standardisasi sertifikasi arsiparis profesional, penguatan kapasitas kelembagaan organisasi, dan pengembangan ekosistem digital library nasional.\n\nKetua Umum IAA, Dr. H. M. Asman, M.Si., dalam sambutan pembukaannya menekankan pentingnya adaptasi arsiparis terhadap teknologi digital. "Kearsipan modern bukan sekadar menyimpan, tetapi mengelola informasi sebagai aset strategis bangsa. Digitalisasi adalah keniscayaan, bukan pilihan," tegasnya.', NULL, 'Kegiatan', 'rakornas,arsiparis,jakarta,digitalisasi', true, true, 'PUBLISHED', '2026-03-15', 245, 'usr-003', NULL, NULL, NULL, NOW(), NOW()),
('art-002', 'pelatihan-sertifikasi-arsiparis-madya-batch-12', 'Pelatihan dan Sertifikasi Arsiparis Madya Batch 12 Resmi Dibuka', 'Program pelatihan intensif 3 bulan untuk peningkatan kompetensi arsiparis muda menuju madya dibuka untuk 60 peserta.', 'IAA bersama Pusat Pengembangan Sumber Daya Manusia (PPSDM) ANRI resmi membuka pendaftaran Pelatihan dan Sertifikasi Arsiparis Madya Batch ke-12.\n\nProgram pelatihan berdurasi 3 bulan, terdiri dari 12 modul pembelajaran yang mencakup: manajemen arsip elektronik, kuratorial digital, preservasi digital jangka panjang, etika profesi arsiparis, tata kelola records center, audit sistem kearsipan, dan metodologi penelitian kearsipan.', NULL, 'Pelatihan', 'pelatihan,sertifikasi,arsiparis madya', true, true, 'PUBLISHED', '2026-04-05', 189, 'usr-002', NULL, NULL, NULL, NOW(), NOW()),
('art-003', 'hari-arsip-nasional-2026', 'Peringatan Hari Arsip Nasional ke-53 Tahun 2026', 'IAA merayakan Hari Arsip Nasional dengan rangkaian kegiatan refleksi profesi dan penghargaan arsiparis berprestasi.', 'Jakarta — Ikatan Arsiparis ANRI (IAA) bersama ANRI merayakan Hari Arsip Nasional (Harwanas) ke-53 pada 18 Juni 2026. Tema tahun ini: "Arsip sebagai Jembatan Peradaban: Membangun Indonesia yang Berkarakter".\n\nRangkaian acara meliputi: upacara bendera di kompleks ANRI, penganugerahan penghargaan Arsiparis Berprestasi Nasional, pameran arsip koleksi sejarah Nusantara, seminar nasional, dan gala dinner arsiparis.', NULL, 'Kegiatan', 'harwanas,peringatan,arsip nasional', true, true, 'PUBLISHED', '2026-06-18', 312, 'usr-001', NULL, NULL, NULL, NOW(), NOW()),
('art-004', 'kerja-sama-iaa-dengan-perpustakaan-nasional', 'IAA dan Perpustakaan Nasional Tandatangani MoU Pengembangan Digital Library', 'Kerja sama strategis untuk membangun ekosistem digital library terintegrasi antara arsip dan perpustakaan nasional.', 'Jakarta — Ikatan Arsiparis ANRI (IAA) dan Perpustakaan Nasional RI (Perpusnas) menandatangani Nota Kesepahaman (MoU) untuk pengembangan ekosistem digital library terintegrasi.\n\nMoU ini mencakup tiga pilar kerja sama: pertama, integrasi katalog digital antara Arsip Nasional dan Perpusnas; kedua, pengembangan platform pencarian semantik lintas-domain; dan ketiga, program joint research di bidang preservasi digital.', NULL, 'Kerja Sama', 'mou,perpusnas,digital library,kerja sama', false, true, 'PUBLISHED', '2026-05-21', 156, 'usr-001', NULL, NULL, NULL, NOW(), NOW()),
('art-005', 'workshop-digital-preservation-strategi', 'Workshop Digital Preservation: Strategi dan Tantangan Era Cloud', 'IAA menggelar workshop dua hari mengupas strategi preservasi digital di era komputasi awan.', 'Bandung — IAA menyelenggarakan workshop "Digital Preservation: Strategi dan Tantangan Era Cloud" di Hotel Savoy Homann, Bandung, 8-9 Juni 2026.\n\nWorkshop membahas empat topik utama: model OAIS (Open Archival Information System) untuk era cloud, strategi migrasi format file jangka panjang, manajemen metadata otomatis dengan AI, dan audit kepatuhan ISO 16363 untuk Trusted Digital Repository.', NULL, 'Workshop', 'workshop,digital preservation,bandung,cloud', false, true, 'PUBLISHED', '2026-06-10', 98, 'usr-003', NULL, NULL, NULL, NOW(), NOW()),
('art-006', 'seminar-ai-dalam-kearsipan', 'Seminar Nasional: Artificial Intelligence dalam Manajemen Arsip', 'Seminar membahas integrasi AI untuk otomasi klasifikasi, OCR cerdas, dan semantic search di arsip digital.', 'Jakarta — IAA menggelar Seminar Nasional "Artificial Intelligence dalam Manajemen Arsip" di Balai Kartini, 20 September 2026. Seminar ini menghadirkan 3 pembicara internasional dan 5 praktisi lokal.\n\nTopik yang dibahas meliputi: machine learning untuk klasifikasi arsip otomatis, natural language processing untuk ekstraksi metadata, computer vision untuk OCR dokumen historis, dan tantangan etika AI dalam pengelolaan informasi sensitif.', NULL, 'Seminar', 'seminar,ai,intelligence,otomasi', true, true, 'PUBLISHED', '2026-09-22', 287, 'usr-001', NULL, NULL, NULL, NOW(), NOW()),
('art-007', 'lomba-arsiparis-muda-2026', 'Lomba Arsiparis Muda Indonesia 2026', 'IAA mengadakan lomba karya tulis ilmiah dan inovasi kearsipan untuk arsiparis muda di bawah 35 tahun.', 'IAA mengumumkan pembukaan Lomba Arsiparis Muda Indonesia 2026. Lomba terbuka untuk seluruh arsiparis berusia di bawah 35 tahun yang terdaftar sebagai anggota IAA.\n\nKategori lomba: (1) Karya Tulis Ilmiah Kearsipan, (2) Inovasi Teknologi Arsip Digital, (3) Video Dokumenter Kearsipan. Total hadiah Rp 30 juta.', NULL, 'Lomba', 'lomba,arsiparis muda,2026,inovasi', false, true, 'PUBLISHED', '2026-07-01', 134, 'usr-002', NULL, NULL, NULL, NOW(), NOW()),
('art-008', 'pelatihan-srikandi-untuk-pemula', 'Pelatihan Aplikasi Srikandi untuk Arsiparis Pemula', 'IAA menyelenggarakan pelatihan praktis penggunaan Srikandi untuk arsiparis yang baru bergabung.', 'IAA menyelenggarakan pelatihan praktis "Penggunaan Aplikasi Srikandi untuk Arsiparis Pemula" pada 10-12 Agustus 2026 di Pusdiklat ANRI Jakarta.\n\nPelatihan ini dirancang khusus untuk arsiparis pemula yang baru terdaftar. Materi mencakup: dasar-dasar manajemen arsip dinamis, input dan klasifikasi arsip, penjadwalan retensi, dan pelaporan menggunakan Srikandi.', NULL, 'Pelatihan', 'srikandi,pemula,pelatihan,aplikasi', false, true, 'PUBLISHED', '2026-07-20', 167, 'usr-002', NULL, NULL, NULL, NOW(), NOW()),
('art-009', 'visi-misi-iaa-2024-2027', 'Visi dan Misi IAA Periode 2024-2027: Transformasi Digital Kearsipan', 'IAA menetapkan visi dan misi periode 2024-2027 dengan fokus pada transformasi digital dan penguatan profesi.', 'Pada Rapat Pleno IAA periode 2024-2027, telah ditetapkan visi dan misi organisasi untuk periode kepengurusan saat ini.\n\nVisi: "Menjadi organisasi profesi arsiparis terdepan di Asia Tenggara yang mendorong transformasi digital kearsipan demi terwujudnya tata kelola informasi publik yang transparan, akuntabel, dan berkelanjutan."', NULL, 'Umum', 'visi,misi,2024-2027,transformasi', false, true, 'PUBLISHED', '2024-03-15', 523, 'usr-001', NULL, NULL, NULL, NOW(), NOW()),
('art-010', 'studibanding-malaysia-singapore', 'Studi Banding Kearsipan ke Malaysia dan Singapore', 'Delegasi IAA melakukan studi banding ke National Archives of Malaysia dan National Library Board Singapore.', 'Delegasi IAA yang terdiri dari 15 pengurus dan anggota melakukan studi banding ke National Archives of Malaysia (Kuala Lumpur) dan National Library Board Singapore pada 15-20 Mei 2026.\n\nTujuan studi banding adalah mempelajari praktik terbaik manajemen arsip digital, sistem preservasi digital, dan implementasi AI di institusi kearsipan internasional.', NULL, 'Kegiatan', 'studi banding,malaysia,singapore,internasional', false, true, 'PUBLISHED', '2026-05-25', 145, 'usr-003', NULL, NULL, NULL, NOW(), NOW()),
('art-011', 'draft-artikel-belum-publish', 'Artikel Draft: Rencana Program Kerja 2027', 'Rencana program kerja IAA untuk tahun 2027 sedang dalam penyusunan.', 'Artikel ini masih dalam tahap draft. Program kerja 2027 akan fokus pada penguatan kapasitas digital anggota.', NULL, 'Umum', 'draft,program kerja,2027', false, false, 'DRAFT', '2026-07-15', 0, 'usr-001', NULL, NULL, NULL, NOW(), NOW()),
('art-012', 'artikel-terjadwal-publish', 'Pengumuman: Workshop Nasional Arsip Elektronik 2027', 'Workshop nasional tentang arsip elektronik akan diselenggarakan awal 2027.', 'Pengumuman resmi tentang penyelenggaraan Workshop Nasional Arsip Elektronik 2027 akan diadakan pada Februari 2027.', NULL, 'Pengumuman', 'workshop,2027,arsip elektronik', false, false, 'SCHEDULED', '2027-02-01 08:00:00', 0, 'usr-002', NULL, NULL, NULL, NOW(), NOW()),
('art-013', 'publikasi-jurnal-kearsipan-v18', 'Jurnal Kearsipan Vol. 18 No. 1 (2026) Telah Terbit', 'Edisi terbaru jurnal ilmiah kearsipan IAA telah terbit dengan 8 artikel penelitian.', 'IAA dengan bangga mengumumkan terbitnya Jurnal Kearsipan Volume 18 Nomor 1 Tahun 2026. Jurnal ini berisi 8 artikel penelitian yang telah melalui proses peer-review.\n\nArtikel dalam edisi ini mencakup: preservasi digital arsip elektronik, implementasi AI dalam klasifikasi arsip, analisis metadata Dublin Core, manajemen records center digital, audit ISO 16363, dan lainnya.', NULL, 'Publikasi', 'jurnal,publikasi,2026,penelitian', false, true, 'PUBLISHED', '2026-06-01', 234, 'usr-007', NULL, NULL, NULL, NOW(), NOW()),
('art-014', 'pedoman-baru-klasifikasi-arsip', 'Pedoman Baru Klasifikasi Arsip Dinamis Telah Diterbitkan', 'IAA merilis pedoman baru klasifikasi arsip dinamis yang mengakomodasi arsip elektronik.', 'IAA telah menerbitkan Pedoman Klasifikasi Arsip Dinamis Edisi 2026. Pedoman ini merupakan revisi dari edisi sebelumnya dengan tambahan klasifikasi khusus untuk arsip elektronik dan digital.\n\nPedoman ini disusun oleh tim ahli dari Bidang Profesional IAA dan telah melalui validasi dari ANRI.', NULL, 'Pedoman', 'pedoman,klasifikasi,arsip dinamis,2026', false, true, 'PUBLISHED', '2026-04-20', 312, 'usr-007', NULL, NULL, NULL, NOW(), NOW()),
('art-015', 'kegiatan-bakti-sosial-arsiparis', 'Bakti Sosial Arsiparis: Donasi Buku Kearsipan ke Perpustakaan Daerah', 'IAA mengadakan bakti sosial berupa donasi 500 buku kearsipan ke perpustakaan daerah di 10 provinsi.', 'Sebagai bentuk kepedulian sosial, IAA mengadakan program bakti sosial dengan mendonasikan 500 buku kearsipan ke perpustakaan daerah di 10 provinsi di Indonesia.\n\nProgram ini diharapkan dapat meningkatkan literasi kearsipan di daerah dan menumbuhkan minat generasi muda terhadap profesi arsiparis.', NULL, 'Kegiatan', 'bakti sosial,donasi,buku,daerah', false, true, 'PUBLISHED', '2026-05-10', 87, 'usr-003', NULL, NULL, NULL, NOW(), NOW());

-- ============================================
-- ARTICLE REVISIONS (5)
-- ============================================
INSERT INTO `ArticleRevision` (`id`, `articleId`, `version`, `title`, `excerpt`, `content`, `editedById`, `changeLog`, `createdAt`) VALUES
('rev-001', 'art-001', 1, 'Rapat Koordinasi Nasional Arsiparis 2026 Diselenggarakan di Jakarta', 'IAA menggelar Rakornas arsiparis dengan tema Transformasi Digital Kearsipan.', 'Versi awal artikel.', 'usr-003', 'Versi awal', NOW()),
('rev-002', 'art-001', 2, 'Rapat Koordinasi Nasional Arsiparis 2026 Diselenggarakan di Jakarta', 'IAA menggelar Rakornas arsiparis dengan tema Transformasi Digital Kearsipan untuk Indonesia Emas 2045.', 'Revisi dengan tambahan detail kegiatan dan kutipan Ketua Umum.', 'usr-001', 'Tambah detail dan kutipan', NOW()),
('rev-003', 'art-002', 1, 'Pelatihan dan Sertifikasi Arsiparis Madya Batch 12 Resmi Dibuka', 'Program pelatihan intensif 3 bulan.', 'Versi awal.', 'usr-002', 'Versi awal', NOW()),
('rev-004', 'art-003', 1, 'Peringatan Hari Arsip Nasional ke-53 Tahun 2026', 'IAA merayakan Hari Arsip Nasional.', 'Versi awal.', 'usr-001', 'Versi awal', NOW()),
('rev-005', 'art-003', 2, 'Peringatan Hari Arsip Nasional ke-53 Tahun 2026', 'IAA merayakan Hari Arsip Nasional dengan rangkaian kegiatan.', 'Revisi dengan tambahan detail acara dan penghargaan.', 'usr-001', 'Tambah detail acara', NOW());

-- ============================================
-- EVENTS (10)
-- ============================================
INSERT INTO `Event` (`id`, `slug`, `title`, `description`, `eventType`, `coverImage`, `location`, `startDate`, `endDate`, `quota`, `registeredCount`, `isPublished`, `isRegistrationOpen`, `organizerId`, `createdAt`, `updatedAt`) VALUES
('evt-001', 'webinar-transformasi-digital-kearsipan', 'Webinar: Transformasi Digital Kearsipan — Peluang & Tantangan', 'Webinar nasional membahas roadmap transformasi digital kearsipan Indonesia 2025-2030.', 'WEBINAR', NULL, 'Zoom Webinar', '2026-07-25 09:00:00', '2026-07-25 12:00:00', 500, 312, true, true, 'usr-003', NOW(), NOW()),
('evt-002', 'pelatihan-manajemen-arsip-elektronik', 'Pelatihan Manajemen Arsip Elektronik Berbasis Srikandi', 'Pelatihan praktis penggunaan aplikasi Srikandi untuk manajemen arsip dinamis.', 'PELATIHAN', NULL, 'Pusdiklat ANRI, Jakarta', '2026-08-10 08:00:00', '2026-08-12 16:00:00', 60, 48, true, true, 'usr-002', NOW(), NOW()),
('evt-003', 'workshop-kurasi-digital', 'Workshop Kurasi Digital: Dari Metadata ke Knowledge Graph', 'Workshop intensif tentang teknik kurasi digital, penerapan linked data.', 'WORKSHOP', NULL, 'Hotel Harris, Bandung', '2026-08-22 09:00:00', '2026-08-23 17:00:00', 40, 35, true, true, 'usr-003', NOW(), NOW()),
('evt-004', 'seminar-nasional-kearsipan-2026', 'Seminar Nasional Kearsipan 2026: Arsip & Kecerdasan Artifisial', 'Seminar nasional membahas integrasi AI dalam manajemen arsip.', 'SEMINAR', NULL, 'Balai Kartini, Jakarta', '2026-09-18 08:30:00', '2026-09-18 16:00:00', 300, 187, true, true, 'usr-001', NOW(), NOW()),
('evt-005', 'rapat-pleno-pengurus-pusat', 'Rapat Pleno Pengurus Pusat IAA — Triwulan III 2026', 'Rapat pleno pengurus pusat untuk evaluasi program triwulan III.', 'RAPAT', NULL, 'Kantor Pusat IAA, Jakarta', '2026-10-15 09:00:00', '2026-10-15 15:00:00', 25, 22, true, false, 'usr-001', NOW(), NOW()),
('evt-006', 'lomba-arsiparis-muda-2026', 'Lomba Arsiparis Muda Indonesia 2026', 'Lomba karya tulis ilmiah dan inovasi kearsipan untuk arsiparis muda.', 'LOMBA', NULL, 'Online + Offline', '2026-09-01 00:00:00', '2026-11-30 23:59:00', 100, 67, true, true, 'usr-002', NOW(), NOW()),
('evt-007', 'workshop-iso-16363', 'Workshop Audit ISO 16363 Trusted Digital Repository', 'Workshop mendalam tentang audit kepatuhan ISO 16363.', 'WORKSHOP', NULL, 'Hotel Mercure, Surabaya', '2026-11-10 09:00:00', '2026-11-11 17:00:00', 30, 18, true, true, 'usr-003', NOW(), NOW()),
('evt-008', 'pelatihan-arsiparis-pemula', 'Pelatihan Dasar Arsiparis Pemula Batch 15', 'Pelatihan dasar untuk arsiparis yang baru bergabung.', 'PELATIHAN', NULL, 'Pusdiklat ANRI, Jakarta', '2026-09-05 08:00:00', '2026-09-07 16:00:00', 80, 65, true, true, 'usr-002', NOW(), NOW()),
('evt-009', 'webinar-preservasi-digital', 'Webinar: Preservasi Digital Jangka Panjang', 'Webinar internasional tentang strategi preservasi digital.', 'WEBINAR', NULL, 'Zoom Webinar', '2026-10-20 13:00:00', '2026-10-20 16:00:00', 300, 145, true, true, 'usr-003', NOW(), NOW()),
('evt-010', 'seminar-kearsipan-daerah', 'Seminar Kearsipan Daerah: Penguatan Kapasitas Arsiparis Lokal', 'Seminar regional untuk arsiparis di luar Jabodetabek.', 'SEMINAR', NULL, 'Hotel Novotel, Makassar', '2026-11-25 08:00:00', '2026-11-25 16:00:00', 150, 89, true, true, 'usr-001', NOW(), NOW());

-- ============================================
-- REGISTRATIONS (15)
-- ============================================
INSERT INTO `Registration` (`id`, `eventId`, `memberId`, `status`, `checkedIn`, `checkedInAt`, `registeredAt`) VALUES
('reg-001', 'evt-001', 'mem-001', 'APPROVED', true, '2026-07-25 09:05:00', '2026-07-01'),
('reg-002', 'evt-002', 'mem-001', 'APPROVED', false, NULL, '2026-07-10'),
('reg-003', 'evt-004', 'mem-001', 'PENDING', false, NULL, '2026-07-15'),
('reg-004', 'evt-001', 'mem-003', 'APPROVED', true, '2026-07-25 09:02:00', '2026-06-28'),
('reg-005', 'evt-003', 'mem-003', 'APPROVED', false, NULL, '2026-07-08'),
('reg-006', 'evt-002', 'mem-002', 'APPROVED', false, NULL, '2026-07-12'),
('reg-007', 'evt-004', 'mem-002', 'APPROVED', false, NULL, '2026-07-14'),
('reg-008', 'evt-006', 'mem-002', 'PENDING', false, NULL, '2026-09-02'),
('reg-009', 'evt-001', 'mem-007', 'APPROVED', false, NULL, '2026-06-30'),
('reg-010', 'evt-003', 'mem-007', 'WAITING_LIST', false, NULL, '2026-08-15'),
('reg-011', 'evt-008', 'mem-007', 'APPROVED', false, NULL, '2026-08-20'),
('reg-012', 'evt-004', 'mem-008', 'APPROVED', false, NULL, '2026-07-10'),
('reg-013', 'evt-009', 'mem-008', 'APPROVED', false, NULL, '2026-10-01'),
('reg-014', 'evt-002', 'mem-009', 'REJECTED', false, NULL, '2026-07-15'),
('reg-015', 'evt-006', 'mem-009', 'APPROVED', false, NULL, '2026-09-05');

-- ============================================
-- CERTIFICATES (10)
-- ============================================
INSERT INTO `Certificate` (`id`, `certificateNumber`, `eventId`, `memberId`, `issuedById`, `title`, `description`, `template`, `issuedAt`, `createdAt`) VALUES
('cert-001', 'IAA-CERT-2026-0001', 'evt-001', 'mem-001', 'usr-003', 'Peserta Webinar Transformasi Digital Kearsipan', 'Diberikan kepada peserta yang telah mengikuti Webinar Transformasi Digital Kearsipan secara penuh.', 'webinar', '2026-07-25', NOW()),
('cert-002', 'IAA-CERT-2025-0048', NULL, 'mem-001', 'usr-001', 'Sertifikat Sertifikasi Arsiparis Muda', 'Sertifikat resmi kelulusan sertifikasi arsiparis jenjang Muda.', 'default', '2025-11-20', NOW()),
('cert-003', 'IAA-CERT-2026-0012', 'evt-003', 'mem-003', 'usr-003', 'Peserta Workshop Kurasi Digital', 'Diberikan kepada peserta Workshop Kurasi Digital.', 'workshop', '2026-08-23', NOW()),
('cert-004', 'IAA-CERT-2026-0015', 'evt-002', 'mem-001', 'usr-002', 'Peserta Pelatihan Manajemen Arsip Elektronik', 'Diberikan kepada peserta pelatihan Srikandi.', 'training', '2026-08-12', NOW()),
('cert-005', 'IAA-CERT-2026-0016', 'evt-002', 'mem-002', 'usr-002', 'Peserta Pelatihan Manajemen Arsip Elektronik', 'Diberikan kepada peserta pelatihan Srikandi.', 'training', '2026-08-12', NOW()),
('cert-006', 'IAA-CERT-2024-0102', NULL, 'mem-003', 'usr-001', 'Sertifikasi Arsiparis Madya', 'Sertifikat resmi kelulusan sertifikasi arsiparis jenjang Madya.', 'default', '2024-12-15', NOW()),
('cert-007', 'IAA-CERT-2026-0020', 'evt-004', 'mem-007', 'usr-001', 'Peserta Seminar Nasional Kearsipan 2026', 'Diberikan kepada peserta Seminar Nasional Kearsipan.', 'default', '2026-09-18', NOW()),
('cert-008', 'IAA-CERT-2026-0021', 'evt-004', 'mem-008', 'usr-001', 'Peserta Seminar Nasional Kearsipan 2026', 'Diberikan kepada peserta Seminar Nasional Kearsipan.', 'default', '2026-09-18', NOW()),
('cert-009', 'IAA-CERT-2026-0025', 'evt-008', 'mem-007', 'usr-002', 'Peserta Pelatihan Dasar Arsiparis Pemula', 'Diberikan kepada peserta pelatihan dasar.', 'training', '2026-09-07', NOW()),
('cert-010', 'IAA-CERT-2023-0089', NULL, 'mem-009', 'usr-001', 'Sertifikasi Arsiparis Muda', 'Sertifikat resmi kelulusan sertifikasi arsiparis jenjang Muda.', 'default', '2023-06-10', NOW());

-- ============================================
-- LIBRARY ITEMS (15)
-- ============================================
INSERT INTO `LibraryItem` (`id`, `title`, `slug`, `description`, `category`, `author`, `publisher`, `year`, `coverImage`, `fileUrl`, `fileSize`, `pages`, `tags`, `downloadCount`, `viewCount`, `isPublished`, `createdAt`, `updatedAt`) VALUES
('lib-001', 'Modul Manajemen Arsip Dinamis', 'modul-manajemen-arsip-dinamis', 'Modul pembelajaran dasar manajemen arsip dinamis untuk arsiparis pemula.', 'PEDOMAN', 'IAA - Bidang Profesional', 'IAA Digital Press', 2025, NULL, NULL, NULL, 184, 'manajemen,arsip dinamis,pemula', 1240, 3420, true, NOW(), NOW()),
('lib-002', 'Undang-Undang Nomor 43 Tahun 2009 tentang Kearsipan', 'uu-43-2009-kearsipan', 'Teks lengkap UU 43/2009 yang menjadi dasar hukum sistem kearsipan nasional Indonesia.', 'REGULASI', 'Republik Indonesia', 'Lembaran Negara RI', 2009, NULL, NULL, NULL, 56, 'uu,regulasi,hukum', 5680, 12400, true, NOW(), NOW()),
('lib-003', 'Pedoman Sistem Informasi Kearsipan (Srikandi)', 'pedoman-srikandi', 'Buku pedoman lengkap penggunaan aplikasi Srikandi.', 'SOP', 'ANRI', 'ANRI Press', 2024, NULL, NULL, NULL, 220, 'srikandi,sistem informasi,panduan', 2890, 8760, true, NOW(), NOW()),
('lib-004', 'Jurnal Kearsipan Vol. 18 No. 1 (2026)', 'jurnal-kearsipan-v18n1-2026', 'Edisi terbaru jurnal ilmiah kearsipan berisi 8 artikel penelitian.', 'JURNAL', 'Berbagai penulis', 'IAA - Bidang Litbang', 2026, NULL, NULL, NULL, 156, 'jurnal,riset,akademik', 856, 2150, true, NOW(), NOW()),
('lib-005', 'Ebook: Digital Preservation for Archivists', 'ebook-digital-preservation', 'Ebook komprehensif tentang preservasi digital dengan pendekatan praktis.', 'EBOOK', 'Luciana Duranti', 'IAA Digital Press', 2025, NULL, NULL, NULL, 320, 'preservasi,digital,internasional', 1920, 5340, true, NOW(), NOW()),
('lib-006', 'Template SK Penjadwalan Retensi Arsip', 'template-sk-retensi', 'Template dokumen standar untuk penyusunan SK penjadwalan retensi arsip.', 'TEMPLATE', 'IAA - Bidang Profesional', 'IAA Digital', 2026, NULL, NULL, NULL, 24, 'template,sk,retensi', 3450, 6120, true, NOW(), NOW()),
('lib-007', 'Permen PANRB No. 1 Tahun 2022 tentang Tata Kelola Arsip', 'permen-panrb-1-2022', 'Peraturan Menteri PANRB tentang tata kelola arsip di instansi pemerintah.', 'REGULASI', 'Kementerian PANRB', 'Kementerian PANRB', 2022, NULL, NULL, NULL, 48, 'permen,panrb,tata kelola', 2100, 4500, true, NOW(), NOW()),
('lib-008', 'Buku: Sejarah Kearsipan Indonesia', 'buku-sejarah-kearsipan-indonesia', 'Buku komprehensif tentang sejarah perkembangan kearsipan di Indonesia dari masa kolonial hingga modern.', 'BUKU', 'Prof. Dr. Endang S., M.Hum.', 'UI Press', 2023, NULL, NULL, NULL, 450, 'sejarah,indonesia,kolonial', 670, 1890, true, NOW(), NOW()),
('lib-009', 'Presentasi: Workshop Digital Preservation', 'presentasi-workshop-digital-preservation', 'Materi presentasi workshop Digital Preservation 2026.', 'PRESENTASI', 'Dewi Lestari, M.Ars.', 'IAA Digital', 2026, NULL, NULL, NULL, 85, 'presentasi,workshop,preservasi', 540, 1230, true, NOW(), NOW()),
('lib-010', 'SOP Klasifikasi Arsip Dinamis', 'sop-klasifikasi-arsip-dinamis', 'SOP standar untuk klasifikasi arsip dinamis di instansi pemerintah.', 'SOP', 'ANRI - Bidang Standardisasi', 'ANRI Press', 2024, NULL, NULL, NULL, 65, 'sop,klasifikasi,arsip dinamis', 1780, 3400, true, NOW(), NOW()),
('lib-011', 'Majalah Arsiparis Vol. 12 (2026)', 'majalah-arsiparis-v12-2026', 'Majalah triwulanan IAA edisi 2026.', 'MAJALAH', 'Tim Redaksi IAA', 'IAA Digital', 2026, NULL, NULL, NULL, 48, 'majalah,arsiparis,2026', 320, 890, true, NOW(), NOW()),
('lib-012', 'Video Tutorial: Cara Upload Arsip ke Srikandi', 'video-tutorial-srikandi-upload', 'Video tutorial langkah demi langkah cara upload arsip ke aplikasi Srikandi.', 'VIDEO', 'Siti Nurhaliza, S.Kom.', 'IAA Digital', 2026, NULL, NULL, NULL, NULL, 'video,tutorial,srikandi,upload', 2340, 5600, true, NOW(), NOW()),
('lib-013', 'Audio Podcast: Wawancara dengan Arsiparis Senior', 'audio-podcast-arsiparis-senior', 'Podcast wawancara dengan arsiparis senior tentang pengalaman dan tantangan profesi.', 'AUDIO', 'IAA - Bidang Humas', 'IAA Digital', 2026, NULL, NULL, NULL, NULL, 'audio,podcast,wawancara', 450, 980, true, NOW(), NOW()),
('lib-014', 'Ebook: Manajemen Records Elektronik', 'ebook-manajemen-records-elektronik', 'Panduan praktis manajemen records elektronik untuk instansi pemerintah.', 'EBOOK', 'Dr. Ir. Hendro W., M.M.', 'IAA Digital Press', 2025, NULL, NULL, NULL, 280, 'ebook,records,elektronik,manajemen', 1340, 3670, true, NOW(), NOW()),
('lib-015', 'Template Notula Rapat', 'template-notula-rapat', 'Template standar untuk pembuatan notula rapat di instansi.', 'TEMPLATE', 'IAA - Bidang Profesional', 'IAA Digital', 2026, NULL, NULL, NULL, 12, 'template,notula,rapat', 2890, 5400, true, NOW(), NOW());

-- ============================================
-- GALLERY ALBUMS (5)
-- ============================================
INSERT INTO `GalleryAlbum` (`id`, `title`, `description`, `coverImage`, `createdAt`, `updatedAt`) VALUES
('gal-001', 'Rakornas Arsiparis 2026', 'Dokumentasi kegiatan Rapat Koordinasi Nasional Arsiparis 2026 di Jakarta.', NULL, NOW(), NOW()),
('gal-002', 'Harwanas ke-53 Tahun 2026', 'Peringatan Hari Arsip Nasional ke-53 tahun 2026.', NULL, NOW(), NOW()),
('gal-003', 'Workshop Digital Preservation Bandung', 'Dokumentasi workshop Digital Preservation di Bandung.', NULL, NOW(), NOW()),
('gal-004', 'Studi Banding Malaysia-Singapore', 'Dokumentasi studi banding ke Malaysia dan Singapore.', NULL, NOW(), NOW()),
('gal-005', 'Seminar Nasional Kearsipan 2026', 'Dokumentasi Seminar Nasional Kearsipan 2026 di Balai Kartini.', NULL, NOW(), NOW());

-- ============================================
-- GALLERY PHOTOS (20)
-- ============================================
INSERT INTO `GalleryPhoto` (`id`, `albumId`, `title`, `url`, `order`, `createdAt`) VALUES
('pho-001', 'gal-001', 'Sesi Pleno Rakornas', 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800', 0, NOW()),
('pho-002', 'gal-001', 'Ketua Umum Memberikan Sambutan', 'https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=800', 1, NOW()),
('pho-003', 'gal-001', 'Peserta Rakornas 2026', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 2, NOW()),
('pho-004', 'gal-001', 'Diskusi Panel', 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800', 3, NOW()),
('pho-005', 'gal-002', 'Upacara Harwanas', 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800', 0, NOW()),
('pho-006', 'gal-002', 'Penghargaan Arsiparis Berprestasi', 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800', 1, NOW()),
('pho-007', 'gal-002', 'Pameran Arsip Sejarah', 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800', 2, NOW()),
('pho-008', 'gal-002', 'Gala Dinner Arsiparis', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', 3, NOW()),
('pho-009', 'gal-003', 'Sesi Presentasi Workshop', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', 0, NOW()),
('pho-010', 'gal-003', 'Praktik Preservasi Digital', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800', 1, NOW()),
('pho-011', 'gal-003', 'Foto Bersama Peserta', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 2, NOW()),
('pho-012', 'gal-004', 'National Archives of Malaysia', 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800', 0, NOW()),
('pho-013', 'gal-004', 'National Library Board Singapore', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800', 1, NOW()),
('pho-014', 'gal-004', 'Diskusi dengan Arsitek', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800', 2, NOW()),
('pho-015', 'gal-005', 'Seminar AI dalam Kearsipan', 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800', 0, NOW()),
('pho-016', 'gal-005', 'Pemateri Internasional', 'https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=800', 1, NOW()),
('pho-017', 'gal-005', 'Peserta Seminar', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', 2, NOW()),
('pho-018', 'gal-005', 'Panel Diskusi', 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800', 3, NOW()),
('pho-019', 'gal-005', 'Workshop Sesi', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800', 4, NOW()),
('pho-020', 'gal-005', 'Foto Bersama', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', 5, NOW());

-- ============================================
-- ANNOUNCEMENTS (6)
-- ============================================
INSERT INTO `Announcement` (`id`, `title`, `content`, `type`, `isPinned`, `isPopup`, `startDate`, `endDate`, `createdAt`, `updatedAt`) VALUES
('ann-001', 'Pendaftaran Anggota Baru IAA 2026 Dibuka!', 'Pendaftaran anggota baru Ikatan Arsiparis ANRI periode 2026 telah dibuka. Segera daftarkan diri Anda melalui portal IAA Digital.', 'BANNER', true, false, '2026-06-01', '2026-12-31', NOW(), NOW()),
('ann-002', 'Selamat Hari Arsip Nasional 2026', 'Selamat Hari Arsip Nasional ke-53. Tema tahun ini: Arsip sebagai Jembatan Peradaban.', 'RUNNING_TEXT', false, false, '2026-06-18', '2026-07-31', NOW(), NOW()),
('ann-003', 'Webinar Transformasi Digital Kearsipan — Besok!', 'Jangan lewatkan webinar nasional besok (25 Juli 2026, 09.00 WIB).', 'POPUP', false, true, '2026-07-20', '2026-07-25', NOW(), NOW()),
('ann-004', 'Maintenance Sistem: Sabtu 25 Jul 2026 23.00-02.00 WIB', 'Sistem IAA Digital akan menjalani maintenance terjadwal.', 'PINNED', true, false, '2026-07-22', '2026-07-26', NOW(), NOW()),
('ann-005', 'Pengumuman Pemenang Lomba Arsiparis Muda 2026', 'Pengumuman pemenang lomba arsiparis muda akan dilaksanakan pada 1 Desember 2026.', 'PINNED', false, false, '2026-11-15', '2026-12-15', NOW(), NOW()),
('ann-006', 'Libur Idul Fitri', 'Sekretariat IAA libur selama Idul Fitri. Layanan online tetap tersedia.', 'BANNER', false, false, '2026-04-08', '2026-04-15', NOW(), NOW());

-- ============================================
-- NOTIFICATIONS (10)
-- ============================================
INSERT INTO `Notification` (`id`, `userId`, `type`, `title`, `message`, `link`, `data`, `isRead`, `readAt`, `createdAt`) VALUES
('ntf-001', 'usr-004', 'CERTIFICATE_ISSUED', 'Sertifikat Baru Diterbitkan', 'Sertifikat "Peserta Webinar Transformasi Digital Kearsipan" (IAA-CERT-2026-0001) telah diterbitkan untuk Anda.', 'member-dashboard', '{"certNumber":"IAA-CERT-2026-0001"}', false, NULL, '2026-07-25 12:30:00'),
('ntf-002', 'usr-004', 'EVENT_REMINDER', 'Pengingat: Webinar Besok', 'Webinar "Transformasi Digital Kearsipan" akan dimulai besok pukul 09.00 WIB via Zoom.', 'event-detail', '{"eventSlug":"webinar-transformasi-digital-kearsipan"}', true, '2026-07-24 10:00:00', '2026-07-24 09:00:00'),
('ntf-003', 'usr-004', 'REGISTRATION_STATUS', 'Pendaftaran Diterima', 'Pendaftaran Anda untuk "Pelatihan Manajemen Arsip Elektronik" telah disetujui.', 'member-dashboard', NULL, false, NULL, '2026-07-12 14:00:00'),
('ntf-004', 'usr-004', 'ANNOUNCEMENT', 'Selamat Hari Arsip Nasional!', 'Selamat Hari Arsip Nasional ke-53.', 'public', NULL, true, '2026-06-18 10:00:00', '2026-06-18 08:00:00'),
('ntf-005', 'usr-004', 'SYSTEM', 'Kartu Anggota Digital Aktif', 'Digital Membership Card Anda (IAA-2024-0001) telah aktif.', 'member-dashboard', NULL, true, '2026-01-20 10:00:00', '2026-01-20 09:00:00'),
('ntf-006', 'usr-001', 'SYSTEM', 'Backup Database Berhasil', 'Backup otomatis database berhasil pada 03:00 WIB.', 'admin-reports', NULL, true, '2026-07-17 08:00:00', '2026-07-17 03:15:00'),
('ntf-007', 'usr-001', 'REGISTRATION_STATUS', '3 Pendaftaran Menunggu Approval', 'Ada 3 pendaftaran kegiatan baru yang memerlukan approval.', 'admin-events', NULL, false, NULL, '2026-07-16 10:00:00'),
('ntf-008', 'usr-001', 'ANNOUNCEMENT', 'Laporan Bulanan Siap', 'Laporan aktivitas organisasi bulan Juni 2026 telah dibuat otomatis.', 'admin-reports', NULL, true, '2026-07-01 10:00:00', '2026-07-01 15:00:00'),
('ntf-009', 'usr-003', 'EVENT_REMINDER', 'Rapat Pleno Besok', 'Rapat Pleno Pengurus Pusat Triwulan III 2026 besok pukul 09.00 WIB.', 'admin-events', NULL, false, NULL, '2026-07-14 10:00:00'),
('ntf-010', 'usr-003', 'SYSTEM', 'Arsip Baru Diunggah', 'Dokumen "MoU IAA - Perpustakaan Nasional RI" telah diunggah ke Arsip Digital.', 'admin-archives', NULL, true, '2026-05-20 14:00:00', '2026-05-20 16:00:00');

-- ============================================
-- AUDIT LOGS (10)
-- ============================================
INSERT INTO `AuditLog` (`id`, `userId`, `action`, `description`, `ipAddress`, `userAgent`, `createdAt`) VALUES
('log-001', 'usr-001', 'LOGIN', 'User superadmin@iaa-anri.go.id logged in', '127.0.0.1', 'Mozilla/5.0', NOW()),
('log-002', 'usr-002', 'LOGIN', 'User admin@iaa-anri.go.id logged in', '192.168.1.5', 'Chrome/120', NOW()),
('log-003', 'usr-003', 'LOGIN', 'User pengurus@iaa-anri.go.id logged in', '10.0.0.15', 'Firefox/121', NOW()),
('log-004', 'usr-004', 'LOGIN', 'User anggota@iaa-anri.go.id logged in', '203.142.88.10', 'Safari/17', NOW()),
('log-005', 'usr-001', 'ARTICLE_CREATE', 'Created article: Rapat Koordinasi Nasional Arsiparis 2026', '127.0.0.1', 'Chrome/120', NOW()),
('log-006', 'usr-002', 'ARTICLE_UPDATE', 'Updated article: Pelatihan dan Sertifikasi Arsiparis Madya', '192.168.1.5', 'Chrome/120', NOW()),
('log-007', 'usr-001', 'CERTIFICATE_CREATE', 'Issued cert IAA-CERT-2026-0001 to Rina Wijayanti', '127.0.0.1', 'Chrome/120', NOW()),
('log-008', 'usr-003', 'ARCHIVE_CREATE', 'Created archive: SK Pengurus Pusat IAA Periode 2024-2027', '10.0.0.15', 'Firefox/121', NOW()),
('log-009', 'usr-001', 'BACKUP_CREATE', 'Created manual backup iaa-backup-2026-07-14.json', '127.0.0.1', 'Chrome/120', NOW()),
('log-010', 'usr-002', 'MENU_UPDATE', 'Updated menu: Kontak visibility toggled', '192.168.1.5', 'Chrome/120', NOW());

-- ============================================
-- CONTACT MESSAGES (5)
-- ============================================
INSERT INTO `ContactMessage` (`id`, `name`, `email`, `phone`, `subject`, `message`, `isRead`, `createdAt`) VALUES
('msg-001', 'Andi Pratama', 'andi.pratama@gmail.com', '081234567890', 'Tanya Pendaftaran Anggota', 'Halo, saya tertarik untuk mendaftar sebagai anggota IAA. Bagaimana cara pendaftarannya? Apakah ada syarat khusus?', false, NOW()),
('msg-002', 'Maya Sari', 'maya.sari@yahoo.com', '08987654321', 'Kerja Sama Penelitian', 'Selamat siang, saya dari Universitas Brawijaya ingin mengajukan kerja sama penelitian tentang digital preservation. Siapa kontak person yang bisa dihubungi?', true, NOW()),
('msg-003', 'Rudi Hartono', 'rudi.hartono@bpad.go.id', '081299988877', 'Pelatihan Srikandi', 'Mohon info jadwal pelatihan Srikandi terdekat untuk instansi kami. Kami butuh pelatihan untuk 15 orang staff.', false, NOW()),
('msg-004', 'Linda Kusuma', 'linda.kusuma@gmail.com', NULL, 'Undangan Seminar', 'Halo Tim IAA, kami ingin mengundang IAA untuk menjadi pembicara dalam seminar kearsipan di universitas kami. Mohon info prosedurnya.', true, NOW()),
('msg-005', 'Fajar Nugroho', 'fajar.nugroho@anri.go.id', '085712345678', 'Lupa Password', 'Mohon bantuan, saya lupa password akun IAA Digital saya. Email: fajar.nugroho@anri.go.id. Terima kasih.', false, NOW());

-- ============================================
-- ARCHIVES (8) + VERSIONS (12) + ACCESSES (15)
-- ============================================
INSERT INTO `Archive` (`id`, `archiveNumber`, `title`, `description`, `category`, `documentDate`, `source`, `destination`, `classification`, `accessLevel`, `tags`, `currentVersion`, `isPinned`, `uploadedById`, `createdAt`, `updatedAt`) VALUES
('arc-001', 'ARC-SK-2026-001', 'SK Pengurus Pusat IAA Periode 2024-2027', 'Surat Keputusan pengangkatan pengurus pusat IAA periode 2024-2027.', 'SK', '2024-01-15', 'Dewan Pembina IAA', NULL, 'PUBLIK', 'PUBLIK', 'sk,pengurus,2024-2027', 2, true, 'usr-001', NOW(), NOW()),
('arc-002', 'ARC-ADART-2024-001', 'Anggaran Dasar dan Rumah Tangga IAA', 'AD/ART IAA hasil amandemen Kongres VI tahun 2024.', 'AD_ART', '2024-11-20', 'Kongres VI IAA', NULL, 'PUBLIK', 'PUBLIK', 'ad,art,kongres,amandemen', 1, true, 'usr-001', NOW(), NOW()),
('arc-003', 'ARC-MOU-2026-001', 'MoU IAA - Perpustakaan Nasional RI', 'Nota Kesepahaman antara IAA dan Perpusnas tentang pengembangan digital library.', 'MOU', '2026-05-20', 'Sekretariat IAA', 'Perpustakaan Nasional RI', 'INTERNAL', 'PENGURUS', 'mou,perpusnas,digital library', 1, false, 'usr-001', NOW(), NOW()),
('arc-004', 'ARC-SURAT-M-2026-045', 'Undangan Rakornas Arsiparis 2026 dari ANRI', 'Surat undangan resmi dari Kepala ANRI kepada IAA untuk Rakornas 2026.', 'SURAT_MASUK', '2026-02-10', 'Kepala ANRI', 'Ketua Umum IAA', 'INTERNAL', 'PENGURUS', 'undangan,rakornas,2026', 1, false, 'usr-002', NOW(), NOW()),
('arc-005', 'ARC-SURAT-K-2026-028', 'Surat Balasan IAA ke Perpusnas', 'Surat balasan resmi IAA kepada Perpusnas mengenai implementasi MoU.', 'SURAT_KELUAR', '2026-06-05', 'Sekretaris Jenderal IAA', 'Perpustakaan Nasional RI', 'INTERNAL', 'PENGURUS', 'surat keluar,perpusnas,mou', 2, false, 'usr-003', NOW(), NOW()),
('arc-006', 'ARC-RAPAT-2026-012', 'Notula Rapat Pleno Pengurus Pusat Triwulan II 2026', 'Dokumentasi notula rapat pleno pengurus pusat IAA triwulan II 2026.', 'DOKUMEN_RAPAT', '2026-07-05', 'Sekretariat IAA', NULL, 'INTERNAL', 'PENGURUS', 'notula,rapat pleno,tw ii 2026', 1, false, 'usr-003', NOW(), NOW()),
('arc-007', 'ARC-SK-2026-008', 'SK Panitia Harwanas ke-53 Tahun 2026', 'Surat Keputusan pembentukan panitia pelaksana Harwanas ke-53 tahun 2026.', 'SK', '2026-05-01', 'Ketua Umum IAA', NULL, 'PUBLIK', 'ANGGOTA', 'sk,panitia,harwanas 2026', 1, false, 'usr-001', NOW(), NOW()),
('arc-008', 'ARC-ORG-2025-003', 'Laporan Tahunan IAA 2025', 'Laporan tahunan IAA tahun 2025.', 'DOKUMEN_ORGANISASI', '2026-01-30', 'Sekretariat IAA', NULL, 'PUBLIK', 'PUBLIK', 'laporan,tahunan,2025', 1, false, 'usr-002', NOW(), NOW());

INSERT INTO `ArchiveVersion` (`id`, `archiveId`, `version`, `fileUrl`, `fileName`, `fileSize`, `mimeType`, `changeLog`, `uploadedById`, `createdAt`) VALUES
('vrs-001', 'arc-001', 1, '/uploads/archives/sk-pengurus-2024-v1.pdf', 'SK-Pengurus-2024-v1.pdf', 245000, 'application/pdf', 'Versi awal pengangkatan', 'usr-001', '2024-01-15'),
('vrs-002', 'arc-001', 2, '/uploads/archives/sk-pengurus-2024-v2.pdf', 'SK-Pengurus-2024-v2.pdf', 251000, 'application/pdf', 'Revisi pasal 5 tentang tugas bendahara', 'usr-002', '2024-03-10'),
('vrs-003', 'arc-002', 1, '/uploads/archives/ad-art-2024.pdf', 'AD-ART-IAA-2024.pdf', 580000, 'application/pdf', 'Hasil amandemen Kongres VI', 'usr-001', '2024-11-20'),
('vrs-004', 'arc-003', 1, '/uploads/archives/mou-perpusnas-2026.pdf', 'MoU-IAA-Perpusnas-2026.pdf', 320000, 'application/pdf', 'Versi awal penandatanganan', 'usr-001', '2026-05-20'),
('vrs-005', 'arc-004', 1, '/uploads/archives/undangan-rakornas-2026.pdf', 'Undangan-Rakornas-2026.pdf', 145000, 'application/pdf', 'Surat masuk original', 'usr-002', '2026-02-10'),
('vrs-006', 'arc-005', 1, '/uploads/archives/surat-balasan-perpusnas-v1.pdf', 'Surat-Balasan-Perpusnas-v1.pdf', 98000, 'application/pdf', 'Draft awal', 'usr-003', '2026-06-05'),
('vrs-007', 'arc-005', 2, '/uploads/archives/surat-balasan-perpusnas-v2.pdf', 'Surat-Balasan-Perpusnas-v2.pdf', 102000, 'application/pdf', 'Revisi penanggalan dan tanda tangan', 'usr-003', '2026-06-08'),
('vrs-008', 'arc-006', 1, '/uploads/archives/notula-rapat-pleno-tw2-2026.pdf', 'Notula-Rapat-Pleno-TW2-2026.pdf', 187000, 'application/pdf', 'Notula final', 'usr-003', '2026-07-05'),
('vrs-009', 'arc-007', 1, '/uploads/archives/sk-panitia-harwanas-2026.pdf', 'SK-Panitia-Harwanas-2026.pdf', 156000, 'application/pdf', 'Versi awal', 'usr-001', '2026-05-01'),
('vrs-010', 'arc-008', 1, '/uploads/archives/laporan-tahunan-2025.pdf', 'Laporan-Tahunan-IAA-2025.pdf', 1240000, 'application/pdf', 'Versi publikasi', 'usr-002', '2026-01-30'),
('vrs-011', 'arc-002', 2, '/uploads/archives/ad-art-2024-revisi.pdf', 'AD-ART-IAA-2024-Revisi.pdf', 595000, 'application/pdf', 'Revisi pasal 12 tentang keanggotaan', 'usr-001', '2025-02-15'),
('vrs-012', 'arc-003', 2, '/uploads/archives/mou-perpusnas-addendum-2026.pdf', 'MoU-Addendum-2026.pdf', 180000, 'application/pdf', 'Addendum: tambahan pilar kerja sama', 'usr-001', '2026-07-01');

INSERT INTO `ArchiveAccess` (`id`, `archiveId`, `userId`, `action`, `ipAddress`, `createdAt`) VALUES
('acc-001', 'arc-001', 'usr-003', 'VIEW', '10.0.0.15', NOW()),
('acc-002', 'arc-001', 'usr-002', 'DOWNLOAD', '192.168.1.5', NOW()),
('acc-003', 'arc-001', 'usr-001', 'UPLOAD', '127.0.0.1', NOW()),
('acc-004', 'arc-002', 'usr-001', 'UPLOAD', '127.0.0.1', NOW()),
('acc-005', 'arc-002', 'usr-004', 'VIEW', '203.142.88.10', NOW()),
('acc-006', 'arc-003', 'usr-001', 'UPLOAD', '127.0.0.1', NOW()),
('acc-007', 'arc-003', 'usr-003', 'VIEW', '10.0.0.15', NOW()),
('acc-008', 'arc-003', 'usr-003', 'DOWNLOAD', '10.0.0.15', NOW()),
('acc-009', 'arc-004', 'usr-002', 'UPLOAD', '192.168.1.5', NOW()),
('acc-010', 'arc-005', 'usr-003', 'UPLOAD', '10.0.0.15', NOW()),
('acc-011', 'arc-005', 'usr-001', 'VIEW', '127.0.0.1', NOW()),
('acc-012', 'arc-006', 'usr-003', 'UPLOAD', '10.0.0.15', NOW()),
('acc-013', 'arc-007', 'usr-001', 'UPLOAD', '127.0.0.1', NOW()),
('acc-014', 'arc-008', 'usr-002', 'UPLOAD', '192.168.1.5', NOW()),
('acc-015', 'arc-008', 'usr-004', 'VIEW', '203.142.88.10', NOW());

-- ============================================
-- CHAT CONVERSATIONS (5) + MESSAGES (20)
-- ============================================
INSERT INTO `ChatConversation` (`id`, `userId`, `guestName`, `title`, `createdAt`, `updatedAt`) VALUES
('chat-001', 'usr-004', NULL, 'Tanya tentang arsip dinamis', NOW(), NOW()),
('chat-002', 'usr-005', NULL, 'Cara daftar sertifikasi', NOW(), NOW()),
('chat-003', NULL, 'Guest', 'Tanya tentang keanggotaan IAA', NOW(), NOW()),
('chat-004', 'usr-006', NULL, 'Preservasi digital', NOW(), NOW()),
('chat-005', 'usr-009', NULL, 'UU 43/2009 kearsipan', NOW(), NOW());

INSERT INTO `ChatMessage` (`id`, `conversationId`, `role`, `content`, `createdAt`) VALUES
('cm-001', 'chat-001', 'user', 'Apa itu arsip dinamis dan bagaimana cara mengelolanya?', NOW()),
('cm-002', 'chat-001', 'assistant', 'Arsip dinamis adalah arsip yang masih dalam proses administrasi dan masih digunakan untuk pengambilan keputusan. Pengelolaannya meliputi penciptaan, klasifikasi, penyimpanan, dan penjadwalan retensi sesuai dengan SOP yang berlaku di instansi.', NOW()),
('cm-003', 'chat-001', 'user', 'Apa bedanya dengan arsip statis?', NOW()),
('cm-004', 'chat-001', 'assistant', 'Arsip statis adalah arsip yang sudah tidak digunakan untuk kegiatan sehari-hari tetapi memiliki nilai guna untuk penelitian dan sejarah. Arsip statis biasanya diserahkan ke lembaga kearsipan untuk dipreservasi secara permanen.', NOW()),
('cm-005', 'chat-002', 'user', 'Bagaimana cara mendaftar sertifikasi arsiparis berjenjang?', NOW()),
('cm-006', 'chat-002', 'assistant', 'Pendaftaran sertifikasi arsiparis berjenjang (Pemula, Muda, Madya, Utama) dibuka dua kali setahun melalui portal IAA Digital. Anda perlu melampirkan NIP, ijazah, SK pengangkatan, dan memenuhi syarat pengalaman kerja.', NOW()),
('cm-007', 'chat-002', 'user', 'Berapa lama proses sertifikasinya?', NOW()),
('cm-008', 'chat-002', 'assistant', 'Proses sertifikasi meliputi pelatihan intensif (1-3 bulan tergantung jenjang), asesmen kompetensi, dan uji sertifikasi. Total waktu sekitar 3-6 bulan dari pendaftaran hingga pengumuman hasil.', NOW()),
('cm-009', 'chat-003', 'user', 'Siapa yang bisa menjadi anggota IAA?', NOW()),
('cm-010', 'chat-003', 'assistant', 'Anggota IAA adalah arsiparis yang bekerja di lingkungan ANRI dan instansi pemerintah lainnya. Pendaftaran dilakukan melalui portal IAA Digital dengan melampirkan dokumen pendukung seperti NIP, ijazah, dan SK pengangkatan.', NOW()),
('cm-011', 'chat-004', 'user', 'Apa itu preservasi digital?', NOW()),
('cm-012', 'chat-004', 'assistant', 'Preservasi digital adalah serangkaian kegiatan untuk memastikan bahwa informasi digital tetap dapat diakses dan dapat dibaca dalam jangka panjang. Ini meliputi migrasi format, emulasi, dan manajemen metadata.', NOW()),
('cm-013', 'chat-004', 'user', 'Standar apa yang digunakan?', NOW()),
('cm-014', 'chat-004', 'assistant', 'Standar yang umum digunakan adalah ISO 16363 (Trusted Digital Repository), model OAIS (Open Archival Information System), dan Dublin Core untuk metadata. IAA mengadopsi standar ini dalam pedoman preservasi digital nasional.', NOW()),
('cm-015', 'chat-004', 'user', 'Apakah cloud storage cukup untuk preservasi?', NOW()),
('cm-016', 'chat-004', 'assistant', 'Cloud storage hanyalah infrastruktur penyimpanan, bukan solusi preservasi. Preservasi digital membutuhkan strategi yang lebih komprehensif: manajemen format file, validasi integritas, redundansi geografis, dan kebijakan akses jangka panjang.', NOW()),
('cm-017', 'chat-005', 'user', 'Apa dasar hukum kearsipan di Indonesia?', NOW()),
('cm-018', 'chat-005', 'assistant', 'Dasar hukum utama kearsipan di Indonesia adalah Undang-Undang Nomor 43 Tahun 2009 tentang Kearsipan. Selain itu, ada Permen PANRB No. 1 Tahun 2022 tentang Tata Kelola Arsip dan berbagai peraturan teknis lainnya dari ANRI.', NOW()),
('cm-019', 'chat-005', 'user', 'Di mana saya bisa baca UU tersebut?', NOW()),
('cm-020', 'chat-005', 'assistant', 'Anda dapat mengunduh teks lengkap UU 43/2009 melalui Digital Library IAA Digital. Cari koleksi dengan kategori "Regulasi" atau gunakan fitur pencarian dengan kata kunci "UU 43".', NOW());

-- ============================================
-- OAUTH ACCOUNTS (2)
-- ============================================
INSERT INTO `OAuthAccount` (`id`, `userId`, `provider`, `providerAccountId`, `email`, `name`, `avatar`, `accessToken`, `refreshToken`, `expiresAt`, `createdAt`, `updatedAt`) VALUES
('oau-001', 'usr-001', 'google', 'google-1084729104729', 'bambang.sutrisno@gmail.com', 'Dr. Bambang Sutrisno', 'https://lh3.googleusercontent.com/avatar1', 'sim_access_token_001', 'sim_refresh_token_001', '2026-08-01 00:00:00', NOW(), NOW()),
('oau-002', 'usr-002', 'google', 'google-2038571029385', 'siti.nurhaliza@gmail.com', 'Siti Nurhaliza', 'https://lh3.googleusercontent.com/avatar2', 'sim_access_token_002', 'sim_refresh_token_002', '2026-08-01 00:00:00', NOW(), NOW());

-- ============================================
-- BACKUP HISTORY (7)
-- ============================================
INSERT INTO `BackupHistory` (`id`, `type`, `status`, `fileName`, `fileSize`, `recordCount`, `triggeredById`, `notes`, `createdAt`) VALUES
('bkp-001', 'scheduled', 'success', 'iaa-backup-2026-07-17-0300.json', 2458624, 1247, NULL, 'Auto backup harian 03:00 WIB', '2026-07-17 03:00:00'),
('bkp-002', 'scheduled', 'success', 'iaa-backup-2026-07-16-0300.json', 2451234, 1245, NULL, 'Auto backup harian 03:00 WIB', '2026-07-16 03:00:00'),
('bkp-003', 'scheduled', 'success', 'iaa-backup-2026-07-15-0300.json', 2448901, 1244, NULL, 'Auto backup harian 03:00 WIB', '2026-07-15 03:00:00'),
('bkp-004', 'manual', 'success', 'iaa-backup-2026-07-14-1510.json', 2445234, 1242, 'usr-001', 'Manual backup sebelum update sistem', '2026-07-14 15:10:00'),
('bkp-005', 'scheduled', 'failed', 'iaa-backup-2026-07-13-0300.json', 0, 0, NULL, 'Failed: Disk space insufficient (resolved at 04:30)', '2026-07-13 03:00:00'),
('bkp-006', 'scheduled', 'success', 'iaa-backup-2026-07-12-0300.json', 2438901, 1240, NULL, 'Auto backup harian 03:00 WIB', '2026-07-12 03:00:00'),
('bkp-007', 'manual', 'success', 'iaa-backup-2026-07-10-0900.json', 2435678, 1238, 'usr-001', 'Manual backup sebelum maintenance', '2026-07-10 09:00:00');

-- ============================================
-- SITE SETTINGS (28)
-- ============================================
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `type`, `category`, `updatedAt`, `updatedById`) VALUES
('ss-001', 'site.name', 'IAA Digital', 'text', 'general', NOW(), NULL),
('ss-002', 'site.shortName', 'IAA', 'text', 'general', NOW(), NULL),
('ss-003', 'site.description', 'Platform Digital Organisasi Ikatan Arsiparis ANRI. Memori kolektif peradaban bangsa, dikelola dengan profesionalisme dan teknologi modern.', 'textarea', 'general', NOW(), NULL),
('ss-004', 'site.tagline', 'Ikatan Arsiparis ANRI', 'text', 'general', NOW(), NULL),
('ss-005', 'branding.logoUrl', '', 'image', 'branding', NOW(), NULL),
('ss-006', 'branding.faviconUrl', '/favicon.svg', 'image', 'branding', NOW(), NULL),
('ss-007', 'branding.icon192Url', '/icon-192.svg', 'image', 'branding', NOW(), NULL),
('ss-008', 'branding.icon512Url', '/icon-512.svg', 'image', 'branding', NOW(), NULL),
('ss-009', 'branding.primaryColor', '#0a1e3f', 'color', 'branding', NOW(), NULL),
('ss-010', 'branding.accentColor', '#c9a227', 'color', 'branding', NOW(), NULL),
('ss-011', 'contact.address', 'Jl. Gajah Mada No. 111, Jakarta Pusat 11130, Indonesia', 'textarea', 'contact', NOW(), NULL),
('ss-012', 'contact.phone', '(021) 6694166', 'text', 'contact', NOW(), NULL),
('ss-013', 'contact.fax', '(021) 6694167', 'text', 'contact', NOW(), NULL),
('ss-014', 'contact.email', 'sekretariat@iaa-anri.go.id', 'text', 'contact', NOW(), NULL),
('ss-015', 'contact.emailPengurus', 'pengurus@iaa-anri.go.id', 'text', 'contact', NOW(), NULL),
('ss-016', 'contact.whatsapp', '6281234567890', 'text', 'contact', NOW(), NULL),
('ss-017', 'contact.operatingHours', 'Senin - Jumat: 08.00 - 16.00 WIB', 'text', 'contact', NOW(), NULL),
('ss-018', 'contact.mapsUrl', 'https://maps.google.com/?q=ANRI+Jakarta', 'text', 'contact', NOW(), NULL),
('ss-019', 'social.facebook', 'https://facebook.com/iaa.anri', 'text', 'social', NOW(), NULL),
('ss-020', 'social.instagram', 'https://instagram.com/iaa.anri', 'text', 'social', NOW(), NULL),
('ss-021', 'social.youtube', 'https://youtube.com/@iaa.anri', 'text', 'social', NOW(), NULL),
('ss-022', 'social.linkedin', 'https://linkedin.com/company/iaa-anri', 'text', 'social', NOW(), NULL),
('ss-023', 'social.twitter', '', 'text', 'social', NOW(), NULL),
('ss-024', 'seo.metaTitle', 'IAA Digital — Ikatan Arsiparis ANRI', 'text', 'seo', NOW(), NULL),
('ss-025', 'seo.metaDescription', 'Platform Digital Organisasi Ikatan Arsiparis ANRI. Manajemen anggota, perpustakaan digital, arsip organisasi, kegiatan, dan e-certificate dalam satu sistem.', 'textarea', 'seo', NOW(), NULL),
('ss-026', 'seo.metaKeywords', 'IAA, Ikatan Arsiparis ANRI, Arsiparis, ANRI, Kearsipan, Digital Platform', 'text', 'seo', NOW(), NULL),
('ss-027', 'seo.ogImage', '', 'image', 'seo', NOW(), NULL),
('ss-028', 'seo.googleAnalyticsId', '', 'text', 'seo', NOW(), NULL);

-- Header feature toggles
INSERT INTO `SiteSetting` (`id`, `key`, `value`, `type`, `category`, `updatedAt`, `updatedById`) VALUES
('ss-029', 'header.showSearch', 'true', 'boolean', 'header', NOW(), NULL),
('ss-030', 'header.showAIChatbot', 'true', 'boolean', 'header', NOW(), NULL),
('ss-031', 'header.showLanguageSwitcher', 'true', 'boolean', 'header', NOW(), NULL),
('ss-032', 'header.showThemeToggle', 'true', 'boolean', 'header', NOW(), NULL),
('ss-033', 'header.showVerifyButton', 'true', 'boolean', 'header', NOW(), NULL);

-- ============================================
-- MENU CONFIG (5 parent + 6 child)
-- ============================================
INSERT INTO `MenuConfig` (`id`, `label`, `labelKey`, `view`, `url`, `icon`, `parentId`, `order`, `isVisible`, `isExternal`, `isActive`, `createdAt`, `updatedAt`) VALUES
('menu-001', 'Beranda', 'nav.beranda', 'public', NULL, 'Home', NULL, 0, true, false, true, NOW(), NOW()),
('menu-002', 'Tentang', 'nav.tentangGroup', NULL, NULL, 'Info', NULL, 1, true, false, true, NOW(), NOW()),
('menu-003', 'Informasi', 'nav.informasi', NULL, NULL, 'FileText', NULL, 2, true, false, true, NOW(), NOW()),
('menu-004', 'Digital Library', 'nav.library', 'library', NULL, 'BookOpen', NULL, 3, true, false, true, NOW(), NOW()),
('menu-005', 'Kontak', 'nav.kontak', 'contact', NULL, 'Mail', NULL, 4, true, false, true, NOW(), NOW());

INSERT INTO `MenuConfig` (`id`, `label`, `labelKey`, `view`, `url`, `icon`, `parentId`, `order`, `isVisible`, `isExternal`, `isActive`, `createdAt`, `updatedAt`) VALUES
('menu-006', 'Tentang IAA', 'nav.tentang', 'about', NULL, 'Info', 'menu-002', 0, true, false, true, NOW(), NOW()),
('menu-007', 'Struktur Pengurus', 'nav.pengurus', 'organization', NULL, 'Users', 'menu-002', 1, true, false, true, NOW(), NOW()),
('menu-008', 'Berita', 'nav.berita', 'news-list', NULL, 'FileText', 'menu-003', 0, true, false, true, NOW(), NOW()),
('menu-009', 'Agenda', 'nav.agenda', 'event-list', NULL, 'Calendar', 'menu-003', 1, true, false, true, NOW(), NOW()),
('menu-010', 'Galeri', 'nav.galeri', 'gallery', NULL, 'Image', 'menu-003', 2, true, false, true, NOW(), NOW()),
('menu-011', 'FAQ', 'nav.faq', 'faq', NULL, 'HelpCircle', 'menu-003', 3, true, false, true, NOW(), NOW());

-- ============================================
-- MEDIA ASSETS (10)
-- ============================================
INSERT INTO `MediaAsset` (`id`, `filename`, `storedName`, `url`, `mimeType`, `size`, `width`, `height`, `alt`, `caption`, `thumbUrl`, `mediumUrl`, `largeUrl`, `uploadedById`, `createdAt`) VALUES
('med-001', 'logo-iaa.png', 'logo-iaa-001.png', '/uploads/logo-iaa.png', 'image/png', 45000, 400, 400, 'Logo IAA Digital', NULL, '/uploads/logo-iaa-thumb.webp', '/uploads/logo-iaa-medium.webp', '/uploads/logo-iaa-large.webp', 'usr-001', NOW()),
('med-002', 'hero-bg.jpg', 'hero-bg-001.jpg', '/uploads/hero-bg.jpg', 'image/jpeg', 234000, 1920, 1080, 'Background hero section', NULL, '/uploads/hero-bg-thumb.webp', '/uploads/hero-bg-medium.webp', '/uploads/hero-bg-large.webp', 'usr-001', NOW()),
('med-003', 'rakornas-2026.jpg', 'rakornas-2026.jpg', '/uploads/rakornas-2026.jpg', 'image/jpeg', 567000, 1600, 900, 'Foto Rakornas Arsiparis 2026', 'Rapat Koordinasi Nasional Arsiparis 2026 di Jakarta', '/uploads/rakornas-2026-thumb.webp', '/uploads/rakornas-2026-medium.webp', '/uploads/rakornas-2026-large.webp', 'usr-003', NOW()),
('med-004', 'harwanas-2026.jpg', 'harwanas-2026.jpg', '/uploads/harwanas-2026.jpg', 'image/jpeg', 445000, 1600, 900, 'Foto Harwanas 2026', 'Peringatan Hari Arsip Nasional ke-53', '/uploads/harwanas-2026-thumb.webp', '/uploads/harwanas-2026-medium.webp', '/uploads/harwanas-2026-large.webp', 'usr-001', NOW()),
('med-005', 'infographic-kearsipan.png', 'infographic-001.png', '/uploads/infographic-kearsipan.png', 'image/png', 189000, 1200, 800, 'Infografis statistik kearsipan', NULL, '/uploads/infographic-001-thumb.webp', '/uploads/infographic-001-medium.webp', '/uploads/infographic-001-large.webp', 'usr-002', NOW()),
('med-006', 'workshop-bandung.jpg', 'workshop-bandung.jpg', '/uploads/workshop-bandung.jpg', 'image/jpeg', 334000, 1600, 900, 'Workshop Digital Preservation Bandung', NULL, '/uploads/workshop-bandung-thumb.webp', '/uploads/workshop-bandung-medium.webp', '/uploads/workshop-bandung-large.webp', 'usr-003', NOW()),
('med-007', 'sertifikat-template.png', 'sertifikat-template.png', '/uploads/sertifikat-template.png', 'image/png', 78000, 1200, 850, 'Template sertifikat IAA', NULL, NULL, NULL, NULL, 'usr-001', NOW()),
('med-008', 'member-card-bg.png', 'member-card-bg.png', '/uploads/member-card-bg.png', 'image/png', 95000, 480, 303, 'Background kartu anggota', NULL, NULL, NULL, NULL, 'usr-001', NOW()),
('med-009', 'seminar-ai.jpg', 'seminar-ai.jpg', '/uploads/seminar-ai.jpg', 'image/jpeg', 412000, 1600, 900, 'Seminar AI dalam Kearsipan', NULL, '/uploads/seminar-ai-thumb.webp', '/uploads/seminar-ai-medium.webp', '/uploads/seminar-ai-large.webp', 'usr-001', NOW()),
('med-010', 'studibanding-msg.jpg', 'studibanding-msg.jpg', '/uploads/studibanding-msg.jpg', 'image/jpeg', 378000, 1600, 900, 'Studi banding Malaysia Singapore', NULL, '/uploads/studibanding-msg-thumb.webp', '/uploads/studibanding-msg-medium.webp', '/uploads/studibanding-msg-large.webp', 'usr-003', NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- DONE!
-- ============================================
-- Total data:
--   10 Users
--   10 Members
--   10 Organization Members
--   15 Articles + 5 Revisions
--   10 Events
--   15 Registrations
--   10 Certificates
--   15 Library Items
--   5 Gallery Albums + 20 Photos
--   6 Announcements
--   10 Notifications
--   10 Audit Logs
--   5 Contact Messages
--   8 Archives + 12 Versions + 15 Accesses
--   5 Chat Conversations + 20 Messages
--   2 OAuth Accounts
--   7 Backup History
--   33 Site Settings
--   11 Menu Configs
--   10 Media Assets
-- ============================================
