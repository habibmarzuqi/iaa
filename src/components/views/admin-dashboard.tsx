'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp, roleLabel, roleBadgeColor } from '@/lib/store'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts'
import {
  LayoutDashboard, Users, Award, CalendarCheck, BookOpen, FileText, Clock,
  TrendingUp, TrendingDown, ArrowUpRight, Activity, Loader2, LogOut,
  ChevronRight, UserPlus, FilePlus2, CalendarPlus, Award as AwardIcon,
  Bell, Search, Download, Settings, Archive, FileBarChart,
} from 'lucide-react'
import { formatDate, formatDateTime, timeAgo } from '@/lib/helpers'

interface Stats {
  totals: {
    members: number
    activeMembers: number
    articles: number
    events: number
    library: number
    certificates: number
    pendingRegistrations: number
  }
  byLevel: { level: string; count: number }[]
  byStatus: { status: string; count: number }[]
  certByMonth: { label: string; count: number }[]
  recentMembers: any[]
  recentArticles: any[]
  upcomingEvents: any[]
}

const LEVEL_LABELS: Record<string, string> = {
  PEMULA: 'Pemula',
  MUDA: 'Muda',
  MADYA: 'Madya',
  UTAMA: 'Utama',
}

const STATUS_LABELS: Record<string, string> = {
  AKTIF: 'Aktif',
  TIDAK_AKTIF: 'Tidak Aktif',
  PENSIUN: 'Pensiun',
  MENINGGAL: 'Meninggal',
}

const PIE_COLORS = ['#0a1e3f', '#1d4ed8', '#c9a227', '#059669', '#ea580c']

export function AdminDashboard() {
  const { user, setView, logout } = useApp()
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [tab, setTab] = React.useState<'overview' | 'members' | 'events' | 'content'>('overview')

  React.useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setStats(d)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    logout()
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-navy" />
          <p className="text-sm text-muted-foreground">Memuat dashboard admin...</p>
        </div>
      </div>
    )
  }

  const initials = user?.name?.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '?'

  const STAT_CARDS = [
    { label: 'Total Anggota', value: stats.totals.members, sub: `${stats.totals.activeMembers} aktif`, icon: Users, color: 'from-blue-soft to-blue', trend: '+12%' },
    { label: 'Sertifikat', value: stats.totals.certificates, sub: 'total terbit', icon: Award, color: 'from-gold-soft to-gold', trend: '+8%' },
    { label: 'Kegiatan', value: stats.totals.events, sub: 'aktif terjadwal', icon: CalendarCheck, color: 'from-emerald-400 to-emerald-600', trend: '+5' },
    { label: 'Digital Library', value: stats.totals.library, sub: 'koleksi', icon: BookOpen, color: 'from-purple-400 to-purple-600', trend: '+22' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <div className="flex-1 mx-auto max-w-7xl w-full px-4 lg:px-8 py-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-hero-gradient p-6 lg:p-8 text-white mb-6"
        >
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-gold/40 shadow-lg">
                <AvatarFallback className="bg-white/10 text-white font-display font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display text-xl lg:text-2xl font-bold">{user?.name}</h1>
                  <Badge className={`text-[10px] ${roleBadgeColor(user?.role)}`}>{roleLabel(user?.role)}</Badge>
                </div>
                <p className="text-white/70 text-sm">
                  Dashboard administratif IAA Digital — pantau aktivitas organisasi secara real-time.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white" onClick={() => setView({ name: 'admin-reports' })}>
                <Download className="mr-2 h-4 w-4" /> Export Laporan
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Module quick access cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Arsip Digital', desc: 'Kelola dokumen organisasi', icon: Archive, color: 'from-blue-soft to-blue', view: { name: 'admin-archives' as const } },
            { label: 'E-Certificate', desc: 'Generate & verifikasi sertifikat', icon: Award, color: 'from-gold-soft to-gold', view: { name: 'admin-certificates' as const } },
            { label: 'Event & Registrasi', desc: 'Approval & check-in peserta', icon: CalendarCheck, color: 'from-emerald-400 to-emerald-600', view: { name: 'admin-events' as const } },
            { label: 'Laporan', desc: 'Export PDF & CSV', icon: FileBarChart, color: 'from-purple-400 to-purple-600', view: { name: 'admin-reports' as const } },
          ].map((m) => (
            <motion.button
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setView(m.view)}
              className="group rounded-xl border border-border bg-card p-4 text-left hover:border-gold/40 hover:shadow-premium hover:-translate-y-0.5 transition-all"
            >
              <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${m.color} text-white mb-2 group-hover:scale-110 transition-transform`}>
                <m.icon className="h-5 w-5" />
              </div>
              <div className="font-semibold text-sm text-navy dark:text-white">{m.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</div>
            </motion.button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border hover:shadow-premium transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="border-emerald-400/40 text-emerald-600 text-[10px]">
                      <TrendingUp className="h-3 w-3 mr-1" /> {s.trend}
                    </Badge>
                  </div>
                  <div className="text-3xl font-extrabold font-display text-navy dark:text-white">
                    {s.value.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label} · <span className="text-navy dark:text-white font-medium">{s.sub}</span></div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Certificates trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-navy dark:text-white">
                  <Activity className="h-5 w-5 text-gold" /> Tren Penerbitan Sertifikat
                </span>
                <span className="text-xs text-muted-foreground">6 bulan terakhir</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.certByMonth}>
                  <defs>
                    <linearGradient id="certGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c9a227" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#c9a227" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a1e3f',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#c9a227', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Sertifikat"
                    stroke="#c9a227"
                    strokeWidth={2.5}
                    fill="url(#certGrad)"
                    dot={{ r: 4, fill: '#c9a227', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Members by level pie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                <Users className="h-5 w-5 text-gold" /> Anggota per Jenjang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={stats.byLevel}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {stats.byLevel.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a1e3f', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {stats.byLevel.map((l, i) => (
                  <div key={l.level} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-muted-foreground">{LEVEL_LABELS[l.level] ?? l.level}</span>
                    <span className="font-semibold text-navy dark:text-white ml-auto">{l.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending + Status row */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Pending approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                <Clock className="h-5 w-5 text-orange-500" /> Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3 mb-3">
                <div className="text-4xl font-extrabold font-display text-orange-600">{stats.totals.pendingRegistrations}</div>
                <div className="text-xs text-muted-foreground pb-1">pendaftaran kegiatan menunggu</div>
              </div>
              <Button variant="outline" className="w-full border-orange-400/40 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                Proses Approval <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Members by status bar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                <Users className="h-5 w-5 text-gold" /> Distribusi Status Anggota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.byStatus.map((s) => ({ name: STATUS_LABELS[s.status] ?? s.status, count: s.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a1e3f', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                    cursor={{ fill: '#c9a22720' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.byStatus.map((s, i) => {
                      const colors: Record<string, string> = {
                        AKTIF: '#059669', TIDAK_AKTIF: '#64748b', PENSIUN: '#1d4ed8', MENINGGAL: '#dc2626',
                      }
                      return <Cell key={i} fill={colors[s.status] ?? '#0a1e3f'} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Latest activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-navy dark:text-white">
                <span className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-gold" /> Anggota Terbaru
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentMembers.slice(0, 5).map((m: any) => {
                const initials = m.fullName.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-navy-gradient text-white text-xs font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-navy dark:text-white truncate">{m.fullName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{m.memberNumber}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{timeAgo(m.createdAt)}</div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Recent articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                <FilePlus2 className="h-5 w-5 text-gold" /> Artikel Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentArticles.slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-blue-soft/20 text-blue-brand">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-navy dark:text-white line-clamp-1">{a.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {a.author?.name ?? 'Unknown'} · {timeAgo(a.publishedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy dark:text-white">
                <CalendarPlus className="h-5 w-5 text-gold" /> Kegiatan Mendatang
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.upcomingEvents.slice(0, 5).map((e: any) => {
                const d = new Date(e.startDate)
                return (
                  <div key={e.id} className="flex items-start gap-3">
                    <div className="grid h-9 w-12 flex-shrink-0 place-items-center rounded-lg bg-navy-gradient text-white">
                      <div className="text-center leading-none">
                        <div className="text-[8px] uppercase">{d.toLocaleString('id-ID', { month: 'short' })}</div>
                        <div className="text-sm font-bold font-display">{d.getDate()}</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-navy dark:text-white line-clamp-1">{e.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">{e.location}</div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
