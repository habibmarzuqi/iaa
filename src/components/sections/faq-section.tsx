'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, MessageCircleQuestion } from 'lucide-react'
import { useApp } from '@/lib/store'
import { Button } from '@/components/ui/button'

export function FaqSection() {
  const { setView } = useApp()
  const [faqs, setFaqs] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch('/api/faq')
      .then((r) => r.json())
      .then((d) => setFaqs(d.faqs ?? []))
      .catch(() => setFaqs([]))
  }, [])

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold mt-4 text-navy dark:text-white">
            Pertanyaan Umum
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Jawaban atas pertanyaan yang sering diajukan tentang IAA Digital dan keanggotaan
          </p>
        </div>

        {faqs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 text-center rounded-2xl bg-navy-gradient p-8 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative">
            <MessageCircleQuestion className="h-10 w-10 text-gold mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold mb-2">Masih ada pertanyaan?</h3>
            <p className="text-white/70 text-sm mb-4 max-w-md mx-auto">
              Tim pengurus IAA siap membantu Anda. Hubungi kami melalui formulir kontak atau email resmi.
            </p>
            <Button onClick={() => setView({ name: 'contact' })} className="bg-gold-gradient text-navy hover:opacity-90">
              Hubungi Kami
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
