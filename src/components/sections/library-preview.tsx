'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BookOpen, Download, FileText, Eye, BookMarked, Scale, FileCheck, Presentation, Newspaper, Video, Headphones, File } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LibItem {
  id: string
  title: string
  description: string
  category: string
  author: string | null
  year: number | null
  pages: number | null
  downloadCount: number
  viewCount: number
}

const CAT_ICONS: Record<string, any> = {
  BUKU: BookOpen,
  EBOOK: BookMarked,
  JURNAL: FileText,
  PEDOMAN: BookOpen,
  REGULASI: Scale,
  SOP: FileCheck,
  TEMPLATE: File,
  PRESENTASI: Presentation,
  MAJALAH: Newspaper,
  VIDEO: Video,
  AUDIO: Headphones,
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

export function LibraryPreview() {
  const { setView } = useApp()
  const [items, setItems] = useState<LibItem[]>([])

  useEffect(() => {
    fetch('/api/library?limit=6')
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
  }, [])

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider">
              Digital Library
            </span>
            <h2 className="font-display text-3xl lg:text-4xl font-extrabold mt-4 text-navy dark:text-white">
              Pusat Pengetahuan Kearsipan
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Koleksi buku, ebook, jurnal, regulasi, SOP, dan template kearsipan terlengkap
            </p>
          </div>
          <Button variant="outline" onClick={() => setView({ name: 'library' })} className="border-gold/40 text-gold hover:bg-gold/10">
            Jelajahi Library <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 && (
            <div className="col-span-full h-64 rounded-2xl bg-muted animate-pulse" />
          )}
          {items.map((item, i) => {
            const Icon = CAT_ICONS[item.category] ?? FileText
            const colorClass = CAT_COLORS[item.category] ?? 'bg-muted text-muted-foreground'
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card
                  className="group h-full border-border hover:border-gold/40 hover:shadow-premium hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                  onClick={() => setView({ name: 'library' })}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wide mb-1 ${colorClass} border-transparent`}>
                          {item.category}
                        </Badge>
                        <h3 className="font-semibold text-sm text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-2">
                          {item.title}
                        </h3>
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
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
