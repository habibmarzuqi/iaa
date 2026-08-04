# 02 — Daftar Fitur

## Modul Website Publik (Phase 1)

### 1. Landing Page Premium
- **Hero Section** — Glassmorphism, animated gradient, mock dashboard preview, stats inline
- **About Section** — Visi, Misi, nilai organisasi, sejarah
- **Stats Section** — 6 kartu statistik dengan gradient icons
- **Berita Section** — Berita unggulan + 3 berita terbaru
- **Agenda Section** — 4 kegiatan mendatang dengan progress bar kuota
- **Digital Library Preview** — 6 koleksi terbaru
- **Pengurus Preview** — 4 anggota pengurus pusat
- **FAQ Section** — 8 pertanyaan umum (accordion)
- **CTA Section** — Call-to-action untuk bergabung
- **Footer** — Navigasi, layanan, kontak, sosial media

### 2. Multi-bahasa (ID/EN)
- 300+ translation keys
- Language switcher dengan flag emoji (🇮🇩/🇬🇧)
- Persist pilihan bahasa di localStorage

### 3. Dark Mode
- Toggle dark/light mode
- next-themes integration
- Full dark mode support di seluruh komponen

### 4. PWA (Progressive Web App)
- manifest.json dengan app icons
- Service Worker (offline cache, stale-while-revalidate)
- Install prompt dengan 7-day dismiss
- Push notification handler

### 5. Announcement System
- **Banner** — Sticky banner di atas header (dismissable)
- **Running Text** — Marquee animation di bawah header
- **Popup** — Modal full-screen dengan localStorage dismiss
- **Pinned** — Banner dengan indikator pin

### 6. Global Search
- Cmd/Ctrl+K shortcut
- Search across articles, events, library, archives, members
- Grouped results dengan type badges
- Highlight match dengan `<mark>` tag
- Recent searches (localStorage)
- Popular searches

---

## Modul Autentikasi & User (Phase 1)

### 7. Authentication
- Login dengan email + password (SHA-256)
- Session via httpOnly cookie (7 hari)
- 4 role: Super Admin, Administrator, Pengurus, Anggota
- Demo credentials untuk testing
- Google/Microsoft OAuth (simulated, ready for production)
- Audit log untuk setiap login

### 8. Member Dashboard
- Welcome banner dengan info anggota
- Quick stats (sertifikat, kegiatan, pending, status)
- **Digital Membership Card** — Premium card dengan QR code verification
- Overview tab dengan upcoming events + recent certificates
- Membership tab dengan card info + download PDF
- Certificates tab dengan grid e-certificate
- Events tab dengan riwayat pendaftaran
- **Digital Library Anggota** — Tab khusus untuk mengakses koleksi internal/khusus Anggota IAA
- Profile tab dengan data lengkap + riwayat pelatihan & sertifikasi

### 9. Admin Dashboard & Dynamic Member Management
- 4 stat cards dengan trend badges
- 3 Recharts (Area chart tren sertifikat, Pie chart jenjang, Bar chart status)
- **Pencarian & Filter Dinamis Anggota**:
  - Multi-field text search instant (Nama, No. Anggota, NIP, Instansi, Jabatan, Email)
  - Filter dropdown dinamis: Status Keanggotaan, Jenjang Arsiparis, Hak Akses Role, Unit Kerja / Instansi
  - Fitur pengurutan: Nomor Anggota, Nama A-Z, Tanggal Bergabung, Jenjang (dengan toggle Ascending/Descending)
  - Active filter chips dengan tombol Hapus (X) per item & reset paginasi otomatis

---

## Modul CMS — Manajemen Website Publik (Phase 1-4)

### 10. CMS Berita (Articles)
- Full CRUD (create, read, update, delete)
- **Rich Text Editor** (MDXEditor) — Bold, italic, headings, lists, quote, link toolbar (`CreateLink`)
- **Draft & Schedule** — Status: DRAFT/SCHEDULED/PUBLISHED/ARCHIVED
- **SEO Metadata** — Meta title, description, keywords, OG image
- **SEO Preview** — Google search + social media card preview
- **Featured Image** — Upload dari Media Library
- **Multi-Author** — Assign ke user lain
- **Revision History** — Auto-save setiap perubahan + LCS diff viewer
- **Tag Autocomplete** — Chip input dengan suggestion dari existing tags
- Auto-generate unique slug
- View count tracking

### 11. CMS Agenda (Events)
- Full CRUD dengan 6 event types (SEMINAR, WORKSHOP, WEBINAR, RAPAT, PELATIHAN, LOMBA)
- Rich Text Editor untuk deskripsi
- Datetime picker untuk mulai/selesai
- Kuota peserta + registration toggle
- Progress bar kuota terisi

### 12. CMS Digital Library & Dokumen
- Full CRUD dengan 11 kategori (BUKU, EBOOK, JURNAL, PEDOMAN, REGULASI, SOP, TEMPLATE, PRESENTASI, MAJALAH, VIDEO, AUDIO)
- **Aksesibilitas Ganda**: Pilihan publik (`PUBLIK`) atau khusus anggota (`ANGGOTA`)
- **Direct File Upload**: Upload file PDF, EPUB, DOCX, ZIP, MP3, MP4 langsung dari admin (`/api/library/upload`)
- **Wide Dialog Modal**: Pop-up form editor ekstra lebar (`max-w-4xl lg:max-w-5xl`) tanpa geser-geser
- Download & view counter tracking

### 13. Granular CMS Sub-Module Permissions (Manajemen Grup)
- Breakdown hak akses CMS menjadi sub-modul mandiri:
  - `cms-articles` — Berita & Artikel
  - `cms-events` — Agenda Kegiatan
  - `cms-library` — Digital Library & Dokumen
  - `cms-gallery` — Galeri Foto
  - `cms-organization` — Struktur Pengurus
  - `cms-announcements` — Pengumuman & Banner
  - `cms-faq` — Pertanyaan FAQ
- Visual indicator dengan inden (`↳`) dan badge *Sub-Modul CMS* di tabel permission grup
- Otomatis menyembunyikan tab CMS yang tidak diizinkan untuk grup pengguna tersebut

### 13. CMS Galeri Foto
- Album CRUD
- **Upload foto nyata** (multiple files, drag & drop)
- **Auto watermark** "IAA Digital" di setiap foto (sharp composite)
- **Auto thumbnail** (200x200 webp)
- **Bulk delete** dengan checkbox selection mode
- **Drag & drop reorder** (dnd-kit)
- **Photo management** — Side sheet dengan grid preview + hapus per foto

### 14. CMS Pengurus (Organization)
- Full CRUD dengan 4 kategori (Pengurus Pusat, Bidang, Dewan Pembina, Dewan Kehormatan)
- Order field untuk urutan tampil
- isActive toggle

### 15. CMS Pengumuman (Announcements)
- Full CRUD dengan 4 tipe (BANNER, POPUP, RUNNING_TEXT, PINNED)
- Date range (start/end) dengan auto-calc status aktif
- isPinned + isPopup flags

---

## Modul Arsip Digital (Phase 2)

### 16. Arsip Digital Organisasi
- 9 kategori (SURAT_MASUK, SURAT_KELUAR, DOKUMEN_RAPAT, SK, AD_ART, MOU, DOKUMEN_ORGANISASI, FOTO, VIDEO)
- 4 klasifikasi (PUBLIK, INTERNAL, RAHASIA, SANGAT_RAHASIA)
- 5 access level (PUBLIK, ANGGOTA, PENGURUS, ADMIN, SUPER_ADMIN)
- **Versioning** — Multiple versi per arsip dengan changeLog
- **File upload nyata** — PDF, DOC, XLS, PPT, images, video (max 50MB)
- **Add Version** — Upload file versi baru ke arsip existing
- **PDF Preview** — Render halaman pertama PDF sebagai thumbnail (pdfjs-dist + canvas)
- **Audit log** — Track setiap aksi (VIEW, DOWNLOAD, UPLOAD, EDIT, DELETE)
- Role-based access control
- Auto-generate archive number (ARC-CAT-YEAR-SEQ)
- Search + filter by kategori

---

## Modul E-Certificate (Phase 2)

### 17. E-Certificate Management
- Admin generator dengan 4 template (default, webinar, training, workshop)
- Auto-generate certificate number (IAA-CERT-YEAR-SEQ)
- Select penerima dari member list
- Link ke event (opsional)
- **Certificate Preview** — Premium card dengan QR code
- **Public Verification Page** — Verifikasi via nomor sertifikat atau QR scan
  - Valid result: Green card "Sertifikat Valid & Terverifikasi"
  - Invalid result: Red card "Sertifikat Tidak Ditemukan"
  - 3 demo cert numbers untuk quick test

---

## Modul Event Registration (Phase 2)

### 18. Event Registration Full Flow
- Member register ke event (POST /api/registrations)
- Auto WAITING_LIST jika kuota penuh
- Admin approve/reject registrations
- **QR Check-In** — Simulasi scanner dengan JSON input
  - Quick check-in list (belum check-in)
  - Recent check-ins
  - QR code per peserta di detail sheet
- Auto-promote waiting list saat ada cancel
- Registration status: PENDING, APPROVED, REJECTED, WAITING_LIST, CANCELLED
- Member side: "Daftar Sekarang" button di event detail

---

## Modul AI Chatbot (Phase 2)

### 19. AI Chatbot Kearsipan
- **z-ai-web-dev-sdk** integration (server-side only)
- System prompt: Pakar kearsipan Indonesia (UU 43/2009, Srikandi, ISO 16363, OAIS)
- Chat persistence ke database (ChatConversation + ChatMessage)
- Premium chat UI dengan:
  - 6 quick suggestion buttons
  - Markdown-lite renderer (bold, italic, lists)
  - Loading dots animation
  - Auto-scroll
  - Sidebar dengan disclaimer + stats
- Conversation history (max 10 messages context)

---

## Modul Reports & Export (Phase 2)

### 20. Reports
- 5 jenis laporan: Members, Events, Certificates, Library, Archives
- Date range filter (from/to)
- Preview laporan formal dengan header IAA + timestamp
- **Export CSV** (Excel-compatible)
- **Print/PDF** (browser print dialog)
- Summary stats per laporan

---

## Modul Notifikasi (Phase 3)

### 21. Notification System
- **Notification Bell** di header (hanya untuk logged-in user)
  - Badge unread counter (merah, animated)
  - Polling otomatis setiap 30 detik
  - 6 type: SYSTEM, EVENT_REMINDER, REGISTRATION_STATUS, CERTIFICATE_ISSUED, ANNOUNCEMENT, MESSAGE
  - Quick actions: Tandai dibaca, Hapus, Tandai semua dibaca
  - Click → navigate ke linked view
- **Broadcast** — Admin bisa kirim notifikasi ke semua user
- **Push Notification** — Permission request + browser Notification API

---

## Modul Backup & Restore (Phase 3)

### 22. Backup & Restore
- **Export** — Dump 20+ Prisma models ke JSON file (download)
- **Restore** — Upload JSON + ketik "RESTORE" untuk konfirmasi (Super Admin only)
- **Backup History** — Log semua backup (scheduled + manual, success/failed)
- **Scheduled cron** — `/api/cron/publish-scheduled` untuk auto-publish SCHEDULED articles
  - Token protection
  - Admin notification setiap auto-publish

---

## Modul Pengaturan (Phase 3-4)

### 23. Site Settings (Pengaturan Situs)
- **6 tabs**: Umum, Branding, Kontak, Sosial Media, SEO, Fitur Header
- **Umum**: Nama situs, nama singkat, tagline, deskripsi
- **Branding**: Upload logo, favicon (auto-resize 32x32), app icon 192/512 (auto-resize), warna primer & aksen (color picker)
- **Kontak**: Alamat, telepon, fax, email (seketariat + pengurus), WhatsApp, jam operasional, Google Maps URL
- **Sosial Media**: Facebook, Instagram, YouTube, LinkedIn, Twitter/X
- **SEO**: Meta title, description, keywords, OG image (auto-resize 1200x630), Google Analytics ID
- **Fitur Header**: Toggle show/hide untuk Search, AI Chatbot, Verifikasi, Bahasa, Dark Mode
- **Live integration**: Settings langsung ter-apply ke Header (nama, logo), Footer (kontak, sosial media), DynamicHead (favicon, meta tags)
- **Live preview**: Header + Footer + SEO preview card

### 24. System Settings (Pengaturan Sistem)
- **Backup & Restore** tab — History list + upload restore
- **Keamanan & OAuth** tab — Google/Microsoft linking + password policy checklist
- **Notifikasi** tab — Push permission + channel list
- **PWA & Mobile** tab — Status cards (Manifest, SW, Install, Push) + app shortcuts

### 25. Menu Manager (Manajemen Menu)
- **Dynamic menu** — Fetch dari API (bukan hardcoded)
- **Toggle visibility** — Switch per menu item
- **Reorder** — Tombol ↑↓ (auto-save via API)
- **Add/Delete menu** — Internal view atau external link
- **Submenu** — Tambah submenu ke parent (auto-dropdown di header)
- **Edit** — Label, i18n key, view, URL, icon
- **Expand/collapse** di admin panel
- Auto-seed 5 default menus (Beranda, Tentang ▾, Informasi ▾, Digital Library, Kontak)

---

## Modul File Management (Phase 4)

### 26. Media Library
- Upload gambar/PDF/video/audio (max 10MB)
- **Image optimization** — Auto-generate 3 webp variants (thumb 200x200, medium 800px, large 1200px)
- Grid view dengan hover actions (Pilih, Salin URL, Hapus)
- Search + filter by type
- Terintegrasi di ArticleDialog untuk Featured Image & OG Image

### 27. File Manager Terpadu
- 3 tabs: Media Library, Arsip, Galeri
- 4 stat cards: count per kategori + total size
- Search across all categories
- Grid view untuk media/galeri, list view untuk arsip

---

## Modul Keamanan

### 28. Security Features
- HTTPS ready
- httpOnly cookie untuk session
- CSRF protection (Next.js built-in)
- Rate limiting (ready untuk middleware)
- Audit trail untuk semua aksi sensitif
- Activity log (login history, archive access, content changes)
- Role-based access control (5 level)
- Password hashing (SHA-256, ready untuk bcrypt/argon2)
- File upload validation (type, size)
- Access level filtering untuk archives

---

## Total: 54+ Fitur Modul

- **20 Prisma models**
- **42+ API routes**
- **300+ i18n translation keys**
- **50+ shadcn/ui components**
- **10 admin sidebar menus**
