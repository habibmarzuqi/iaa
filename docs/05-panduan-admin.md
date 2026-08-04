# 05 — Panduan Admin

Panduan lengkap untuk administrator IAA Digital.

---

## Login

1. Buka `https://iaa-anri.go.id`
2. Klik tombol **Masuk** di pojok kanan atas
3. Masukkan email dan password
4. Klik **Masuk ke Portal**

### Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@iaa-anri.go.id` | `iaa12345` |
| Administrator | `admin@iaa-anri.go.id` | `iaa12345` |
| Pengurus | `pengurus@iaa-anri.go.id` | `iaa12345` |
| Anggota | `anggota@iaa-anri.go.id` | `iaa12345` |

> **Ganti password demo setelah deployment production!**

---

## Sidebar Admin

Setelah login sebagai admin, Anda akan melihat sidebar dengan 10 menu:

| Menu | Fungsi |
|------|--------|
| **Dashboard** | Statistik, charts, recent activity |
| **Website Publik (CMS)** | Kelola berita, agenda, library, galeri, pengurus, pengumuman, FAQ (tergantung hak akses sub-modul) |
| **Manajemen Anggota** | Kelola data anggota, filter dinamis multi-kriteria, pengurutan, ubah status & role |
| **Manajemen Grup** | Kelola grup tim pengelola & hak akses modul / sub-modul CMS secara spesifik |
| **Manajemen Menu** | Atur menu header (show/hide, urutan, tambah/hapus) |
| **File Manager** | Browse semua file (media, arsip, galeri) |
| **Pengaturan Situs** | Nama, logo, favicon, kontak, sosial media, SEO, fitur header |
| **Arsip Digital** | Kelola dokumen organisasi dengan versioning |
| **E-Certificate** | Generate & kelola sertifikat digital |
| **Event & Registrasi** | Approval pendaftaran + check-in QR |
| **Laporan** | Export PDF/CSV laporan |
| **Pengaturan Sistem** | Backup, restore, OAuth, PWA |

---

## 1. Manajemen Berita (CMS → Berita)

### Membuat Berita Baru
1. Klik **Website Publik (CMS)** → tab **Berita & Artikel**
2. Klik **Tulis Berita**
3. Isi form:
   - **Tab Konten**: Judul, kategori, tags (autocomplete), ringkasan, konten (Rich Text Editor)
   - **Tab Publish & Schedule**: Pilih status (Draft/Published/Scheduled), tanggal, slug, penulis
   - **Tab SEO**: Meta title, description, keywords, OG image + live preview
   - **Tab Media**: Upload featured image dari Media Library
4. Klik **Simpan**

### Edit Berita
1. Klik icon **Edit** (pensil) di samping artikel
2. Ubah konten
3. Klik **Simpan**

### Sembunyikan Berita
1. Ubah status ke **Draft** atau **Archived** di tab Publish
2. Simpan

### Riwayat Revisi
1. Saat edit artikel, klik **Riwayat Revisi** di pojok kanan atas
2. Lihat semua versi dengan diff viewer (hijau=added, merah=removed)
3. Klik **Restore ke Versi Ini** untuk rollback

---

## 2. Manajemen Menu (Manajemen Menu)

### Sembunyikan Menu
1. Klik **Manajemen Menu** di sidebar
2. Toggle switch (on/off) di samping menu yang ingin disembunyikan
3. Menu yang hidden akan punya badge "Hidden"
4. Refresh website publik → menu hilang dari header

### Mengubah Urutan Menu
1. Klik tombol **↑** atau **↓** di samping menu
2. Urutan tersimpan otomatis

### Tambah Menu Baru
1. Klik **Tambah Menu**
2. Isi: Label, pilih internal view atau external link, icon
3. Simpan

### Tambah Submenu
1. Klik tombol **+** di samping parent menu
2. Isi form submenu
3. Simpan → submenu otomatis jadi dropdown di header

---

## 3. Pengaturan Situs

### Ganti Logo & Favicon
1. Klik **Pengaturan Situs** → tab **Branding**
2. Klik **Upload** di samping Logo/Favicon/Icon
3. Pilih file gambar
4. Favicon auto-resize ke 32x32, icon 192/512 auto-resize
5. Klik **Simpan Perubahan**
6. Refresh website → logo berubah di header & footer

### Ganti Nama Situs
1. Tab **Umum** → ubah **Nama Situs**
2. Simpan → header & footer otomatis update

### Toggle Fitur Header
1. Tab **Fitur Header**
2. Toggle on/off untuk: Search, AI Chatbot, Verifikasi, Bahasa, Dark Mode
3. Simpan → fitur yang di-off hilang dari header

### Setup Sosial Media
1. Tab **Sosial Media**
2. Isi URL Facebook, Instagram, YouTube, LinkedIn, Twitter
3. Simpan → icon sosial media muncul di footer (hanya yang diisi)

### Setup SEO
1. Tab **SEO**
2. Isi Meta Title, Description, Keywords
3. Upload OG Image (auto-resize 1200x630)
4. Isi Google Analytics ID
5. Simpan → meta tags ter-update di browser

---

## 4. Manajemen Arsip Digital

### Buat Arsip Baru
1. Klik **Arsip Digital** → **Tambah Arsip**
2. Isi: Judul, kategori, tanggal dokumen, sumber, klasifikasi, access level
3. Upload file dokumen (PDF/DOC/media, max 50MB)
4. Isi catatan versi
5. Simpan

### Tambah Versi Baru ke Arsip Existing
1. Klik arsip untuk buka detail
2. Klik **Tambah Versi** di header Riwayat Versi
3. Upload file baru
4. Isi catatan perubahan
5. Simpan → versi baru muncul di riwayat

### Preview & Download File
1. Buka arsip detail
2. Di setiap versi, klik **Preview** (buka di tab baru) atau **Download**

---

## 5. E-Certificate

### Generate Sertifikat
1. Klik **E-Certificate** → **Generate Sertifikat**
2. Pilih penerima (anggota)
3. Pilih kegiatan terkait (opsional)
4. Isi judul sertifikat
5. Pilih template (default/webinar/training/workshop)
6. Generate → nomor sertifikat auto-generated

### Verifikasi Sertifikat (Public)
1. Buka `https://iaa-anri.go.id` → klik **Verifikasi** di header
2. Masukkan nomor sertifikat (contoh: `IAA-CERT-2026-0001`)
3. Klik **Verifikasi**
4. Hasil: hijau = valid, merah = tidak ditemukan

---

## 6. Event & Registrasi

### Approve Pendaftaran
1. Klik **Event & Registrasi** → tab **Registrasi**
2. Cari pendaftaran dengan status "Menunggu"
3. Klik **Approve** atau **Reject**

### Check-In Peserta
1. Tab **Check-In Scanner**
2. Pilih kegiatan
3. Paste QR data peserta (JSON) atau klik **Check-In** di list peserta
4. Status berubah menjadi "Checked-in"

---

## 7. Backup & Restore

### Backup Database
1. Klik **Pengaturan Sistem** → tab **Backup & Restore**
2. Klik **Backup Sekarang**
3. File JSON otomatis di-download

### Restore Database
1. Klik **Choose File** di section Restore
2. Pilih file backup JSON
3. Ketik "RESTORE" untuk konfirmasi
4. Klik **Restore Sekarang**
5. Hanya Super Admin yang bisa restore

---

## 8. Galeri Foto

### Upload Foto ke Album
1. Klik **Website Publik (CMS)** → tab **Galeri Foto**
2. Klik tombol **Foto** di album
3. Klik area upload → pilih multiple foto
4. Foto auto-dapat watermark "IAA Digital" + thumbnail

### Reorder Foto
1. Di manage photos sheet, drag foto dengan grip handle (pojok kanan atas)
2. Urutan tersimpan otomatis

### Bulk Delete Foto
1. Klik **Pilih** di toolbar
2. Centang foto yang ingin dihapus
3. Klik **Hapus (X)**

---

## 9. File Manager

### Browse Semua File
1. Klik **File Manager** di sidebar
2. 3 tabs: Media Library, Arsip, Galeri
3. Search di semua kategori sekaligus

### Hapus File
1. Hover file → klik icon **Trash**
2. Konfirmasi hapus

### Copy URL File
1. Hover file → klik icon **Copy**
2. URL disalin ke clipboard

---

## Tips & Trik

### Keyboard Shortcuts
- `Ctrl+K` (atau `Cmd+K` di Mac) — Buka global search
- `Esc` — Tutup dialog/modal

### Multi-bahasa
- Klik icon **Globe** di header untuk beralih ID/EN
- Pilihan tersimpan di browser

### Dark Mode
- Klik icon **Moon/Sun** di header
- Pilihan tersimpan di browser

### Best Practices
- **Backup sebelum update** — Selalu backup database sebelum melakukan perubahan besar
- **Test di Draft dulu** — Gunakan status Draft sebelum publish artikel
- **Cek SEO Preview** — Pastikan meta description 150-160 karakter
- **Gunakan Media Library** — Upload gambar sekali, pakai berkali-kali
- **Audit Log** — Semua aksi admin tercatat, jadi hati-hati saat delete
