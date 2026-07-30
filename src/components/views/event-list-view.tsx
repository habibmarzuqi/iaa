'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, MapPin, Clock, Users, Video, GraduationCap, Presentation, Users2, Trophy, ArrowRight, Globe, Shield } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/helpers'

interface EventItem {
  id: string; slug: string; title: string; description: string; eventType: string
  location: string; startDate: string; endDate: string; quota: number
  registeredCount: number; isRegistrationOpen: boolean; isPublicEvent?: boolean
  coverImage?: string | null
}

const EVENT_ICONS: Record<string, any> = {
  WEBINAR: Video, PELATIHAN: GraduationCap, WORKSHOP: Presentation,
  SEMINAR: Users2, RAPAT: Users, LOMBA: Trophy,
}

const EVENT_COLORS: Record<string, string> = {
  WEBINAR: 'from-blue-500 to-blue-600',
  PELATIHAN: 'from-emerald-500 to-emerald-600',
  WORKSHOP: 'from-orange-500 to-orange-600',
  SEMINAR: 'from-purple-500 to-purple-600',
  RAPAT: 'from-slate-500 to-slate-600',
  LOMBA: 'from-red-500 to-red-600',
}

export function EventListView() {
  const { setView } = useApp()
  const [events, setEvents] = React.useState<EventItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('ALL')
  const [targetFilter, setTargetFilter] = React.useState<'ALL' | 'PUBLIC' | 'MEMBERS'>('ALL')

  React.useEffect(() => {
    fetch('/api/events?limit=50')
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false))
  }, [])

  const types = React.useMemo(() => {
    const s = new Set(events.map((e) => e.eventType))
    return ['ALL', ...Array.from(s)]
  }, [events])

  const filtered = events.filter((e) => {
    const typeMatch = filter === 'ALL' || e.eventType === filter
    const targetMatch =
      targetFilter === 'ALL' ||
      (targetFilter === 'PUBLIC' && e.isPublicEvent) ||
      (targetFilter === 'MEMBERS' && !e.isPublicEvent)
    return typeMatch && targetMatch
  })

  return (
    <PublicLayout>
      <div className="bg-hero-gradient text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" onClick={() => setView({ name: 'public' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
          <Badge className="bg-gold text-navy hover:bg-gold mb-3">Agenda Kegiatan</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold">Agenda IAA</h1>
          <p className="text-white/70 mt-2 max-w-2xl">Webinar, seminar, workshop, pelatihan, rapat, dan lomba kearsipan</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        {/* Filter chips & Target Audience Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-premium pb-2 sm:pb-0">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === t ? 'bg-navy-gradient text-white shadow-sm' : 'bg-card border border-border text-foreground/70 hover:border-gold/40'
                }`}
              >
                {t === 'ALL' ? 'Semua Jenis' : t}
              </button>
            ))}
          </div>

          {/* Target Audience Filter */}
          <div className="flex gap-1.5 p-1 bg-muted rounded-xl border border-border self-start sm:self-auto">
            <button
              onClick={() => setTargetFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                targetFilter === 'ALL' ? 'bg-card text-navy dark:text-white shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semua Target
            </button>
            <button
              onClick={() => setTargetFilter('PUBLIC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                targetFilter === 'PUBLIC' ? 'bg-emerald-500 text-white shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe className="h-3 w-3" /> Untuk Umum
            </button>
            <button
              onClick={() => setTargetFilter('MEMBERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                targetFilter === 'MEMBERS' ? 'bg-navy-gradient text-white shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Shield className="h-3 w-3 text-gold" /> Khusus Anggota
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada kegiatan ditemukan</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e, i) => {
              const Icon = EVENT_ICONS[e.eventType] ?? Calendar
              const color = EVENT_COLORS[e.eventType] ?? 'from-slate-500 to-slate-600'
              const d = new Date(e.startDate)
              const remaining = e.quota - e.registeredCount
              const pct = Math.min(100, Math.round((e.registeredCount / e.quota) * 100))

              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="group h-full overflow-hidden border-border hover:border-gold/40 hover:shadow-premium hover:-translate-y-1 transition-all cursor-pointer"
                    onClick={() => setView({ name: 'event-detail', slug: e.slug })}
                  >
                    <div className={`relative h-36 bg-gradient-to-br ${color} overflow-hidden`}>
                      {e.coverImage ? (
                        <>
                          <img src={e.coverImage} alt={e.title} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-grid opacity-30" />
                      )}
                      <div className="absolute top-3 left-3">
                        <div className="bg-white/95 rounded-lg px-2 py-1.5 text-center text-navy shadow-sm">
                          <div className="text-[9px] uppercase font-semibold">{d.toLocaleString('id-ID', { month: 'short' })}</div>
                          <div className="text-xl font-extrabold leading-none font-display">{d.getDate()}</div>
                        </div>
                      </div>
                      <Icon className="absolute top-3 right-3 h-6 w-6 text-white/90" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur text-[10px] uppercase">{e.eventType}</Badge>
                        {e.isPublicEvent ? (
                          <Badge className="bg-emerald-500/90 text-white border-emerald-400/30 backdrop-blur text-[10px] flex items-center gap-1">
                            <Globe className="h-2.5 w-2.5" /> Umum
                          </Badge>
                        ) : (
                          <Badge className="bg-navy/90 text-gold border-gold/40 backdrop-blur text-[10px] flex items-center gap-1">
                            <Shield className="h-2.5 w-2.5 text-gold" /> Khusus Anggota
                          </Badge>
                        )}
                      </div>
                      {!e.isRegistrationOpen && (
                        <Badge className="absolute bottom-3 right-3 bg-red-500/80 text-white border-red-400/30 backdrop-blur text-[10px]">Ditutup</Badge>
                      )}
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-semibold text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-2">{e.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2"><Clock className="h-3 w-3" /> {formatDate(e.startDate, { hour: '2-digit', minute: '2-digit' })} WIB</div>
                        <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> <span className="truncate">{e.location}</span></div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {e.registeredCount}/{e.quota}</span>
                          <span className="text-emerald-600 font-medium">{remaining} slot tersisa</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
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
