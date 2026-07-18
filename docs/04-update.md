# 04 — Update Aplikasi yang Sudah Di-Deploy

Panduan untuk mengupdate aplikasi IAA Digital yang sudah berjalan di server production.

---

## Skenario Update

Ada 2 skenario update:
1. **Update kode saja** — Perubahan UI, bug fix, fitur baru tanpa perubahan database
2. **Update kode + database** — Perubahan schema database (tambah tabel, kolom, dll)

---

## Skenario 1: Update Kode Saja (Tanpa Database Change)

### Langkah 1: Backup Data Saat Ini

```bash
# Masuk ke direktori proyek
cd /var/www/iaa-digital

# Backup database
mysqldump -u iaa_user -p iaa_digital > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz public/uploads/

# Backup .env
cp .env .env.backup
```

### Langkah 2: Stop Aplikasi

```bash
# Jika menggunakan PM2
pm2 stop iaa-digital

# Jika menggunakan systemd
sudo systemctl stop iaa-digital
```

### Langkah 3: Upload Kode Baru

#### Opsi A: Via Git (disarankan)

```bash
cd /var/www/iaa-digital

# Simpan perubahan lokal
git stash

# Pull kode terbaru
git pull origin main

# Restore perubahan lokal (jika ada)
git stash pop
```

#### Opsi B: Upload manual

```bash
# Dari komputer lokal, compress kode baru (tanpa node_modules, .next, db)
tar --exclude='node_modules' --exclude='.next' --exclude='db' --exclude='.env' \
    -czf iaa-digital-update.tar.gz .

# Upload ke server
scp iaa-digital-update.tar.gz user@server_ip:/var/www/iaa-digital/

# Di server, extract
cd /var/www/iaa-digital
tar -xzf iaa-digital-update.tar.gz
rm iaa-digital-update.tar.gz
```

### Langkah 4: Install Dependencies Baru

```bash
cd /var/www/iaa-digital
npm install --production
```

### Langkah 5: Build Ulang

```bash
npm run build
```

### Langkah 6: Start Aplikasi

```bash
# PM2
pm2 start iaa-digital

# systemd
sudo systemctl start iaa-digital
```

### Langkah 7: Verifikasi

```bash
# Cek aplikasi berjalan
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Harus return 200

# Cek log error
pm2 logs iaa-digital --lines 20
# atau
journalctl -u iaa-digital --since "5 min ago"
```

---

## Skenario 2: Update Kode + Database Migration

### Langkah 1-3: Sama dengan Skenario 1

(Lihat langkah backup, stop, upload di atas)

### Langkah 4: Install Dependencies

```bash
npm install --production
```

### Langkah 5: Generate Prisma Client Baru

```bash
npx prisma generate
```

### Langkah 6: Push Schema Database

```bash
# Push schema changes ke MySQL (aman, tidak menghapus data existing)
npx prisma db push
```

> **Penting:** `prisma db push` akan menambahkan tabel/kolom baru tanpa menghapus data.
> Jika ada perubahan yang breaking (hapus kolom, ubah tipe), gunakan `prisma migrate` instead.

#### Jika perlu migrasi dengan data preservation:

```bash
# Buat migration
npx prisma migrate dev --name update_schema_v2

# Apply ke production
npx prisma migrate deploy
```

### Langkah 7: Jalankan Seeder Baru (jika ada)

```bash
# Hanya jalankan seeder untuk data BARU (jangan re-run seeder lama)
node scripts/seed-new-features.js
```

> **Peringatan:** Jangan jalankan `seed.js` lagi jika database sudah punya data,
> karena akan membuat duplikat. Gunakan seeder khusus untuk fitur baru.

### Langkah 8: Build & Start

```bash
npm run build

# PM2
pm2 restart iaa-digital

# systemd
sudo systemctl start iaa-digital
```

### Langkah 9: Verifikasi Database

```bash
# Cek tabel baru
mysql -u iaa_user -p iaa_digital -e "SHOW TABLES;"

# Cek data tidak hilang
mysql -u iaa_user -p iaa_digital -e "SELECT COUNT(*) FROM User;"
mysql -u iaa_user -p iaa_digital -e "SELECT COUNT(*) FROM Article;"
```

---

## Rollback (Jika Update Gagal)

### Langkah 1: Stop Aplikasi

```bash
pm2 stop iaa-digital
```

### Langkah 2: Restore Kode Lama

```bash
# Via Git
git checkout HEAD~1

# Atau restore dari backup
tar -xzf code_backup.tar.gz
```

### Langkah 3: Restore Database (jika perlu)

```bash
mysql -u iaa_user -p iaa_digital < backup_YYYYMMDD_HHMMSS.sql
```

### Langkah 4: Rebuild & Start

```bash
npm install --production
npx prisma generate
npm run build
pm2 start iaa-digital
```

---

## Checklist Update

Sebelum update:
- [ ] Backup database (`mysqldump`)
- [ ] Backup folder `public/uploads/`
- [ ] Backup file `.env`
- [ ] Catat versi aplikasi saat ini
- [ ] Baca changelog/release notes kode baru

Saat update:
- [ ] Stop aplikasi
- [ ] Upload kode baru
- [ ] Install dependencies
- [ ] Generate Prisma client
- [ ] Push database schema (jika ada perubahan)
- [ ] Build production
- [ ] Start aplikasi

Setelah update:
- [ ] Cek homepage (200 OK)
- [ ] Cek login berfungsi
- [ ] Cek admin dashboard
- [ ] Cek file upload berfungsi
- [ ] Cek dark mode toggle
- [ ] Cek log untuk error
- [ ] Hapus file backup sementara

---

## Update Otomatis via Script

Buat file `update.sh` di server:

```bash
#!/bin/bash
set -e

APP_DIR="/var/www/iaa-digital"
BACKUP_DIR="/var/backups/iaa-digital"

echo "=== IAA Digital Update Script ==="

# 1. Backup
echo "[1/7] Backing up database..."
mkdir -p $BACKUP_DIR
mysqldump -u iaa_user -pPASSWORD iaa_digital > $BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql

echo "[2/7] Backing up uploads..."
tar -czf $BACKUP_DIR/uploads_$(date +%Y%m%d).tar.gz -C $APP_DIR public/uploads/

# 2. Stop app
echo "[3/7] Stopping application..."
pm2 stop iaa-digital

# 3. Pull kode
echo "[4/7] Pulling latest code..."
cd $APP_DIR
git pull origin main

# 4. Install deps
echo "[5/7] Installing dependencies..."
npm install --production

# 5. Generate Prisma + push schema
echo "[6/7] Updating database..."
npx prisma generate
npx prisma db push

# 6. Build
echo "[7/7] Building..."
npm run build

# 7. Start
echo "Starting application..."
pm2 start iaa-digital

# 8. Verify
sleep 5
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$STATUS" = "200" ]; then
  echo "✅ Update berhasil! Aplikasi berjalan normal."
else
  echo "❌ Aplikasi tidak merespons (HTTP $STATUS). Cek log:"
  pm2 logs iaa-digital --lines 20
  echo "Untuk rollback: jalankan rollback.sh"
fi
```

Jalankan:
```bash
chmod +x update.sh
./update.sh
```
