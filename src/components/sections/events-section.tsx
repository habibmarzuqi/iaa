'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/helpers'
import { ArrowRight, Calendar, MapPin, Clock, Users, Video, GraduationCap, Presentation, Users2, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

interface EventItem {
  id: string
  slug: string
  title: string
  description: string
  eventType: string
  location: string
  startDate: string
  endDate: string
  quota: number
  registeredCount: number
  isRegistrationOpen: boolean
}

const EVENT_ICONS: Record<string, any> = {
  WEBINAR: Video,
  PELATIHAN: GraduationCap,
  WORKSHOP: Presentation,
  SEMINAR: Users2,
  RAPAT: Users,
  LOMBA: Trophy,
}

const EVENT_COLORS: Record<string, string> = {
  WEBINAR: 'from-blue-500 to-blue-600',
  PELATIHAN: 'from-emerald-500 to-emerald-600',
  WORKSHOP: 'from-orange-500 to-orange-600',
  SEMINAR: 'from-purple-500 to-purple-600',
  RAPAT: 'from-slate-500 to-slate-600',
  LOMBA: 'from-red-500 to-red-600',
}

export function EventsSection() {
  const { setView } = useApp()
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    fetch('/api/events?limit=4')
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => {})
  }, [])

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider">
              Agenda Kegiatan
            </span>
            <h2 className="font-display text-3xl lg:text-4xl font-extrabold mt-4 text-navy dark:text-white">
              Kegiatan Mendatang
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Webinar, seminar, workshop, pelatihan, dan rapat organisasi terjadwal
            </p>
          </div>
          <Button variant="outline" onClick={() => setView({ name: 'event-list' })} className="border-gold/40 text-gold hover:bg-gold/10">
            Lihat Agenda <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {events.length === 0 && (
            <div className="col-span-full h-64 rounded-2xl bg-muted animate-pulse" />
          )}
          {events.map((e, i) => {
            const Icon = EVENT_ICONS[e.eventType] ?? Calendar
            const color = EVENT_COLORS[e.eventType] ?? 'from-slate-500 to-slate-600'
            const d = new Date(e.startDate)
            const remaining = e.quota - e.registeredCount
            const pct = Math.min(100, Math.round((e.registeredCount / e.quota) * 100))
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card
                  className="group h-full overflow-hidden border-border hover:border-gold/40 hover:shadow-premium hover:-translate-y-1 transition-all cursor-pointer"
                  onClick={() => setView({ name: 'event-detail', slug: e.slug })}
                >
                  <div className={`relative h-32 bg-gradient-to-br ${color} overflow-hidden`}>
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <div className="absolute top-3 left-3">
                      <div className="bg-white/95 backdrop-blur rounded-lg px-2 py-1.5 text-center text-navy shadow-sm">
                        <div className="text-[9px] uppercase font-semibold tracking-wide">{d.toLocaleString('id-ID', { month: 'short' })}</div>
                        <div className="text-xl font-extrabold leading-none font-display">{d.getDate()}</div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Icon className="h-6 w-6 text-white/90" />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur text-[10px] uppercase tracking-wide">
                        {e.eventType}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm text-navy dark:text-white group-hover:text-blue-brand transition-colors line-clamp-2 min-h-[2.5rem]">
                      {e.title}
                    </h3>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2"><Clock className="h-3 w-3 flex-shrink-0" /> {formatDate(e.startDate, { hour: '2-digit', minute: '2-digit' })} WIB</div>
                      <div className="flex items-center gap-2"><MapPin className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{e.location}</span></div>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{e.registeredCount}/{e.quota} terdaftar</span>
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
      </div>
    </section>
  )
}
