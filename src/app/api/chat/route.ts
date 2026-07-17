/**
 * POST /api/chat
 *   body: { message: string, conversationId?: string, history?: {role, content}[] }
 *   returns: { response: string, conversationId: string }
 *
 * Uses z-ai-web-dev-sdk on backend only.
 * System prompt sets assistant as IAA Kearsipan expert.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 30

const SYSTEM_PROMPT = `Anda adalah Asisten AI Kearsipan IAA (Ikatan Arsiparis ANRI), asisten digital resmi untuk profesi arsiparis Indonesia.

PERAN ANDA:
- Pakar kearsipan nasional Indonesia yang membantu anggota IAA dan masyarakat umum
- Mampu menjelaskan konsep kearsipan: siklus hidup arsip, klasifikasi, retensi, preservasi digital
- Membantu pertanyaan tentang regulasi (UU 43/2009, Permen PANRB), Srikandi, sertifikasi arsiparis berjenjang
- Memberikan panduan praktis manajemen arsip dinamis dan statis
- Membantu interpretasi metadata, standar ISO 16363, model OAIS

GAYA JAWABAN:
- Profesional, ramah, dan jelas. Bahasa Indonesia baku.
- Struktur jawaban: pendahuluan singkat, poin-poin utama, contoh konkret bila relevan, penutup.
- Gunakan format markdown ringan (bold untuk istilah kunci, bullet list untuk poin).
- Maksimal 4-5 paragraf. Tidak bertele-tele.
- Jika tidak yakin, akui dan sarankan sumber resmi (ANRI, IAA, peraturan terkait).

BATASAN:
- Hanya membahas kearsipan, manajemen arsip, dan topik terkait profesi arsiparis.
- Untuk pertanyaan di luar kearsipan, arahkan kembali ke topik organisasi/profesi.
- Tidak memberikan nasihat hukum definitif — selalu sarankan konsultasi dengan ahli hukum untuk kasus spesifik.

KONTEKS ORGANISASI:
- IAA = Ikatan Arsiparis ANRI (berdiri 1973)
- Anggota: arsiparis di ANRI dan instansi pemerintah Indonesia
- Layanan: pelatihan, sertifikasi berjenjang (Pemuda/Muda/Madya/Utama), digital library, e-certificate
- Platform: IAA Digital (website + member portal + admin dashboard)
`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, conversationId, history } = body as {
      message: string
      conversationId?: string
      history?: { role: string; content: string }[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan wajib diisi' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Pesan terlalu panjang (maks 2000 karakter)' }, { status: 400 })
    }

    // Get or create conversation
    const userId = req.cookies.get('iaa_session')?.value
    let user = null
    if (userId) {
      user = await db.user.findUnique({ where: { id: userId } })
    }

    let conversation = null
    if (conversationId) {
      conversation = await db.chatConversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
      })
    }
    if (!conversation) {
      conversation = await db.chatConversation.create({
        data: {
          userId: user?.id,
          guestName: user?.name || 'Guest',
          title: message.slice(0, 50),
        },
        include: { messages: [] },
      })
    }

    // Save user message
    await db.chatMessage.create({
      data: { conversationId: conversation.id, role: 'user', content: message },
    })

    // Build messages for LLM
    const priorMessages = (history && history.length > 0 ? history : conversation.messages.map((m) => ({ role: m.role, content: m.content })))
      .slice(-10) // keep last 10 messages max
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const messages = [
      { role: 'assistant' as const, content: SYSTEM_PROMPT },
      ...priorMessages,
      { role: 'user' as const, content: message },
    ]

    // Call z-ai-web-dev-sdk (server-side only)
    let aiResponse: string
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages,
        thinking: { type: 'disabled' },
      })
      aiResponse = completion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memberikan respons saat ini. Silakan coba lagi.'
    } catch (e: any) {
      console.error('ZAI SDK error:', e)
      aiResponse = `Maaf, layanan AI sedang tidak tersedia saat ini. Error: ${e.message || 'unknown'}. Silakan coba beberapa saat lagi atau hubungi admin melalui menu Kontak.`
    }

    // Save assistant response
    await db.chatMessage.create({
      data: { conversationId: conversation.id, role: 'assistant', content: aiResponse },
    })

    // Update conversation title if first message
    if (conversation.messages.length === 0) {
      await db.chatConversation.update({
        where: { id: conversation.id },
        data: { title: message.slice(0, 80), updatedAt: new Date() },
      })
    } else {
      await db.chatConversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() },
      })
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
    })
  } catch (e: any) {
    console.error('Chat API error:', e)
    return NextResponse.json({ error: 'Gagal memproses pesan' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // List conversations for current user
  const userId = req.cookies.get('iaa_session')?.value
  if (!userId) return NextResponse.json({ conversations: [] })

  const conversations = await db.chatConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 20,
    include: { _count: { select: { messages: true } } },
  })
  return NextResponse.json({ conversations })
}
