'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Mail, MailOpen, Search, Trash2, Clock, User, Mail as MailIcon,
  Phone, RefreshCw, Inbox as InboxIcon, AlertCircle,
} from 'lucide-react'
import { formatDateTime, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'
import { DataPagination } from '@/components/ui/data-pagination'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export function AdminInboxView() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchInput, setSearchInput] = React.useState('')
  const [search, setSearch] = React.useState('')
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all')
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)
  const [selected, setSelected] = React.useState<Message | null>(null)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [totalCount, setTotalCount] = React.useState(0)

  const load = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    })
    if (search) params.set('search', search)
    if (filter === 'unread') params.set('unread', 'true')
    fetch(`/api/contact?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d.messages ?? [])
        setUnreadCount(d.unreadCount ?? 0)
        setTotalCount(d.total ?? 0)
      })
      .catch(() => toast.error('Gagal memuat pesan'))
      .finally(() => setLoading(false))
  }, [page, pageSize, search, filter])

  React.useEffect(() => { load() }, [load])

  // Debounce search input
  React.useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const openMessage = async (m: Message) => {
    setSelected(m)
    setDetailOpen(true)
    // If unread, optimistically mark as read in list
    if (!m.isRead) {
      setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, isRead: true } : x))
      setUnreadCount((c) => Math.max(0, c - 1))
      try {
        await fetch(`/api/contact?id=${m.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isRead: true }) })
      } catch { /* ignore */ }
    }
  }

  const toggleRead = async (m: Message) => {
    const newState = !m.isRead
    setMessages((prev) => prev.map((x) => x.id === m.id ? { ...x, isRead: newState } : x))
    setUnreadCount((c) => newState ? Math.max(0, c - 1) : c + 1)
    try {
      await fetch(`/api/contact?id=${m.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: newState }),
      })
      toast.success(newState ? 'Ditandai sudah dibaca' : 'Ditandai belum dibaca')
    } catch {
      toast.error('Gagal update status')
      load()
    }
  }

  const remove = async (m: Message) => {
    if (!confirm(`Hapus pesan dari "${m.name}" dengan subjek "${m.subject}"?`)) return
    try {
      const res = await fetch(`/api/contact?id=${m.id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal menghapus'); return }
      toast.success('Pesan dihapus')
      if (selected?.id === m.id) {
        setDetailOpen(false)
        setSelected(null)
      }
      load()
    } catch { toast.error('Terjadi kesalahan') }
  }

  const stats = [
    { label: 'Total Pesan', value: totalCount, icon: InboxIcon, color: 'from-blue-soft to-blue' },
    { label: 'Belum Dibaca', value: unreadCount, icon: Mail, color: 'from-orange-400 to-orange-600' },
    { label: 'Sudah Dibaca', value: totalCount - unreadCount, icon: MailOpen, color: 'from-emerald-400 to-emerald-600' },
  ]

  return (
    <AdminShell
      activeKey="inbox"
      title="Pesan Masuk"
      subtitle="Kelola pesan dari formulir kontak publik (inbox)"
      actions={
        <Button onClick={load} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${s.color} text-white mb-2`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-bold font-display text-navy dark:text-white">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, subjek, atau isi pesan..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => { setFilter('all'); setPage(1) }}
                className={filter === 'all' ? 'bg-navy-gradient' : ''}
              >
                Semua ({totalCount})
              </Button>
              <Button
                size="sm"
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => { setFilter('unread'); setPage(1) }}
                className={filter === 'unread' ? 'bg-orange-500 hover:bg-orange-600' : ''}
              >
                Belum Dibaca ({unreadCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <InboxIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' ? 'Tidak ada pesan belum dibaca' : (search ? 'Tidak ada hasil pencarian' : 'Belum ada pesan masuk')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[640px] overflow-y-auto scrollbar-premium">
              {messages.map((m, i) => {
                const initials = m.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`p-4 hover:bg-muted/30 transition-colors cursor-pointer ${!m.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                    onClick={() => openMessage(m)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`text-xs font-semibold ${m.isRead ? 'bg-muted text-muted-foreground' : 'bg-navy-gradient text-white'}`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {!m.isRead && (
                          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-orange-500 border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`text-sm ${m.isRead ? 'font-medium text-foreground' : 'font-bold text-navy dark:text-white'}`}>
                            {m.name}
                          </span>
                          {!m.isRead && (
                            <Badge variant="outline" className="text-[9px] border-orange-400/40 text-orange-600 bg-orange-50 dark:bg-orange-900/20">
                              Baru
                            </Badge>
                          )}
                        </div>
                        <div className={`text-sm ${m.isRead ? 'text-muted-foreground' : 'font-medium text-foreground'} line-clamp-1`}>
                          {m.subject}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {m.message}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><MailIcon className="h-3 w-3" /> {m.email}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeAgo(m.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleRead(m)}
                          title={m.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                        >
                          {m.isRead ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => remove(m)}
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {totalCount > 0 && (
        <Card>
          <CardContent className="p-2">
            <DataPagination
              page={page}
              pageSize={pageSize}
              total={totalCount}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
            />
          </CardContent>
        </Card>
      )}

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto scrollbar-premium">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">Detail Pesan</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Sender card */}
                <div className="rounded-xl bg-navy-gradient text-white p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  <div className="relative flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-gold/40">
                      <AvatarFallback className="bg-white/10 text-white font-semibold">
                        {selected.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-display font-bold truncate">{selected.name}</div>
                      <div className="text-xs text-white/70 truncate">{selected.email}</div>
                      {selected.phone && <div className="text-[10px] text-white/60 mt-0.5">{selected.phone}</div>}
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Info label="Subjek" value={selected.subject} />
                  <Info label="Diterima" value={formatDateTime(selected.createdAt)} />
                  <Info label="Status" value={selected.isRead ? 'Sudah Dibaca' : 'Belum Dibaca'} />
                  <Info label="Telepon" value={selected.phone || '-'} />
                </div>

                {/* Body */}
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Isi Pesan</div>
                  <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </div>
                </div>

                {/* Reply via email */}
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}&body=Halo ${encodeURIComponent(selected.name)},%0D%0A%0D%0ATerima kasih atas pesan Anda.%0D%0A%0D%0A`}
                  className="block"
                >
                  <Button className="w-full bg-navy-gradient">
                    <MailIcon className="mr-2 h-4 w-4" /> Balas via Email
                  </Button>
                </a>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { toggleRead(selected); setDetailOpen(false) }}
                  >
                    {selected.isRead ? <Mail className="mr-2 h-4 w-4" /> : <MailOpen className="mr-2 h-4 w-4" />}
                    {selected.isRead ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-400/40 text-red-600 hover:bg-red-50"
                    onClick={() => { remove(selected); }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                  </Button>
                </div>

                {/* Info note */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Klik "Balas via Email" akan membuka aplikasi email Anda dengan pesan terisi otomatis.
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2.5">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-xs font-medium text-navy dark:text-white mt-0.5 break-words">{value}</div>
    </div>
  )
}
