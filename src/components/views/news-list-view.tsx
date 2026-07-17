'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Calendar, User, Clock, Search, FileText, ArrowRight, Eye } from 'lucide-react'
import { formatDate, timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'

interface Article {
  id: string; slug: string; title: string; excerpt: string; category: string
  publishedAt: string; isFeatured: boolean; author: { name: string }; viewCount: number
}

export function NewsListView() {
  const { setView } = useApp()
  const [articles, setArticles] = React.useState<Article[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState('ALL')

  React.useEffect(() => {
    fetch('/api/articles?limit=50')
      .then((r) => r.json())
      .then((d) => setArticles(d.articles ?? []))
      .finally(() => setLoading(false))
  }, [])

  const cats = React.useMemo(() => {
    const s = new Set(articles.map((a) => a.category))
    return ['ALL', ...Array.from(s)]
  }, [articles])

  const filtered = articles.filter((a) => {
    if (category !== 'ALL' && a.category !== category) return false
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.excerpt.toLowerCase().includes(search.toLowerCase())) return false
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
          <Badge className="bg-gold text-navy hover:bg-gold mb-3">Berita & Artikel</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold">Kabar Terbaru IAA</h1>
          <p className="text-white/70 mt-2 max-w-2xl">Berita kegiatan, pengumuman, publikasi ilmiah, dan artikel kearsipan terkini</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari artikel..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-premium pb-1">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  category === c ? 'bg-navy-gradient text-white' : 'bg-card border border-border text-foreground/70 hover:border-gold/40'
                }`}
              >
                {c === 'ALL' ? 'Semua' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada artikel ditemukan</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="group h-full overflow-hidden border-border hover:border-gold/40 hover:shadow-premium hover:-translate-y-1 transition-all cursor-pointer"
                  onClick={() => setView({ name: 'news-detail', slug: a.slug })}
                >
                  <div className="relative h-44 bg-navy-gradient overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <div className="absolute inset-0 flex items-center justify-center p-5">
                      <span className="text-white font-display font-bold text-center line-clamp-3">{a.title.slice(0, 80)}</span>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-gold text-navy hover:bg-gold text-[10px]">{a.category}</Badge>
                    {a.isFeatured && (
                      <Badge className="absolute top-3 right-3 bg-white/20 text-white border-white/30 backdrop-blur text-[10px]">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(a.publishedAt)}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {a.viewCount}</span>
                    </div>
                    <h3 className="font-semibold text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{a.excerpt}</p>
                    <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground border-t border-border">
                      <User className="h-3 w-3" /> {a.author.name}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
