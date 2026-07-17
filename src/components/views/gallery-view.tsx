'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { PublicLayout } from '@/components/layout/public-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Image as ImageIcon, Images } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

export function GalleryView() {
  const { setView } = useApp()
  const [albums, setAlbums] = React.useState<any[]>([])
  const [photos, setPhotos] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState<any | null>(null)

  React.useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((d) => {
        setAlbums(d.albums ?? [])
        setPhotos(d.photos ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <div className="bg-hero-gradient text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <Button variant="ghost" onClick={() => setView({ name: 'public' })} className="text-white/70 hover:text-white hover:bg-white/10 mb-4 -ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Beranda
          </Button>
          <Badge className="bg-gold text-navy hover:bg-gold mb-3">Galeri</Badge>
          <h1 className="font-display text-4xl lg:text-5xl font-extrabold">Galeri Kegiatan IAA</h1>
          <p className="text-white/70 mt-2 max-w-2xl">Dokumentasi foto kegiatan, acara, dan momen organisasi</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        {/* Albums */}
        <h2 className="font-display text-2xl font-bold mb-5 text-navy dark:text-white">Album</h2>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {albums.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="group cursor-pointer border-border hover:border-gold/40 hover:shadow-premium transition-all overflow-hidden">
                  <div className="relative h-44 bg-navy-gradient overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-30" />
                    <div className="absolute inset-0 grid place-items-center">
                      <Images className="h-12 w-12 text-white/40" />
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">{a._count.photos} foto</Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-navy dark:text-white">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Photo grid */}
        <h2 className="font-display text-2xl font-bold mb-5 text-navy dark:text-white">Foto Terbaru</h2>
        {loading ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => setSelected(p)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="group relative aspect-square overflow-hidden rounded-xl bg-navy-gradient cursor-pointer"
              >
                <div className="absolute inset-0 bg-grid opacity-30" />
                <div className="absolute inset-0 grid place-items-center">
                  <ImageIcon className="h-8 w-8 text-white/30 group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-left">
                  <div className="text-xs font-medium truncate">{p.title}</div>
                  <div className="text-[10px] text-white/70 truncate">{p.album?.title}</div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">{selected?.title}</DialogTitle>
          <div className="aspect-video rounded-lg bg-navy-gradient grid place-items-center">
            <ImageIcon className="h-16 w-16 text-white/40" />
          </div>
          <div className="mt-3">
            <h3 className="font-semibold text-navy dark:text-white">{selected?.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{selected?.album?.title}</p>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  )
}
