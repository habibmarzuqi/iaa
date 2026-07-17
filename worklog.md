# IAA Digital — Worklog

## Task 21-apis — Add POST/PATCH/DELETE handlers to 5 API route files

**Date:** Auto-generated
**Task ID:** `21-apis`
**Agent:** api-routes-agent
**Scope:** Append admin CRUD handlers to existing API route files, mirroring the gold-standard pattern in `src/app/api/articles/route.ts`.

### Files Modified (5)

All located under `/home/z/my-project/src/app/api/`:

1. **`events/route.ts`** — Added `POST` (create event), `PATCH` (update event), `DELETE` (delete event). Kept existing public `GET` (list + detail by slug). Added `GET ?admin=true` (admin list incl. unpublished) and `GET ?id=xxx` (admin detail by ID). Auto-generates unique slug from `title`. Validates `eventType` against the `EventType` enum (SEMINAR, WORKSHOP, WEBINAR, RAPAT, PELATIHAN, LOMBA). Audit log actions: `EVENT_CREATE`, `EVENT_UPDATE`, `EVENT_DELETE`.

2. **`library/route.ts`** — Added `POST` (create item), `PATCH` (update item), `DELETE` (delete item). Kept existing public `GET` (list with optional `category` filter). Added `GET ?slug=xxx` (public detail), `GET ?admin=true` (admin list incl. unpublished), `GET ?id=xxx` (admin detail). Auto-generates unique slug. Validates `category` against `LibraryCategory` enum (BUKU, EBOOK, JURNAL, PEDOMAN, REGULASI, SOP, TEMPLATE, PRESENTASI, MAJALAH, VIDEO, AUDIO). Audit log actions: `LIBRARY_CREATE`, `LIBRARY_UPDATE`, `LIBRARY_DELETE`.

3. **`gallery/route.ts`** — Added `POST ?action=add-photo` (add photo to album), `POST` (create album), `PATCH ?id=albumId` (update album), `DELETE ?id=albumId` (cascade-delete album), `DELETE ?action=photo&id=photoId` (delete single photo). Kept existing public `GET` (returns albums + recent photos). Added `GET ?admin=true` (admin list with photos) and `GET ?id=albumId` (album detail with photos). Audit log actions: `GALLERY_ALBUM_CREATE`, `GALLERY_ALBUM_UPDATE`, `GALLERY_ALBUM_DELETE`, `GALLERY_PHOTO_ADD`, `GALLERY_PHOTO_DELETE`.

4. **`announcements/route.ts`** — Added `POST` (create), `PATCH ?id=xxx` (update), `DELETE ?id=xxx` (delete). Kept existing public `GET` (active announcements only, filtered by date window). Added `GET ?admin=true` (returns ALL announcements incl. expired) and `GET ?id=xxx` (admin detail). Validates `type` against `AnnouncementType` enum (BANNER, POPUP, RUNNING_TEXT, PINNED). Audit log actions: `ANNOUNCEMENT_CREATE`, `ANNOUNCEMENT_UPDATE`, `ANNOUNCEMENT_DELETE`.

5. **`organization/route.ts`** — Added `POST` (create member), `PATCH ?id=xxx` (update member), `DELETE ?id=xxx` (delete member). Kept existing public `GET` (active members ordered by `order`). Added `GET ?admin=true` (all members incl. inactive) and `GET ?id=xxx` (admin detail). Audit log actions: `ORG_MEMBER_CREATE`, `ORG_MEMBER_UPDATE`, `ORG_MEMBER_DELETE`.

### Pattern Compliance

All 5 files follow the EXACT same structure as `articles/route.ts`:

- `export const runtime = 'nodejs'`
- `async function getSessionUser(req: NextRequest)` helper — reads `iaa_session` cookie, returns `User | null`
- Role check `['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS']` (extracted to `isAdmin()` helper in gallery/announcements/organization for the multi-action handlers)
- `slugify()` helper used in events & library
- Unique slug generation loop (`baseSlug`, `counter`, append `-N` until free)
- Try-catch with `console.error` and `500` fallback
- `db.auditLog.create()` on every mutation
- 403 returns `{ error: 'Forbidden — minimal Pengurus' }` for POST/PATCH/DELETE on POST path; `{ error: 'Forbidden' }` for PATCH/DELETE/getAdmin
- 404 returns Indonesian error message when resource not found
- 400 returns `{ error: 'ID wajib diisi' }` when `id` query missing for PATCH/DELETE

### Issues Encountered

1. **`mimeType` field on LibraryItem** — The task spec listed `mimeType?` in the POST body for library items, but the `LibraryItem` Prisma model does not have a `mimeType` field (only `ArchiveVersion` does). Resolution: removed `mimeType` from the create/update data blocks to avoid Prisma type error `TS2353`. The field is silently ignored if sent by the client. **Recommendation:** if `mimeType` is genuinely required, add it to the `LibraryItem` Prisma model and run `bun run db:push`. (Out of scope for this task — schema is read-only here.)

2. **Pre-existing TS errors** — `bunx tsc --noEmit` reports errors in `examples/`, `scripts/seed.ts`, `scripts/seed-phase3.ts`, `src/app/api/chat/route.ts`, `src/components/views/admin-events-view.tsx`, and `skills/*`. These are all pre-existing and NOT related to my changes. Confirmed by filtering: `bunx tsc --noEmit 2>&1 | rg "src/app/api/(events|library|gallery|announcements|organization)/route.ts"` returns **NO matches**.

3. **`/agent-ctx` directory** — Did not exist initially. Created `/home/z/my-project/agent-ctx/21-apis-api-routes-agent.md` with a summary record.

4. **`worklog.md`** — Did not exist initially. Created new file with this task entry.

### Lint & Type Check Status

- `bun run lint` → EXIT 0 ✅ (no ESLint errors anywhere in repo)
- `bunx tsc --noEmit` → All 5 modified route files pass type check (verified via filtered grep)

### Audit Log Actions Summary

| Route      | Create                | Update                | Delete                |
|------------|-----------------------|-----------------------|-----------------------|
| events     | `EVENT_CREATE`        | `EVENT_UPDATE`        | `EVENT_DELETE`        |
| library    | `LIBRARY_CREATE`      | `LIBRARY_UPDATE`      | `LIBRARY_DELETE`      |
| gallery    | `GALLERY_ALBUM_CREATE` + `GALLERY_PHOTO_ADD` | `GALLERY_ALBUM_UPDATE` | `GALLERY_ALBUM_DELETE` + `GALLERY_PHOTO_DELETE` |
| announcements | `ANNOUNCEMENT_CREATE` | `ANNOUNCEMENT_UPDATE` | `ANNOUNCEMENT_DELETE` |
| organization  | `ORG_MEMBER_CREATE`   | `ORG_MEMBER_UPDATE`   | `ORG_MEMBER_DELETE`   |
