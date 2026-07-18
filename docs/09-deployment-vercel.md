# 09 — Deployment ke Vercel + MySQL

Tutorial lengkap deploy IAA Digital ke **Vercel** (gratis/hosting cloud) dengan database **MySQL** eksternal.

---

## Kenapa Vercel?

| Kelebihan | Keterangan |
|-----------|------------|
| **Gratis** | Hobby plan 100GB bandwidth, cukup untuk website organisasi |
| **Auto HTTPS** | SSL otomatis, tidak perlu setup Let's Encrypt |
| **Global CDN** | Edge network di 100+ lokasi |
| **Auto Deploy** | Push ke Git → otomatis build & deploy |
| **Zero Config** | Next.js dideteksi otomatis |
| **Preview Deployments** | Setiap pull request dapat preview URL |

---

## Yang Dibutuhkan

1. **Akun Vercel** — Daftar gratis di [vercel.com](https://vercel.com)
2. **Akun GitHub/GitLab/Bitbucket** — Untuk source code repository
3. **Database MySQL eksternal** — Karena Vercel tidak menyediakan MySQL built-in

### Pilihan Database MySQL Eksternal

| Provider | Free Tier | Harga Berbayar | Region |
|----------|-----------|----------------|--------|
| **PlanetScale** | — | $39/bln (Scaler Pro) | Global |
| **Aiven** | Free 5GB | $19/bln+ | Multi-region |
| **TiDB Cloud** | Free 5GB | $0.1/jam (Serverless) | AWS (Singapore) |
| **Railway** | $5 credit/bln | $0.000463/GB-jam | Multi-region |
| **Supabase** | Free 500MB | $25/bln (Pro) | Multi-region |
| **VPS sendiri** | — | Rp 80rb-150rb/bln | ID/Singapore |
| **Shared hosting** | — | Rp 50rb-100rb/bln | Indonesia |

> 💡 **Rekomendasi budget terbatas:** VPS sendiri (DigitalOcean/Vultr $5-6/bln) untuk MySQL,
> deploy aplikasi ke Vercel free tier. Total biaya ~Rp 80rb-100rb/bln.

---

## Langkah 1: Siapkan Source Code di Git

### 1.1 Push kode ke GitHub

Jika belum ada di Git:

```bash
cd /path/to/iaa-digital

# Initialize git
git init
git add .
git commit -m "Initial commit: IAA Digital"

# Tambahkan remote GitHub
git remote add origin https://github.com/username/iaa-digital.git
git branch -M main
git push -u origin main
```

> ⚠️ **Penting:** Pastikan file `.env` TIDAK di-commit ke Git.
> Pastikan `.gitignore` berisi:
> ```
> .env
> .env.local
> .env.production
> node_modules/
> .next/
> db/
> public/uploads/
> ```

### 1.2 Tambahkan `.vercelignore`

Buat file `.vercelignore` di root proyek:

```
node_modules
.next
db
scripts/seed.ts
scripts/seed-archives.ts
scripts/seed-phase3.ts
```

---

## Langkah 2: Setup Database MySQL

### Opsi A: MySQL di VPS (Recommended untuk Indonesia)

Jika Anda punya VPS, install MySQL di sana dan gunakan sebagai database eksternal:

```bash
# Di VPS
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Buat database
mysql -u root -p
```

```sql
CREATE DATABASE iaa_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iaa_user'@'%' IDENTIFIED BY 'password_kuat_anda';
GRANT ALL PRIVILEGES ON iaa_digital.* TO 'iaa_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

**Edit MySQL config** untuk allow remote connection:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Ubah:
```ini
bind-address = 0.0.0.0
```

```bash
sudo systemctl restart mysql
```

**Buka firewall:**
```bash
sudo ufw allow 3306/tcp
```

**Catat koneksi:**
```
DATABASE_URL="mysql://iaa_user:password_kuat_anda@IP_SERVER_VPS:3306/iaa_digital"
```

### Opsi B: PlanetScale (Serverless MySQL)

1. Daftar di [planetscale.com](https://planetscale.com)
2. Buat database baru:
   - Name: `iaa-digital`
   - Region: Pilih terdekat (Singapore/AWS)
3. Dapatkan connection string:
   ```
   mysql://username:password@host/iaa-digital?sslaccept=accept
   ```
4. Catat sebagai `DATABASE_URL`

> **Catatan PlanetScale:** PlanetScale tidak mendukung foreign key constraints
> secara default. Jika ada error terkait foreign key, tambahkan
> `relationMode = "prisma"` di `prisma/schema.prisma`.

### Opsi C: Aiven (Free 5GB MySQL)

1. Daftar di [aiven.io](https://aiven.io)
2. Buat service MySQL (free tier)
3. Dapatkan connection string dari dashboard
4. Catat sebagai `DATABASE_URL`

### Opsi D: Railway

1. Daftar di [railway.app](https://railway.app)
2. New Project → Provision MySQL
3. Dapatkan `DATABASE_URL` dari Variables tab

---

## Langkah 3: Ubah Prisma ke MySQL

### 3.1 Edit `prisma/schema.prisma`

Ubah datasource dari SQLite ke MySQL:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

> **Jika sebelumnya `provider = "sqlite"`**, ganti ke `"mysql"`.

### 3.2 Generate Prisma Client

```bash
npx prisma generate
```

### 3.3 Test koneksi database

```bash
npx prisma db push
```

Jika berhasil, semua tabel akan dibuat di MySQL. Jika gagal, cek:
- `DATABASE_URL` benar
- MySQL mengizinkan remote connection (jika VPS)
- Firewall port 3306 terbuka
- SSL configuration (tambah `?sslaccept=accept` untuk PlanetScale)

### 3.4 Seed database

```bash
# Seed data dasar
npx tsx scripts/seed.ts

# Seed data arsip
npx tsx scripts/seed-archives.ts

# Seed data phase 3
npx tsx scripts/seed-phase3.ts
```

---

## Langkah 4: Deploy ke Vercel

### Opsi A: Deploy via Vercel Website (Recommended)

1. Buka [vercel.com](https://vercel.com) → klik **Sign Up** / **Log In**
2. Klik **Add New** → **Project**
3. Import repository GitHub/GitLab Anda:
   - Cari `iaa-digital` → klik **Import**
4. Konfigurasi project:
   - **Framework Preset**: Next.js (otomatis terdeteksi)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
5. **Environment Variables** — Klik tambah dan masukkan:

   | Key | Value |
  -----|-------|
   | `DATABASE_URL` | `mysql://iaa_user:password@host:3306/iaa_digital` |
   | `NEXTAUTH_SECRET` | (generate dengan `openssl rand -base64 32`) |
   | `CRON_SECRET` | (generate random string untuk cron job) |
   | `NEXT_PUBLIC_SITE_URL` | `https://iaa-digital.vercel.app` (ataar domain custom) |

   > ⚠️ **Jangan gunakan tanda kutip** di Value field Vercel.

6. Klik **Deploy**
7. Tunggu build selesai (2-5 menit)
8. Vercel memberi URL: `https://iaa-digital-xxx.vercel.app`

### Opsi B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy dari direktori proyek
cd /path/to/iaa-digital
vercel

# Ikuti prompt:
# ? Set up and deploy "~/iaa-digital"? [Y/n] y
# ? Which scope do you want to deploy to? username
# ? Link to existing project? [y/N] n
# ? What's your project's name? iaa-digital
# ? In which directory is your code located? ./
# ? Want to modify these settings? [y/N] n
```

Set environment variables via CLI:

```bash
vercel env add DATABASE_URL production
# Paste: mysql://iaa_user:password@host:3306/iaa_digital

vercel env add NEXTAUTH_SECRET production
# Paste: (random string)

vercel env add CRON_SECRET production
# Paste: (random string)
```

Deploy ke production:

```bash
vercel --prod
```

---

## Langkah 5: Setup Custom Domain (Opsional)

### 5.1 Tambah domain di Vercel

1. Buka dashboard Vercel → project `iaa-digital`
2. Settings → **Domains**
3. Klik **Add** → masukkan domain: `iaa-anri.go.id`
4. Tambah juga: `www.iaa-anri.go.id`

### 5.2 Konfigurasi DNS

Di panel DNS domain Anda (Niagahoster/Cloudflare/dll), tambahkan:

**Option A: Using Nameservers (Recommended)**
- Ubah nameserver domain ke Vercel:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ```

**Option B: Using A Record + CNAME**

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

### 5.3 SSL otomatis

Vercel otomatis memberikan SSL untuk custom domain. Tidak perlu setup tambahan.

### 5.4 Update Environment Variable

Setelah domain aktif, update:

```
NEXT_PUBLIC_SITE_URL=https://iaa-anri.go.id
```

Redeploy: Vercel Dashboard → Deployments → **Redeploy**

---

## Langkah 6: Setup File Upload Storage

### Masalah: Vercel filesystem bersifat ephemeral

Vercel menggunakan serverless functions. File yang di-upload ke `public/uploads/` **akan hilang** saat function cold start. Anda perlu **external storage** untuk file uploads.

### Solusi A: Cloudinary (Recommended, Free Tier)

1. Daftar di [cloudinary.com](https://cloudinary.com) — free 25GB storage
2. Dapatkan: `Cloud Name`, `API Key`, `API Secret`
3. Install package:
   ```bash
   npm install cloudinary
   ```
4. Tambah env variables di Vercel:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
5. Ubah API upload (media, gallery, archives) untuk menggunakan Cloudinary alih-alih `fs.writeFile`

### Solusi B: VPS sebagai storage (budget terbatas)

Jika Anda sudah punya VPS untuk MySQL, gunakan juga untuk file storage:

1. Setup API endpoint di VPS untuk receive file upload
2. Aplikasi di Vercel POST file ke VPS API
3. VPS simpan file ke `public/uploads/` dan return URL
4. Aplikasi simpan URL ke database

### Solusi C: AWS S3 / Backblaze B2

1. Buat bucket di AWS S3 atau Backblaze B2 (lebih murah)
2. Install `@aws-sdk/client-s3`
3. Ubah API upload untuk POST ke S3
4. Return public URL dari S3

### Solusi D: Upload ke VPS via API proxy

Buat script sederhana di VPS yang menerima file upload:

```javascript
// VPS: upload-server.js (jalankan dengan pm2)
const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')

const app = express()
const upload = multer({ dest: '/var/www/uploads/' })

app.use(cors())
app.post('/upload', upload.single('file'), (req, res) => {
  const url = `https://vps-anda.com/uploads/${req.file.filename}`
  res.json({ url, fileName: req.file.originalname, fileSize: req.file.size })
})

app.listen(3001, () => console.log('Upload server on :3001'))
```

Di aplikasi Vercel, ubah fetch upload dari `/api/media` ke `https://vps-anda.com:3001/upload`.

---

## Langkah 7: Setup Cron Job (Vercel Cron)

Vercel mendukung cron jobs via `vercel.json`:

Buat file `vercel.json` di root proyek:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled?token=YOUR_CRON_SECRET",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

> **Catatan:** Cron jobs hanya tersedia di Vercel **Pro plan** ($20/bulan).
> Untuk Hobby plan (free), gunakan **external cron**:
> - [cron-job.org](https://cron-job.org) (free)
> - [UptimeRobot](https://uptimerobot.com) (free, dengan cron monitoring)
> - Atur untuk hit URL setiap 15 menit:
>   `https://iaa-anri.go.id/api/cron/publish-scheduled?token=YOUR_CRON_SECRET`

---

## Langkah 8: Konfigurasi `next.config.ts` untuk Vercel

Pastikan `next.config.ts` sudah optimal untuk Vercel:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Output standalone untuk Vercel (otomatis, tidak perlu set)
  // output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Environment
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
}

export default nextConfig
```

---

## Langkah 9: Push Schema & Seed Database

Setelah deploy pertama berhasil, jalankan Prisma push & seed **secara lokal** dengan DATABASE_URL yang sama dengan Vercel:

```bash
# Set DATABASE_URL ke MySQL eksternal di .env lokal
DATABASE_URL="mysql://iaa_user:password@host:3306/iaa_digital"

# Push schema
npx prisma db push

# Generate client
npx prisma generate

# Seed
npx tsx scripts/seed.ts
npx tsx scripts/seed-archives.ts
npx tsx scripts/seed-phase3.ts
```

> **Jangan jalankan seeder di Vercel!** Vercel tidak punya akses ke filesystem
> untuk seed scripts. Selalu seed dari lokal dengan DATABASE_URL yang sama.

---

## Langkah 10: Auto Deploy dari Git

Setelah setup pertama, setiap `git push` ke branch `main` akan otomatis:

1. Vercel detect push ke GitHub
2. Build aplikasi (`npm run build`)
3. Deploy ke production
4. Update URL otomatis

Untuk **Preview Deployment** (branch lain / Pull Request):
- Vercel otomatis buat preview URL: `https://iaa-digital-git-branch.vercel.app`
- Bisa untuk testing sebelum merge ke main

---

## Verifikasi Deployment

1. Buka URL Vercel (misal: `https://iaa-digital.vercel.app`)
2. Pastikan landing page tampil
3. Coba login:
   - Email: `superadmin@iaa-anri.go.id`
   - Password: `iaa12345`
4. Cek admin dashboard
5. Test upload file (jika storage sudah dikonfigurasi)
6. Cek dark mode
7. Cek language switcher

---

## Limitasi Vercel Free Tier (Hobby Plan)

| Aspek | Limit | Solusi |
|-------|-------|--------|
| **Bandwidth** | 100 GB/bulan | Upgrade ke Pro ($20/bln) jika perlu |
| **Build** | 6000 menit/bulan | Cukup untuk deploy harian |
| **Function Duration** | 10 detik/function | Cukup untuk API biasa |
| **Cron Jobs** | Tidak tersedia | Gunakan cron-job.org (external) |
| **File Storage** | Ephemeral | Gunakan Cloudinary/VPS/S3 |
| **Database** | Tidak tersedia | Gunakan MySQL eksternal |
| **Concurrent Builds** | 1 | Upgrade ke Pro untuk parallel |

---

## Update Aplikasi di Vercel

Update sangat mudah:

```bash
# Push kode baru ke GitHub
git add .
git commit -m "Update: new features"
git push origin main

# Vercel auto-deploy dalam 2-5 menit!
```

Jika ada perubahan database:

```bash
# Push schema ke MySQL (dari lokal)
npx prisma db push

# Commit & push kode
git add .
git commit -m "Update: schema changes"
git push origin main
```

---

## Troubleshooting Vercel

### Build Error: "Prisma Client not found"

**Solusi:** Tambahkan postinstall script di `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Runtime Error: "Database connection failed"

**Solusi:** Cek Environment Variables di Vercel Dashboard → Settings → Environment Variables. Pastikan `DATABASE_URL` benar dan MySQL mengizinkan koneksi dari IP Vercel.

### Error: "Function timeout"

Vercel free tier membatasi 10 detik per API call. Jika ada query berat:

**Solusi:**
- Optimasi query Prisma (tambah `select` untuk limit fields)
- Tambah `take` untuk limit results
- Upgrade ke Vercel Pro (60 detik timeout)

### File upload tidak persisten

**Solusi:** Gunakan external storage (Cloudinary/VPS/S3). Lihat Langkah 6 di atas.

### Cold start lambat

Vercel serverless functions cold start ~1-3 detik.

**Solusi:**
- Gunakan Vercel Edge Functions (lebih cepat cold start)
- Setup cron-job.org untuk hit URL setiap 5 menit (keep warm)

### Domain tidak bisa diakses

**Solusi:**
- Cek DNS record (A record ke `76.76.21.21` atau nameserver Vercel)
- Tunggu propagasi DNS (5-30 menit)
- Cek di Vercel Dashboard → Domains → status harus "Valid Configuration"

---

## Estimasi Biaya Total

| Skenario | Komponen | Biaya/bulan |
|----------|----------|-------------|
| **Budget (Free)** | Vercel Hobby + VPS MySQL $5 | ~Rp 80rb |
| **Recommended** | Vercel Hobby + VPS MySQL $6 + Cloudinary Free | ~Rp 95rb |
| **Pro** | Vercel Pro $20 + PlanetScale $39 | ~Rp 900rb |
| **Enterprise** | Vercel Pro + AWS RDS MySQL + S3 | $50-100+ |

> 💡 **Rekomendasi:** Vercel Hobby (free) + VPS DigitalOcean/Vultr ($5-6) untuk MySQL +
> Cloudinary (free 25GB) untuk file storage = **Total ~Rp 80rb-100rb/bulan**

---

## Quick Reference: Environment Variables untuk Vercel

```
DATABASE_URL=mysql://iaa_user:password@host:3306/iaa_digital
NEXTAUTH_SECRET=random_32_char_string
CRON_SECRET=random_string_for_cron
NEXT_PUBLIC_SITE_URL=https://iaa-anri.go.id
CLOUDINARY_CLOUD_NAME=your_cloud_name (opsional)
CLOUDINARY_API_KEY=your_api_key (opsional)
CLOUDINARY_API_SECRET=your_api_secret (opsional)
SMTP_HOST=smtp.gmail.com (opsional)
SMTP_PORT=587 (opsional)
SMTP_USER=email@anda.com (opsional)
SMTP_PASS=password_email (opsional)
```

---

## Checklist Deploy Vercel

- [ ] Kode sudah di-push ke GitHub/GitLab
- [ ] `.gitignore` berisi `.env`, `node_modules`, `.next`, `db/`, `public/uploads/`
- [ ] `.vercelignore` dibuat
- [ ] `prisma/schema.prisma` sudah `provider = "mysql"`
- [ ] Database MySQL eksternal sudah dibuat dan bisa diakses
- [ ] `DATABASE_URL` sudah benar di Vercel Environment Variables
- [ ] `NEXTAUTH_SECRET` sudah di-set di Vercel
- [ ] `package.json` punya `postinstall: "prisma generate"`
- [ ] `npx prisma db push` sudah dijalankan dari lokal
- [ ] Seeder sudah dijalankan dari lokal
- [ ] File upload storage sudah dikonfigurasi (Cloudinary/VPS/S3)
- [ ] Domain custom sudah di-setup (opsional)
- [ ] Cron job sudah dikonfigurasi (Vercel Pro atau external cron-job.org)
- [ ] Test login berfungsi
- [ ] Test upload file berfungsi
- [ ] Test dark mode & language switcher
