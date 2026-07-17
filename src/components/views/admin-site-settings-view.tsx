'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs'
import {
  Palette, Globe, Phone, Mail, MapPin, Share2, Search,
  Save, Loader2, Upload, Check, Image as ImageIcon, Clock,
  Facebook, Instagram, Youtube, Linkedin, Twitter, FileImage,
  Building2, Hash, AlertCircle,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { toast } from 'sonner'

const SETTING_GROUPS = {
  general: {
    label: 'Umum',
    icon: Building2,
    fields: [
      { key: 'site.name', label: 'Nama Situs', type: 'text', placeholder: 'IAA Digital' },
      { key: 'site.shortName', label: 'Nama Singkat', type: 'text', placeholder: 'IAA' },
      { key: 'site.tagline', label: 'Tagline', type: 'text', placeholder: 'Ikatan Arsiparis ANRI' },
      { key: 'site.description', label: 'Deskripsi Situs', type: 'textarea', placeholder: 'Deskripsi singkat organisasi...' },
    ],
  },
  branding: {
    label: 'Branding',
    icon: Palette,
    fields: [
      { key: 'branding.logoUrl', label: 'Logo', type: 'image', hint: 'Logo utama organisasi (PNG/SVG, rasio 1:1 atau 4:1)' },
      { key: 'branding.faviconUrl', label: 'Favicon (32x32)', type: 'image', hint: 'Icon kecil di tab browser (auto-resize ke 32x32)' },
      { key: 'branding.icon192Url', label: 'App Icon 192x192', type: 'image', hint: 'Icon PWA 192x192 (auto-resize)' },
      { key: 'branding.icon512Url', label: 'App Icon 512x512', type: 'image', hint: 'Icon PWA 512x512 (auto-resize)' },
      { key: 'branding.primaryColor', label: 'Warna Primer', type: 'color', hint: 'Warna utama brand (Navy)' },
      { key: 'branding.accentColor', label: 'Warna Aksen', type: 'color', hint: 'Warna aksen/highlight (Gold)' },
    ],
  },
  contact: {
    label: 'Kontak',
    icon: Phone,
    fields: [
      { key: 'contact.address', label: 'Alamat', type: 'textarea', placeholder: 'Jl. Gajah Mada No. 111...' },
      { key: 'contact.phone', label: 'Telepon', type: 'text', placeholder: '(021) 6694166' },
      { key: 'contact.fax', label: 'Fax', type: 'text', placeholder: '(021) 6694167' },
      { key: 'contact.email', label: 'Email Sekretariat', type: 'text', placeholder: 'sekretariat@iaa-anri.go.id' },
      { key: 'contact.emailPengurus', label: 'Email Pengurus', type: 'text', placeholder: 'pengurus@iaa-anri.go.id' },
      { key: 'contact.whatsapp', label: 'WhatsApp (dengan kode negara)', type: 'text', placeholder: '6281234567890' },
      { key: 'contact.operatingHours', label: 'Jam Operasional', type: 'text', placeholder: 'Senin - Jumat: 08.00 - 16.00 WIB' },
      { key: 'contact.mapsUrl', label: 'Google Maps URL', type: 'text', placeholder: 'https://maps.google.com/...' },
    ],
  },
  social: {
    label: 'Sosial Media',
    icon: Share2,
    fields: [
      { key: 'social.facebook', label: 'Facebook URL', type: 'text', placeholder: 'https://facebook.com/iaa.anri', icon: 'facebook' },
      { key: 'social.instagram', label: 'Instagram URL', type: 'text', placeholder: 'https://instagram.com/iaa.anri', icon: 'instagram' },
      { key: 'social.youtube', label: 'YouTube URL', type: 'text', placeholder: 'https://youtube.com/@iaa.anri', icon: 'youtube' },
      { key: 'social.linkedin', label: 'LinkedIn URL', type: 'text', placeholder: 'https://linkedin.com/company/iaa-anri', icon: 'linkedin' },
      { key: 'social.twitter', label: 'Twitter/X URL', type: 'text', placeholder: 'https://twitter.com/iaa_anri', icon: 'twitter' },
    ],
  },
  seo: {
    label: 'SEO',
    icon: Search,
    fields: [
      { key: 'seo.metaTitle', label: 'Meta Title', type: 'text', placeholder: 'IAA Digital — Ikatan Arsiparis ANRI', hint: 'Judul untuk search engine (maks 60 karakter)' },
      { key: 'seo.metaDescription', label: 'Meta Description', type: 'textarea', placeholder: 'Deskripsi untuk search engine...', hint: 'Deskripsi untuk search engine (maks 160 karakter)' },
      { key: 'seo.metaKeywords', label: 'Meta Keywords', type: 'text', placeholder: 'IAA, arsiparis, kearsipan', hint: 'Pisahkan dengan koma' },
      { key: 'seo.ogImage', label: 'OpenGraph Image (1200x630)', type: 'image', hint: 'Gambar untuk social media sharing (auto-resize ke 1200x630)' },
      { key: 'seo.googleAnalyticsId', label: 'Google Analytics ID', type: 'text', placeholder: 'G-XXXXXXXXXX', hint: 'Tracking ID untuk analytics' },
    ],
  },
}

const SOCIAL_ICONS: Record<string, any> = { facebook: Facebook, instagram: Instagram, youtube: Youtube, linkedin: Linkedin, twitter: Twitter }

export function AdminSiteSettingsView() {
  const [settings, setSettings] = React.useState<Record<string, string>>({})
  const [original, setOriginal] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/settings?admin=true')
      .then((r) => r.json())
      .then((d) => {
        const flat: Record<string, string> = {}
        for (const [key, val] of Object.entries(d.settings || {})) {
          flat[key] = (val as any)?.value ?? ''
        }
        setSettings(flat)
        setOriginal(flat)
      })
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const dirty = React.useMemo(() => {
    return Object.keys(settings).some((k) => settings[k] !== original[k])
  }, [settings, original])

  const handleUpload = async (key: string, type: string, file: File) => {
    setUploadingKey(key)
    try {
      // Map setting key to upload type
      const uploadType = key.replace('branding.', '').replace('seo.og', 'og') // logoUrl → logo, faviconUrl → favicon, ogImage → ogImage
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', uploadType)
      const res = await fetch('/api/settings/upload', { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal upload'); return }
      setSettings((s) => ({ ...s, [key]: d.url }))
      toast.success(`${type} berhasil diunggah`)
    } catch { toast.error('Gagal upload file') } finally { setUploadingKey(null) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Only send changed settings
      const changed: Record<string, string> = {}
      for (const k of Object.keys(settings)) {
        if (settings[k] !== original[k]) changed[k] = settings[k]
      }
      if (Object.keys(changed).length === 0) {
        toast.info('Tidak ada perubahan')
        return
      }
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: changed }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(`${Object.keys(changed).length} pengaturan diperbarui`)
      setOriginal({ ...settings })
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  const renderField = (field: any) => {
    const value = settings[field.key] ?? ''
    const isDirty = value !== (original[field.key] ?? '')

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-2">
          <Label className="flex items-center gap-1.5">
            {field.label}
            {isDirty && <Badge variant="outline" className="text-[9px] border-gold/40 text-gold bg-gold/5">modified</Badge>}
          </Label>
          <Textarea
            rows={3}
            value={value}
            onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
          />
          {field.hint && <p className="text-[10px] text-muted-foreground">{field.hint}</p>}
          {field.key === 'seo.metaDescription' && (
            <p className="text-[10px] text-muted-foreground">{value.length}/160 karakter</p>
          )}
        </div>
      )
    }

    if (field.type === 'color') {
      return (
        <div key={field.key} className="space-y-2">
          <Label className="flex items-center gap-1.5">
            {field.label}
            {isDirty && <Badge variant="outline" className="text-[9px] border-gold/40 text-gold bg-gold/5">modified</Badge>}
          </Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
              className="h-9 w-16 rounded-md border border-border cursor-pointer"
            />
            <Input
              value={value}
              onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
              placeholder="#0a1e3f"
              className="font-mono text-xs flex-1"
            />
          </div>
          {field.hint && <p className="text-[10px] text-muted-foreground">{field.hint}</p>}
        </div>
      )
    }

    if (field.type === 'image') {
      const uploadType = field.key.replace('branding.', '').replace('seo.og', 'og')
      return (
        <div key={field.key} className="space-y-2">
          <Label className="flex items-center gap-1.5">
            {field.label}
            {isDirty && <Badge variant="outline" className="text-[9px] border-gold/40 text-gold bg-gold/5">modified</Badge>}
          </Label>
          <div className="flex items-start gap-4">
            {/* Preview */}
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-lg border border-border bg-muted overflow-hidden grid place-items-center">
                {value ? (
                   
                  <img src={value} alt={field.label} className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(field.key, field.label, f) }}
                disabled={uploadingKey === field.key}
                className="hidden"
                id={`upload-${field.key}`}
              />
              <label htmlFor={`upload-${field.key}`} className="inline-flex items-center cursor-pointer">
                <div className={`inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-gold/40 transition-colors ${uploadingKey === field.key ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploadingKey === field.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {uploadingKey === field.key ? 'Mengunggah...' : 'Upload'}
                </div>
              </label>
              <Input
                value={value}
                onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
                placeholder={field.placeholder || '/path/to/image'}
                className="font-mono text-xs"
              />
              {field.hint && <p className="text-[10px] text-muted-foreground">{field.hint}</p>}
            </div>
          </div>
        </div>
      )
    }

    // Default: text input
    const SocialIcon = field.icon ? SOCIAL_ICONS[field.icon] : null
    return (
      <div key={field.key} className="space-y-2">
        <Label className="flex items-center gap-1.5">
          {SocialIcon && <SocialIcon className="h-3.5 w-3.5 text-muted-foreground" />}
          {field.label}
          {isDirty && <Badge variant="outline" className="text-[9px] border-gold/40 text-gold bg-gold/5">modified</Badge>}
        </Label>
        <Input
          value={value}
          onChange={(e) => setSettings((s) => ({ ...s, [field.key]: e.target.value }))}
          placeholder={field.placeholder}
        />
        {field.hint && <p className="text-[10px] text-muted-foreground">{field.hint}</p>}
      </div>
    )
  }

  return (
    <AdminShell
      activeKey="site-settings"
      title="Pengaturan Situs"
      subtitle="Konfigurasi website publik: nama, logo, favicon, kontak, sosial media, dan SEO"
      actions={
        <Button onClick={handleSave} disabled={!dirty || saving} className="bg-navy-gradient">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      }
    >
      {loading ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-navy mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Memuat pengaturan...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Unsaved changes banner */}
          {dirty && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-gold/40 bg-gold/5 p-3 flex items-center gap-2 text-xs"
            >
              <AlertCircle className="h-4 w-4 text-gold" />
              <span className="text-gold font-medium">Ada perubahan yang belum disimpan.</span>
              <span className="text-muted-foreground">Klik "Simpan Perubahan" untuk menerapkan.</span>
            </motion.div>
          )}

          <Tabs defaultValue="general">
            <TabsList className="flex-wrap">
              {Object.entries(SETTING_GROUPS).map(([key, group]) => (
                <TabsTrigger key={key} value={key} className="gap-1.5">
                  <group.icon className="h-3.5 w-3.5" /> {group.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(SETTING_GROUPS).map(([key, group]) => (
              <TabsContent key={key} value={key}>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <group.icon className="h-5 w-5 text-gold" />
                      <h3 className="font-display font-bold text-navy dark:text-white">{group.label}</h3>
                    </div>
                    {group.fields.map(renderField)}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Live preview */}
          <Card className="bg-navy-gradient text-white border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <CardContent className="relative p-6">
              <h3 className="font-display font-bold mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gold" /> Preview Header & Footer
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Header preview */}
                <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <div className="text-[10px] text-white/60 uppercase tracking-wide mb-2">Header</div>
                  <div className="flex items-center gap-2">
                    {settings['branding.logoUrl'] ? (
                      <img src={settings['branding.logoUrl']} alt="Logo" className="h-8 w-8 object-contain" />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-white/10 grid place-items-center">
                        <ImageIcon className="h-4 w-4 text-white/40" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold">{settings['site.name'] || 'IAA Digital'}</div>
                      <div className="text-[10px] text-white/60">{settings['site.tagline'] || 'Ikatan Arsiparis ANRI'}</div>
                    </div>
                  </div>
                </div>

                {/* Footer preview */}
                <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <div className="text-[10px] text-white/60 uppercase tracking-wide mb-2">Footer Kontak</div>
                  <div className="space-y-1 text-xs text-white/80">
                    <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-gold" /> {settings['contact.address'] || 'Alamat belum diisi'}</div>
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-gold" /> {settings['contact.phone'] || '-'}</div>
                    <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-gold" /> {settings['contact.email'] || '-'}</div>
                  </div>
                </div>
              </div>

              {/* SEO preview */}
              <div className="mt-4 rounded-lg bg-white p-3 text-navy">
                <div className="text-[10px] text-emerald-700 truncate">
                  https://iaa-anri.go.id/
                </div>
                <div className="text-sm font-medium text-blue-700 truncate mt-0.5">
                  {settings['seo.metaTitle'] || 'IAA Digital — Ikatan Arsiparis ANRI'}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {settings['seo.metaDescription'] || 'Platform Digital Organisasi Ikatan Arsiparis ANRI'}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AdminShell>
  )
}
