'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface OrgMember {
  id: string; name: string; position: string; category: string; photo: string | null; bio: string | null
}

interface OrgCat {
  id: string; name: string; description: string | null; order: number
}

export function OrganizationView() {
  const { setView } = useApp()
  const [members, setMembers] = React.useState<OrgMember[]>([])
  const [categories, setCategories] = React.useState<OrgCat[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/organization')
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members ?? [])
        setCategories(d.categories ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  // Group by category respecting category order
  const groups = React.useMemo(() => {
    const map: Record<string, OrgMember[]> = {}
    members.forEach((mem) => {
      if (!map[mem.category]) map[mem.category] = []
      map[mem.category].push(mem)
    })

    const result: Array<{ categoryName: string; members: OrgMember[] }> = []

    // 1. Add categories defined in database in order
    categories.forEach((cat) => {
      if (map[cat.name] && map[cat.name].length > 0) {
        result.push({ categoryName: cat.name, members: map[cat.name] })
        delete map[cat.name]
      }
    })

    // 2. Add any remaining categories
    Object.entries(map).forEach(([catName, mems]) => {
      if (mems.length > 0) {
        result.push({ categoryName: catName, members: mems })
      }
    })

    return result
  }, [members, categories])

  return (
    <PublicLayout>
      <div className="bg-hero-gradient text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" onClick={() => setView({ name: 'public' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
          <Badge className="bg-gold text-navy hover:bg-gold mb-3">Struktur Organisasi</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold">Pengurus IAA</h1>
          <p className="text-white/70 mt-2 max-w-2xl">Periode kepengurusan 2024-2027 — para arsiparis profesional yang memimpin organisasi</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
        {loading ? (
          <div className="space-y-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-8 w-48 mb-5" />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-56 rounded-2xl" />)}
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada data pengurus</p>
          </div>
        ) : (
          groups.map(({ categoryName, members: mems }) => (
            <section key={categoryName} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-border" />
                <Badge variant="outline" className="border-gold/40 text-gold bg-gold/5 px-4 py-1.5 text-sm font-semibold">{categoryName}</Badge>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {mems.map((m, i) => {
                  const initials = m.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    >
                      <Card className="group text-center border-border hover:border-gold/40 hover:shadow-premium transition-all overflow-hidden">
                        <div className="relative h-32 bg-navy-gradient overflow-hidden">
                          <div className="absolute inset-0 bg-grid opacity-30" />
                          <div className="absolute inset-0 grid place-items-center">
                            <Avatar className="h-20 w-20 border-4 border-white/40 shadow-xl ring-2 ring-gold/40">
                              {m.photo && <AvatarImage src={m.photo} alt={m.name} className="object-cover" />}
                              <AvatarFallback className="bg-white/20 text-white font-display font-bold text-xl">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                        <CardContent className="p-4 pt-3 space-y-1">
                          <h3 className="font-semibold text-sm text-navy dark:text-white leading-tight">{m.name}</h3>
                          <p className="text-xs text-gold font-medium">{m.position}</p>
                          {m.bio && <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2">{m.bio}</p>}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </PublicLayout>
  )
}
