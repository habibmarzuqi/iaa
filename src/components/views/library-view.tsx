'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, BookOpen, Download, Eye, FileText, BookMarked, Scale, FileCheck, File, Presentation, Newspaper, Video, Headphones, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface LibItem {
  id: string; title: string; slug: string; description: string; category: string
  author: string | null; publisher: string | null; year: number | null; pages: number | null
  downloadCount: number; viewCount: number
}

const CAT_ICONS: Record<string, any> = {
  BUKU: BookOpen, EBOOK: BookMarked, JURNAL: FileText, PEDOMAN: BookOpen,
  REGULASI: Scale, SOP: FileCheck, TEMPLATE: File, PRESENTASI: Presentation,
  MAJALAH: Newspaper, VIDEO: Video, AUDIO: Headphones,
}

const CAT_COLORS: Record<string, string> = {
  BUKU: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  EBOOK: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  JURNAL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  PEDOMAN: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  REGULASI: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  SOP: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  TEMPLATE: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  PRESENTASI: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  MAJALAH: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  VIDEO: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  AUDIO: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
}

export function LibraryView() {
  const { setView } = useApp()
  const [items, setItems] = React.useState<LibItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('ALL')
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    fetch('/api/library?limit=50')
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false))
  }, [])

  const cats = ['ALL', 'BUKU', 'EBOOK', 'JURNAL', 'PEDOMAN', 'REGULASI', 'SOP', 'TEMPLATE', 'PRESENTASI', 'MAJALAH', 'VIDEO', 'AUDIO']
  const filtered = items.filter((i) => {
    if (filter !== 'ALL' && i.category !== filter) return false
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <PublicLayout>
      <div className="bg-hero-gradient text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" onClick={() => setView({ name: 'public' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
          <Badge className="bg-gold text-navy hover:bg-gold mb-3">Digital Library</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold">Pusat Pengetahuan Kearsipan</h1>
          <p className="text-white/70 mt-2 max-w-2xl">Koleksi buku, ebook, jurnal, regulasi, SOP, template, dan publikasi kearsipan</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari koleksi..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-premium pb-2 mb-8">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === c ? 'bg-navy-gradient text-white' : 'bg-card border border-border text-foreground/70 hover:border-gold/40'
              }`}
            >
              {c === 'ALL' ? 'Semua Kategori' : c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada koleksi ditemukan</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => {
              const Icon = CAT_ICONS[item.category] ?? FileText
              const colorClass = CAT_COLORS[item.category] ?? 'bg-muted text-muted-foreground'
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group h-full border-border hover:border-gold/40 hover:shadow-premium hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className={`text-[10px] uppercase tracking-wide mb-1 ${colorClass} border-transparent`}>{item.category}</Badge>
                          <h3 className="font-semibold text-sm text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-2">{item.title}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] text-muted-foreground">
                        <span className="truncate">{item.author ?? '—'} {item.year ? `· ${item.year}` : ''}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {item.viewCount.toLocaleString('id-ID')}</span>
                          <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {item.downloadCount.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-gold/40 text-gold hover:bg-gold/10"
                        onClick={(e) => { e.stopPropagation(); toast.info('Unduh akan segera tersedia') }}
                      >
                        <Download className="mr-2 h-3.5 w-3.5" /> Unduh
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
