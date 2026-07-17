'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs'
import {
  FileText, Calendar, BookOpen, Image as ImageIcon, Users, Megaphone,
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Pin, Star, Clock,
  ExternalLink, Save, X, Loader2, Filter, ArrowRight,
  History, Search as SeoIcon, ImagePlus, UserCircle, AlertCircle,
  Globe, FileSearch, Check,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { formatDate, formatDateTime, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'
import { RichTextEditor } from '@/components/rich-text-editor'
import { MediaLibraryDialog } from '@/components/media-library-dialog'
import { RevisionHistoryDialog } from '@/components/revision-history-dialog'
import { TagInput } from '@/components/tag-input'

type ContentType = 'articles' | 'events' | 'library' | 'gallery' | 'organization' | 'announcements'

const CONTENT_TYPES: { id: ContentType; label: string; icon: any; desc: string }[] = [
  { id: 'articles', label: 'Berita & Artikel', icon: FileText, desc: 'Berita kegiatan, artikel, publikasi' },
  { id: 'events', label: 'Agenda Kegiatan', icon: Calendar, desc: 'Webinar, seminar, workshop, pelatihan' },
  { id: 'library', label: 'Digital Library', icon: BookOpen, desc: 'Buku, ebook, jurnal, regulasi' },
  { id: 'gallery', label: 'Galeri Foto', icon: ImageIcon, desc: 'Album & dokumentasi foto' },
  { id: 'organization', label: 'Pengurus', icon: Users, desc: 'Struktur kepengurusan organisasi' },
  { id: 'announcements', label: 'Pengumuman', icon: Megaphone, desc: 'Banner, popup, running text' },
]

export function AdminCMSView() {
  const [active, setActive] = React.useState<ContentType>('articles')

  return (
    <AdminShell
      activeKey="cms"
      title="Manajemen Website Publik"
      subtitle="Kelola seluruh konten website publik: berita, agenda, library, galeri, pengurus, dan pengumuman"
    >
      {/* Content type selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {CONTENT_TYPES.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`group rounded-xl border p-3 text-left transition-all ${
              active === c.id
                ? 'border-gold bg-gold/5 shadow-premium'
                : 'border-border bg-card hover:border-gold/40 hover:shadow-premium'
            }`}
          >
            <div className={`grid h-9 w-9 place-items-center rounded-lg mb-2 transition-colors ${
              active === c.id ? 'bg-navy-gradient text-white' : 'bg-muted text-muted-foreground group-hover:bg-gold/10 group-hover:text-gold'
            }`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="font-semibold text-xs text-navy dark:text-white leading-tight">{c.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{c.desc}</div>
          </button>
        ))}
      </div>

      {/* Active content manager */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {active === 'articles' && <ArticlesManager />}
          {active === 'events' && <EventsManager />}
          {active === 'library' && <LibraryManager />}
          {active === 'gallery' && <GalleryManager />}
          {active === 'organization' && <OrganizationManager />}
          {active === 'announcements' && <AnnouncementsManager />}
        </motion.div>
      </AnimatePresence>
    </AdminShell>
  )
}

// ============ ARTICLES MANAGER ============

interface Article {
  id: string; slug: string; title: string; excerpt: string; content: string
  category: string; tags: string | null; isFeatured: boolean; isPublished: boolean
  publishStatus?: string; scheduledAt?: string | null
  publishedAt: string; viewCount: number; author: { name: string }
  metaDescription?: string | null; ogTitle?: string | null; ogImage?: string | null
}

function ArticlesManager() {
  const { setView } = useApp()
  const [items, setItems] = React.useState<Article[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [editing, setEditing] = React.useState<Article | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/articles?admin=true&limit=100')
      .then((r) => r.json())
      .then((d) => setItems(d.articles ?? []))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const filtered = items.filter((a) => {
    if (!search) return true
    const s = search.toLowerCase()
    return a.title.toLowerCase().includes(s) || a.slug.toLowerCase().includes(s) || a.category.toLowerCase().includes(s)
  })

  const openCreate = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (a: Article) => { setEditing(a); setDialogOpen(true) }

  const remove = async (a: Article) => {
    if (!confirm(`Hapus artikel "${a.title}"?`)) return
    try {
      await fetch(`/api/articles?id=${a.id}`, { method: 'DELETE' })
      toast.success('Artikel dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari berita..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const res = await fetch('/api/cron/publish-scheduled?token=iaa-cron-secret-dev')
                const d = await res.json()
                if (d.ok) {
                  toast.success(d.message || `Cron dijalankan: ${d.published} artikel di-publish`)
                  load()
                } else {
                  toast.error(d.error || 'Gagal menjalankan cron')
                }
              } catch { toast.error('Gagal') }
            }}
            title="Trigger manual auto-publish untuk artikel SCHEDULED yang sudah lewat jadwalnya"
          >
            <Clock className="mr-2 h-3.5 w-3.5" /> Run Cron
          </Button>
          <Button onClick={openCreate} className="bg-navy-gradient">
            <Plus className="mr-2 h-4 w-4" /> Tulis Berita
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="p-6 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileText} label="Belum ada berita" />
        ) : (
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-premium">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="p-4 hover:bg-muted/30 transition-colors flex items-start gap-3"
              >
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-blue-soft/20 text-blue-brand">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="text-[10px] border-blue-soft/40 text-blue-brand">{a.category}</Badge>
                    {a.isFeatured && <Badge variant="outline" className="text-[10px] border-gold/40 text-gold bg-gold/5"><Star className="h-2.5 w-2.5 mr-1" /> Featured</Badge>}
                    {(() => {
                      const status = a.publishStatus || (a.isPublished ? 'PUBLISHED' : 'DRAFT')
                      const meta: Record<string, { label: string; color: string; icon?: any }> = {
                        DRAFT: { label: 'Draft', color: 'border-slate-400/40 text-slate-500' },
                        SCHEDULED: { label: 'Scheduled', color: 'border-orange-400/40 text-orange-600' },
                        PUBLISHED: { label: 'Published', color: 'border-emerald-400/40 text-emerald-600' },
                        ARCHIVED: { label: 'Archived', color: 'border-red-400/40 text-red-600' },
                      }
                      const m = meta[status] || meta.DRAFT
                      return <Badge variant="outline" className={`text-[10px] ${m.color}`}>{m.label}</Badge>
                    })()}
                  </div>
                  <h3 className="font-semibold text-sm text-navy dark:text-white line-clamp-1">{a.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {formatDate(a.publishedAt)}</span>
                    <span className="flex items-center gap-1"><Eye className="h-2.5 w-2.5" /> {a.viewCount} views</span>
                    <span>by {a.author.name}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setView({ name: 'news-detail', slug: a.slug })} title="Lihat publik">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(a)} title="Edit">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => remove(a)} title="Hapus">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>

      <ArticleDialog open={dialogOpen} onOpenChange={setDialogOpen} article={editing} onSaved={() => { setDialogOpen(false); load() }} />
    </Card>
  )
}

function ArticleDialog({ open, onOpenChange, article, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; article: Article | null; onSaved: () => void
}) {
  const { user } = useApp()
  const [form, setForm] = React.useState({
    title: '', excerpt: '', content: '', category: 'Umum', tags: '',
    isFeatured: false, isPublished: true,
    publishStatus: 'PUBLISHED' as 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED',
    scheduledAt: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    slug: '', featuredImage: '',
    // SEO
    metaDescription: '', ogTitle: '', ogImage: '',
    // Author
    authorId: '',
    // Revision note
    changeLog: '',
  })
  const [saving, setSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('content')
  const [mediaPickerOpen, setMediaPickerOpen] = React.useState<null | 'featured' | 'og'>(null)
  const [revisionOpen, setRevisionOpen] = React.useState(false)
  const [authors, setAuthors] = React.useState<{ id: string; name: string; email: string; role: string }[]>([])
  const [tagSuggestions, setTagSuggestions] = React.useState<string[]>([])

  // Load authors (pengurus + admin users) + tag suggestions
  React.useEffect(() => {
    if (open) {
      fetch('/api/tags')
        .then((r) => r.json())
        .then((d) => setTagSuggestions(d.tags ?? []))
        .catch(() => {})
      fetch('/api/members-list')
        .then((r) => r.json())
        .then((d) => {
          // members-list returns members; we also need users. For now use dashboard recentMembers fallback.
          // Actually we need a /api/users-list endpoint. Let's improvise with what we have.
        })
        .catch(() => {})
      // Use the current user + a few seeded ones from dashboard
      fetch('/api/dashboard')
        .then((r) => r.json())
        .then((d) => {
          // dashboard returns recentMembers but with member IDs. We need user IDs.
          // Build a minimal authors list from what we know
          const knownUsers = [
            { id: user?.id || '', name: user?.name || 'Saya', email: user?.email || '', role: user?.role || 'ANGGOTA' },
          ]
          setAuthors(knownUsers)
        })
        .catch(() => setAuthors([{ id: user?.id || '', name: user?.name || 'Saya', email: user?.email || '', role: user?.role || 'ANGGOTA' }]))
    }
  }, [open, user])

  React.useEffect(() => {
    if (article) {
      setForm({
        title: article.title, excerpt: article.excerpt, content: article.content,
        category: article.category, tags: article.tags || '',
        isFeatured: article.isFeatured, isPublished: article.isPublished,
        publishStatus: (article.publishStatus as any) || (article.isPublished ? 'PUBLISHED' : 'DRAFT'),
        scheduledAt: article.scheduledAt ? new Date(article.scheduledAt).toISOString().slice(0, 16) : '',
        publishedAt: new Date(article.publishedAt).toISOString().slice(0, 10),
        slug: article.slug, featuredImage: '',
        metaDescription: article.metaDescription || '', ogTitle: article.ogTitle || '', ogImage: article.ogImage || '',
        authorId: '', changeLog: '',
      })
    } else {
      setForm({
        title: '', excerpt: '', content: '', category: 'Umum', tags: '',
        isFeatured: false, isPublished: true,
        publishStatus: 'PUBLISHED', scheduledAt: '',
        publishedAt: new Date().toISOString().slice(0, 10),
        slug: '', featuredImage: '',
        metaDescription: '', ogTitle: '', ogImage: '',
        authorId: '', changeLog: '',
      })
    }
    setActiveTab('content')
  }, [article, open])

  const handleMediaSelect = (asset: any) => {
    if (mediaPickerOpen === 'featured') {
      setForm({ ...form, featuredImage: asset.url })
    } else if (mediaPickerOpen === 'og') {
      setForm({ ...form, ogImage: asset.url })
    }
    setMediaPickerOpen(null)
  }

  const handleRestoreRevision = (rev: any) => {
    setForm({
      ...form,
      title: rev.title, excerpt: rev.excerpt, content: rev.content,
      changeLog: `Restore dari versi ${rev.version}`,
    })
    toast.info(`Konten di-restore ke versi ${rev.version}. Klik Simpan untuk menyimpan.`)
  }

  const submit = async () => {
    if (!form.title || !form.content) { toast.error('Judul dan konten wajib diisi'); return }
    if (form.publishStatus === 'SCHEDULED' && !form.scheduledAt) {
      toast.error('Tanggal schedule wajib diisi untuk status SCHEDULED')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        // Strip empty strings to null for optional fields
        featuredImage: form.featuredImage || null,
        metaDescription: form.metaDescription || null,
        ogTitle: form.ogTitle || null,
        ogImage: form.ogImage || null,
        scheduledAt: form.scheduledAt || null,
        authorId: form.authorId || null,
        changeLog: form.changeLog || null,
      }
      const url = article ? `/api/articles?id=${article.id}` : '/api/articles'
      const method = article ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(article ? 'Artikel diperbarui' : 'Artikel dibuat')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  const statusMeta: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Draft', color: 'border-slate-400/40 text-slate-600' },
    SCHEDULED: { label: 'Scheduled', color: 'border-orange-400/40 text-orange-600' },
    PUBLISHED: { label: 'Published', color: 'border-emerald-400/40 text-emerald-600' },
    ARCHIVED: { label: 'Archived', color: 'border-red-400/40 text-red-600' },
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-2 text-navy dark:text-white">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gold" /> {article ? 'Edit Berita' : 'Tulis Berita Baru'}
              </span>
              {article && (
                <Button variant="outline" size="sm" onClick={() => setRevisionOpen(true)}>
                  <History className="mr-2 h-3.5 w-3.5" /> Riwayat Revisi
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="content" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Konten</TabsTrigger>
              <TabsTrigger value="publish" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Publish & Schedule</TabsTrigger>
              <TabsTrigger value="seo" className="gap-1.5"><SeoIcon className="h-3.5 w-3.5" /> SEO</TabsTrigger>
              <TabsTrigger value="media" className="gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Media</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto scrollbar-premium py-4">
              {/* CONTENT TAB */}
              <TabsContent value="content" className="space-y-4 mt-0">
                <Field label="Judul *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Judul berita..." />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Umum, Kegiatan, Pelatihan..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <TagInput
                      value={form.tags}
                      onChange={(v) => setForm({ ...form, tags: v })}
                      suggestions={tagSuggestions}
                      placeholder="kearsipan, webinar, 2026"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ringkasan (Excerpt)</Label>
                  <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Ringkasan singkat berita..." />
                  <p className="text-[10px] text-muted-foreground">{form.excerpt.length}/300 karakter — gunakan untuk preview di list berita & SEO default</p>
                </div>
                <div className="space-y-2">
                  <Label>Konten *</Label>
                  <RichTextEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} placeholder="Tulis konten lengkap berita... (Markdown supported: **bold**, *italic*, # heading, - list, > quote, [link](url))" />
                </div>
                <div className="space-y-2">
                  <Label>Catatan Revisi (opsional)</Label>
                  <Input value={form.changeLog} onChange={(e) => setForm({ ...form, changeLog: e.target.value })} placeholder="Catatan singkat perubahan ini untuk riwayat revisi" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" />
                  <span className="text-sm flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-gold" /> Featured (tampil di highlight beranda)</span>
                </label>
              </TabsContent>

              {/* PUBLISH & SCHEDULE TAB */}
              <TabsContent value="publish" className="space-y-4 mt-0">
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-navy dark:text-white mb-2">Status Publikasi</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'] as const).map((s) => {
                        const meta = statusMeta[s]
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setForm({ ...form, publishStatus: s })}
                            className={`rounded-lg border p-3 text-left transition-all ${
                              form.publishStatus === s
                                ? 'border-gold bg-gold/5 shadow-premium'
                                : 'border-border hover:border-gold/40'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-navy dark:text-white">{meta.label}</span>
                              {form.publishStatus === s && <Check className="h-3 w-3 text-gold" />}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              {s === 'DRAFT' && 'Tidak tampil publik'}
                              {s === 'PUBLISHED' && 'Langsung tampil publik'}
                              {s === 'SCHEDULED' && 'Auto-publish di tanggal'}
                              {s === 'ARCHIVED' && 'Disembunyikan dari publik'}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {form.publishStatus === 'SCHEDULED' && (
                    <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-orange-700 dark:text-orange-300">
                        <Clock className="h-3.5 w-3.5" /> Artikel akan otomatis dipublikasi pada tanggal:
                      </div>
                      <Input
                        type="datetime-local"
                        value={form.scheduledAt}
                        onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                        className="bg-background"
                      />
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tanggal Publikasi</Label>
                      <Input type="date" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
                      <p className="text-[10px] text-muted-foreground">Tanggal terbit artikel (untuk urutan list)</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Slug (URL)</Label>
                      <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="otomatis dari judul" className="font-mono text-xs" />
                      <p className="text-[10px] text-muted-foreground">URL: /berita/{form.slug || 'auto-generated'}</p>
                    </div>
                  </div>
                </div>

                {/* Author */}
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-sm text-navy dark:text-white mb-2 flex items-center gap-1.5">
                    <UserCircle className="h-4 w-4 text-gold" /> Penulis
                  </h4>
                  <Select
                    value={form.authorId || user?.id || ''}
                    onValueChange={(v) => setForm({ ...form, authorId: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Pilih penulis..." /></SelectTrigger>
                    <SelectContent>
                      {authors.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} ({a.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">Default: akun Anda. Hubungkan ke anggota lain via admin Settings untuk multi-author penuh.</p>
                </div>
              </TabsContent>

              {/* SEO TAB */}
              <TabsContent value="seo" className="space-y-4 mt-0">
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gold" />
                    <h4 className="font-semibold text-sm text-navy dark:text-white">SEO Metadata</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Konfigurasi metadata untuk search engine & social media sharing. Kosongkan untuk menggunakan default.</p>

                  <div className="space-y-2">
                    <Label>Meta Description</Label>
                    <Textarea
                      rows={2}
                      value={form.metaDescription}
                      onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      placeholder={form.excerpt || 'Otomatis dari excerpt...'}
                    />
                    <p className="text-[10px] text-muted-foreground">{form.metaDescription.length}/160 karakter — direkomendasikan 150-160</p>
                  </div>

                  <div className="space-y-2">
                    <Label>OpenGraph Title</Label>
                    <Input value={form.ogTitle} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} placeholder={form.title || 'Otomatis dari judul...'} />
                  </div>

                  <div className="space-y-2">
                    <Label>OpenGraph Image URL</Label>
                    <div className="flex gap-2">
                      <Input value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} placeholder={form.featuredImage || '/default-og.jpg'} />
                      <Button type="button" variant="outline" size="sm" onClick={() => setMediaPickerOpen('og')}>
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* SEO Preview */}
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-semibold text-sm text-navy dark:text-white mb-3 flex items-center gap-1.5">
                    <FileSearch className="h-4 w-4 text-gold" /> Preview (Google Search)
                  </h4>
                  <div className="rounded-lg bg-white p-3 shadow-sm border border-border">
                    <div className="text-xs text-emerald-700 truncate">
                      https://iaa-anri.go.id/berita/{form.slug || 'judul-berita'}
                    </div>
                    <div className="text-base text-blue-700 font-medium mt-0.5 truncate">
                      {form.ogTitle || form.title || 'Judul Berita'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {form.metaDescription || form.excerpt || 'Meta description akan muncul di sini. Isi field di atas untuk customisasi.'}
                    </div>
                  </div>

                  <h4 className="font-semibold text-sm text-navy dark:text-white mt-4 mb-3 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-gold" /> Preview (Social Media)
                  </h4>
                  <div className="rounded-lg overflow-hidden border border-border bg-white max-w-sm">
                    <div className="aspect-video bg-muted grid place-items-center overflow-hidden">
                      {form.ogImage || form.featuredImage ? (
                         
                        <img src={form.ogImage || form.featuredImage} alt="OG preview" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] text-muted-foreground uppercase">iaa-anri.go.id</div>
                      <div className="text-sm font-semibold text-navy line-clamp-2 mt-0.5">{form.ogTitle || form.title || 'Judul Berita'}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{form.metaDescription || form.excerpt || ''}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* MEDIA TAB */}
              <TabsContent value="media" className="space-y-4 mt-0">
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-navy dark:text-white flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-gold" /> Featured Image
                  </h4>
                  <p className="text-xs text-muted-foreground">Gambar utama yang tampil di card berita di beranda & list berita.</p>
                  <div className="grid sm:grid-cols-[200px_1fr] gap-3">
                    <div className="aspect-video rounded-lg border border-border bg-muted overflow-hidden grid place-items-center">
                      {form.featuredImage ? (
                         
                        <img src={form.featuredImage} alt="Featured" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} placeholder="URL gambar atau pilih dari media library" />
                      <Button type="button" variant="outline" size="sm" onClick={() => setMediaPickerOpen('featured')}>
                        <ImagePlus className="mr-2 h-3.5 w-3.5" /> Pilih dari Media Library
                      </Button>
                      {form.featuredImage && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, featuredImage: '' })} className="text-red-600 ml-2">
                          <X className="h-3.5 w-3.5" /> Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-gold" />
                    <span><strong>Media Library</strong> menyimpan semua file yang diunggah. Akses via tombol di atas untuk upload gambar baru atau pilih yang sudah ada.</span>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
              <Badge variant="outline" className={statusMeta[form.publishStatus].color}>
                {statusMeta[form.publishStatus].label}
              </Badge>
              {form.publishStatus === 'SCHEDULED' && form.scheduledAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {new Date(form.scheduledAt).toLocaleString('id-ID')}
                </span>
              )}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Library Picker */}
      <MediaLibraryDialog
        open={mediaPickerOpen !== null}
        onOpenChange={(o) => !o && setMediaPickerOpen(null)}
        onSelect={handleMediaSelect}
        filterType="image"
      />

      {/* Revision History */}
      {article && (
        <RevisionHistoryDialog
          open={revisionOpen}
          onOpenChange={setRevisionOpen}
          articleId={article.id}
          currentTitle={form.title}
          currentContent={form.content}
          onRestore={handleRestoreRevision}
        />
      )}
    </>
  )
}

// ============ EVENTS MANAGER ============

interface EventItem {
  id: string; slug: string; title: string; description: string; eventType: string
  location: string; startDate: string; endDate: string; quota: number
  registeredCount: number; isRegistrationOpen: boolean; isPublished: boolean
}

const EVENT_TYPES = ['SEMINAR', 'WORKSHOP', 'WEBINAR', 'RAPAT', 'PELATIHAN', 'LOMBA']

function EventsManager() {
  const { setView } = useApp()
  const [items, setItems] = React.useState<EventItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [editing, setEditing] = React.useState<EventItem | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/events?admin=true&limit=100')
      .then((r) => r.json())
      .then((d) => setItems(d.events ?? []))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const filtered = items.filter((e) => {
    if (!search) return true
    const s = search.toLowerCase()
    return e.title.toLowerCase().includes(s) || e.eventType.toLowerCase().includes(s) || e.location.toLowerCase().includes(s)
  })

  const remove = async (e: EventItem) => {
    if (!confirm(`Hapus kegiatan "${e.title}"?`)) return
    try {
      await fetch(`/api/events?id=${e.id}`, { method: 'DELETE' })
      toast.success('Kegiatan dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari kegiatan..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }} className="bg-navy-gradient">
            <Plus className="mr-2 h-4 w-4" /> Tambah Kegiatan
          </Button>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Calendar} label="Belum ada kegiatan" />
        ) : (
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-premium">
            {filtered.map((e, i) => (
              <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="p-4 hover:bg-muted/30 flex items-start gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="text-[10px]">{e.eventType}</Badge>
                    {e.isRegistrationOpen ? (
                      <Badge variant="outline" className="text-[10px] border-emerald-400/40 text-emerald-600">Pendaftaran Dibuka</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-red-400/40 text-red-600">Pendaftaran Ditutup</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">{e.registeredCount}/{e.quota} peserta</Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-navy dark:text-white line-clamp-1">{e.title}</h3>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {formatDate(e.startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {e.location}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setView({ name: 'event-detail', slug: e.slug })} title="Lihat publik">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditing(e); setDialogOpen(true) }} title="Edit">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => remove(e)} title="Hapus">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>

      <EventDialog open={dialogOpen} onOpenChange={setDialogOpen} event={editing} onSaved={() => { setDialogOpen(false); load() }} />
    </Card>
  )
}

function EventDialog({ open, onOpenChange, event, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; event: EventItem | null; onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    title: '', description: '', eventType: 'WEBINAR', location: '',
    startDate: '', endDate: '', quota: 100, isRegistrationOpen: true, isPublished: true,
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (event) {
      setForm({
        title: event.title, description: event.description, eventType: event.eventType,
        location: event.location,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        quota: event.quota, isRegistrationOpen: event.isRegistrationOpen, isPublished: event.isPublished,
      })
    } else {
      setForm({
        title: '', description: '', eventType: 'WEBINAR', location: '',
        startDate: '', endDate: '', quota: 100, isRegistrationOpen: true, isPublished: true,
      })
    }
  }, [event, open])

  const submit = async () => {
    if (!form.title || !form.location || !form.startDate) { toast.error('Judul, lokasi, dan tanggal mulai wajib diisi'); return }
    setSaving(true)
    try {
      const url = event ? `/api/events?id=${event.id}` : '/api/events'
      const method = event ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(event ? 'Kegiatan diperbarui' : 'Kegiatan dibuat')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-premium">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Calendar className="h-5 w-5 text-gold" /> {event ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Judul *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Judul kegiatan..." />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipe Kegiatan</Label>
              <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kuota Peserta</Label>
              <Input type="number" value={form.quota} onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })} min={1} />
            </div>
          </div>
          <Field label="Lokasi *" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Tempat/Zoom/URL..." />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tanggal & Waktu Mulai *</Label>
              <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tanggal & Waktu Selesai</Label>
              <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <RichTextEditor value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Deskripsi kegiatan... (Markdown supported)" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isRegistrationOpen} onChange={(e) => setForm({ ...form, isRegistrationOpen: e.target.checked })} className="rounded" />
              <span className="text-sm">Pendaftaran Dibuka</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="rounded" />
              <span className="text-sm">Published</span>
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ LIBRARY MANAGER ============

interface LibItem {
  id: string; title: string; slug: string; description: string; category: string
  author: string | null; publisher: string | null; year: number | null; pages: number | null
  tags: string | null; downloadCount: number; viewCount: number
}

const LIB_CATEGORIES = ['BUKU', 'EBOOK', 'JURNAL', 'PEDOMAN', 'REGULASI', 'SOP', 'TEMPLATE', 'PRESENTASI', 'MAJALAH', 'VIDEO', 'AUDIO']

function LibraryManager() {
  const { setView } = useApp()
  const [items, setItems] = React.useState<LibItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [filterCat, setFilterCat] = React.useState('ALL')
  const [editing, setEditing] = React.useState<LibItem | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/library?admin=true&limit=100')
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const filtered = items.filter((i) => {
    if (filterCat !== 'ALL' && i.category !== filterCat) return false
    if (search) {
      const s = search.toLowerCase()
      if (!i.title.toLowerCase().includes(s) && !i.author?.toLowerCase().includes(s)) return false
    }
    return true
  })

  const remove = async (i: LibItem) => {
    if (!confirm(`Hapus koleksi "${i.title}"?`)) return
    try {
      await fetch(`/api/library?id=${i.id}`, { method: 'DELETE' })
      toast.success('Koleksi dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari koleksi..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="sm:w-[180px]"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kategori</SelectItem>
              {LIB_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }} className="bg-navy-gradient">
            <Plus className="mr-2 h-4 w-4" /> Tambah Koleksi
          </Button>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={BookOpen} label="Belum ada koleksi" />
        ) : (
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-premium">
            {filtered.map((i, idx) => (
              <motion.div key={i.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} className="p-4 hover:bg-muted/30 flex items-start gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="text-[10px]">{i.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">{i.year ?? '-'}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-navy dark:text-white line-clamp-1">{i.title}</h3>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {i.author ?? 'Unknown'} · {i.downloadCount} downloads · {i.viewCount} views
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setView({ name: 'library' })} title="Lihat publik">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditing(i); setDialogOpen(true) }} title="Edit">
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => remove(i)} title="Hapus">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>

      <LibraryDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editing} onSaved={() => { setDialogOpen(false); load() }} />
    </Card>
  )
}

function LibraryDialog({ open, onOpenChange, item, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; item: LibItem | null; onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    title: '', description: '', category: 'BUKU', author: '', publisher: '',
    year: '', pages: '', tags: '', fileUrl: '', fileSize: '',
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (item) {
      setForm({
        title: item.title, description: item.description, category: item.category,
        author: item.author || '', publisher: item.publisher || '',
        year: item.year?.toString() || '', pages: item.pages?.toString() || '',
        tags: item.tags || '', fileUrl: '', fileSize: '',
      })
    } else {
      setForm({ title: '', description: '', category: 'BUKU', author: '', publisher: '', year: '', pages: '', tags: '', fileUrl: '', fileSize: '' })
    }
  }, [item, open])

  const submit = async () => {
    if (!form.title) { toast.error('Judul wajib diisi'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        year: form.year ? Number(form.year) : null,
        pages: form.pages ? Number(form.pages) : null,
        fileSize: form.fileSize ? Number(form.fileSize) : null,
      }
      const url = item ? `/api/library?id=${item.id}` : '/api/library'
      const method = item ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(item ? 'Koleksi diperbarui' : 'Koleksi dibuat')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-premium">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <BookOpen className="h-5 w-5 text-gold" /> {item ? 'Edit Koleksi' : 'Tambah Koleksi Baru'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Judul *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LIB_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Field label="Tahun" value={form.year} onChange={(v) => setForm({ ...form, year: v })} type="number" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Penulis" value={form.author} onChange={(v) => setForm({ ...form, author: v })} />
            <Field label="Penerbit" value={form.publisher} onChange={(v) => setForm({ ...form, publisher: v })} />
          </div>
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <RichTextEditor value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Deskripsi koleksi... (Markdown supported)" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Jumlah Halaman" value={form.pages} onChange={(v) => setForm({ ...form, pages: v })} type="number" />
            <Field label="Tags" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} placeholder="regulasi, kearsipan" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="URL File" value={form.fileUrl} onChange={(v) => setForm({ ...form, fileUrl: v })} placeholder="/uploads/file.pdf" />
            <Field label="Ukuran File (bytes)" value={form.fileSize} onChange={(v) => setForm({ ...form, fileSize: v })} type="number" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ GALLERY MANAGER ============

function GalleryManager() {
  const [albums, setAlbums] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/gallery?admin=true')
      .then((r) => r.json())
      .then((d) => setAlbums(d.albums ?? []))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const remove = async (a: any) => {
    if (!confirm(`Hapus album "${a.title}"? Semua foto di dalamnya akan ikut terhapus.`)) return
    try {
      await fetch(`/api/gallery?id=${a.id}`, { method: 'DELETE' })
      toast.success('Album dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-sm text-navy dark:text-white">Album Galeri</h3>
            <p className="text-xs text-muted-foreground">{albums.length} album terdaftar</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }} className="bg-navy-gradient">
            <Plus className="mr-2 h-4 w-4" /> Tambah Album
          </Button>
        </div>

        {loading ? (
          <div className="p-6 grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : albums.length === 0 ? (
          <EmptyState icon={ImageIcon} label="Belum ada album" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 p-4">
            {albums.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="overflow-hidden hover:shadow-premium transition-shadow">
                  <div className="relative h-32 bg-navy-gradient overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <div className="absolute inset-0 grid place-items-center">
                      <ImageIcon className="h-10 w-10 text-white/40" />
                    </div>
                    <Badge className="absolute top-2 right-2 bg-white/20 text-white border-white/30 backdrop-blur text-[10px]">{a._count?.photos ?? 0} foto</Badge>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm text-navy dark:text-white line-clamp-1">{a.title}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{a.description || 'Tanpa deskripsi'}</p>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="outline" className="h-7 flex-1 text-[10px]" onClick={() => { setEditing(a); setDialogOpen(true) }}>
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600" onClick={() => remove(a)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>

      <AlbumDialog open={dialogOpen} onOpenChange={setDialogOpen} album={editing} onSaved={() => { setDialogOpen(false); load() }} />
    </Card>
  )
}

function AlbumDialog({ open, onOpenChange, album, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; album: any | null; onSaved: () => void
}) {
  const [form, setForm] = React.useState({ title: '', description: '', coverImage: '' })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (album) {
      setForm({ title: album.title, description: album.description || '', coverImage: album.coverImage || '' })
    } else {
      setForm({ title: '', description: '', coverImage: '' })
    }
  }, [album, open])

  const submit = async () => {
    if (!form.title) { toast.error('Judul album wajib diisi'); return }
    setSaving(true)
    try {
      const url = album ? `/api/gallery?id=${album.id}` : '/api/gallery'
      const method = album ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(album ? 'Album diperbarui' : 'Album dibuat')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <ImageIcon className="h-5 w-5 text-gold" /> {album ? 'Edit Album' : 'Tambah Album'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Judul *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Field label="Cover Image URL" value={form.coverImage} onChange={(v) => setForm({ ...form, coverImage: v })} placeholder="https://..." />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ ORGANIZATION MANAGER ============

interface OrgMember {
  id: string; name: string; position: string; category: string; photo: string | null
  bio: string | null; order: number; isActive: boolean
}

function OrganizationManager() {
  const { setView } = useApp()
  const [items, setItems] = React.useState<OrgMember[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<OrgMember | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/organization?admin=true')
      .then((r) => r.json())
      .then((d) => setItems(d.members ?? []))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const remove = async (m: OrgMember) => {
    if (!confirm(`Hapus pengurus "${m.name}"?`)) return
    try {
      await fetch(`/api/organization?id=${m.id}`, { method: 'DELETE' })
      toast.success('Pengurus dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-sm text-navy dark:text-white">Struktur Pengurus</h3>
            <p className="text-xs text-muted-foreground">{items.length} pengurus terdaftar</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView({ name: 'organization' })}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> Lihat Publik
            </Button>
            <Button onClick={() => { setEditing(null); setDialogOpen(true) }} className="bg-navy-gradient">
              <Plus className="mr-2 h-4 w-4" /> Tambah Pengurus
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Users} label="Belum ada pengurus" />
        ) : (
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-premium">
            {items.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="p-4 hover:bg-muted/30 flex items-center gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-navy-gradient text-white text-xs font-semibold">
                  {m.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm text-navy dark:text-white">{m.name}</span>
                    <Badge variant="outline" className="text-[10px]">{m.category}</Badge>
                    {!m.isActive && <Badge variant="outline" className="text-[10px] border-slate-400/40 text-slate-500">Nonaktif</Badge>}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{m.position} · urutan #{m.order}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditing(m); setDialogOpen(true) }}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => remove(m)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>

      <OrgMemberDialog open={dialogOpen} onOpenChange={setDialogOpen} member={editing} onSaved={() => { setDialogOpen(false); load() }} />
    </Card>
  )
}

function OrgMemberDialog({ open, onOpenChange, member, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; member: OrgMember | null; onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    name: '', position: '', category: 'Pengurus Pusat', photo: '', bio: '', order: 1, isActive: true,
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (member) {
      setForm({
        name: member.name, position: member.position, category: member.category,
        photo: member.photo || '', bio: member.bio || '', order: member.order, isActive: member.isActive,
      })
    } else {
      setForm({ name: '', position: '', category: 'Pengurus Pusat', photo: '', bio: '', order: 1, isActive: true })
    }
  }, [member, open])

  const submit = async () => {
    if (!form.name || !form.position) { toast.error('Nama dan jabatan wajib diisi'); return }
    setSaving(true)
    try {
      const url = member ? `/api/organization?id=${member.id}` : '/api/organization'
      const method = member ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(member ? 'Pengurus diperbarui' : 'Pengurus ditambahkan')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Users className="h-5 w-5 text-gold" /> {member ? 'Edit Pengurus' : 'Tambah Pengurus'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Nama Lengkap *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Jabatan *" value={form.position} onChange={(v) => setForm({ ...form, position: v })} placeholder="Ketua Umum, Sekretaris, dll" />
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Pengurus Pusat', 'Bidang', 'Dewan Pembina', 'Dewan Kehormatan'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Field label="Urutan" value={String(form.order)} onChange={(v) => setForm({ ...form, order: Number(v) || 1 })} type="number" />
          </div>
          <div className="space-y-2">
            <Label>Bio Singkat</Label>
            <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <Field label="Photo URL" value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} placeholder="https://..." />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
            <span className="text-sm">Aktif (tampil di website publik)</span>
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ ANNOUNCEMENTS MANAGER ============

interface AnnItem {
  id: string; title: string; content: string; type: string; isPinned: boolean; isPopup: boolean
  startDate: string; endDate: string | null
}

const ANN_TYPES = [
  { value: 'BANNER', label: 'Banner (sticky di atas header)' },
  { value: 'POPUP', label: 'Popup (modal full-screen)' },
  { value: 'RUNNING_TEXT', label: 'Running Text (marquee di bawah header)' },
  { value: 'PINNED', label: 'Pinned (banner dengan indikator pin)' },
]

function AnnouncementsManager() {
  const [items, setItems] = React.useState<AnnItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [editing, setEditing] = React.useState<AnnItem | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    fetch('/api/announcements?admin=true')
      .then((r) => r.json())
      .then((d) => setItems(d.announcements ?? []))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const remove = async (a: AnnItem) => {
    if (!confirm(`Hapus pengumuman "${a.title}"?`)) return
    try {
      await fetch(`/api/announcements?id=${a.id}`, { method: 'DELETE' })
      toast.success('Pengumuman dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  const typeMeta = (t: string) => ANN_TYPES.find((x) => x.value === t) ?? ANN_TYPES[0]
  const isActive = (a: AnnItem) => {
    const now = new Date()
    if (new Date(a.startDate) > now) return false
    if (a.endDate && new Date(a.endDate) < now) return false
    return true
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-sm text-navy dark:text-white">Pengumuman</h3>
            <p className="text-xs text-muted-foreground">{items.length} pengumuman terdaftar</p>
          </div>
          <Button onClick={() => { setEditing(null); setDialogOpen(true) }} className="bg-navy-gradient">
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengumuman
          </Button>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Megaphone} label="Belum ada pengumuman" />
        ) : (
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-premium">
            {items.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="p-4 hover:bg-muted/30 flex items-start gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-gold/15 text-gold">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                    {a.isPinned && <Badge variant="outline" className="text-[10px] border-gold/40 text-gold"><Pin className="h-2.5 w-2.5 mr-1" /> Pinned</Badge>}
                    {a.isPopup && <Badge variant="outline" className="text-[10px] border-purple-400/40 text-purple-600">Popup</Badge>}
                    <Badge variant="outline" className={`text-[10px] ${isActive(a) ? 'border-emerald-400/40 text-emerald-600' : 'border-slate-400/40 text-slate-500'}`}>
                      {isActive(a) ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm text-navy dark:text-white line-clamp-1">{a.title}</h3>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{a.content}</p>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {formatDate(a.startDate)} → {a.endDate ? formatDate(a.endDate) : 'Tanpa batas'}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setEditing(a); setDialogOpen(true) }}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => remove(a)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>

      <AnnDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editing} onSaved={() => { setDialogOpen(false); load() }} />
    </Card>
  )
}

function AnnDialog({ open, onOpenChange, item, onSaved }: {
  open: boolean; onOpenChange: (o: boolean) => void; item: AnnItem | null; onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    title: '', content: '', type: 'BANNER', isPinned: false, isPopup: false,
    startDate: new Date().toISOString().slice(0, 10), endDate: '',
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (item) {
      setForm({
        title: item.title, content: item.content, type: item.type,
        isPinned: item.isPinned, isPopup: item.isPopup,
        startDate: new Date(item.startDate).toISOString().slice(0, 10),
        endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : '',
      })
    } else {
      setForm({
        title: '', content: '', type: 'BANNER', isPinned: false, isPopup: false,
        startDate: new Date().toISOString().slice(0, 10), endDate: '',
      })
    }
  }, [item, open])

  const submit = async () => {
    if (!form.title || !form.content) { toast.error('Judul dan konten wajib diisi'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        endDate: form.endDate || null,
        isPopup: form.type === 'POPUP' || form.isPopup,
      }
      const url = item ? `/api/announcements?id=${item.id}` : '/api/announcements'
      const method = item ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menyimpan'); return }
      toast.success(item ? 'Pengumuman diperbarui' : 'Pengumuman dibuat')
      onSaved()
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <Megaphone className="h-5 w-5 text-gold" /> {item ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Field label="Judul *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <div className="space-y-2">
            <Label>Tipe</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ANN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Konten *</Label>
            <Textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Tanggal Mulai" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} type="date" />
            <Field label="Tanggal Selesai (opsional)" value={form.endDate} onChange={(v) => setForm({ ...form, endDate: v })} type="date" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} className="rounded" />
              <span className="text-sm">Pinned</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPopup} onChange={(e) => setForm({ ...form, isPopup: e.target.checked })} className="rounded" />
              <span className="text-sm">Popup</span>
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={submit} disabled={saving} className="bg-navy-gradient">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============ SHARED COMPONENTS ============

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
