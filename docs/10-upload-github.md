# 10 — Upload ke GitHub

Panduan lengkap upload proyek IAA Digital ke GitHub repository Anda.

---

## Prasyarat

1. **Git** terinstall di komputer → cek: `git --version`
2. **Akun GitHub** → Anda sudah punya: `https://github.com/habibmarzuqi`
3. **Repository** sudah dibuat: `https://github.com/habibmarzuqi/iaa.git`

---

## Langkah 1: Install Git (jika belum)

### Windows
Download dari [git-scm.com](https://git-scm.com/download/win) → install dengan default settings.

### macOS
```bash
# Via Homebrew
brew install git

# Atau via Xcode Command Line Tools
xcode-select --install
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update && sudo apt install -y git
```

### Verifikasi
```bash
git --version
# Output: git version 2.43.0 (atau lebih baru)
```

---

## Langkah 2: Konfigurasi Git (sekali saja)

```bash
git config --global user.name "Habib Marzuqi"
git config --global user.email "email-anda@gmail.com"
```

> Gunakan email yang terdaftar di akun GitHub Anda.

---

## Langkah 3: Buat `.gitignore`

Pastikan file `.gitignore` ada di root proyek. Jika belum, buat:

```bash
cd /home/z/my-project
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Next.js
.next/
out/

# Production
build/

# Environment
.env
.env.local
.env.production
.env.development

# Database
db/
*.db
*.db-journal

# Uploads (jangan commit file upload)
public/uploads/

# Misc
.DS_Store
*.pem
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log
npm-debug.log*
dev.log

# Vercel
.vercel

# Cache
.cache/
.turbo/

# Agent context
agent-ctx/
worklog.md
EOF
```

> ⚠️ **PENTING:** `.env` dan `public/uploads/` HARUS ada di `.gitignore`.
> `.env` berisi password database, `uploads/` berisi file user yang besar.

---

## Langkah 4: Buat `.vercelignore` (untuk deploy Vercel nanti)

```bash
cat > .vercelignore << 'EOF'
node_modules
.next
db
scripts/seed.ts
scripts/seed-archives.ts
scripts/seed-phase3.ts
docs/
agent-ctx/
worklog.md
EOF
```

---

## Langkah 5: Inisialisasi Git di Proyek

```bash
cd /home/z/my-project

# Initialize git repository
git init

# Tambahkan semua file (kecuali yang di .gitignore)
git add .

# Cek apa yang akan di-commit (opsional, untuk verifikasi)
git status
```

> **Pastikan `node_modules/`, `.env`, `db/`, dan `public/uploads/` TIDAK muncul di git status.**
> Jika muncul, periksa kembali `.gitignore`.

---

## Langkah 6: Commit Pertama

```bash
git commit -m "Initial commit: IAA Digital - Platform Organisasi Ikatan Arsiparis ANRI

Fitur:
- Website publik (landing page, berita, agenda, library, galeri, FAQ)
- CMS lengkap (Rich Text Editor, SEO, revision history, tag autocomplete)
- Manajemen menu dinamis (show/hide, reorder, submenu)
- Pengaturan situs (logo, favicon, kontak, sosial media, SEO, fitur header)
- Dashboard anggota (Digital Membership Card + QR)
- Dashboard admin (charts, stats, quick access)
- Arsip digital (versioning, file upload, PDF preview, audit log)
- E-Certificate (generate, QR verification, public verification page)
- Event registration (approve/reject, QR check-in, waiting list)
- AI Chatbot kearsipan (z-ai-web-dev-sdk)
- Notifikasi (bell, announcement banner/popup/running text)
- Backup & Restore (JSON export/import)
- Multi-bahasa ID/EN (300+ translation keys)
- Dark mode
- PWA (manifest, service worker, install prompt)
- Full-text search (Cmd+K, grouped results, highlight)
- File manager terpadu (media + arsip + galeri)
- Media library (sharp optimization, watermark, variants)
- Galeri foto (upload, drag&drop reorder, bulk delete, watermark)
- Laporan (PDF/CSV export, 5 jenis laporan)
- Scheduled publish (cron job)
- 20 Prisma models, 42+ API routes
- Dokumentasi lengkap (10 file, 3000+ baris)"
```

---

## Langkah 7: Hubungkan ke GitHub Repository

```bash
# Tambahkan remote repository
git remote add origin https://github.com/habibmarzuqi/iaa.git

# Set branch utama ke main
git branch -M main

# Push ke GitHub
git push -u origin main
```

### Jika diminta login GitHub:

#### Opsi A: Personal Access Token (Recommended)

GitHub tidak lagi menerima password untuk Git push. Gunakan Personal Access Token:

1. Buka [github.com/settings/tokens](https://github.com/settings/tokens)
2. Klik **Generate new token (classic)**
3. Beri nama: `IAA Digital`
4. Expiration: pilih sesuai kebutuhan (90 hari / 1 tahun)
5. Centang scope: `repo` (full control of private repositories)
6. Klik **Generate token**
7. **Copy token** (simpan baik-baik, tidak bisa dilihat lagi)

Saat `git push`, masukkan:
- Username: `habibmarzuqi`
- Password: paste **token** (bukan password GitHub)

#### Opsi B: SSH Key (lebih aman, setup sekali)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "email-anda@gmail.com"
# Tekan Enter untuk semua prompt (default location, no passphrase)

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

Tambahkan ke GitHub:
1. Buka [github.com/settings/keys](https://github.com/settings/keys)
2. Klik **New SSH key**
3. Title: `Komputer Saya`
4. Key: paste hasil `cat` di atas
5. Klik **Add SSH key**

Ubah remote ke SSH:
```bash
git remote set-url origin git@github.com:habibmarzuqi/iaa.git
git push -u origin main
```

#### Opsi C: GitHub CLI (paling mudah)

```bash
# Install GitHub CLI
# macOS: brew install gh
# Linux: sudo apt install gh
# Windows: winget install GitHub.cli

# Login
gh auth login
# Pilih: GitHub.com → HTTPS → Login with browser

# Push
git push -u origin main
```

---

## Langkah 8: Verifikasi di GitHub

1. Buka [github.com/habibmarzuqi/iaa](https://github.com/habibmarzuqi/iaa)
2. Pastikan semua file ter-upload
3. Cek bahwa `node_modules/`, `.env`, `db/`, `public/uploads/` TIDAK ada di repo
4. Cek folder `docs/` ada dengan 10 file markdown

---

## Langkah 9: Update di Masa Depan

Setiap kali Anda mengubah kode dan ingin update ke GitHub:

```bash
cd /home/z/my-project

# Cek apa yang berubah
git status

# Tambahkan semua perubahan
git add .

# Commit dengan pesan deskriptif
git commit -m "Update: tambah fitur X, fix bug Y"

# Push ke GitHub
git push origin main
```

### Contoh pesan commit yang baik:

```bash
git commit -m "Tambah: modul manajemen menu dengan toggle visibility"
git commit -m "Fix: bug nav.tentangGroup muncul literal di header"
git commit -m "Update: dokumentasi deployment Vercel"
git commit -m "Refactor: optimasi query Prisma untuk dashboard"
```

---

## Troubleshooting

### Error: "fatal: remote origin already exists"

```bash
# Hapus remote lama, tambah ulang
git remote remove origin
git remote add origin https://github.com/habibmarzuqi/iaa.git
git push -u origin main
```

### Error: "failed to push some refs" (repository tidak kosong)

Jika repo GitHub sudah ada file (misal README dari GitHub):

```bash
# Pull dulu, lalu push
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: "Permission denied (publickey)" (SSH)

```bash
# Cek SSH key ada
ls -la ~/.ssh/
# Harus ada id_ed25519 dan id_ed25519.pub

# Cek SSH agent berjalan
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Test koneksi
ssh -T git@github.com
# Harus: "Hi habibmarzuqi! You've successfully authenticated."
```

### Error: "file terlalu besar" (uploads ter-commit)

Jika tidak sengaja commit file besar dari `uploads/`:

```bash
# Hapus dari git tracking (tapi tetap di disk)
git rm -r --cached public/uploads/
git commit -m "Remove uploads from git tracking"
git push origin main
```

### File `.env` ter-commit (BAHAYA!)

Jika tidak sengaja commit `.env`:

```bash
# Hapus dari git history
git rm --cached .env
git commit -m "Remove .env from tracking"

# Jika sudah di-push, hapus dari history (PERLU force push)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all
git push origin main --force

# GANTI SEMUA PASSWORD di .env (database, SMTP, dll) karena sudah ter-expose!
```

---

## Quick Reference Commands

```bash
# Setup awal (sekali saja)
git init
git remote add origin https://github.com/habibmarzuqi/iaa.git
git branch -M main

# Commit & push (setiap update)
git add .
git commit -m "Deskripsi perubahan"
git push origin main

# Cek status
git status
git log --oneline -5

# Pull update terbaru (jika bekerja dari komputer berbeda)
git pull origin main
```
