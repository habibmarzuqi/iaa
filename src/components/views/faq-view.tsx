'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { ArrowLeft, HelpCircle, MessageCircleQuestion } from 'lucide-react'

export function FaqView() {
  const { setView } = useApp()
  const [faqs, setFaqs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/faq')
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs ?? []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <div className="bg-hero-gradient text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-4xl px-4 lg:px-8">
          <Button variant="ghost" onClick={() => setView({ name: 'public' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
          <Badge className="bg-gold text-navy hover:bg-gold mb-3">FAQ</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold">Pertanyaan Umum</h1>
          <p className="text-white/70 mt-2 max-w-2xl">Jawaban atas pertanyaan yang sering diajukan tentang IAA Digital dan keanggotaan</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={f.id || i}
                  value={`item-${f.id || i}`}
                  className="rounded-xl border border-border bg-card px-5 shadow-sm overflow-hidden"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <div className="flex items-start gap-3 pr-4">
                      <HelpCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="font-semibold text-navy dark:text-white">{f.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pl-8">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        )}

        <Card className="mt-10 bg-navy-gradient text-white border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <CardContent className="relative p-8 text-center">
            <MessageCircleQuestion className="h-10 w-10 text-gold mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold mb-2">Masih ada pertanyaan?</h3>
            <p className="text-white/70 text-sm mb-4 max-w-md mx-auto">
              Tim pengurus IAA siap membantu Anda. Hubungi kami melalui formulir kontak atau email resmi.
            </p>
            <Button onClick={() => setView({ name: 'contact' })} className="bg-gold-gradient text-navy hover:opacity-90">
              Hubungi Kami
            </Button>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
