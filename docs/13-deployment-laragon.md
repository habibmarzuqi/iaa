# 13 — Deployment Lokal dengan Laragon (Windows)

Panduan lengkap menjalankan IAA Digital di komputer Windows menggunakan **Laragon** sebagai environment lokal (MySQL + Node.js).

---

## Kenapa Laragon?

| Kelebihan | Keterangan |
|-----------|------------|
| **All-in-one** | MySQL, Apache, PHP dalam 1 instalasi |
| **Auto virtual host** | Otomatis buat domain seperti `iaa.test` |
| **Ringan** | Hemat RAM, cocok untuk laptop |
| **Gratis** | Laragon Full adalah freeware |
| **Mudah** | GUI untuk start/stop services |
| **phpMyAdmin** | Include database manager |

---

## Langkah 1: Download & Install Laragon

### 1.1 Download Laragon

1. Buka [laragon.org/download](https://laragon.org/download.html)
2. Download **Laragon Full** (versi terbaru, ~260MB)
3. Pilih **Laragon Full** (bukan Lite) karena includes MySQL

### 1.2 Install Laragon

1. Jalankan installer `laragon-wamp.exe`
2. Pilih bahasa: **English**
3. **Destination location:** biarkan default `C:\laragon`
4. Pilih komponen (biarkan semua tercentang):
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ Node.js
   - ✅ Composer
5. Klik **Next** → **Install**
6. Tunggu instalasi selesai (~2-5 menit)
7. Centang **Run Laragon** → **Finish**

### 1.3 Konfigurasi Laragon

1. Buka Laragon
2. Klik **gear icon** (Settings) di pojok kanan atas
3. Tab **General**:
   - ✅ **Run when Windows starts** (opsional)
   - ✅ **Auto virtual hosts** — penting!
   - Virtual host folder: `C:\laragon\www`
4. Tab **Services**:
   - ✅ Apache → Auto start
   - ✅ MySQL → Auto start
5. Klik **OK**

### 1.4 Start Services

1. Klik tombol **Start All** di Laragon
2. Pastikan **Apache** dan **MySQL** berwarna hijau
3. Cek di browser: buka `http://localhost` → harus tampil halaman Laragon

---

## Langkah 2: Setup MySQL Database

### 2.1 Buka phpMyAdmin

1. Buka browser → `http://localhost/phpmyadmin`
2. Login:
   - Username: `root`
   - Password: *(kosong, default Laragon)*

### 2.2 Buat Database

1. Klik **New** (di sidebar kiri)
2. Database name: `iaa_digital`
3. Collation: `utf8mb4_unicode_ci`
4. Klik **Create**

### 2.3 Buat MySQL User (Opsional, bisa pakai root)

Jika ingin pakai user terpisah:

1. Klik tab **User accounts**
2. Klik **Add user account**
3. Isi:
   - Username: `iaa_user`
   - Host name: `localhost`
   - Password: `iaa_password` (atau password kuat)
4. Database for user: **Grant all privileges on database "iaa_digital"**
5. Klik **Go**

### 2.4 Catat Koneksi Database

```
Host: localhost
Port: 3306
Database: iaa_digital
Username: root (atau iaa_user)
Password: (kosong untuk root, atau iaa_password untuk iaa_user)
```

---

## Langkah 3: Install Git & Clone Proyek

### 3.1 Install Git (jika belum)

1. Download dari [git-scm.com/download/win](https://git-scm.com/download/win)
2. Jalankan installer → Next semua (default settings)
3. Verifikasi: buka **Command Prompt** → ketik `git --version`

### 3.2 Clone Proyek

Buka **Command Prompt** (atau **PowerShell** atau **Git Bash**):

```cmd
cd C:\laragon\www

git clone https://github.com/habibmarzuqi/iaa.git iaa.monas.web.id
```

> **Kenapa folder `iaa.monas.web.id`?**
> Laragon auto virtual host akan membuat domain `iaa.monas.web.id.test`
> berdasarkan nama folder. Jadi Anda bisa akses via `http://iaa.monas.web.id.test`

### 3.3 Verifikasi Clone

```cmd
cd iaa.monas.web.id
dir
```

Pastikan terlihat: `package.json`, `src/`, `prisma/`, `public/`, `docs/`, dll

---

## Langkah 4: Switch Prisma ke MySQL

### 4.1 Copy Schema MySQL

```cmd
copy prisma\schema-mysql.prisma prisma\schema.prisma
```

Atau via File Explorer:
1. Buka `C:\laragon\www\iaa.monas.web.id\prisma\`
2. Copy `schema-mysql.prisma` → paste → rename jadi `schema.prisma` (overwrite)

### 4.2 Verifikasi

Buka `prisma/schema.prisma` dengan text editor, pastikan:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

---

## Langkah 5: Install Node.js (jika belum)

Laragon sudah include Node.js, tapi mungkin versi lama. Cek:

```cmd
node --version
```

Jika versi < 18 atau `command not found`:

### 5.1 Install Node.js 20 LTS

1. Download dari [nodejs.org](https://nodejs.org/) → **LTS version** (20.x)
2. Jalankan installer → Next semua (default settings)
3. **Restart Command Prompt** (tutup dan buka lagi)
4. Verifikasi:
   ```cmd
   node --version
   npm --version
   ```
   Harus: `v20.x.x` dan `10.x.x`

---

## Langkah 6: Buat File .env

### 6.1 Buat file .env

```cmd
cd C:\laragon\www\iaa.monas.web.id
copy .env.example .env
```

### 6.2 Edit .env

Buka file `.env` dengan Notepad / VS Code:

```env
# Database MySQL Laragon
DATABASE_URL="mysql://root:@localhost:3306/iaa_digital"

# Jika pakai user iaa_user:
# DATABASE_URL="mysql://iaa_user:iaa_password@localhost:3306/iaa_digital"

# Application
NODE_ENV="development"
NEXTAUTH_SECRET="random32karakterstringdisini1234567890"
CRON_SECRET="randomcronsecret123"
NEXT_PUBLIC_SITE_URL="http://iaa.monas.web.id.test"
```

> **Catatan:**
> - Jika password root kosong, formatnya: `mysql://root:@localhost:3306/iaa_digital`
>   (perhatikan tanda `:` setelah root, lalu `@` langsung — tidak ada password)
> - Jika pakai user: `mysql://iaa_user:iaa_password@localhost:3306/iaa_digital`
> - `NODE_ENV="development"` untuk lokal (hot reload aktif)
> - Generate NEXTAUTH_SECRET: ketik 32+ karakter acak

---

## Langkah 7: Install Dependencies

```cmd
cd C:\laragon\www\iaa.monas.web.id
npm install
```

Tunggu 3-5 menit. Jika sukses, tidak ada error.

> Jika error `npm ERR!`:
> - Hapus folder `node_modules` dan file `package-lock.json`
> - Jalankan ulang: `npm install`
> - Atau coba: `npm install --legacy-peer-deps`

---

## Langkah 8: Generate Prisma Client

```cmd
npx prisma generate
```

Output:
```
✔ Generated Prisma Client (v6.x.x) to ./node_modules/@prisma/client
```

---

## Langkah 9: Push Database Schema

```cmd
npx prisma db push
```

Ini akan membuat semua tabel (20+ models) di MySQL Laragon.

Output:
```
🚀 Your database is now in sync with your Prisma schema.
```

> Jika error: `Can't reach database server`
> - Pastikan MySQL Laragon sedang running (lampu hijau)
> - Cek `DATABASE_URL` di `.env` — host harus `localhost`, port `3306`

---

## Langkah 10: Seed Database

```cmd
# Install tsx global
npm install -g tsx

# Seed data dasar
npx tsx scripts/seed.ts

# Seed data arsip
npx tsx scripts/seed-archives.ts

# Seed data notifikasi + backup
npx tsx scripts/seed-phase3.ts
```

Output sukses:
```
✅ Seed completed!
🔑 Demo credentials (password: iaa12345):
   - superadmin@iaa-anri.go.id (SUPER_ADMIN)
```

---

## Langkah 11: Jalankan Aplikasi

### Mode Development (Hot Reload — Recommended untuk lokal)

```cmd
npm run dev
```

Output:
```
▲ Next.js 16.1.3 (Turbopack)
- Local:        http://localhost:3000
✓ Ready in 1.2s
```

Buka browser: **http://localhost:3000**

### Mode Production (Test sebelum deploy)

```cmd
# Build dulu
npm run build

# Jalankan production server
npm run start
```

Buka browser: **http://localhost:3000**

---

## Langkah 12: Login & Test

1. Buka **http://localhost:3000**
2. Klik **Masuk** di pojok kanan atas
3. Login:
   - Email: `superadmin@iaa-anri.go.id`
   - Password: `iaa12345`
4. Test semua fitur:
   - Dashboard admin
   - CMS berita (buat artikel baru)
   - Upload file ke arsip/galeri
   - Dark mode toggle
   - Language switcher (ID/EN)
   - Search (Ctrl+K)

---

## Langkah 13: Setup Virtual Host Laragon (Opsional)

Laragon auto virtual host memungkinkan akses via `http://iaa.monas.web.id.test` alih-alih `http://localhost:3000`.

Namun karena Next.js berjalan di port 3000 (bukan port 80 Apache), Anda perlu setup proxy:

### 13.1 Buat .htaccess di root domain

Buat file `C:\laragon\www\iaa.monas.web.id\.htaccess`:

```apache
RewriteEngine On
RewriteRule ^$ http://localhost:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### 13.2 Enable Apache proxy modules

1. Buka `C:\laragon\bin\apache\httpd-2.4.x\conf\httpd.conf`
2. Uncomment (hapus tanda `#`):
   ```
   LoadModule proxy_module modules/mod_proxy.so
   LoadModule proxy_http_module modules/mod_proxy_http.so
   ```
3. Restart Apache di Laragon

### 13.3 Akses via virtual host

Buka browser: **http://iaa.monas.web.id.test**

> Catatan: Next.js dev server harus tetap running (`npm run dev` di Command Prompt terpisah)

---

## Struktur Folder Laragon

```
C:\laragon\
├── bin\
│   ├── apache\          → Apache server
│   ├── mysql\           → MySQL server
│   ├── php\             → PHP
│   └── nodejs\          → Node.js (Laragon bundled)
├── data\
│   └── mysql\           → Database files
├── etc\
│   └── apps\            → phpMyAdmin
├── tmp\
└── www\                 → Web root
    └── iaa.monas.web.id\     → Proyek IAA Digital
        ├── .env
        ├── .next\
        ├── node_modules\
        ├── prisma\
        │   └── schema.prisma  (MySQL version)
        ├── public\
        │   └── uploads\       → File uploads
        ├── scripts\
        ├── src\
        ├── docs\
        ├── package.json
        └── ...
```

---

## Update Aplikasi Lokal

Setiap kali ada update di GitHub:

```cmd
cd C:\laragon\www\iaa.monas.web.id

:: Pull kode terbaru
git pull origin main

:: Install dependencies baru
npm install

:: Generate Prisma client
npx prisma generate

:: Push database schema (jika ada perubahan)
npx prisma db push

:: Jalankan ulang
npm run dev
```

---

## Backup Database Lokal

### Via phpMyAdmin:
1. Buka `http://localhost/phpmyadmin`
2. Pilih database `iaa_digital`
3. Klik **Export**
4. Format: **SQL**
5. Klik **Go** → file download

### Via Command Prompt:
```cmd
:: Export
mysqldump -u root iaa_digital > backup_iaa.sql

:: Import
mysql -u root iaa_digital < backup_iaa.sql
```

---

## Troubleshooting Windows + Laragon

### `npm: command not found`
- Buka Command Prompt baru (tutup yang lama)
- Atau install Node.js dari nodejs.org (Laragon mungkin pakai versi lama)
- Cek: `where npm`

### `npx prisma: command not found`
```cmd
npx prisma generate
```
Jika tetap gagal:
```cmd
node node_modules\prisma\build\index.js generate
```

### MySQL: `Access denied for user 'root'`
- Default Laragon: user `root`, password kosong
- Jika Anda set password, update `DATABASE_URL` di `.env`
- Test koneksi: `mysql -u root -p`

### Port 3000 sudah digunakan
```cmd
:: Cek apa yang pakai port 3000
netstat -ano | findstr :3000

:: Kill process (ganti PID dengan angka dari output di atas)
taskkill /PID 12345 /F

:: Atau jalankan Next.js di port lain
npx next dev -p 3001
```

### `git clone` gagal: `SSL certificate problem`
```cmd
git config --global http.sslVerify false
git clone https://github.com/habibmarzuqi/iaa.git iaa.monas.web.id
```

### Build error: `JavaScript heap out of memory`
```cmd
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

### phpMyAdmin: `Cannot log in to the MySQL server`
- Pastikan MySQL running di Laragon (lampu hijau)
- Default Laragon: user `root`, password kosong
- Jika masih gagal, reset password MySQL via Laragon

### File upload error: `EACCES permission denied`
- Klik kanan folder `public\uploads` → Properties → Security
- Tambahkan user **Everyone** dengan **Full Control**
- Atau jalankan Command Prompt sebagai Administrator

### Virtual host tidak jalan
- Pastikan **Auto virtual hosts** aktif di Laragon Settings
- Restart Apache setelah ubah config
- Cek file `hosts` di `C:\Windows\System32\drivers\etc\hosts`
  - Harus ada entry: `127.0.0.1 iaa.monas.web.id.test`
  - Laragon otomatis tambahkan ini

---

## VS Code Setup (Recommended)

### Install VS Code
Download dari [code.visualstudio.com](https://code.visualstudio.com/)

### Recommended Extensions
| Extension | Fungsi |
|-----------|--------|
| **Prisma** | Syntax highlight untuk `.prisma` files |
| **Tailwind CSS IntelliSense** | Autocomplete Tailwind classes |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **GitLens** | Git integration |

### Buka proyek
```cmd
cd C:\laragon\www\iaa.monas.web.id
code .
```

### VS Code Terminal
- Tekan `Ctrl + \`` (backtick) untuk buka terminal di VS Code
- Jalankan `npm run dev` dari terminal VS Code
- Hot reload otomatis saat save file

---

## Checklist Setup Lokal

- [ ] Laragon terinstall & running (Apache + MySQL hijau)
- [ ] Database `iaa_digital` dibuat di phpMyAdmin
- [ ] Git terinstall
- [ ] Proyek di-clone ke `C:\laragon\www\iaa.monas.web.id\`
- [ ] Prisma schema switched ke MySQL
- [ ] File `.env` dibuat dengan DATABASE_URL yang benar
- [ ] Node.js 20+ terinstall
- [ ] `npm install` berhasil
- [ ] `npx prisma generate` berhasil
- [ ] `npx prisma db push` berhasil
- [ ] `npx tsx scripts/seed.ts` berhasil
- [ ] `npm run dev` berjalan
- [ ] http://localhost:3000 bisa diakses
- [ ] Login dengan demo credentials berhasil
- [ ] Upload file berfungsi
- [ ] Dark mode & language switcher berfungsi

---

## Quick Reference Commands

```cmd
:: Navigasi ke proyek
cd C:\laragon\www\iaa.monas.web.id

:: Jalankan development server
npm run dev

:: Build production
npm run build

:: Jalankan production server
npm run start

:: Update dari GitHub
git pull origin main

:: Reset database (HATI-HATI: hapus semua data!)
npx prisma db push --force-reset
npx tsx scripts/seed.ts

:: Cek database di phpMyAdmin
:: Buka browser: http://localhost/phpmyadmin
```
