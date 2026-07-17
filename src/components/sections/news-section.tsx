'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/helpers'
import { ArrowRight, Calendar, User, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Article {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  publishedAt: string
  isFeatured: boolean
  author: { name: string }
}

export function NewsSection() {
  const { setView } = useApp()
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    fetch('/api/articles?limit=4')
      .then((r) => r.json())
      .then((d) => setArticles(d.articles ?? []))
      .catch(() => {})
  }, [])

  const featured = articles.find((a) => a.isFeatured) ?? articles[0]
  const others = articles.filter((a) => a.id !== featured?.id).slice(0, 3)

  if (!featured) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="h-80 rounded-2xl bg-muted animate-pulse" />
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider">
              Berita & Artikel
            </span>
            <h2 className="font-display text-3xl lg:text-4xl font-extrabold mt-4 text-navy dark:text-white">
              Kabar Terbaru IAA
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Berita kegiatan, pengumuman, artikel ilmiah, dan publikasi terkini dari organisasi
            </p>
          </div>
          <Button variant="outline" onClick={() => setView({ name: 'news-list' })} className="border-gold/40 text-gold hover:bg-gold/10">
            Semua Berita <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Featured */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              className="group h-full overflow-hidden border-border hover:border-gold/40 hover:shadow-premium transition-all cursor-pointer"
              onClick={() => setView({ name: 'news-detail', slug: featured.slug })}
            >
              <div className="relative h-56 overflow-hidden bg-navy-gradient">
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center text-white/90 font-display font-bold text-2xl px-6 text-center">
                  {featured.title.slice(0, 60)}{featured.title.length > 60 ? '…' : ''}
                </div>
                <Badge className="absolute top-4 left-4 bg-gold text-navy hover:bg-gold font-semibold">
                  Featured
                </Badge>
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline" className="border-blue-soft/40 text-blue-brand">{featured.category}</Badge>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(featured.publishedAt)}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-2">
                  {featured.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>
                <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{featured.author.name}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Others */}
          <div className="grid gap-4">
            {others.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card
                  className="group flex items-start gap-4 border-border hover:border-gold/40 hover:shadow-premium transition-all cursor-pointer p-4"
                  onClick={() => setView({ name: 'news-detail', slug: a.slug })}
                >
                  <div className="grid h-20 w-20 flex-shrink-0 place-items-center rounded-lg bg-navy-gradient text-white">
                    <span className="text-2xl font-extrabold font-display">{new Date(a.publishedAt).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="border-blue-soft/40 text-blue-brand text-[10px]">{a.category}</Badge>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(a.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{a.excerpt}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
