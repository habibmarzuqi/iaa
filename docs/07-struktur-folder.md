# 07 — Struktur Folder

```
iaa-digital/
├── docs/                           # 📚 Dokumentasi proyek
│   ├── README.md                   # Index dokumentasi
│   ├── 01-teknologi.md             # Tech stack & arsitektur
│   ├── 02-fitur.md                 # Daftar lengkap fitur
│   ├── 03-deployment.md            # Cara deploy ke hosting + MySQL
│   ├── 04-update.md                # Cara update aplikasi
│   ├── 05-panduan-admin.md         # Panduan untuk admin
│   ├── 06-api-reference.md         # Daftar API endpoints
│   └── 07-struktur-folder.md       # File ini
│
├── prisma/
│   └── schema.prisma               # Database schema (20 models)
│
├── public/
│   ├── uploads/                    # File upload storage
│   │   ├── branding/               # Logo, favicon, app icons
│   │   ├── archives/               # Dokumen arsip (PDF, DOC, dll)
│   │   └── gallery/                # Foto galeri (+ thumbnails)
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service Worker
│   ├── icon-192.svg                # PWA icon 192x192
│   ├── icon-512.svg                # PWA icon 512x512
│   ├── favicon.svg                 # Default favicon
│   ├── watermark.svg               # Watermark template
│   └── logo.svg                    # Default logo
│
├── scripts/                        # Script utilities
│   ├── seed.ts                     # Seed data dasar
│   ├── seed-archives.ts            # Seed data arsip
│   └── seed-phase3.ts              # Seed data notifikasi + backup
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (fonts, theme, PWA, DynamicHead)
│   │   ├── page.tsx                # Main page (view dispatcher)
│   │   ├── globals.css             # Global styles + IAA theme
│   │   └── api/                    # API Routes (42+ endpoints)
│   │       ├── auth/
│   │       │   ├── login/          # POST login, GET session
│   │       │   ├── logout/         # POST logout
│   │       │   └── google/         # OAuth simulation
│   │       ├── articles/           # CRUD berita + SEO + revision
│   │       ├── articles-revisions/ # Revision history
│   │       ├── events/             # CRUD agenda
│   │       ├── library/            # CRUD digital library
│   │       ├── gallery/            # CRUD album + upload + reorder
│   │       │   └── upload/         # Photo upload (sharp + watermark)
│   │       ├── organization/       # CRUD pengurus
│   │       ├── announcements/      # CRUD pengumuman
│   │       ├── archives/           # CRUD arsip + versioning
│   │       │   ├── upload/         # File upload arsip
│   │       │   └── pdf-preview/    # PDF thumbnail generator
│   │       ├── certificates/       # E-certificate + verification
│   │       ├── registrations/      # Event registration flow
│   │       ├── members/            # Member profile + certs + regs
│   │       ├── members-list/       # List all members (admin)
│   │       ├── dashboard/          # Admin dashboard stats
│   │       ├── notifications/      # Notification CRUD
│   │       ├── media/              # Media library + sharp variants
│   │       ├── settings/           # Site settings + branding upload
│   │       ├── menu/               # Menu management CRUD
│   │       ├── tags/               # Tag autocomplete
│   │       ├── search/             # Global search
│   │       ├── chat/               # AI chatbot (z-ai-web-dev-sdk)
│   │       ├── reports/            # Reports + CSV export
│   │       ├── backup/             # Backup + restore
│   │       ├── cron/               # Scheduled jobs
│   │       └── route.ts            # Health check
│   │
│   ├── components/                 # React components
│   │   ├── layout/
│   │   │   ├── header.tsx          # Dynamic header (menu, search, features)
│   │   │   ├── footer.tsx          # Dynamic footer (settings-based)
│   │   │   └── public-layout.tsx   # Public layout wrapper
│   │   ├── admin/
│   │   │   └── admin-shell.tsx     # Admin layout (sidebar + content)
│   │   ├── sections/               # Landing page sections
│   │   │   ├── hero-section.tsx
│   │   │   ├── about-section.tsx
│   │   │   ├── stats-section.tsx
│   │   │   ├── news-section.tsx
│   │   │   ├── events-section.tsx
│   │   │   ├── library-preview.tsx
│   │   │   ├── organization-preview.tsx
│   │   │   ├── faq-section.tsx
│   │   │   └── cta-section.tsx
│   │   ├── views/                  # Page views (dispatched by page.tsx)
│   │   │   ├── public-site.tsx     # Landing page
│   │   │   ├── login-page.tsx      # Login + OAuth buttons
│   │   │   ├── member-dashboard.tsx
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── admin-cms-view.tsx  # CMS (6 content types)
│   │   │   ├── admin-archives-view.tsx
│   │   │   ├── admin-certificates-view.tsx
│   │   │   ├── admin-events-view.tsx
│   │   │   ├── admin-reports-view.tsx
│   │   │   ├── admin-settings-view.tsx
│   │   │   ├── admin-site-settings-view.tsx
│   │   │   ├── admin-menu-view.tsx
│   │   │   ├── admin-files-view.tsx
│   │   │   ├── news-list-view.tsx
│   │   │   ├── news-detail-view.tsx
│   │   │   ├── event-list-view.tsx
│   │   │   ├── event-detail-view.tsx
│   │   │   ├── library-view.tsx
│   │   │   ├── gallery-view.tsx
│   │   │   ├── about-view.tsx
│   │   │   ├── organization-view.tsx
│   │   │   ├── contact-view.tsx
│   │   │   ├── faq-view.tsx
│   │   │   ├── verify-certificate-view.tsx
│   │   │   └── chat-view.tsx
│   │   ├── member/
│   │   │   └── membership-card.tsx # Digital membership card (QR)
│   │   ├── ui/                     # shadcn/ui components (50+)
│   │   ├── iaa-logo.tsx            # IAA logo SVG
│   │   ├── theme-toggle.tsx        # Dark/light mode toggle
│   │   ├── theme-provider.tsx      # next-themes wrapper
│   │   ├── language-switcher.tsx   # ID/EN dropdown
│   │   ├── notification-bell.tsx   # Notification dropdown
│   │   ├── search-dialog.tsx       # Global search modal
│   │   ├── announcement-banner.tsx # Banner + popup + running text
│   │   ├── pwa-install-prompt.tsx  # PWA install banner
│   │   ├── dynamic-head.tsx        # Dynamic favicon + meta tags
│   │   ├── rich-text-editor.tsx    # MDXEditor wrapper
│   │   ├── media-library-dialog.tsx
│   │   ├── revision-history-dialog.tsx
│   │   ├── sortable-photo-grid.tsx # dnd-kit photo grid
│   │   └── tag-input.tsx           # Tag autocomplete chip input
│   │
│   ├── lib/                        # Utilities & hooks
│   │   ├── db.ts                   # Prisma client
│   │   ├── store.ts                # Zustand store (auth + navigation)
│   │   ├── i18n.ts                 # i18n dictionary (300+ keys, ID/EN)
│   │   ├── use-site-settings.ts    # Site settings hook
│   │   ├── helpers.ts              # Date format, bytes format, dll
│   │   └── utils.ts                # cn() class merge
│   │
│   └── hooks/
│       ├── use-toast.ts            # Toast hook
│       └── use-mobile.ts           # Mobile detection
│
├── .env                            # Environment variables
├── package.json                    # Dependencies
├── next.config.ts                  # Next.js config
├── tailwind.config.ts              # Tailwind config
├── tsconfig.json                   # TypeScript config
├── eslint.config.mjs               # ESLint config
├── postcss.config.mjs              # PostCSS config
├── components.json                 # shadcn/ui config
├── Caddyfile                       # Caddy gateway config
└── README.md                       # Project readme
```

## Penjelasan Key Files

### `src/app/page.tsx`
**Main entry point** — dispatcher yang menentukan view mana yang dirender berdasarkan `view.name` dari Zustand store. Karena hanya route `/` yang diekspos, semua navigasi dilakukan via state (bukan URL routing).

### `src/lib/store.ts`
**Zustand store** untuk:
- `user` — Session user (null jika belum login)
- `view` — Current view name + params (misal: `{ name: 'news-detail', slug: 'xxx' }`)
- Persist: hanya `user` yang di-persist (tidak `view`, agar refresh kembali ke public)

### `src/app/api/`
**42+ API routes** — Setiap folder adalah endpoint terpisah. Semua menggunakan `runtime = 'nodejs'` dan Prisma client untuk database access.

### `prisma/schema.prisma`
**20 Prisma models**: User, Member, Article, Event, Registration, Certificate, LibraryItem, GalleryAlbum, GalleryPhoto, Announcement, OrganizationMember, Archive, ArchiveVersion, ArchiveAccess, ChatConversation, ChatMessage, Notification, OAuthAccount, BackupHistory, ArticleRevision, MediaAsset, SiteSetting, MenuConfig, AuditLog, ContactMessage.

### `src/app/globals.css`
**Global CSS** dengan:
- IAA color palette (Navy, Blue, Gold, Emerald, Orange, Red)
- Custom utility classes (bg-hero-gradient, glass-card, shadow-premium, dll)
- Dark mode via `.dark` class
- Custom animations (fade-in-up, float-slow, pulse-gold, shimmer)
- Custom scrollbar styling

### `public/sw.js`
**Service Worker** untuk PWA:
- Stale-while-revalidate untuk app shell
- Network-first untuk API routes
- Push notification handler
- Notification click handler
