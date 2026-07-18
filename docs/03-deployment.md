# 03 — Deployment ke Hosting dengan MySQL

## Prasyarat

### Yang dibutuhkan di server/hosting:
1. **Node.js 18+** (disarankan 20 LTS)
2. **MySQL 8+** (atau MariaDB 10.6+)
3. **npm / bun** (package manager)
4. **Akses SSH** (disarankan) atau akses File Manager + Terminal
5. **Domain + SSL** (opsional tapi disarankan)

### Yang dibutuhkan di komputer lokal:
1. Kode proyek IAA Digital
2. Node.js 18+ / bun
3. MySQL client (opsional, untuk test koneksi)

---

## Langkah 1: Persiapan Database MySQL

### 1.1 Buat Database di MySQL

Login ke MySQL server Anda:

```bash
mysql -u root -p
```

Buat database dan user:

```sql
CREATE DATABASE iaa_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'iaa_user'@'localhost' IDENTIFIED BY 'password_kuat_anda';
GRANT ALL PRIVILEGES ON iaa_digital.* TO 'iaa_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1.2 Catat Koneksi Database

```
Host: localhost (atau IP server MySQL)
Port: 3306
Database: iaa_digital
Username: iaa_user
Password: password_kuat_anda
```

---

## Langkah 2: Konfigurasi Environment

### 2.1 Ubah Prisma Schema ke MySQL

Edit file `prisma/schema.prisma`, ubah datasource:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

> **Catatan:** Default proyek menggunakan SQLite untuk development.
> Untuk production, ganti provider dari `sqlite` ke `mysql`.

### 2.2 Buat file `.env` untuk production

Buat file `.env` di root proyek:

```env
# Database
DATABASE_URL="mysql://iaa_user:password_kuat_anda@localhost:3306/iaa_digital"

# Application
NODE_ENV=production
NEXTAUTH_SECRET="generate_random_string_disini"
CRON_SECRET="generate_random_cron_secret"

# Site URL (sesuaikan dengan domain Anda)
NEXT_PUBLIC_SITE_URL="https://iaa-anri.go.id"

# Email (opsional, untuk notifikasi email)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="email@anda.com"
SMTP_PASS="password_email"
```

### 2.3 Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy hasilnya ke `NEXTAUTH_SECRET` di `.env`.

---

## Langkah 3: Build Aplikasi

### 3.1 Install Dependencies

```bash
# Dengan npm
npm install

# Atau dengan bun (lebih cepat)
bun install
```

### 3.2 Generate Prisma Client

```bash
npx prisma generate
```

### 3.3 Push Schema ke MySQL

```bash
npx prisma db push
```

Ini akan membuat semua tabel di database MySQL berdasarkan `prisma/schema.prisst`.

### 3.4 Jalankan Seeder

```bash
# Seed data dasar (users, articles, events, dll)
node scripts/seed.js

# Seed data arsip
node scripts/seed-archives.js

# Seed data phase 3 (notifications, announcements, backups)
node scripts/seed-phase3.js
```

### 3.5 Build Production

```bash
npm run build
```

> **Catatan:** Jika menggunakan Next.js standalone output, tambahkan di `next.config.ts`:
> ```js
> output: 'standalone'
> ```

---

## Langkah 4: Upload ke Server

### Opsi A: Upload via SSH (Disarankan)

#### 4A.1 Copy proyek ke server

```bash
# Dari komputer lokal
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude 'db' \
  ./ user@server_ip:/var/www/iaa-digital/
```

#### 4A.2 Install dependencies di server

```bash
ssh user@server_ip
cd /var/www/iaa-digital
npm install --production
```

#### 4A.3 Build di server

```bash
npm run build
```

#### 4A.4 Jalankan migrasi database

```bash
npx prisma generate
npx prisma db push
node scripts/seed.js
```

### Opsi B: Upload via cPanel / File Manager

1. **Compress proyek** (tanpa `node_modules`, `.next`, `db/`):
   ```bash
   tar --exclude='node_modules' --exclude='.next' --exclude='db' \
       -czf iaa-digital.tar.gz .
   ```

2. **Upload** `iaa-digital.tar.gz` via cPanel File Manager ke `public_html/` atau direktori yang diinginkan

3. **Extract** archive di server

4. **Buka Terminal** (jika tersedia di cPanel) atau gunakan SSH:
   ```bash
   cd /var/www/iaa-digital
   npm install --production
   npm run build
   npx prisma generate
   npx prisma db push
   node scripts/seed.js
   ```

---

## Langkah 5: Jalankan Aplikasi

### 5.1 Menggunakan PM2 (Disarankan untuk VPS)

```bash
# Install PM2 global
npm install -g pm2

# Jalankan aplikasi
pm2 start npm --name "iaa-digital" -- start

# Atau dengan custom command
pm2 start "npx next start -p 3000" --name "iaa-digital"

# Save PM2 config
pm2 save
pm2 startup
```

### 5.2 Menggunakan systemd (Linux)

Buat file `/etc/systemd/system/iaa-digital.service`:

```ini
[Unit]
Description=IAA Digital Platform
After=network.target mysql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/iaa-digital
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Aktifkan:

```bash
sudo systemctl daemon-reload
sudo systemctl enable iaa-digital
sudo systemctl start iaa-digital
sudo systemctl status iaa-digital
```

### 5.3 Cek Aplikasi

```bash
curl http://localhost:3000
```

Harus return HTML (status 200).

---

## Langkah 6: Konfigurasi Nginx (Reverse Proxy)

Buat file `/etc/nginx/sites-available/iaa-digital`:

```nginx
server {
    listen 80;
    server_name iaa-anri.go.id www.iaa-anri.go.id;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name iaa-anri.go.id www.iaa-anri.go.id;

    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/iaa-anri.go.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iaa-anri.go.id/privkey.pem;

    # Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /var/www/iaa-digital/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # File upload size limit
    client_max_body_size 50M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/iaa-digital /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Langkah 7: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d iaa-anri.go.id -d www.iaa-anri.go.id
```

---

## Langkah 8: Setup Cron Job

Untuk auto-publish artikel yang dijadwalkan dan backup otomatis:

```bash
# Edit crontab
crontab -e
```

Tambahkan:

```cron
# Auto-publish scheduled articles setiap 15 menit
*/15 * * * * curl -s "http://localhost:3000/api/cron/publish-scheduled?token=YOUR_CRON_SECRET" > /dev/null 2>&1

# Backup database harian jam 3 pagi
0 3 * * * cd /var/www/iaa-digital && node scripts/backup-daily.js > /dev/null 2>&1
```

---

## Langkah 9: Setup Upload Directory Permissions

```bash
mkdir -p /var/www/iaa-digital/public/uploads/branding
mkdir -p /var/www/iaa-digital/public/uploads/archives
mkdir -p /var/www/iaa-digital/public/uploads/gallery

chown -R www-data:www-data /var/www/iaa-digital/public/uploads/
chmod -R 755 /var/www/iaa-digital/public/uploads/
```

---

## Verifikasi Deployment

1. Buka `https://iaa-anri.go.id` di browser
2. Pastikan landing page tampil dengan benar
3. Coba login dengan demo credentials:
   - Email: `superadmin@iaa-anri.go.id`
   - Password: `iaa12345`
4. Cek admin dashboard
5. Test upload file (gambar ke media library)
6. Test buat artikel baru
7. Cek dark mode toggle
8. Cek language switcher (ID/EN)

---

## Troubleshooting

### Database connection error
```
Error: Can't reach database server
```
**Solusi:** Cek `DATABASE_URL` di `.env`, pastikan MySQL berjalan:
```bash
sudo systemctl status mysql
```

### Port 3000 sudah digunakan
```bash
# Cek apa yang menggunakan port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
# Atau gunakan port lain
npx next start -p 3001
```

### Permission denied pada uploads
```bash
chown -R www-data:www-data /var/www/iaa-digital/public/uploads/
chmod -R 755 /var/www/iaa-digital/public/uploads/
```

### Prisma client not found
```bash
npx prisma generate
```

### Build error
```bash
# Hapus cache
rm -rf .next
npm run build
```
