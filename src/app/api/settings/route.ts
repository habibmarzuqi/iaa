/**
 * Site Settings API
 * GET  /api/settings              — public: get all settings (no auth needed)
 * GET  /api/settings?admin=true   — admin: get all settings with metadata
 * POST /api/settings              — admin: bulk update settings { settings: { key: value, ... } }
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

// Default settings with their types and categories
const DEFAULT_SETTINGS: Record<string, { value: string; type: string; category: string }> = {
  // GENERAL
  'site.name': { value: 'IAA Digital', type: 'text', category: 'general' },
  'site.shortName': { value: 'IAA', type: 'text', category: 'general' },
  'site.description': { value: 'Platform Digital Organisasi Ikatan Arsiparis ANRI. Memori kolektif peradaban bangsa, dikelola dengan profesionalisme dan teknologi modern.', type: 'textarea', category: 'general' },
  'site.tagline': { value: 'Ikatan Arsiparis ANRI', type: 'text', category: 'general' },

  // BRANDING
  'branding.logoUrl': { value: '', type: 'image', category: 'branding' },
  'branding.faviconUrl': { value: '/favicon.svg', type: 'image', category: 'branding' },
  'branding.icon192Url': { value: '/icon-192.svg', type: 'image', category: 'branding' },
  'branding.icon512Url': { value: '/icon-512.svg', type: 'image', category: 'branding' },
  'branding.primaryColor': { value: '#0a1e3f', type: 'color', category: 'branding' },
  'branding.accentColor': { value: '#c9a227', type: 'color', category: 'branding' },

  // CONTACT
  'contact.address': { value: 'Jl. Gajah Mada No. 111, Jakarta Pusat 11130, Indonesia', type: 'textarea', category: 'contact' },
  'contact.phone': { value: '(021) 6694166', type: 'text', category: 'contact' },
  'contact.fax': { value: '(021) 6694167', type: 'text', category: 'contact' },
  'contact.email': { value: 'sekretariat@iaa-anri.go.id', type: 'text', category: 'contact' },
  'contact.emailPengurus': { value: 'pengurus@iaa-anri.go.id', type: 'text', category: 'contact' },
  'contact.whatsapp': { value: '6281234567890', type: 'text', category: 'contact' },
  'contact.operatingHours': { value: 'Senin - Jumat: 08.00 - 16.00 WIB', type: 'text', category: 'contact' },
  'contact.mapsUrl': { value: 'https://maps.google.com/?q=ANRI+Jakarta', type: 'text', category: 'contact' },

  // SOCIAL MEDIA
  'social.facebook': { value: '', type: 'text', category: 'social' },
  'social.instagram': { value: '', type: 'text', category: 'social' },
  'social.youtube': { value: '', type: 'text', category: 'social' },
  'social.linkedin': { value: '', type: 'text', category: 'social' },
  'social.twitter': { value: '', type: 'text', category: 'social' },

  // SEO
  'seo.metaTitle': { value: 'IAA Digital — Ikatan Arsiparis ANRI', type: 'text', category: 'seo' },
  'seo.metaDescription': { value: 'Platform Digital Organisasi Ikatan Arsiparis ANRI. Manajemen anggota, perpustakaan digital, arsip organisasi, kegiatan, dan e-certificate dalam satu sistem.', type: 'textarea', category: 'seo' },
  'seo.metaKeywords': { value: 'IAA, Ikatan Arsiparis ANRI, Arsiparis, ANRI, Kearsipan, Digital Platform', type: 'text', category: 'seo' },
  'seo.ogImage': { value: '', type: 'image', category: 'seo' },
  'seo.googleAnalyticsId': { value: '', type: 'text', category: 'seo' },
}

async function getSessionUser(req: NextRequest) {
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

// Ensure all default settings exist in DB
async function ensureDefaults() {
  const existing = await db.siteSetting.findMany()
  const existingKeys = new Set(existing.map((s) => s.key))

  const toCreate = Object.entries(DEFAULT_SETTINGS)
    .filter(([key]) => !existingKeys.has(key))
    .map(([key, def]) => ({
      key,
      value: def.value,
      type: def.type,
      category: def.category,
    }))

  if (toCreate.length > 0) {
    await db.siteSetting.createMany({ data: toCreate })
  }
}

export async function GET(req: NextRequest) {
  await ensureDefaults()

  const url = new URL(req.url)
  const admin = url.searchParams.get('admin') === 'true'

  if (admin) {
    const user = await getSessionUser(req)
    if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const settings = await db.siteSetting.findMany({
    orderBy: { category: 'asc' },
    include: admin ? { updatedBy: { select: { name: true } } } : false,
  })

  // Build key-value map
  const settingsMap: Record<string, any> = {}
  for (const s of settings) {
    settingsMap[s.key] = admin ? {
      value: s.value,
      type: s.type,
      category: s.category,
      updatedAt: s.updatedAt,
      updatedBy: s.updatedBy?.name || null,
    } : s.value
  }

  return NextResponse.json({ settings: settingsMap })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req)
  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR', 'PENGURUS'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { settings } = body as { settings: Record<string, string> }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'settings object wajib diisi' }, { status: 400 })
    }

    // Upsert each setting
    const updates = Object.entries(settings).map(([key, value]) =>
      db.siteSetting.upsert({
        where: { key },
        create: { key, value, type: DEFAULT_SETTINGS[key]?.type || 'text', category: DEFAULT_SETTINGS[key]?.category || 'general', updatedById: user.id },
        update: { value, updatedById: user.id },
      })
    )

    await Promise.all(updates)

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'SITE_SETTINGS_UPDATE',
        description: `Updated ${Object.keys(settings).length} site settings`,
      },
    })

    return NextResponse.json({ ok: true, updated: Object.keys(settings).length })
  } catch (e: any) {
    console.error('Settings update error:', e)
    return NextResponse.json({ error: 'Gagal update settings' }, { status: 500 })
  }
}
