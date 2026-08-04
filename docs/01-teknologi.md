# 01 — Teknologi & Arsitektur

## Tech Stack Utama

| Kategori | Teknologi | Versi | Keterangan |
|----------|-----------|-------|------------|
| **Framework** | Next.js | 16.x | App Router, Turbopack, React 19 |
| **Bahasa** | TypeScript | 5.x | Type-safe di seluruh codebase |
| **Styling** | Tailwind CSS | 4.x | Utility-first + custom IAA theme |
| **UI Components** | shadcn/ui | — | 50+ komponen (New York style) |
| **Icons** | Lucide React | 0.52x | 1000+ icon konsisten |
| **Database** | Prisma ORM | 6.x | SQLite (dev) / MySQL (production) |
| **State Management** | Zustand | 5.x | Auth, locale, site settings |
| **Server State** | TanStack Query | 5.x | Data fetching & caching |
| **Forms** | React Hook Form | 7.x | + Zod validation |
| **Charts** | Recharts | 2.x | Admin dashboard analytics |
| **Animation** | Framer Motion | 12.x | Page transitions, micro-interactions |
| **Rich Text** | MDX Editor | 3.x | WYSIWYG editor untuk konten |
| **Drag & Drop** | dnd-kit | 6.x | Photo reordering, sortable |
| **Image Processing** | Sharp | 0.34x | Thumbnail, watermark, resize |
| **PDF Processing** | pdfjs-dist + canvas | 6.x / 3.x | PDF preview thumbnail |
| **QR Code** | qrcode.react | 4.x | Membership card, e-certificate |
| **Auth** | Custom (cookie-based) | — | Session via httpOnly cookie |
| **i18n** | Custom Zustand store | — | ID/EN dengan 300+ translation keys |
| **PWA** | manifest.json + Service Worker | — | Offline cache, install prompt |
| **Email** | (konfigurasi SMTP) | — | Ready untuk Nodemailer/Resend |

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────┐
│                   BROWSER (Client)               │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  React 19  │  │ Tailwind │  │  Framer Motion│ │
│  │  (App      │  │  CSS 4   │  │  (animations) │ │
│  │  Router)   │  │          │  │              │ │
│  └─────┬─────┘  └──────────┘  └──────────────┘ │
│        │                                          │
│  ┌─────▼──────────────────────────────────────┐  │
│  │         Zustand Store (client state)       │  │
│  │  • Auth session  • Locale  • Site Settings │  │
│  └─────┬──────────────────────────────────────┘  │
│        │ fetch() / API calls                      │
└────────┼─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (Server)          │
│  ┌─────────┐ ┌─────────┐ ┌───────────────────┐  │
│  │  Auth   │ │ CMS     │ │  Archives         │  │
│  │  /api/  │ │ /api/   │ │  /api/archives    │  │
│  │  auth   │ │ articles│ │  + upload + PDF   │  │
│  └─────────┘ │ events  │ │  preview          │  │
│  ┌─────────┐ │ library │ └───────────────────┘  │
│  │ Search  │ │ gallery │ ┌───────────────────┐  │
│  │ /api/   │ │ org     │ │  Media + Sharp    │  │
│  │ search  │ │ menu    │ │  /api/media       │  │
│  └─────────┘ │ settings│ │  + watermark      │  │
│  ┌─────────┘ └─────────┘ └───────────────────┘  │
│  ┌─────────────────────────────────────────────┐ │
│  │  Other: chat (AI), backup, reports, cron    │ │
│  └─────────────────────────────────────────────┘ │
└────────┬────────────────────────────────────────┘
         │ Prisma Client
         ▼
┌─────────────────────────────────────────────────┐
│                   DATABASE                        │
│  ┌──────────┐    ┌──────────────────────────┐   │
│  │ SQLite   │    │  MySQL 8+ (production)   │   │
│  │ (dev)    │    │  Same Prisma schema      │   │
│  └──────────┘    └──────────────────────────┘   │
│                                                   │
│  20 Models: User, Member, Article, Event,         │
│  Registration, Certificate, LibraryItem,           │
│  GalleryAlbum/Photo, Announcement,                 │
│  OrganizationMember, Archive/Version/Access,       │
│  Notification, OAuthAccount, BackupHistory,        │
│  ChatConversation/Message, ArticleRevision,        │
│  MediaAsset, SiteSetting, MenuConfig,              │
│  AuditLog, ContactMessage                         │
└───────────────────────────────────────────────────┘
```

## File Storage

```
public/
├── uploads/
│   ├── branding/      → Logo, favicon, app icons (from Site Settings)
│   ├── archives/      → Dokumen arsip (PDF, DOC, dll)
│   ├── gallery/       → Foto galeri (+ auto thumbnail webp)
│   └── [media files]  → Media library umum (+ thumb/medium/large variants)
├── manifest.json      → PWA manifest
├── sw.js              → Service Worker (offline cache)
├── icon-192.svg       → Default PWA icon
├── icon-512.svg       → Default PWA icon
└── favicon.svg        → Default favicon
```

## Theme & Design System

### Color Palette

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--iaa-navy` | `#0a1e3f` | Primary (header, footer, buttons) |
| `--iaa-navy-deep` | `#061229` | Hero background, footer |
| `--iaa-blue` | `#1d4ed8` | Links, secondary accents |
| `--iaa-gold` | `#c9a227` | Accent (highlights, badges, CTA) |
| `--iaa-emerald` | `#059669` | Success states |
| `--iaa-orange` | `#ea580c` | Warning states |
| `--iaa-red` | `#dc2626` | Error/destructive states |

### Typography
- **Headings**: Plus Jakarta Sans (500-800)
- **Body**: Inter (regular)
- **Mono**: Geist Mono

### Custom CSS Classes
- `.bg-hero-gradient` — Navy gradient untuk hero section
- `.bg-navy-gradient` — Navy gradient untuk buttons/cards
- `.bg-gold-gradient` — Gold gradient untuk CTA
- `.glass-card` — Glassmorphism dengan backdrop-blur
- `.shadow-premium` — Soft multi-layer shadow
- `.shadow-gold-glow` — Gold glow shadow
- `.text-gradient-gold` — Gold text gradient
- `.bg-grid` — Subtle grid pattern overlay

## Authentication Flow

```
User Input (email + password)
         │
         ▼
  POST /api/auth/login
         │
         ▼
  Verify password (SHA-256 hash)
         │
         ▼
  Set httpOnly cookie: iaa_session = userId
  Create AuditLog entry
         │
         ▼
  Return SessionUser (id, email, name, role, member info)
         │
         ▼
  Zustand store: setUser(sessionUser)
  Redirect: Anggota → Member Dashboard, Admin → Admin Dashboard
```

## Role Hierarchy & Permission Architecture

```
SUPER_ADMIN  → Full unrestricted access (delete archives, restore backup, group management, system config)
ADMINISTRATOR → Full access to assigned admin modules (or fallback unrestricted if not in a group)
PENGURUS     → Module access controlled by assigned Groups & Module Permissions (e.g. Tim Humas, Tim Perpustakaan)
ANGGOTA      → Member Dashboard access, Digital Library Anggota, register events, download certificates
GUEST        → View public website only
```

### Sub-Modul Permission Granularity (CMS)
- `admin-cms` — Access to all CMS sections (Semua Akses Bagian)
- `cms-articles` — Berita & Artikel
- `cms-events` — Agenda Kegiatan
- `cms-library` — Digital Library & Dokumen
- `cms-gallery` — Galeri Foto
- `cms-organization` — Struktur Pengurus
- `cms-announcements` — Pengumuman & Banner
- `cms-faq` — Pertanyaan FAQ

## Dependencies Lengkap

Lihat `package.json` untuk daftar lengkap. Dependencies utama:

```json
{
  "next": "^16.1.1",
  "react": "^19.0.0",
  "@prisma/client": "^6.11.1",
  "zustand": "^5.0.6",
  "@tanstack/react-query": "^5.82.0",
  "framer-motion": "^12.23.2",
  "recharts": "^2.15.4",
  "sharp": "^0.34.3",
  "@mdxeditor/editor": "^3.39.1",
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "qrcode.react": "^4.2.0",
  "pdfjs-dist": "^6.1.200",
  "canvas": "^3.2.3",
  "lucide-react": "^0.525.0",
  "next-themes": "^0.4.6",
  "sonner": "^2.0.6",
  "react-hook-form": "^7.60.0",
  "zod": "^4.0.2"
}
```
