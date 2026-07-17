'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { IAALogo } from '@/components/iaa-logo'
import {
  Send, Sparkles, Bot, User as UserIcon, Loader2, Trash2,
  MessageSquare, Plus, ArrowLeft, BookOpen, Shield, Award,
  FileText, Scale, GraduationCap, Database, Clock,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/helpers'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

const QUICK_SUGGESTIONS = [
  { icon: BookOpen, label: 'Apa itu arsip dinamis?', message: 'Jelaskan apa itu arsip dinamis dan bagaimana cara mengelolanya' },
  { icon: Scale, label: 'Dasar hukum kearsipan', message: 'Apa dasar hukum kearsipan di Indonesia?' },
  { icon: GraduationCap, label: 'Sertifikasi arsiparis', message: 'Bagaimana cara mendapatkan sertifikasi arsiparis berjenjang?' },
  { icon: FileText, label: 'SOP retensi arsip', message: 'Bagaimana menyusun SOP penjadwalan retensi arsip yang baik?' },
  { icon: Database, label: 'Preservasi digital', message: 'Apa itu preservasi digital dan mengapa penting?' },
  { icon: Award, label: 'Jenjang arsiparis', message: 'Apa saja jenjang arsiparis di Indonesia dan bedanya?' },
]

const SAMPLE_RESPONSE = `Saya adalah **Asisten AI Kearsipan IAA**. Saya dapat membantu Anda dengan:

- **Konsep kearsipan**: siklus hidup arsip, klasifikasi, retensi
- **Regulasi**: UU 43/2009, Permen PANRB terkait
- **Sertifikasi**: jenjang Pemuda/Muda/Madya/Utama
- **Praktik**: manajemen arsip dinamis & statis, preservasi digital
- **Standar**: ISO 16363, model OAIS, Srikandi

Silakan ajukan pertanyaan atau pilih salah satu saran di bawah.`

export function ChatView() {
  const { setView, user } = useApp()
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: SAMPLE_RESPONSE,
      createdAt: new Date().toISOString(),
    },
  ])
  const [input, setInput] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [conversationId, setConversationId] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new message
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, loading])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      createdAt: new Date().toISOString(),
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          conversationId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        toast.error(d.error || 'Gagal mengirim pesan')
        return
      }
      if (d.conversationId) setConversationId(d.conversationId)
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: 'assistant', content: d.response, createdAt: new Date().toISOString() },
      ])
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const resetChat = () => {
    setMessages([{ id: 'welcome', role: 'assistant', content: SAMPLE_RESPONSE, createdAt: new Date().toISOString() }])
    setConversationId(null)
    setInput('')
    toast.info('Percakapan baru dimulai')
  }

  return (
    <PublicLayout>
      <div className="bg-hero-gradient text-white py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
          <Button variant="ghost" onClick={() => setView({ name: 'public' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-3 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/20 border border-gold/30 backdrop-blur">
              <Bot className="h-6 w-6 text-gold" />
            </div>
            <div>
              <Badge className="bg-gold text-navy hover:bg-gold mb-1">AI Chatbot Kearsipan</Badge>
              <h1 className="font-display text-3xl font-extrabold">Asisten AI IAA</h1>
            </div>
          </div>
          <p className="text-white/70 max-w-2xl">
            Tanyakan apa saja seputar kearsipan, regulasi, sertifikasi, dan praktik manajemen arsip. Asisten AI siap membantu Anda 24/7.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 lg:px-8 py-6">
        <div className="grid lg:grid-cols-[1fr_280px] gap-4 h-[calc(100vh-280px)] min-h-[600px]">
          {/* Chat panel */}
          <Card className="flex flex-col overflow-hidden">
            {/* Header */}
            <div className="border-b border-border p-4 flex items-center justify-between bg-card">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-navy-gradient text-white">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-navy dark:text-white flex items-center gap-1.5">
                    Asisten AI Kearsipan
                    <Badge variant="outline" className="text-[9px] border-emerald-400/40 text-emerald-600">Online</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">Powered by Z.AI · Merespons dalam ~3 detik</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={resetChat} title="Percakapan baru">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-premium p-4 space-y-4 bg-muted/20">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}
                >
                  {m.role === 'assistant' && (
                    <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-navy-gradient text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${m.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm ${
                        m.role === 'user'
                          ? 'bg-navy-gradient text-white rounded-br-sm'
                          : 'bg-card border border-border rounded-bl-sm'
                      }`}
                    >
                      <MarkdownLite content={m.content} />
                    </div>
                    <div className={`text-[10px] text-muted-foreground mt-1 ${m.role === 'user' ? 'text-right' : ''}`}>
                      {formatDateTime(m.createdAt)}
                    </div>
                  </div>
                  {m.role === 'user' && (
                    <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-muted border border-border">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-navy-gradient text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-card border border-border rounded-bl-sm">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-border p-3 bg-card">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Tulis pesan Anda... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-gold/40 max-h-32 scrollbar-premium"
                  style={{ minHeight: '40px' }}
                />
                <Button type="submit" disabled={loading || !input.trim()} className="bg-navy-gradient h-10 w-10 p-0">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                <span>{input.length}/2000 karakter</span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Data Anda aman dan tidak dibagikan
                </span>
              </div>
            </form>
          </Card>

          {/* Sidebar: quick suggestions */}
          <div className="space-y-3 overflow-y-auto scrollbar-premium">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-gold" /> Saran Pertanyaan
              </h3>
              <div className="space-y-2">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => send(s.message)}
                    disabled={loading}
                    className="group w-full text-left rounded-lg border border-border bg-card p-3 hover:border-gold/40 hover:shadow-premium transition-all disabled:opacity-50"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-gold/10 text-gold group-hover:bg-gold group-hover:text-navy transition-colors">
                        <s.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-navy dark:text-white">{s.label}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{s.message}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info card */}
            <Card className="bg-navy-gradient text-white border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-grid opacity-20" />
              <div className="relative p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-gold" />
                  <span className="font-semibold text-sm">Disclaimer</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Asisten AI memberikan informasi umum berbasis pengetahuan kearsipan. Untuk keputusan resmi, selalu konsultasi dengan ahli atau regulator (ANRI).
                </p>
              </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-card border border-border p-3 text-center">
                <Clock className="h-4 w-4 text-gold mx-auto mb-1" />
                <div className="text-[10px] text-muted-foreground">Avg Response</div>
                <div className="text-sm font-semibold text-navy dark:text-white">~3 detik</div>
              </div>
              <div className="rounded-lg bg-card border border-border p-3 text-center">
                <MessageSquare className="h-4 w-4 text-gold mx-auto mb-1" />
                <div className="text-[10px] text-muted-foreground">Pesan</div>
                <div className="text-sm font-semibold text-navy dark:text-white">{messages.length - 1}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

// Simple markdown-lite renderer: **bold**, *italic*, line breaks, lists
function MarkdownLite({ content }: { content: string }) {
  // Split by lines, render paragraphs and lists
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let inList = false

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-4 my-1.5 space-y-0.5">
          {listItems.map((li, i) => (
            <li key={i} className="text-sm">{renderInline(li)}</li>
          ))}
        </ul>
      )
      listItems = []
    }
    inList = false
  }

  const renderInline = (text: string) => {
    // **bold** and *italic*
    const parts: React.ReactNode[] = []
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
    let lastIdx = 0
    let match
    let i = 0
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index))
      const m = match[0]
      if (m.startsWith('**')) {
        parts.push(<strong key={i++} className="font-semibold">{m.slice(2, -2)}</strong>)
      } else {
        parts.push(<em key={i++}>{m.slice(1, -1)}</em>)
      }
      lastIdx = match.index + m.length
    }
    if (lastIdx < text.length) parts.push(text.slice(lastIdx))
    return parts.length > 0 ? parts : text
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true
      listItems.push(trimmed.slice(2))
    } else if (trimmed.match(/^\d+\.\s/)) {
      inList = true
      listItems.push(trimmed.replace(/^\d+\.\s/, ''))
    } else {
      flushList()
      if (trimmed === '') {
        // skip empty line
      } else {
        elements.push(
          <p key={`p-${idx}`} className="text-sm leading-relaxed mb-1.5 last:mb-0">
            {renderInline(trimmed)}
          </p>
        )
      }
    }
  })
  flushList()

  return <>{elements}</>
}
