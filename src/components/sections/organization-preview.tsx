'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

interface OrgMember {
  id: string
  name: string
  position: string
  category: string
  photo: string | null
}

export function OrganizationPreview() {
  const { setView } = useApp()
  const [members, setMembers] = useState<OrgMember[]>([])

  useEffect(() => {
    fetch('/api/organization')
      .then((r) => r.json())
      .then((d) => setMembers((d.members ?? []).slice(0, 4)))
      .catch(() => {})
  }, [])

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider">
              Struktur Organisasi
            </span>
            <h2 className="font-display text-3xl lg:text-4xl font-extrabold mt-4 text-navy dark:text-white">
              Pengurus Pusat IAA
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Para arsiparis profesional yang memimpin organisasi periode 2024-2027
            </p>
          </div>
          <Button variant="outline" onClick={() => setView({ name: 'organization' })} className="border-gold/40 text-gold hover:bg-gold/10">
            Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.length === 0 && (
            <div className="col-span-full h-48 rounded-2xl bg-muted animate-pulse" />
          )}
          {members.map((m, i) => {
            const initials = m.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="group text-center border-border hover:border-gold/40 hover:shadow-premium transition-all overflow-hidden">
                  <div className="relative h-32 bg-navy-gradient overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <div className="absolute inset-0 grid place-items-center">
                      <Avatar className="h-20 w-20 border-4 border-white/30 shadow-lg">
                        <AvatarFallback className="bg-white/20 text-white font-display font-bold text-xl">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <CardContent className="p-4 pt-3 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-gold font-semibold">{m.category}</div>
                    <h3 className="font-semibold text-sm text-navy dark:text-white leading-tight">{m.name}</h3>
                    <p className="text-xs text-muted-foreground">{m.position}</p>
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
