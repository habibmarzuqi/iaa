# 06 — API Reference

Daftar lengkap semua API endpoints di IAA Digital.

## Base URL

```
Production: https://iaa-anri.go.id/api
Development: http://localhost:3000/api
```

## Authentication

Semua endpoint admin memerlukan cookie `iaa_session` (httpOnly, set saat login).

```
Cookie: iaa_session=<userId>
```

---

## Auth

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/auth/login` | — | Login dengan email + password |
| `GET` | `/api/auth/login` | — | Get current session user |
| `POST` | `/api/auth/logout` | — | Logout (hapus cookie) |
| `GET` | `/api/auth/google` | — | Generate Google OAuth URL (simulated) |
| `POST` | `/api/auth/google` | — | Handle Google OAuth callback |

---

## Articles (Berita)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/articles` | — | List published articles (`?limit=`, `?featured=`, `?slug=`) |
| `GET` | `/api/articles?admin=true` | Pengurus+ | List all articles (including drafts) |
| `GET` | `/api/articles?id=xxx` | Pengurus+ | Get article by ID (admin) |
| `POST` | `/api/articles` | Pengurus+ | Create article |
| `PATCH` | `/api/articles?id=xxx` | Pengurus+ | Update article (auto-create revision) |
| `DELETE` | `/api/articles?id=xxx` | Pengurus+ | Delete article |

---

## Events (Agenda)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/events` | — | List published events (`?limit=`, `?slug=`) |
| `GET` | `/api/events?admin=true` | Pengurus+ | List all events |
| `POST` | `/api/events` | Pengurus+ | Create event |
| `PATCH` | `/api/events?id=xxx` | Pengurus+ | Update event |
| `DELETE` | `/api/events?id=xxx` | Pengurus+ | Delete event |

---

## Library (Digital Library)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/library` | — | List published items (`?limit=`, `?category=`, `?accessLevel=`, `?admin=true`) |
| `POST` | `/api/library` | Pengurus+ | Create library item |
| `POST` | `/api/library/upload` | Pengurus+ | Upload digital library document (PDF, EPUB, DOCX, ZIP, etc.) |
| `PATCH` | `/api/library?id=xxx` | Pengurus+ | Update library item |
| `DELETE` | `/api/library?id=xxx` | Pengurus+ | Delete library item |

---

## Gallery (Galeri)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/gallery` | — | List albums + recent photos (`?admin=true`, `?id=albumId`) |
| `POST` | `/api/gallery` | Pengurus+ | Create album |
| `POST` | `/api/gallery?action=add-photo` | Pengurus+ | Add photo to album |
| `POST` | `/api/gallery/upload` | Pengurus+ | Upload photo (multipart, auto watermark + thumbnail) |
| `PATCH` | `/api/gallery?id=albumId` | Pengurus+ | Update album |
| `PATCH` | `/api/gallery/reorder` | Pengurus+ | Reorder photos `{ photoIds: [] }` |
| `DELETE` | `/api/gallery?id=albumId` | Pengurus+ | Delete album (cascade) |
| `DELETE` | `/api/gallery?action=photo&id=photoId` | Pengurus+ | Delete single photo |

---

## Organization (Pengurus)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/organization` | — | List active members |
| `GET` | `/api/organization?admin=true` | Pengurus+ | List all members |
| `POST` | `/api/organization` | Pengurus+ | Create member |
| `PATCH` | `/api/organization?id=xxx` | Pengurus+ | Update member |
| `DELETE` | `/api/organization?id=xxx` | Pengurus+ | Delete member |

---

## Announcements (Pengumuman)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/announcements` | — | List active announcements |
| `GET` | `/api/announcements?admin=true` | Pengurus+ | List all announcements |
| `POST` | `/api/announcements` | Pengurus+ | Create announcement |
| `PATCH` | `/api/announcements?id=xxx` | Pengurus+ | Update announcement |
| `DELETE` | `/api/announcements?id=xxx` | Pengurus+ | Delete announcement |

---

## Archives (Arsip Digital)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/archives` | — (role-filtered) | List archives (`?search=`, `?category=`, `?id=`) |
| `POST` | `/api/archives` | Pengurus+ | Create archive |
| `PATCH` | `/api/archives?id=xxx` | Pengurus+ | Update archive (add version with `versionData`) |
| `DELETE` | `/api/archives?id=xxx` | Super Admin | Delete archive |
| `POST` | `/api/archives/upload` | Pengurus+ | Upload archive file (multipart, max 50MB) |
| `GET` | `/api/archives/pdf-preview?url=xxx` | — | Generate PDF first-page thumbnail (PNG) |

---

## Certificates (E-Certificate)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/certificates?verify=NUMBER` | — | Public verification by certificate number |
| `GET` | `/api/certificates` | Pengurus+ | List all certificates |
| `POST` | `/api/certificates` | Pengurus+ | Generate certificate (auto number) |

---

## Registrations (Event Registration)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/registrations` | Anggota+ | List registrations (anggota: own only, admin: all) |
| `POST` | `/api/registrations` | Anggota | Register to event (auto waiting list if full) |
| `PATCH` | `/api/registrations?id=xxx` | Anggota+ | Update status (approve/reject/checkin/cancel) |

---

## Members

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/members` | Login | Get own member data (`?sub=certificates`, `?sub=registrations`) |
| `GET` | `/api/members-list` | Pengurus+ | List all members (for admin selects) |

---

## Dashboard

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/dashboard` | Pengurus+ | Admin dashboard statistics (totals, charts, recent) |

---

## Notifications

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/notifications` | Login | List current user's notifications |
| `POST` | `/api/notifications` | Admin+ | Create notification (or broadcast) |
| `PATCH` | `/api/notifications?id=xxx` | Login | Mark as read |
| `PATCH` | `/api/notifications?action=read-all` | Login | Mark all as read |
| `DELETE` | `/api/notifications?id=xxx` | Login | Delete notification |

---

## Media Library

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/media` | Pengurus+ | List media assets (`?type=image\|document\|video\|audio`) |
| `POST` | `/api/media` | Pengurus+ | Upload media (multipart, max 10MB, auto thumb/medium/large) |
| `PATCH` | `/api/media?id=xxx` | Pengurus+ | Update alt/caption |
| `DELETE` | `/api/media?id=xxx` | Admin+ | Delete media (file + record) |

---

## Settings (Site Configuration)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/settings` | — | Get all site settings (key-value) |
| `GET` | `/api/settings?admin=true` | Pengurus+ | Get settings with metadata |
| `POST` | `/api/settings` | Pengurus+ | Bulk update settings |
| `POST` | `/api/settings/upload` | Pengurus+ | Upload branding assets (logo/favicon/icon/ogImage, auto-resize) |

---

## Menu Management

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/menu` | — | Get visible menu tree |
| `GET` | `/api/menu?admin=true` | Pengurus+ | Get all menus (including hidden) |
| `POST` | `/api/menu` | Pengurus+ | Create menu item |
| `PATCH` | `/api/menu?id=xxx` | Pengurus+ | Update menu item |
| `PATCH` | `/api/menu?reorder=true` | Pengurus+ | Bulk reorder |
| `DELETE` | `/api/menu?id=xxx` | Admin+ | Delete menu (cascade children) |

---

## Article Revisions

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/articles-revisions?articleId=xxx` | Pengurus+ | List revisions |
| `GET` | `/api/articles-revisions?articleId=xxx&version=N` | Pengurus+ | Get specific revision |
| `POST` | `/api/articles-revisions?articleId=xxx` | Pengurus+ | Create new revision |

---

## Tags

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/tags` | — | List all distinct tags (for autocomplete) |

---

## Search

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/search?q=query` | — | Global search across articles, events, library, archives, members |

---

## Chat (AI Chatbot)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/chat` | Login | List chat conversations |
| `POST` | `/api/chat` | — | Send message to AI (z-ai-web-dev-sdk) |

---

## Reports

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/reports?type=members\|events\|certificates\|library\|archives` | Pengurus+ | Get report data |
| `GET` | `/api/reports?type=xxx&format=csv` | Pengurus+ | Export CSV |

---

## Backup

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/backup` | Pengurus+ | List backup history |
| `POST` | `/api/backup` | Admin+ | Create backup (download JSON) |
| `POST` | `/api/backup?action=restore` | Super Admin | Restore from JSON |
| `DELETE` | `/api/backup?id=xxx` | Super Admin | Delete backup record |

---

## Cron

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `GET` | `/api/cron/publish-scheduled?token=SECRET` | Token | Auto-publish SCHEDULED articles |

---

## Response Format

### Success
```json
{
  "data": "...",
  "total": 10
}
```

### Error
```json
{
  "error": "Deskripsi error dalam Bahasa Indonesia"
}
```

### HTTP Status Codes
- `200` — Success
- `201` — Created
- `400` — Bad Request (validation error)
- `401` — Unauthorized (not logged in)
- `403` — Forbidden (insufficient role)
- `404` — Not Found
- `500` — Internal Server Error
