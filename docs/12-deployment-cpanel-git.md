# 12 — Deploy cPanel via Git Clone (Terminal)

Cara paling mudah deploy IAA Digital ke cPanel `iaa.monas.web.id` dengan clone langsung dari GitHub via Terminal cPanel.

---

## Prasyarat

- cPanel dengan akses **Terminal**
- cPanel support **Node.js** (menu "Setup Node.js App")
- Git terinstall di server (biasanya sudah)
- Repository GitHub: `https://github.com/habibmarzuqi/iaa.git`

---

## Langkah 1: Setup MySQL Database

1. Login cPanel → **MySQL Databases**
2. **Create New Database:** `iaa_digital`
3. **Create New User:**
   - Username: `iaa_user`
   - Password: buat password kuat (CATAT!)
4. **Add User to Database:**
   - Pilih `iaa_user` + `iaa_digital`
   - ALL PRIVILEGES → Make Changes

> cPanel akan tambahkan prefix, jadi nama lengkapnya mungkin:
> - Database: `monas_iaa_digital` (prefix = username cPanel)
> - User: `monas_iaa_user`

---

## Langkah 2: Buka Terminal cPanel

1. cPanel → **Advanced** → **Terminal**
2. Klik **I understand and want to proceed**
3. Anda akan masuk ke shell dengan prompt seperti:
   ```
   monas@server [~]#
   ```

---

## Langkah 3: Navigasi ke Root Domain

```bash
# Cek folder home
pwd
# Output: /home/monas

# Navigasi ke root domain
cd public_html/iaa.monas.web.id
# Atau jika domain ada di:
# cd iaa.monas.web.id
# Atau:
# cd public_html

# Pastikan folder kosong
ls -la
# Jika ada file, backup dulu atau hapus
```

---

## Langkah 4: Clone dari GitHub

```bash
git clone https://github.com/habibmarzuqi/iaa.git .
```

> Tanda `.` di akhir = clone ke folder saat ini (bukan subfolder)

Jika diminta login:
```
Username: habibmarzuqi
Password: [Personal Access Token GitHub Anda]
```

Atau gunakan URL dengan token:
```bash
git clone https://habibmarzuqi:TOKEN_ANDA@github.com/habibmarzuqi/iaa.git .
```

Setelah clone selesai:
```bash
ls -la
# Pastikan terlihat: package.json, src/, prisma/, public/, dll
```

---

## Langkah 5: Switch Prisma ke MySQL

```bash
# Ganti schema Prisma dari SQLite ke MySQL
cp prisma/schema-mysql.prisma prisma/schema.prisma
```

---

## Langkah 6: Buat File .env

```bash
# Copy template
cp .env.example .env

# Edit .env
nano .env
```

Isi dengan kredensial MySQL dari Langkah 1:

```
DATABASE_URL="mysql://monas_iaa_user:PASSWORD_ANDA@localhost:3306/monas_iaa_digital"
NODE_ENV="production"
NEXTAUTH_SECRET="ketik_random_32_karakter_disini"
CRON_SECRET="ketik_random_string_disini"
NEXT_PUBLIC_SITE_URL="https://iaa.monas.web.id"
```

Simpan: `Ctrl+X` → `Y` → `Enter`

> ⚠️ **Penting:**
> - Ganti `monas_` dengan prefix username cPanel Anda
> - Ganti `PASSWORD_ANDA` dengan password MySQL dari Langkah 1
> - Host: `localhost` (bukan IP)
> - Generate random string untuk NEXTAUTH_SECRET: ketik 32 karakter acak

---

## Langkah 7: Install Dependencies

```bash
npm install
```

Tunggu 2-5 menit sampai selesai.

---

## Langkah 8: Generate Prisma Client

```bash
npx prisma generate
```

---

## Langkah 9: Push Database Schema

```bash
npx prisma db push
```

Ini akan membuat semua tabel di MySQL. Jika berhasil, output:
```
🚀 Your database is now in sync with your Prisma schema.
```

---

## Langkah 10: Seed Database

```bash
# Install tsx untuk menjalankan script TypeScript
npm install -g tsx

# Seed data dasar (users, articles, events, dll)
npx tsx scripts/seed.ts

# Seed data arsip
npx tsx scripts/seed-archives.ts

# Seed data notifikasi + backup
npx tsx scripts/seed-phase3.ts
```

Jika berhasil, output:
```
✅ Seed completed!
🔑 Demo credentials (password: iaa12345):
   - superadmin@iaa-anri.go.id (SUPER_ADMIN)
```

---

## Langkah 11: Build Next.js

```bash
npm run build
```

Tunggu 3-5 menit. Jika berhasil, output:
```
✓ Compiled successfully
✓ Build completed
```

---

## Langkah 12: Buat Folder Uploads

```bash
mkdir -p public/uploads/branding
mkdir -p public/uploads/archives
mkdir -p public/uploads/gallery
chmod -R 755 public/uploads/
```

---

## Langkah 13: Buat app.js untuk cPanel

```bash
cat > app.js << 'EOF'
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const port = process.env.PORT || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log('> IAA Digital ready on http://localhost:' + port)
  })
})
EOF
```

---

## Langkah 14: Setup Node.js App di cPanel

1. Keluar dari Terminal: `exit` atau tutup tab Terminal
2. cPanel → **Software** → **Setup Node.js App**
3. Klik **Create Application**

| Field | Value |
|-------|-------|
| **Node.js version** | 20.x |
| **Application mode** | Production |
| **Application root** | `iaa.monas.web.id` (atau path folder domain) |
| **Application URL** | `iaa.monas.web.id` |
| **Application startup file** | `app.js` |

4. Klik **Create**

---

## Langkah 15: Restart & Test

1. Di halaman Setup Node.js App → klik **Restart**
2. Tunggu 10-30 detik
3. Buka browser → **https://iaa.monas.web.id**
4. Login:
   - Email: `superadmin@iaa-anri.go.id`
   - Password: `iaa12345`

---

## Langkah 16: Setup SSL

1. cPanel → **SSL/TLS** → **Manage SSL sites**
2. Pilih `iaa.monas.web.id`
3. Klik **Run AutoSSL** (atau **Install SSL** jika punya cert)
4. Enable **Force HTTPS Redirect**

---

## Langkah 17: Setup Cron Job (Opsional)

1. cPanel → **Cron Jobs**
2. Add New Cron Job:
   - Setting: `*/15 * * * *` (setiap 15 menit)
   - Command:
     ```
     curl -s "https://iaa.monas.web.id/api/cron/publish-scheduled?token=CRON_SECRET_ANDA" > /dev/null 2>&1
     ```

---

## Selesai! 🎉

Aplikasi IAA Digital sekarang live di **https://iaa.monas.web.id**

---

## Update Aplikasi via Git (Sangat Mudah!)

Setiap kali ada update di GitHub, cukup jalankan di cPanel Terminal:

```bash
cd ~/public_html/iaa.monas.web.id

# Pull kode terbaru dari GitHub
git pull origin main

# Install dependencies baru (jika ada)
npm install

# Generate Prisma client
npx prisma generate

# Push schema database (jika ada perubahan)
npx prisma db push

# Build ulang
npm run build

# Restart di cPanel Node.js App
```

Lalu ke cPanel → Setup Node.js App → **Restart**

---

## Script Update Otomatis

Buat script untuk update yang tinggal dijalankan:

```bash
# Di cPanel Terminal
cd ~/public_html/iaa.monas.web.id

cat > update.sh << 'EOF'
#!/bin/bash
set -e
echo "=== IAA Digital Update ==="
echo "[1/5] Pull latest code..."
git pull origin main
echo "[2/5] Install dependencies..."
npm install
echo "[3/5] Generate Prisma..."
npx prisma generate
echo "[4/5] Push database..."
npx prisma db push
echo "[5/5] Build..."
npm run build
echo "✅ Update selesai! Restart Node.js App di cPanel."
EOF

chmod +x update.sh
```

Untuk update selanjutnya tinggal:
```bash
./update.sh
```

Lalu restart di cPanel → Setup Node.js App.

---

## Troubleshooting

### `git clone` gagal: "Permission denied"
```bash
# Coba dengan token
git clone https://habibmarzuqi:TOKEN@github.com/habibmarzuqi/iaa.git .
```

### `npm install` gagal: "Out of memory"
```bash
# Batasi memory Node.js
export NODE_OPTIONS="--max-old-space-size=512"
npm install
```

### `npx prisma db push` gagal: "Database connection failed"
```bash
# Cek .env
cat .env
# Pastikan DATABASE_URL benar:
# mysql://USER:PASSWORD@localhost:3306/DATABASE
# User & database dengan prefix cPanel (misal: monas_iaa_user)
```

### Build gagal: "Out of memory"
```bash
export NODE_OPTIONS="--max-old-space-size=512"
npm run build
```

### `npx tsx` tidak ditemukan
```bash
npm install -g tsx
# Atau gunakan:
npx tsx scripts/seed.ts
```

### Website 500 error setelah deploy
1. cPanel → Setup Node.js App → cek **Passenger log**
2. Pastikan `.env` ada dan `DATABASE_URL` benar
3. Pastikan `npm run build` berhasil
4. Pastikan `app.js` ada di root
5. Restart Node.js App

### Upload file tidak tersimpan
```bash
chmod -R 755 public/uploads/
# Pastikan folder ada
ls -la public/uploads/
```
