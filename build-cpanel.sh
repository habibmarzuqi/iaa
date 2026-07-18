#!/bin/bash
# ============================================
# IAA Digital - cPanel Build Script
# ============================================
# Jalankan di komputer lokal (bukan di server)
# Hasil: folder "iaa-cpanel-deploy/" siap upload ke cPanel
# 
# Cara pakai:
#   chmod +x build-cpanel.sh
#   ./build-cpanel.sh
# ============================================

set -e

echo ""
echo "============================================"
echo "   IAA Digital - cPanel Build Script"
echo "============================================"
echo ""

DEPLOY_DIR="iaa-cpanel-deploy"

# Hapus folder lama jika ada
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

echo "[1/7] Copy source code..."
# Copy file yang diperlukan (TANPA node_modules, .next, db, uploads, .env)
rsync -av --progress \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='db' \
  --exclude='public/uploads' \
  --exclude='.env' \
  --exclude='.git' \
  --exclude='agent-ctx' \
  --exclude='worklog.md' \
  --exclude='dev.log' \
  --exclude='.zscripts' \
  --exclude='iaa-cpanel-deploy' \
  --exclude='.z-ai-config' \
  --exclude='examples' \
  --exclude='mini-services' \
  --exclude='skills' \
  --exclude='upload' \
  --exclude='download' \
  ./ $DEPLOY_DIR/

echo "[2/7] Switch Prisma ke MySQL..."
cp prisma/schema-mysql.prisma $DEPLOY_DIR/prisma/schema.prisma

echo "[3/7] Install dependencies..."
cd $DEPLOY_DIR
npm install --production=false

echo "[4/7] Generate Prisma Client..."
npx prisma generate

echo "[5/7] Build Next.js..."
npm run build

echo "[6/7] Cleanup (hapus file yang tidak diperlukan di server)..."
# Hapus source yang tidak diperlukan (sudah di-build)
rm -rf node_modules
rm -rf .next/cache
rm -f tsconfig.json
rm -f eslint.config.mjs
rm -f postcss.config.mjs
rm -f tailwind.config.ts
rm -f components.json
rm -f Dockerfile
rm -f docker-compose.yml
rm -f deploy.sh
rm -f build-cpanel.sh
rm -f Caddyfile
rm -f prisma/schema-sqlite.prisma.backup
rm -f prisma/schema-mysql.prisma
rm -f .vercelignore
rm -f .gitignore

# Re-install production dependencies saja
npm install --production

# Buat folder uploads
mkdir -p public/uploads/branding
mkdir -p public/uploads/archives
mkdir -p public/uploads/gallery

# Buat .htaccess untuk cPanel
cat > .htaccess << 'HTACCESS'
# cPanel Node.js App Configuration
# Pastikan "Setup Node.js App" sudah dikonfigurasi di cPanel

# Redirect semua traffic ke Node.js app
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:3000/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/xml
</IfModule>

# Upload size limit
<IfModule mod_php.c>
  php_value upload_max_filesize 50M
  php_value post_max_size 50M
</IfModule>
HTACCESS

# Buat app.js untuk Phusion Passenger (cPanel Node.js)
cat > app.js << 'APPJS'
// IAA Digital - cPanel Entry Point
// This file is used by Phusion Passenger (cPanel Node.js App)

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
    console.log(`> IAA Digital ready on http://localhost:${port}`)
  })
})
APPJS

# Buat .env.example untuk panduan
cat > .env.example << 'ENVEXAMPLE'
# ============================================
# IAA Digital - Environment Variables
# ============================================
# Copy file ini ke .env dan edit nilainya
# cp .env.example .env

# Database MySQL (dari cPanel → MySQL Databases)
DATABASE_URL="mysql://IAA_USER:PASSWORD_ANDA@localhost:3306/iaa_digital"

# Application
NODE_ENV="production"
NEXTAUTH_SECRET="generate-dengan-openssl-rand-base64-32"
CRON_SECRET="generate-random-string"
NEXT_PUBLIC_SITE_URL="https://iaa.monas.web.id"
ENVEXAMPLE

# Buat readme
cat > README-DEPLOY.txt << 'README'
============================================
   IAA Digital - cPanel Deployment
============================================

LANGKAH DEPLOYMENT:

1. Upload semua isi folder ini ke root domain iaa.monas.web.id
   (via cPanel File Manager atau FTP)

2. Buat file .env:
   - Copy .env.example ke .env
   - Edit DATABASE_URL dengan kredensial MySQL dari cPanel

3. Setup MySQL Database di cPanel:
   - cPanel → MySQL Databases
   - Buat database: iaa_digital
   - Buat user: iaa_user (dengan password kuat)
   - Add user to database (ALL PRIVILEGES)

4. Setup Node.js App di cPanel:
   - cPanel → Software → Setup Node.js App
   - Node.js version: 20.x
   - Application mode: Production
   - Application root: / (root domain)
   - Application URL: iaa.monas.web.id
   - Application startup file: app.js
   - Klik "Create"

5. Install dependencies:
   - Di cPanel Node.js App, klik "Run NPM Install"

6. Push database schema:
   - Di cPanel Terminal (jika ada) atau via SSH:
     npx prisma db push
   
7. Seed database:
   npx tsx scripts/seed.ts
   npx tsx scripts/seed-archives.ts
   npx tsx scripts/seed-phase3.ts

8. Restart Node.js App di cPanel

9. Akses: https://iaa.monas.web.id

Demo login:
  Email: superadmin@iaa-anri.go.id
  Password: iaa12345
README

echo "[7/7] Build selesai!"
echo ""
echo "============================================"
echo "   ✅ Build siap untuk upload ke cPanel!"
echo ""
echo "   Folder: iaa-cpanel-deploy/"
echo ""
echo "   Langkah selanjutnya:"
echo "   1. Compress folder: tar -czf iaa-cpanel-deploy.tar.gz iaa-cpanel-deploy/"
echo "   2. Upload ke cPanel File Manager (root iaa.monas.web.id)"
echo "   3. Extract"
echo "   4. Ikuti README-DEPLOY.txt"
echo "============================================"
