#!/bin/bash
# ============================================
# IAA Digital - Deployment Script
# ============================================
# Untuk domain: iaa.monas.web.id
# 
# Cara pakai:
#   1. Upload seluruh proyek ke server
#   2. Edit .env dengan kredensial yang benar
#   3. Jalankan: chmod +x deploy.sh && ./deploy.sh
# ============================================

set -e

echo ""
echo "============================================"
echo "   IAA Digital - Deployment Script"
echo "   Domain: iaa.monas.web.id"
echo "============================================"
echo ""

# Warna
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Cek apakah .env ada
if [ ! -f .env ]; then
    echo -e "${RED}❌ File .env tidak ditemukan!${NC}"
    echo "Salin dari .env.example dan edit:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Cek DATABASE_URL
source .env
if echo "$DATABASE_URL" | grep -q "file:"; then
    echo -e "${YELLOW}⚠️  DATABASE_URL masih menggunakan SQLite.${NC}"
    echo "Untuk production, gunakan MySQL. Edit .env:"
    echo '  DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/iaa_digital"'
    echo ""
    read -p "Lanjutkan dengan SQLite? (y/N): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        exit 1
    fi
fi

echo -e "${GREEN}[1/8]${NC} Install dependencies..."
npm install --production=false

echo -e "${GREEN}[2/8]${NC} Generate Prisma Client..."
npx prisma generate

echo -e "${GREEN}[3/8]${NC} Push database schema..."
npx prisma db push

echo -e "${GREEN}[4/8]${NC} Cek apakah database sudah di-seed..."
if [ -f .seeded ]; then
    echo "      Database sudah di-seed sebelumnya, skip..."
else
    echo "      Seeding database..."
    npx tsx scripts/seed.ts 2>/dev/null || node -e "
        const { PrismaClient } = require('@prisma/client');
        console.log('Seed script memerlukan tsx. Install: npm install -g tsx');
    " && npx tsx scripts/seed.ts
    npx tsx scripts/seed-archives.ts 2>/dev/null || true
    npx tsx scripts/seed-phase3.ts 2>/dev/null || true
    touch .seeded
fi

echo -e "${GREEN}[5/8]${NC} Build production..."
npm run build

echo -e "${GREEN}[6/8]${NC} Buat direktori uploads..."
mkdir -p public/uploads/branding
mkdir -p public/uploads/archives
mkdir -p public/uploads/gallery
chmod -R 755 public/uploads/

echo -e "${GREEN}[7/8]${NC} Setup PM2 (process manager)..."
if ! command -v pm2 &> /dev/null; then
    echo "      Installing PM2..."
    npm install -g pm2
fi

# Stop app jika sudah running
pm2 delete iaa-digital 2>/dev/null || true

# Start app
pm2 start npm --name "iaa-digital" -- start
pm2 save

# Setup PM2 startup (auto-restart on reboot)
pm2 startup 2>/dev/null || true

echo -e "${GREEN}[8/8]${NC} Verifikasi..."
sleep 3

# Cek aplikasi
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo ""
    echo -e "${GREEN}✅ DEPLOYMENT BERHASIL!${NC}"
    echo ""
    echo "   Aplikasi berjalan di: http://localhost:3000"
    echo "   Domain:              https://iaa.monas.web.id"
    echo ""
    echo "   Demo login:"
    echo "     Email:    superadmin@iaa-anri.go.id"
    echo "     Password: iaa12345"
    echo ""
    echo "   Command berguna:"
    echo "     pm2 status          - Cek status aplikasi"
    echo "     pm2 logs iaa-digital - Lihat log"
    echo "     pm2 restart iaa-digital - Restart aplikasi"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Aplikasi belum merespons (HTTP $HTTP_STATUS)${NC}"
    echo ""
    echo "   Cek log:"
    echo "     pm2 logs iaa-digital --lines 30"
    echo ""
    echo "   Kemungkinan masalah:"
    echo "     1. Database belum bisa dikonek - cek DATABASE_URL di .env"
    echo "     2. Port 3000 digunakan app lain - ubah port"
    echo "     3. Build error - cek pm2 logs"
fi

echo ""
echo "============================================"
echo "   Next steps:"
echo "   1. Setup Nginx reverse proxy (lihat nginx.conf)"
echo "   2. Setup SSL dengan certbot"
echo "   3. Setup cron job untuk auto-publish"
echo "============================================"
