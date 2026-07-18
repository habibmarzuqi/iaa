'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search, FileText, Calendar, BookOpen, Archive, Users,
  Loader2, ArrowRight, Clock, TrendingUp, X,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { timeAgo } from '@/lib/helpers'

interface SearchResult {
  type: string
  id: string
  title: string
  description: string
  meta: string
  meta2: string
  link: any
  icon: string
}

interface GroupedResults {
  articles: SearchResult[]
  events: SearchResult[]
  library: SearchResult[]
  archives: SearchResult[]
  members: SearchResult[]
}

const ICON_MAP: Record<string, any> = {
  FileText, Calendar, BookOpen, Archive, Users,
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  articles: { label: 'Berita & Artikel', color: 'border-blue-soft/40 text-blue-brand bg-blue-soft/5' },
  events: { label: 'Agenda Kegiatan', color: 'border-emerald-400/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  library: { label: 'Digital Library', color: 'border-purple-400/40 text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  archives: { label: 'Arsip Digital', color: 'border-orange-400/40 text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
  members: { label: 'Pengurus', color: 'border-gold/40 text-gold bg-gold/5' },
}

const RECENT_KEY = 'iaa-recent-searches'
const TRENDING = ['arsiparis', 'webinar', 'UU kearsipan', 'sertifikasi', 'Srikandi', 'digital library']

interface SearchDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { setView } = useApp()
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<GroupedResults | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [total, setTotal] = React.useState(0)
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>()

  // Load recent searches
  React.useEffect(() => {
    const stored = localStorage.getItem(RECENT_KEY)
    if (stored) {
      try { setRecentSearches(JSON.parse(stored)) } catch {}
    }
  }, [])

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setQuery('')
      setResults(null)
      setTotal(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults(null)
      setTotal(0)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=5`)
        const d = await res.json()
        if (d.results) {
          setResults(d.results)
          setTotal(d.total)
        }
      } catch {
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const saveRecentSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
  }

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query.trim())
    if (result.link) {
      setView(result.link)
    }
    onOpenChange(false)
  }

  const handleRecentClick = (q: string) => {
    setQuery(q)
  }

  const hasResults = results && total > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0 gap-0" >
        <DialogTitle className="sr-only">Pencarian Global</DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari berita, kegiatan, koleksi library, arsip, pengurus..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            autoComplete="off"
            spellCheck="false"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {!loading && query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground font-mono">
            ESC
          </kbd>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto scrollbar-premium">
          {/* Empty state: recent + trending */}
          {!query.trim() && (
            <div className="p-4 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Pencarian Terakhir
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleRecentClick(s)}
                        className="rounded-full border border-border bg-card px-3 py-1 text-xs hover:border-gold/40 hover:text-navy dark:hover:text-white transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" /> Pencarian Populer
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleRecentClick(s)}
                      className="rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs text-gold hover:bg-gold/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No results */}
          {query.trim().length >= 2 && !loading && !hasResults && (
            <div className="p-10 text-center">
              <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Tidak ada hasil untuk "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">Coba kata kunci lain atau periksa ejaan</p>
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div className="p-2">
              {/* Total count */}
              <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border/50 mb-2">
                {total} hasil ditemukan untuk <strong className="text-navy dark:text-white">"{query}"</strong>
              </div>

              {(['articles', 'events', 'library', 'archives', 'members'] as const).map((type) => {
                const items = results![type]
                if (!items || items.length === 0) return null
                const meta = TYPE_LABELS[type]
                return (
                  <div key={type} className="mb-2">
                    <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Badge variant="outline" className={`text-[9px] ${meta.color}`}>{meta.label}</Badge>
                      <span>{items.length} hasil</span>
                    </div>
                    {items.map((item) => {
                      const Icon = ICON_MAP[item.icon] || FileText
                      return (
                        <button
                          key={`${type}-${item.id}`}
                          onClick={() => handleResultClick(item)}
                          className="group w-full flex items-start gap-3 rounded-lg p-2 hover:bg-accent transition-colors text-left"
                        >
                          <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground group-hover:bg-navy-gradient group-hover:text-white transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-1">
                              {highlightMatch(item.title, query)}
                            </div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {item.description}
                              </div>
                            )}
                            {(item.meta || item.meta2) && (
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                {item.meta && <span>{item.meta}</span>}
                                {item.meta2 && <span>· {item.meta2}</span>}
                              </div>
                            )}
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="h-4 rounded border border-border bg-muted px-1 text-[9px] font-mono">↑↓</kbd> navigasi
            </span>
            <span className="flex items-center gap-1">
              <kbd className="h-4 rounded border border-border bg-muted px-1 text-[9px] font-mono">↵</kbd> pilih
            </span>
          </div>
          <span>Powered by IAA Digital Search</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Highlight matching text in results
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return text

  const regex = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) => {
    if (words.some((w) => part.toLowerCase() === w.toLowerCase())) {
      return (
        <mark key={i} className="bg-gold/30 text-navy dark:text-white rounded px-0.5">
          {part}
        </mark>
      )
    }
    return part
  })
}
