'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { AdminShell } from '@/components/admin/admin-shell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from '@/components/ui/tabs'
import {
  FolderOpen, Image as ImageIcon, FileText, FileVideo, FileAudio,
  Search, Upload, Copy, Trash2, Loader2, Download, ExternalLink,
  HardDrive, FileCheck, FileArchive, Folder,
} from 'lucide-react'
import { formatBytes, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'

interface MediaAsset {
  id: string; filename: string; url: string; mimeType: string; size: number
  width: number | null; height: number | null; alt: string | null
  thumbUrl: string | null; mediumUrl: string | null; largeUrl: string | null
  createdAt: string; uploadedBy: { name: string }
}

interface ArchiveFile {
  id: string; archiveNumber: string; title: string; category: string
  versions: { id: string; version: number; fileName: string | null; fileUrl: string | null; fileSize: number | null; mimeType: string | null; createdAt: string }[]
}

interface GalleryPhotoItem {
  id: string; title: string | null; url: string; albumId: string
  album: { title: string }; createdAt: string
}

export function AdminFilesView() {
  const [mediaAssets, setMediaAssets] = React.useState<MediaAsset[]>([])
  const [archiveFiles, setArchiveFiles] = React.useState<ArchiveFile[]>([])
  const [galleryPhotos, setGalleryPhotos] = React.useState<GalleryPhotoItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')

  const load = React.useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/media?limit=100').then((r) => r.json()),
      fetch('/api/archives?admin=true&limit=100').then((r) => r.json()).catch(() => ({ archives: [] })),
      fetch('/api/gallery?admin=true').then((r) => r.json()).catch(() => ({ albums: [] })),
    ])
      .then(([media, archives, gallery]) => {
        setMediaAssets(media.assets ?? [])

        // Flatten archive versions into file list
        const archFiles: ArchiveFile[] = (archives.archives ?? []).filter((a: any) =>
          a.versions?.some((v: any) => v.fileUrl)
        )
        setArchiveFiles(archFiles)

        // Flatten gallery photos
        const photos: GalleryPhotoItem[] = (gallery.albums ?? []).flatMap((album: any) =>
          (album.photos ?? []).map((p: any) => ({
            id: p.id, title: p.title, url: p.url, albumId: album.id,
            album: { title: album.title }, createdAt: p.createdAt,
          }))
        )
        setGalleryPhotos(photos)
      })
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(() => { load() }, [load])

  const totalSize = React.useMemo(() => {
    const mediaSize = mediaAssets.reduce((s, a) => s + a.size, 0)
    const archiveSize = archiveFiles.reduce((s, a) => s + (a.versions.find((v) => v.fileUrl)?.fileSize ?? 0), 0)
    return mediaSize + archiveSize
  }, [mediaAssets, archiveFiles])

  const copyUrl = async (url: string) => {
    const fullUrl = window.location.origin + url
    await navigator.clipboard.writeText(fullUrl)
    toast.success('URL disalin')
  }

  const deleteMedia = async (id: string) => {
    if (!confirm('Hapus file ini?')) return
    try {
      await fetch(`/api/media?id=${id}`, { method: 'DELETE' })
      toast.success('File dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon
    if (mimeType.startsWith('video/')) return FileVideo
    if (mimeType.startsWith('audio/')) return FileAudio
    if (mimeType === 'application/pdf') return FileText
    return FileArchive
  }

  return (
    <AdminShell
      activeKey="files"
      title="File Manager Terpadu"
      subtitle="Kelola semua file: media library, dokumen arsip, dan foto galeri dalam satu browser"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Media Library" value={mediaAssets.length} icon={ImageIcon} color="from-blue-soft to-blue" />
        <StatCard label="File Arsip" value={archiveFiles.reduce((s, a) => s + a.versions.filter((v) => v.fileUrl).length, 0)} icon={FileArchive} color="from-emerald-400 to-emerald-600" />
        <StatCard label="Foto Galeri" value={galleryPhotos.length} icon={ImageIcon} color="from-purple-400 to-purple-600" />
        <StatCard label="Total Size" value={formatBytes(totalSize)} icon={HardDrive} color="from-gold-soft to-gold" />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari file di semua kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="media">
        <TabsList>
          <TabsTrigger value="media" className="gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Media Library ({mediaAssets.length})
          </TabsTrigger>
          <TabsTrigger value="archives" className="gap-1.5">
            <FileArchive className="h-3.5 w-3.5" /> Arsip ({archiveFiles.length})
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Galeri ({galleryPhotos.length})
          </TabsTrigger>
        </TabsList>

        {/* Media Library tab */}
        <TabsContent value="media">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />)}
                </div>
              ) : mediaAssets.length === 0 ? (
                <EmptyState icon={ImageIcon} label="Belum ada file di media library" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
                  {mediaAssets
                    .filter((a) => !search || a.filename.toLowerCase().includes(search.toLowerCase()))
                    .map((asset, i) => {
                      const Icon = getIcon(asset.mimeType)
                      const isImage = asset.mimeType.startsWith('image/')
                      return (
                        <motion.div
                          key={asset.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="group relative rounded-lg border border-border bg-card overflow-hidden hover:shadow-premium hover:border-gold/40 transition-all"
                        >
                          <div className="aspect-square bg-muted relative overflow-hidden">
                            {isImage ? (
                              <img src={asset.thumbUrl || asset.url} alt={asset.alt || asset.filename} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full grid place-items-center">
                                <Icon className="h-10 w-10 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center gap-1">
                              <div className="flex gap-1">
                                <a href={asset.url} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="secondary" className="h-7 w-7 p-0"><ExternalLink className="h-3.5 w-3.5" /></Button>
                                </a>
                                <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={() => copyUrl(asset.url)}><Copy className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="secondary" className="h-7 w-7 p-0 text-red-600" onClick={() => deleteMedia(asset.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            <div className="text-[10px] font-medium text-navy dark:text-white truncate">{asset.filename}</div>
                            <div className="flex items-center justify-between mt-0.5 text-[9px] text-muted-foreground">
                              <span>{formatBytes(asset.size)}</span>
                              <span>{timeAgo(asset.createdAt)}</span>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archive files tab */}
        <TabsContent value="archives">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
              ) : archiveFiles.length === 0 ? (
                <EmptyState icon={FileArchive} label="Belum ada file arsip" />
              ) : (
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto scrollbar-premium">
                  {archiveFiles
                    .filter((a) => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.archiveNumber.toLowerCase().includes(search.toLowerCase()))
                    .flatMap((archive) =>
                      archive.versions
                        .filter((v) => v.fileUrl)
                        .map((version) => (
                          <div key={version.id} className="p-4 hover:bg-muted/30 flex items-center gap-3">
                            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                              {version.mimeType === 'application/pdf' ? <FileText className="h-5 w-5" /> : <FileArchive className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="font-mono text-[10px] text-muted-foreground">{archive.archiveNumber}</span>
                                <Badge variant="outline" className="text-[9px]">v{version.version}</Badge>
                                <Badge variant="outline" className="text-[9px]">{archive.category}</Badge>
                              </div>
                              <div className="text-sm font-medium text-navy dark:text-white truncate">{version.fileName || archive.title}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {version.fileSize ? formatBytes(version.fileSize) : ''} · {version.mimeType} · {timeAgo(version.createdAt)}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              {version.mimeType === 'application/pdf' && (
                                <a href={`/api/archives/pdf-preview?url=${encodeURIComponent(version.fileUrl!)}`} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Preview PDF"><ExternalLink className="h-3.5 w-3.5" /></Button>
                                </a>
                              )}
                              <a href={version.fileUrl!} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Buka file"><FileCheck className="h-3.5 w-3.5" /></Button>
                              </a>
                              <a href={version.fileUrl!} download={version.fileName || undefined}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Download"><Download className="h-3.5 w-3.5" /></Button>
                              </a>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => copyUrl(version.fileUrl!)} title="Salin URL"><Copy className="h-3.5 w-3.5" /></Button>
                            </div>
                          </div>
                        ))
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery photos tab */}
        <TabsContent value="gallery">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 grid grid-cols-3 gap-2">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />)}</div>
              ) : galleryPhotos.length === 0 ? (
                <EmptyState icon={ImageIcon} label="Belum ada foto galeri" />
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-4 max-h-[600px] overflow-y-auto scrollbar-premium">
                  {galleryPhotos
                    .filter((p) => !search || (p.title || '').toLowerCase().includes(search.toLowerCase()) || p.album.title.toLowerCase().includes(search.toLowerCase()))
                    .map((photo, i) => (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                      >
                        <img src={photo.url} alt={photo.title || 'Foto'} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                          <div className="flex gap-1">
                            <a href={photo.url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0"><ExternalLink className="h-3.5 w-3.5" /></Button>
                            </a>
                            <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={() => copyUrl(photo.url)}><Copy className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                          <p className="text-[8px] text-white truncate">{photo.album.title}</p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminShell>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${color} text-white mb-2`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-2xl font-bold font-display text-navy dark:text-white">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
