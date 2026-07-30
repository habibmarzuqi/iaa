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
  const [selectedAlbum, setSelectedAlbum] = React.useState<any | null>(null)
  const [selectedPhoto, setSelectedPhoto] = React.useState<any | null>(null)

  React.useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((d) => {
        setAlbums(d.albums ?? [])
        setPhotos(d.photos ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSelectAlbum = (album: any) => {
    if (selectedAlbum?.id === album.id) {
      setSelectedAlbum(null)
      fetch('/api/gallery')
        .then((r) => r.json())
        .then((d) => setPhotos(d.photos ?? []))
    } else {
      setSelectedAlbum(album)
      fetch(`/api/gallery?id=${album.id}`)
        .then((r) => r.json())
        .then((d) => setPhotos(d.album?.photos ?? []))
    }
  }

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
          <p className="text-white/70 mt-2 max-w-2xl">Dokumentasi foto kegiatan, acara, dan momen penting organisasi ikatan arsiparis</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        {/* Albums Section */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold text-navy dark:text-white">Album Dokumentasi</h2>
          {selectedAlbum && (
            <Button size="sm" variant="outline" onClick={() => handleSelectAlbum(selectedAlbum)} className="text-xs">
              Tampilkan Semua Foto
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {albums.map((a, i) => {
              const isSelected = selectedAlbum?.id === a.id
              const cover = a.coverImage || a.photos?.[0]?.url
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card
                    onClick={() => handleSelectAlbum(a)}
                    className={`group cursor-pointer border-border hover:border-gold/40 hover:shadow-premium transition-all overflow-hidden ${
                      isSelected ? 'ring-2 ring-gold border-gold' : ''
                    }`}
                  >
                    <div className="relative h-44 bg-navy-gradient overflow-hidden">
                      {cover ? (
                        <img src={cover} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center">
                          <Images className="h-12 w-12 text-white/40" />
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-black/60 text-white border-white/30 backdrop-blur">{a._count?.photos ?? 0} foto</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-navy dark:text-white group-hover:text-gold transition-colors">{a.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description || 'Tanpa deskripsi'}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Photo grid */}
        <h2 className="font-display text-2xl font-bold mb-5 text-navy dark:text-white">
          {selectedAlbum ? `Foto: ${selectedAlbum.title}` : 'Foto Terbaru'}
        </h2>

        {loading ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Belum ada foto pada album ini</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((p, i) => (
              <motion.button
                key={p.id}
                onClick={() => setSelectedPhoto(p)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="group relative aspect-square overflow-hidden rounded-xl bg-navy-gradient cursor-pointer border border-border hover:border-gold/40 shadow-sm"
              >
                <img src={p.url} alt={p.title || 'Foto'} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white text-left">
                  {p.title && <div className="text-xs font-medium truncate">{p.title}</div>}
                  {p.album?.title && <div className="text-[10px] text-white/70 truncate">{p.album.title}</div>}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={(o) => !o && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl bg-black/95 text-white border-white/10 p-4">
          <DialogTitle className="sr-only">{selectedPhoto?.title || 'Foto Galeri'}</DialogTitle>
          <div className="flex flex-col items-center justify-center min-h-[50vh] max-h-[80vh]">
            {selectedPhoto && (
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title || 'Foto Galeri'}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            )}
          </div>
          {selectedPhoto && (
            <div className="mt-3 text-center">
              <h3 className="font-semibold text-white text-base">{selectedPhoto.title || 'Foto Dokumentasi'}</h3>
              {selectedPhoto.album?.title && <p className="text-xs text-white/60 mt-0.5">{selectedPhoto.album.title}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  )
}
