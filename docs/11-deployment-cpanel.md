# 11 — Deployment ke cPanel (Shared Hosting)

Tutorial lengkap deploy IAA Digital ke cPanel shared hosting dengan domain `iaa.monas.web.id`.

---

## Prasyarat

- Akun cPanel dengan akses ke `iaa.monas.web.id`
- cPanel mendukung **Node.js** (cek menu "Setup Node.js App" di cPanel)
- MySQL database tersedia (biasanya sudah include di cPanel)
- Akses **File Manager** atau **FTP**

> ⚠️ **Cek dulu:** Login ke cPanel → cari menu **"Setup Node.js App"** atau **"Node.js"**
> di section Software. Jika tidak ada, hosting Anda tidak support Node.js.
> Hubungi provider hosting untuk enable Node.js, atau pindah ke VPS.

---

## Langkah 1: Build di Komputer Lokal

cPanel shared hosting biasanya tidak punya resource untuk build Next.js. Build di lokal dulu:

```bash
cd /home/z/my-project

# Berikan permission eksekusi
chmod +x build-cpanel.sh

# Jalankan build script
./build-cpanel.sh
```

Script akan:
1. Copy source code ke folder `iaa-cpanel-deploy/`
2. Switch Prisma ke MySQL
3. Install dependencies
4. Build Next.js production
5. Cleanup file yang tidak diperlukan
6. Buat `.htaccess`, `app.js`, `.env.example`, `README-DEPLOY.txt`

Hasil: folder `iaa-cpanel-deploy/` siap upload.

---

## Langkah 2: Compress Folder

```bash
cd /home/z/my-project

# Compress ke zip (untuk cPanel File Manager)
cd iaa-cpanel-deploy
zip -r ../iaa-cpanel-deploy.zip .
cd ..

# Atau tar.gz
tar -czf iaa-cpanel-deploy.tar.gz -C iaa-cpanel-deploy .
```

---

## Langkah 3: Setup MySQL Database di cPanel

1. Login ke **cPanel** (`https://iaa.monas.web.id/cpanel` atau `https://iaa.monas.web.id:2083`)
2. Cari menu **MySQL Databases** (section Databases)
3. **Create New Database:**
   - New Database: `iaa_digital`
   - Klik **Create Database**
4. **Create New User:**
   - Username: `iaa_user` (cPanel akan tambahkan prefix, misal: `monas_iaa_user`)
   - Password: buat password kuat (catat ini!)
   - Klik **Create User**
5. **Add User to Database:**
   - Pilih user + database
   - Klik **Add**
   - Centang **ALL PRIVILEGES**
   - Klik **Make Changes**

### Catat koneksi database:
```
Database Name: monas_iaa_digital    (cPanel biasanya tambahkan prefix)
Username:      monas_iaa_user
Password:      password_yang_anda_buat
Host:          localhost
```

---

## Langkah 4: Upload File ke cPanel

### Via cPanel File Manager:

1. Login cPanel → **File Manager**
2. Navigasi ke folder root domain `iaa.monas.web.id`:
   - Biasanya: `public_html/iaa.monas.web.id/` atau `public_html/`
   - Atau: `iaa.monas.web.id/` (tergantung setup domain)
3. Upload `iaa-cpanel-deploy.zip`
4. **Extract** zip file ke folder root domain
5. Pastikan struktur file seperti ini:
   ```
   public_html/iaa.monas.web.id/
   ├── .next/              (folder build Next.js)
   ├── public/             (static files)
   ├── prisma/             (database schema)
   ├── scripts/            (seed scripts)
   ├── app.js              (entry point untuk cPanel)
   ├── .htaccess           (config Apache)
   ├── package.json
   ├── next.config.ts
   ├── .env.example
   └── README-DEPLOY.txt
   ```

### Via FTP (jika file besar):

```bash
# Install FileZilla atau gunakan command line
ftp iaa.monas.web.id
# Username: cpanel username
# Password: cpanel password

# Upload semua isi folder iaa-cpanel-deploy/ ke root domain
```

---

## Langkah 5: Buat File .env

1. Di cPanel File Manager, buka root domain `iaa.monas.web.id`
2. Copy `.env.example` → rename ke `.env`
3. Edit `.env`:

```
# Ganti dengan kredensial MySQL dari cPanel (Langkah 3)
DATABASE_URL="mysql://monas_iaa_user:password_anda@localhost:3306/monas_iaa_digital"

NODE_ENV="production"
NEXTAUTH_SECRET="random_32_char_string"
CRON_SECRET="random_string"
NEXT_PUBLIC_SITE_URL="https://iaa.monas.web.id"
```

> ⚠️ **Penting:** 
> - Username & database name cPanel biasanya punya prefix (misal `monas_`)
> - Host: `localhost` (bukan IP)
> - Generate NEXTAUTH_SECRET: gunakan https://generate-random.org/api/randoms

---

## Langkah 6: Setup Node.js App di cPanel

1. cPanel → **Software** → **Setup Node.js App**
2. Klik **Create Application**
3. Isi form:

| Field | Value |
|-------|-------|
| **Node.js version** | 20.x (atau 18.x minimum) |
| **Application mode** | Production |
| **Application root** | `iaa.monas.web.id` (atau path ke folder root domain) |
| **Application URL** | `iaa.monas.web.id` |
| **Application startup file** | `app.js` |
| **Passenger log file** | `logs/app.log` (opsional) |

4. Klik **Create**

---

## Langkah 7: Install Dependencies di cPanel

Di halaman **Setup Node.js App**:

1. Scroll ke section **"NPM Install"** atau **"Run NPM Install"**
2. Klik **Run NPM Install**
3. Tunggu sampai selesai (1-3 menit)

> Jika tidak ada tombol NPM Install, buka **Terminal** di cPanel:
> ```bash
> cd /home/username/iaa.monas.web.id
> npm install --production
> ```

---

## Langkah 8: Push Database Schema

### Opsi A: Via cPanel Terminal (jika tersedia)

1. cPanel → **Terminal** (atau **Advanced** → **Terminal**)
2. Jalankan:
```bash
cd /home/username/iaa.monas.web.id
npx prisma generate
npx prisma db push
```

### Opsi B: Via SSH (jika SSH di-enable)

```bash
ssh username@iaa.monas.web.id
cd /home/username/iaa.monas.web.id
npx prisma generate
npx prisma db push
```

### Opsi C: Via phpMyAdmin (manual)

Jika Terminal/SSH tidak tersedia:
1. Import schema manual via phpMyAdmin
2. Generate SQL dari Prisma:
   ```bash
   # Di komputer lokal (dengan MySQL yang sama)
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema.sql
   ```
3. Upload `schema.sql` ke phpMyAdmin → Import

---

## Langkah 9: Seed Database

Via cPanel Terminal atau SSH:

```bash
cd /home/username/iaa.monas.web.id
npx tsx scripts/seed.ts
npx tsx scripts/seed-archives.ts
npx tsx scripts/seed-phase3.ts
```

> Jika `tsx` tidak tersedia, install dulu:
> ```bash
> npm install -g tsx
> ```

---

## Langkah 10: Restart Node.js App

1. cPanel → **Setup Node.js App**
2. Klik **Restart** pada aplikasi IAA Digital
3. Tunggu 10-30 detik

---

## Langkah 11: Setup SSL (HTTPS)

1. cPanel → **SSL/TLS** → **Manage SSL sites**
2. Pilih domain `iaa.monas.web.id`
3. Jika ada **AutoSSL** (Let's Encrypt via cPanel):
   - Klik **Run AutoSSL**
   - Tunggu sampai selesai
4. Atau cari menu **Let's Encrypt SSL** (jika tersedia)
5. Enable **Force HTTPS Redirect**

---

## Langkah 12: Setup Cron Job (Opsional)

Untuk auto-publish artikel yang dijadwalkan:

1. cPanel → **Cron Jobs**
2. Add New Cron Job:
   - **Common Settings**: `*/15 * * * *` (setiap 15 menit)
   - **Command**:
     ```bash
     curl -s "https://iaa.monas.web.id/api/cron/publish-scheduled?token=YOUR_CRON_SECRET" > /dev/null 2>&1
     ```
3. Klik **Add New Cron Job**

Ganti `YOUR_CRON_SECRET` dengan nilai dari `.env` file.

---

## Verifikasi

1. Buka **https://iaa.monas.web.id** di browser
2. Pastikan landing page tampil dengan benar
3. Login:
   - Email: `superadmin@iaa-anri.go.id`
   - Password: `iaa12345`
4. Cek admin dashboard
5. Test upload file
6. Cek dark mode & language switcher

---

## Troubleshooting cPanel

### Error: "Application is not running"

**Solusi:**
1. CPanel → Setup Node.js App → **Restart**
2. Cek **Passenger log file** untuk error detail
3. Pastikan `app.js` ada di root domain
4. Pastikan `.env` file ada dan `DATABASE_URL` benar

### Error: "Cannot find module 'next'"

**Solusi:**
1. Pastikan `npm install` sudah dijalankan
2. CPanel → Setup Node.js App → **Run NPM Install**
3. Jika tetap gagal, hapus `node_modules` dan `package-lock.json`, lalu install ulang

### Error: "Database connection failed"

**Solusi:**
1. Cek `DATABASE_URL` di `.env`:
   - Host harus `localhost` (bukan IP)
   - Username & database name dengan prefix cPanel (misal `monas_`)
   - Password benar
2. Test koneksi via cPanel → phpMyAdmin
3. Pastikan user sudah di-add ke database dengan ALL PRIVILEGES

### Error: "500 Internal Server Error"

**Solusi:**
1. Cek Passenger log: cPanel → Setup Node.js App → lihat log
2. Pastikan Node.js version 18+ (20 disarankan)
3. Pastikan `npm run build` sudah dijalankan di lokal (folder `.next/` harus ada)
4. Cek `.env` file ada dan formatnya benar

### Error: "Permission denied" pada uploads

**Solusi:**
1. cPanel File Manager → klik kanan folder `public/uploads`
2. **Change Permissions** → 755
3. Apply recursively

### Error: "File upload tidak tersimpan"

**Solusi:**
- cPanel shared hosting mungkin punya limit storage
- Cek quota: cPanel → Disk Usage
- Pastikan folder `public/uploads/` ada dan writable (permission 755)

### Error: "Prisma Client not found"

**Solusi:**
```bash
cd /home/username/iaa.monas.web.id
npx prisma generate
```
Lalu restart Node.js App.

### Error: "Port 3000 already in use"

**Solusi:**
- Di cPanel Setup Node.js App, ubah Application startup file ke `app.js`
- cPanel/Passenger akan otomatis assign port
- Jika tetap bermasalah, hubungi hosting provider

---

## Update Aplikasi di cPanel

Setiap kali ada update kode:

### Langkah 1: Build ulang di lokal
```bash
cd /home/z/my-project
./build-cpanel.sh
```

### Langkah 2: Upload file yang berubah
- Upload folder `.next/` (hasil build baru)
- Upload file yang berubah (package.json, prisma/, src/, dll)
- **Jangan overwrite** `.env` dan `public/uploads/`

### Langkah 3: Jika ada perubahan database
```bash
# Via cPanel Terminal
cd /home/username/iaa.monas.web.id
npx prisma generate
npx prisma db push
```

### Langkah 4: Restart
cPanel → Setup Node.js App → **Restart**

---

## Limitasi cPanel Shared Hosting

| Aspek | Limit | Solusi |
|-------|-------|--------|
| **RAM** | 512MB - 1GB | Optimasi query, batasi hasil |
| **CPU** | Shared | Hindari proses berat |
| **Storage** | 1-10 GB | Hapus file lama, gunakan Cloudinary |
| **Node.js Process** | 1 app | Cukup untuk 1 IAA Digital |
| **Build** | Tidak bisa | Build di lokal, upload hasil |
| **SSH** | Terbatas/tidak ada | Gunakan cPanel Terminal/File Manager |
| **Cron Jobs** | Tersedia | Via cPanel → Cron Jobs |
| **SSL** | AutoSSL (Let's Encrypt) | Gratis, auto-renewal |

---

## Checklist Deploy cPanel

- [ ] cPanel support Node.js (cek "Setup Node.js App")
- [ ] Build script dijalankan di lokal (`./build-cpanel.sh`)
- [ ] File hasil build di-upload ke root domain
- [ ] MySQL database dibuat di cPanel
- [ ] MySQL user dibuat + ALL PRIVILEGES
- [ ] `.env` file dibuat dengan kredensial yang benar
- [ ] Node.js App di-setup di cPanel (app.js sebagai startup)
- [ ] NPM Install dijalankan
- [ ] `npx prisma generate` dijalankan
- [ ] `npx prisma db push` dijalankan
- [ ] Seeder dijalankan (seed.ts, seed-archives.ts, seed-phase3.ts)
- [ ] Node.js App di-restart
- [ ] SSL di-enable (AutoSSL)
- [ ] Cron job di-setup (opsional)
- [ ] Test login berfungsi
- [ ] Test upload file berfungsi
- [ ] Test dark mode & language switcher
