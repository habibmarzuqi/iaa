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
import { Switch } from '@/components/ui/switch'
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs'
import {
  Palette, Globe, Phone, Mail, MapPin, Share2, Search,
  Save, Loader2, Upload, Check, Image as ImageIcon, Clock,
  Facebook, Instagram, Youtube, Linkedin, Twitter, FileImage,
  Building2, Hash, AlertCircle, ToggleLeft, Bot, Languages, Moon, ShieldCheck,
  Plus, Trash2, X, Code, BookOpen,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
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
  header: {
    label: 'Fitur Header',
    icon: ToggleLeft,
    fields: [
      { key: 'header.showSearch', label: 'Pencarian Global (Search)', type: 'toggle', hint: 'Tombol pencarian dengan shortcut Ctrl+K di header', toggleIcon: 'Search' },
      { key: 'header.showAIChatbot', label: 'AI Chatbot Kearsipan', type: 'toggle', hint: 'Tombol akses cepat ke asisten AI di header', toggleIcon: 'Bot' },
      { key: 'header.showVerifyButton', label: 'Verifikasi Sertifikat', type: 'toggle', hint: 'Tombol akses cepat ke halaman verifikasi sertifikat', toggleIcon: 'ShieldCheck' },
      { key: 'header.showLanguageSwitcher', label: 'Pengalih Bahasa (ID/EN)', type: 'toggle', hint: 'Dropdown untuk beralih bahasa Indonesia/English', toggleIcon: 'Languages' },
      { key: 'header.showThemeToggle', label: 'Mode Gelap/Terang', type: 'toggle', hint: 'Tombol untuk beralih dark/light mode', toggleIcon: 'Moon' },
    ],
  },
  about: {
    label: 'Tentang (Sejarah, Visi, Misi)',
    icon: BookOpen,
    fields: [
      { key: 'about.history', label: 'Sejarah Organisasi', type: 'textarea', hint: 'Pisahkan paragraf dengan baris kosong (Enter 2x)' },
      { key: 'about.vision', label: 'Visi', type: 'textarea', hint: 'Pernyataan visi organisasi' },
      { key: 'about.mission', label: 'Misi', type: 'textarea', hint: 'Satu misi per baris (akan dinomori otomatis di halaman publik)' },
      { key: 'about.values', label: 'Nilai Organisasi', type: 'textarea', hint: 'Format: Judul|Deskripsi (pisahkan tiap nilai dengan baris baru)' },
      { key: 'about.stats.foundedYear', label: 'Statistik: Tahun Berdiri (nilai)', type: 'text', placeholder: '1973' },
      { key: 'about.stats.foundedYearLabel', label: 'Statistik: Tahun Berdiri (label)', type: 'text', placeholder: 'Tahun Berdiri' },
      { key: 'about.stats.yearsActive', label: 'Statistik: Tahun Berkarya (nilai)', type: 'text', placeholder: '53' },
      { key: 'about.stats.yearsActiveLabel', label: 'Statistik: Tahun Berkarya (label)', type: 'text', placeholder: 'Tahun Berkarya' },
      { key: 'about.stats.activeMembers', label: 'Statistik: Anggota Aktif (nilai)', type: 'text', placeholder: '2,400+' },
      { key: 'about.stats.activeMembersLabel', label: 'Statistik: Anggota Aktif (label)', type: 'text', placeholder: 'Anggota Aktif' },
      { key: 'about.stats.provinces', label: 'Statistik: Provinsi (nilai)', type: 'text', placeholder: '34' },
      { key: 'about.stats.provincesLabel', label: 'Statistik: Provinsi (label)', type: 'text', placeholder: 'Provinsi' },
    ],
  },
}

const TOGGLE_ICONS: Record<string, any> = { Search, Bot, ShieldCheck, Languages, Moon }

const SOCIAL_ICONS: Record<string, any> = { facebook: Facebook, instagram: Instagram, youtube: Youtube, linkedin: Linkedin, twitter: Twitter }

export function AdminSiteSettingsView() {
  const [settings, setSettings] = React.useState<Record<string, string>>({})
  const [settingsMeta, setSettingsMeta] = React.useState<Record<string, any>>({})
  const [original, setOriginal] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [deletingKey, setDeletingKey] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/settings?admin=true')
      .then((r) => r.json())
      .then((d) => {
        const flat: Record<string, string> = {}
        const meta: Record<string, any> = {}
        for (const [key, val] of Object.entries(d.settings || {})) {
          flat[key] = (val as any)?.value ?? ''
          meta[key] = val
        }
        setSettings(flat)
        setSettingsMeta(meta)
        setOriginal(flat)
      })
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  // Identify custom settings (not in SETTING_GROUPS)
  const knownKeys = new Set(Object.values(SETTING_GROUPS).flatMap((g) => g.fields.map((f) => f.key)))
  const customKeys = Object.keys(settings).filter((k) => !knownKeys.has(k))

  const dirty = React.useMemo(() => {
    return Object.keys(settings).some((k) => settings[k] !== original[k])
  }, [settings, original])

  const handleUpload = async (key: string, type: string, file: File) => {
    setUploadingKey(key)
    try {
      const uploadType = key.replace('branding.', '').replace('seo.og', 'og')
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

  const handleCreateSetting = async (data: { key: string; value: string; type: string; category: string }) => {
    try {
      const res = await fetch('/api/settings?single=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal membuat setting'); return }
      toast.success(`Setting "${data.key}" dibuat`)
      setCreateDialogOpen(false)
      load()
    } catch { toast.error('Terjadi kesalahan') }
  }

  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`Hapus setting "${key}"?\n\nTindakan ini tidak dapat dibatalkan.`)) return
    setDeletingKey(key)
    try {
      const res = await fetch(`/api/settings?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menghapus'); return }
      toast.success(`Setting "${key}" dihapus`)
      load()
    } catch { toast.error('Terjadi kesalahan') } finally { setDeletingKey(null) }
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

    if (field.type === 'toggle') {
      const isEnabled = value === 'true' || value === true
      const ToggleIcon = field.toggleIcon ? TOGGLE_ICONS[field.toggleIcon] : null
      return (
        <div key={field.key} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {ToggleIcon && (
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <ToggleIcon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">{field.label}</Label>
                {isDirty && <Badge variant="outline" className="text-[9px] border-gold/40 text-gold bg-gold/5">modified</Badge>}
              </div>
              {field.hint && <p className="text-[11px] text-muted-foreground mt-0.5">{field.hint}</p>}
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => setSettings((s) => ({ ...s, [field.key]: String(checked) }))}
          />
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Setting Baru
          </Button>
          <Button onClick={handleSave} disabled={!dirty || saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
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
              <TabsTrigger value="custom" className="gap-1.5">
                <Code className="h-3.5 w-3.5" /> Custom
                {customKeys.length > 0 && (
                  <Badge variant="outline" className="text-[9px] ml-1">{customKeys.length}</Badge>
                )}
              </TabsTrigger>
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

            {/* Custom settings tab */}
            <TabsContent value="custom">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-gold" />
                      <h3 className="font-display font-bold text-navy dark:text-white">Custom Settings</h3>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-3.5 w-3.5" /> Tambah
                    </Button>
                  </div>

                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-[11px] text-blue-700 dark:text-blue-300">
                    Custom settings adalah key-value pair bebas yang tidak termasuk dalam kategori standar. Berguna untuk menyimpan konfigurasi tambahan yang dibutuhkan oleh fitur kustom.
                  </div>

                  {customKeys.length === 0 ? (
                    <div className="text-center py-8">
                      <Code className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Belum ada custom setting</p>
                      <Button size="sm" variant="outline" className="mt-3" onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-3.5 w-3.5" /> Buat Custom Setting
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customKeys.map((key) => {
                        const meta = settingsMeta[key] || {}
                        const value = settings[key] ?? ''
                        const isDirty = value !== (original[key] ?? '')
                        return (
                          <div key={key} className="rounded-lg border border-border p-3 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <code className="text-xs font-mono font-semibold text-navy dark:text-white bg-muted px-1.5 py-0.5 rounded">{key}</code>
                              <Badge variant="outline" className="text-[9px]">{meta.type || 'text'}</Badge>
                              <Badge variant="outline" className="text-[9px]">{meta.category || 'custom'}</Badge>
                              {isDirty && (
                                <Badge variant="outline" className="text-[9px] border-gold/40 text-gold bg-gold/5">modified</Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-auto h-7 w-7 p-0 text-red-600"
                                disabled={deletingKey === key}
                                onClick={() => handleDeleteSetting(key)}
                                title="Hapus setting"
                              >
                                {deletingKey === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                            <Textarea
                              rows={2}
                              value={value}
                              onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                              placeholder="Value..."
                              className="text-xs font-mono"
                            />
                            {meta.updatedBy && (
                              <div className="text-[10px] text-muted-foreground">
                                Diperbarui oleh: {meta.updatedBy} · {meta.updatedAt ? new Date(meta.updatedAt).toLocaleString('id-ID') : '-'}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
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

      <CreateSettingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateSetting}
      />
    </AdminShell>
  )
}

// ============ Create Setting Dialog ============

function CreateSettingDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onCreate: (data: { key: string; value: string; type: string; category: string }) => void
}) {
  const [form, setForm] = React.useState({
    key: '',
    value: '',
    type: 'text',
    category: 'custom',
  })

  React.useEffect(() => {
    if (open) {
      setForm({ key: '', value: '', type: 'text', category: 'custom' })
    }
  }, [open])

  const submit = () => {
    if (!form.key) {
      toast.error('Key wajib diisi')
      return
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(form.key)) {
      toast.error('Key hanya boleh huruf, angka, titik, underscore, dan hyphen')
      return
    }
    onCreate(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Plus className="h-5 w-5 text-gold" /> Buat Setting Baru
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Key *</Label>
            <Input
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              placeholder="contoh: site.customField"
              className="font-mono text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Hanya huruf, angka, titik (.), underscore (_), dan hyphen (-). Harus unik.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Value</Label>
            <Textarea
              rows={3}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="Isi value setting..."
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">text</SelectItem>
                  <SelectItem value="textarea">textarea</SelectItem>
                  <SelectItem value="boolean">boolean</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="image">image</SelectItem>
                  <SelectItem value="color">color</SelectItem>
                  <SelectItem value="json">json</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="custom"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-[11px] text-blue-700 dark:text-blue-300">
            <strong>Tips:</strong> Gunakan key dengan prefix kategori untuk pengelompokan, contoh: <code>feature.flagX</code>, <code>custom.configY</code>, <code>integration.serviceZ</code>.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} className="bg-navy-gradient">
            <Plus className="mr-2 h-4 w-4" /> Buat Setting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
