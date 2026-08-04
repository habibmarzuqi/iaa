'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Calendar, User, Clock, Eye, Share2, ArrowRight, BookOpen } from 'lucide-react'
import { formatDate, timeAgo } from '@/lib/helpers'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface Article {
  id: string; slug: string; title: string; excerpt: string; content: string
  category: string; tags: string | null; publishedAt: string; isFeatured: boolean
  author: { name: string; email: string }; viewCount: number
}

export function NewsDetailView({ slug }: { slug: string }) {
  const { setView, goBack } = useApp()
  const [article, setArticle] = React.useState<Article | null>(null)
  const [related, setRelated] = React.useState<Article[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/articles?slug=${slug}`).then((r) => r.json()),
      fetch('/api/articles?limit=4').then((r) => r.json()),
    ])
      .then(([d, r]) => {
        if (d.article) {
          setArticle(d.article)
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.searchParams.set('news', d.article.slug)
            window.history.replaceState({}, '', url.toString())
          }
        }
        setRelated((r.articles ?? []).filter((a: Article) => a.slug !== slug).slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleShare = async () => {
    if (!article) return
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?news=${article.slug}`
      : `https://iaa-digital.org/?news=${article.slug}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.title,
          url: shareUrl,
        })
        return
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Tautan artikel berhasil disalin: ' + shareUrl)
    } catch {
      toast.error('Gagal menyalin tautan')
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 lg:px-8 py-10 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PublicLayout>
    )
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Artikel tidak ditemukan</h2>
          <Button onClick={() => setView({ name: 'news-list' })}>Kembali ke Daftar Berita</Button>
        </div>
      </PublicLayout>
    )
  }

  const tags = article.tags?.split(',').filter(Boolean) ?? []
  const initials = article.author.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

  return (
    <PublicLayout>
      {/* Hero header */}
      <div className="bg-hero-gradient text-white py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-3xl px-4 lg:px-8">
          <Button variant="ghost" onClick={goBack} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Kembali
          </Button>
          <Badge className="bg-gold text-navy hover:bg-gold mb-3">{article.category}</Badge>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold leading-tight">{article.title}</h1>
          <p className="text-white/70 mt-3 text-lg leading-relaxed">{article.excerpt}</p>

          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-white/10 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border border-white/30">
                <AvatarFallback className="bg-white/10 text-white text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{article.author.name}</div>
                <div className="text-xs text-white/60">{article.author.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/60 ml-auto">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(article.publishedAt)}</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.viewCount}x</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <article className="mx-auto max-w-3xl px-4 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg max-w-none dark:prose-invert"
        >
          {article.content.split('\n\n').map((p, i) => (
            <p key={i} className="text-foreground/85 leading-relaxed mb-5 text-base lg:text-[17px]">{p}</p>
          ))}
        </motion.div>

        {/* Tags + share */}
        <div className="flex items-center justify-between gap-4 mt-10 pt-6 border-t border-border">
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="border-gold/30 text-gold bg-gold/5">#{t.trim()}</Badge>
              ))}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="ml-auto border-gold/40 text-gold hover:bg-gold/10"
          >
            <Share2 className="mr-2 h-3.5 w-3.5" /> Bagikan
          </Button>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="font-display text-2xl font-bold mb-6 text-navy dark:text-white">Artikel Terkait</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((a) => (
                <Card
                  key={a.id}
                  className="group cursor-pointer border-border hover:border-gold/40 hover:shadow-premium transition-all"
                  onClick={() => setView({ name: 'news-detail', slug: a.slug })}
                >
                  <CardContent className="p-5 space-y-2">
                    <Badge variant="outline" className="text-[10px] border-blue-soft/40 text-blue-brand">{a.category}</Badge>
                    <h3 className="font-semibold text-sm text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-2">{a.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                      <Calendar className="h-3 w-3" /> {formatDate(a.publishedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  )
}
