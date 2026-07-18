# 08 — Server Requirements

Spesifikasi server minimum dan rekomendasi untuk menjalankan IAA Digital di production.

---

## 1. Skenario Deployment

IAA Digital bisa di-deploy di beberapa jenis server:

| Skenario | Cocok untuk | Estimasi Biaya/bulan |
|----------|-------------|---------------------|
| **VPS (Recommended)** | Production full control | Rp 150.000 - 500.000 |
| **Shared Hosting** | Budget terbatas (dengan catatan) | Rp 50.000 - 150.000 |
| **Cloud (Vercel/AWS/GCP)** | Auto-scaling, CDN built-in | $0 - $100+ |
| **Dedicated Server** | Trafik tinggi, data sensitif | Rp 1.000.000+ |

---

## 2. Spesifikasi Minimum vs Rekomendasi

### VPS / Dedicated Server

| Komponen | Minimum | Rekomendasi | Optimal |
|----------|---------|-------------|---------|
| **CPU** | 1 vCPU | 2 vCPU | 4+ vCPU |
| **RAM** | 1 GB | 2 GB | 4+ GB |
| **Storage** | 20 GB SSD | 40 GB SSD | 80+ GB NVMe |
| **Bandwidth** | 100 GB/bulan | 500 GB/bulan | 1 TB+ /bulan |
| **OS** | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

### Shared Hosting (cPanel)

| Komponen | Minimum | Catatan |
|----------|---------|---------|
| **RAM** | 512 MB | Perlu cek limit PHP/Node process |
| **Storage** | 5 GB | Untuk kode + uploads |
| **Node.js** | Tersedia | Beberapa shared hosting tidak support Node.js |
| **MySQL** | 5 database | Cukup untuk 1 database IAA |
| **Bandwidth** | 50 GB/bulan | Tergantung trafik |

> ⚠️ **Peringatan Shared Hosting:** Banyak shared hosting tidak mendukung Node.js
> long-running process. Pertimbangkan VPS jika memungkinkan.

### Cloud Platform

| Platform | Minimum Plan | Estimasi Biaya |
|----------|-------------|----------------|
| **Vercel** | Hobby (free) → Pro ($20/bln) | $0 - $20/bulan |
| **AWS EC2** | t3.micro (1 vCPU, 1 GB) | ~$8-15/bulan |
| **GCP Compute Engine** | e2-micro (0.25 vCPU, 1 GB) | ~$7-12/bulan |
| **DigitalOcean** | Basic Droplet ($6/bln) | $6-12/bulan |
| **Vultr** | Cloud Compute ($5/bln) | $5-10/bulan |

---

## 3. Software Requirements

### Operating System

| OS | Versi Minimum | Status |
|----|--------------|--------|
| Ubuntu | 20.04 LTS (Focal) | ✅ Recommended |
| Ubuntu | 22.04 LTS (Jammy) | ✅ Recommended |
| Ubuntu | 24.04 LTS (Noble) | ✅ Latest |
| Debian | 11 (Bullseye) | ✅ Supported |
| Debian | 12 (Bookworm) | ✅ Supported |
| CentOS / AlmaLinux | 8+ | ✅ Supported |
| Rocky Linux | 8+ | ✅ Supported |

> ❌ **Tidak direkomendasikan:** Windows Server (mungkin berjalan tapi tidak di-test)

### Runtime & Package Manager

| Software | Versi Minimum | Versi Rekomendasi | Install Command |
|----------|--------------|-------------------|-----------------|
| **Node.js** | 18.x LTS | 20.x LTS | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash -` |
| **npm** | 9.x | 10.x | (bundled with Node.js) |
| **bun** (opsional) | 1.x | 1.3+ | `curl -fsSL https://bun.sh/install \| bash` |
| **nvm** (opsional) | — | latest | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh \| bash` |

### Database Server

| Software | Versi Minimum | Versi Rekomendasi | Catatan |
|----------|--------------|-------------------|---------|
| **MySQL** | 8.0 | 8.0+ | Recommended untuk production |
| **MariaDB** | 10.6 | 10.11+ | Kompatibel dengan MySQL 8 |
| **PostgreSQL** | 14 | 16+ | Memerlukan ubah `provider` di Prisma schema |

> Development menggunakan **SQLite** (tidak perlu install database server).
> Untuk production, ganti ke MySQL/MariaDB. Lihat [Deployment](./03-deployment.md).

### Web Server / Reverse Proxy

| Software | Versi | Fungsi |
|----------|-------|--------|
| **Nginx** | 1.18+ | Reverse proxy, static file serving, SSL |
| **Apache** | 2.4+ | Alternatif (dengan mod_proxy) |

### Process Manager

| Software | Versi | Fungsi |
|----------|-------|--------|
| **PM2** | 5.x | Keep Node.js process alive, auto-restart, logs |
| **systemd** | — | Built-in Linux, alternatif PM2 |

### SSL Certificate

| Software | Fungsi |
|----------|--------|
| **Let's Encrypt (certbot)** | Free SSL certificate, auto-renewal |
| **Cloudflare** | Free SSL + CDN + DDoS protection |

---

## 4. Install Semua Dependency di Server

### Quick Install Script (Ubuntu 22.04/24.04)

```bash
#!/bin/bash
set -e

echo "=== Installing IAA Digital Server Dependencies ==="

# 1. Update system
echo "[1/6] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20 LTS
echo "[2/6] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Install MySQL 8
echo "[3/6] Installing MySQL 8..."
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 4. Install Nginx
echo "[4/6] Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 5. Install PM2
echo "[5/6] Installing PM2..."
sudo npm install -g pm2

# 6. Install Certbot (SSL)
echo "[6/6] Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Verify
echo ""
echo "=== Verification ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "MySQL: $(mysql --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "PM2: $(pm2 --version)"
echo "Certbot: $(certbot --version)"
echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Secure MySQL: sudo mysql_secure_installation"
echo "2. Create database: see docs/03-deployment.md"
echo "3. Upload IAA Digital code"
echo "4. Run: npm install && npm run build"
echo "5. Start: pm2 start 'npm run start' --name iaa-digital"
```

Simpan sebagai `install-server.sh` dan jalankan:
```bash
chmod +x install-server.sh
sudo ./install-server.sh
```

---

## 5. Konfigurasi Server

### 5.1 MySQL Security

```bash
sudo mysql_secure_installation
```

Ikuti prompt:
- Set root password
- Remove anonymous users → Y
- Disallow root login remotely → Y
- Remove test database → Y
- Reload privilege tables → Y

### 5.2 Firewall (UFW)

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

### 5.3 Swap Memory (jika RAM < 2GB)

```bash
# Buat 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

### 5.4 Node.js Memory Limit

Jika server RAM terbatas, batasi memory Node.js:

```bash
# Set memory limit to 1GB (untuk server 2GB RAM)
echo 'export NODE_OPTIONS="--max-old-space-size=1024"' >> ~/.bashrc
source ~/.bashrc
```

### 5.5 Nginx Optimization

Edit `/etc/nginx/nginx.conf`:

```nginx
# Worker processes = jumlah CPU cores
worker_processes auto;

# Max connections per worker
worker_connections 1024;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

# Client body size (untuk file upload)
client_max_body_size 50M;

# Buffer size
client_body_buffer_size 10K;
client_header_buffer_size 1k;
large_client_header_buffers 2 1k;
```

### 5.6 MySQL Optimization (my.cnf)

Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Connections
max_connections = 100

# Buffer pool (untuk InnoDB)
innodb_buffer_pool_size = 256M

# Log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Timeout
wait_timeout = 60
interactive_timeout = 120
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

---

## 6. Estimasi Resource Usage

### Per Komponen

| Komponen | RAM | CPU | Disk |
|----------|-----|-----|------|
| Node.js (Next.js) | 200-500 MB | 0.5-1 vCPU | 500 MB |
| MySQL | 200-400 MB | 0.2-0.5 vCPU | 1-10 GB |
| Nginx | 10-50 MB | 0.1 vCPU | 50 MB |
| PM2 | 20-50 MB | 0.05 vCPU | — |
| **Total** | **500 MB - 1 GB** | **1-2 vCPU** | **2-11 GB** |

### Storage Growth Estimasi

| Tipe Data | Estimasi | Per Tahun |
|-----------|----------|-----------|
| Database (MySQL) | 10-50 MB/bulan | 120-600 MB |
| Upload Arsip (PDF/DOC) | 50-200 MB/bulan | 600 MB - 2.4 GB |
| Upload Galeri (Foto) | 100-500 MB/bulan | 1.2 - 6 GB |
| Upload Media Library | 50-200 MB/bulan | 600 MB - 2.4 GB |
| Upload Branding | 1-10 MB (one-time) | — |
| Logs | 10-50 MB/bulan | 120-600 MB |
| Backup | 50-200 MB/bulan | 600 MB - 2.4 GB |
| **Total** | **220 MB - 960 MB/bulan** | **3-14 GB/tahun** |

> 💡 **Tips:** Gunakan SSD/NVMe untuk performance. HDD cukup untuk budget terbatas.

---

## 7. Bandwidth Estimasi

| Skenario | Pengunjung/bulan | Bandwidth/bulan |
|----------|------------------|-----------------|
| Kecil | < 1.000 | 5-10 GB |
| Sedang | 1.000 - 10.000 | 10-50 GB |
| Besar | 10.000 - 50.000 | 50-200 GB |
| Enterprise | 50.000+ | 200 GB+ |

> Gunakan CDN (Cloudflare free tier) untuk mengurangi bandwidth server.

---

## 8. Checklist Server Setup

Sebelum deploy IAA Digital, pastikan:

- [ ] OS: Ubuntu 22.04/24.04 LTS terinstall
- [ ] Node.js 20 LTS terinstall (`node --version`)
- [ ] npm 10+ terinstall (`npm --version`)
- [ ] MySQL 8 terinstall dan berjalan (`systemctl status mysql`)
- [ ] MySQL root password diset (`mysql_secure_installation`)
- [ ] Database `iaa_digital` dibuat
- [ ] User MySQL `iaa_user` dibuat dengan akses ke database
- [ ] Nginx terinstall dan berjalan (`systemctl status nginx`)
- [ ] PM2 terinstall global (`pm2 --version`)
- [ ] Certbot terinstall (untuk SSL)
- [ ] Firewall UFW aktif (port 22, 80, 443)
- [ ] Swap memory dikonfigurasi (jika RAM < 2GB)
- [ ] Directory `/var/www/iaa-digital/` dibuat
- [ ] Permission directory benar (`chown -R www-data:www-data`)
- [ ] `.env` file dibuat dengan DATABASE_URL yang benar
- [ ] Domain DNS sudah pointing ke IP server (A record)
- [ ] SSL certificate terinstall (Let's Encrypt)

---

## 9. Monitoring & Maintenance

### Commands Berguna

```bash
# Cek status aplikasi
pm2 status
pm2 logs iaa-digital --lines 50

# Cek resource usage
htop
df -h          # disk usage
free -h        # memory usage

# Cek MySQL
mysql -u iaa_user -p -e "SHOW STATUS LIKE 'Threads_connected';"
mysql -u iaa_user -p -e "SHOW VARIABLES LIKE 'max_connections';"

# Cek Nginx
sudo nginx -t
sudo systemctl status nginx

# Cek SSL expiry
sudo certbot certificates

# Manual backup database
mysqldump -u iaa_user -p iaa_digital > backup_$(date +%Y%m%d).sql

# PM2 auto-restart on reboot
pm2 startup
pm2 save
```

### Recommended Monitoring Tools

| Tool | Fungsi | Biaya |
|------|--------|-------|
| PM2 Monitoring | Process status, memory, CPU | Free |
| Uptime Robot | Website uptime alert | Free tier |
| Cloudflare | CDN + DDoS + analytics | Free tier |
| Logrotate | Auto-rotate log files | Built-in |
| GoAccess | Nginx log analyzer | Free |

### Logrotate Setup

Buat `/etc/logrotate.d/iaa-digital`:

```
/var/www/iaa-digital/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reload iaa-digital > /dev/null 2>&1
    endscript
}
```

---

## 10. Security Hardening

### SSH

Edit `/etc/ssh/sshd_config`:

```
# Disable root login
PermitRootLogin no

# Disable password auth (use SSH key only)
PasswordAuthentication no

# Change default port (opsional)
Port 2222
```

```bash
sudo systemctl restart sshd
```

### Fail2ban (Brute force protection)

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 11. Alternatif: Deploy dengan Docker

Jika menggunakan Docker, buat `Dockerfile`:

```dockerfile
FROM node:20-slim

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

# Build
RUN npx prisma generate
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

Dan `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://iaa_user:password@db:3306/iaa_digital
      - NODE_ENV=production
    depends_on:
      - db
    restart: always

  db:
    image: mysql:8
    environment:
      - MYSQL_DATABASE=iaa_digital
      - MYSQL_USER=iaa_user
      - MYSQL_PASSWORD=password
      - MYSQL_ROOT_PASSWORD=rootpassword
    volumes:
      - mysql_data:/var/lib/mysql
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./public/uploads:/app/public/uploads
    depends_on:
      - app
    restart: always

volumes:
  mysql_data:
```

Jalankan:
```bash
docker-compose up -d
docker-compose exec app npx prisma db push
docker-compose exec app node scripts/seed.js
```

---

## 12. Rekomendasi Provider VPS Indonesia

| Provider | Paket Minimum | Harga/bulan | Catatan |
|----------|--------------|-------------|---------|
| **DigitalOcean** | Basic Droplet 1GB | $6 (~Rp 95rb) | Singapura region |
| **Vultr** | Cloud Compute 1GB | $5 (~Rp 80rb) | Singapura region |
| **AWS Lightsail** | 1 GB RAM | $5 (~Rp 80rb) | Singapura region |
| **GCP** | e2-micro | $7 (~Rp 110rb) | Free tier tersedia |
| **IDCloudHost** | VPS 1GB | Rp 50rb | Data center Indonesia |
| **Niagahoster** | VPS Cloud 1 | Rp 100rb | Data center Indonesia |
| **Domainesia** | VPS 1GB | Rp 75rb | Data center Indonesia |
| **Exabytes ID** | VPS Linux 1GB | Rp 90rb | Data center Indonesia |

> 💡 **Tips:** Pilih data center terdekat dengan target pengguna (Indonesia → Singapura/ID).

---

## Ringkasan

| Aspek | Minimum | Rekomendasi |
|-------|---------|-------------|
| **Server** | VPS 1 vCPU, 1 GB RAM, 20 GB SSD | VPS 2 vCPU, 2 GB RAM, 40 GB SSD |
| **OS** | Ubuntu 20.04 LTS | Ubuntu 22.04/24.04 LTS |
| **Node.js** | 18 LTS | 20 LTS |
| **Database** | MySQL 8 / MariaDB 10.6 | MySQL 8 |
| **Web Server** | Nginx 1.18 | Nginx 1.24+ |
| **Process Manager** | PM2 5.x | PM2 5.x |
| **SSL** | Let's Encrypt | Let's Encrypt + Cloudflare |
| **Bandwidth** | 100 GB/bulan | 500 GB/bulan |
| **Storage Growth** | ~3 GB/tahun | ~14 GB/tahun |

> Lihat juga: [Deployment Guide](./03-deployment.md) untuk langkah-langkah instalasi lengkap.
