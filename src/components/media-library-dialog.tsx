'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Upload, Copy, Trash2, Search, FileText, Image as ImageIcon, Loader2,
  Check, X, FileVideo, FileAudio, Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatBytes, timeAgo } from '@/lib/helpers'

interface MediaAsset {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  alt: string | null
  caption: string | null
  createdAt: string
  uploadedBy: { name: string }
}

interface MediaLibraryDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSelect: (asset: MediaAsset) => void  // callback when user picks an asset
  filterType?: 'image' | 'document' | 'video' | 'audio'
}

export function MediaLibraryDialog({ open, onOpenChange, onSelect, filterType }: MediaLibraryDialogProps) {
  const [assets, setAssets] = React.useState<MediaAsset[]>([])
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<string>(filterType || 'all')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const load = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (typeFilter !== 'all') params.set('type', typeFilter)
    fetch(`/api/media?${params}`)
      .then((r) => r.json())
      .then((d) => setAssets(d.assets ?? []))
      .finally(() => setLoading(false))
  }, [typeFilter])

  React.useEffect(() => {
    if (open) load()
  }, [open, load])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    let success = 0
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/media', { method: 'POST', body: formData })
        if (res.ok) success++
        else {
          const d = await res.json()
          toast.error(`${file.name}: ${d.error}`)
        }
      } catch {
        toast.error(`Gagal upload ${file.name}`)
      }
    }
    setUploading(false)
    if (success > 0) {
      toast.success(`${success} file berhasil diunggah`)
      load()
    }
  }

  const copyUrl = async (asset: MediaAsset) => {
    const fullUrl = window.location.origin + asset.url
    await navigator.clipboard.writeText(fullUrl)
    toast.success('URL disalin ke clipboard')
  }

  const remove = async (asset: MediaAsset) => {
    if (!confirm(`Hapus "${asset.filename}"? File akan dihapus permanen.`)) return
    try {
      await fetch(`/api/media?id=${asset.id}`, { method: 'DELETE' })
      toast.success('Media dihapus')
      load()
    } catch { toast.error('Gagal menghapus') }
  }

  const filtered = assets.filter((a) => {
    if (!search) return true
    return a.filename.toLowerCase().includes(search.toLowerCase()) || (a.alt || '').toLowerCase().includes(search.toLowerCase())
  })

  const getIcon = (mime: string) => {
    if (mime.startsWith('image/')) return ImageIcon
    if (mime.startsWith('video/')) return FileVideo
    if (mime.startsWith('audio/')) return FileAudio
    return FileText
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <ImageIcon className="h-5 w-5 text-gold" /> Media Library
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 pb-3 border-b border-border">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,video/*,audio/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-navy-gradient"
          >
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {uploading ? 'Mengunggah...' : 'Upload File'}
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari file..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          {!filterType && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-xs"
            >
              <option value="all">Semua</option>
              <option value="image">Gambar</option>
              <option value="document">Dokumen</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
            </select>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-premium min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada media. Upload file pertama Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-2">
              {filtered.map((asset, i) => {
                const Icon = getIcon(asset.mimeType)
                const isImage = asset.mimeType.startsWith('image/')
                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative rounded-lg border border-border bg-card overflow-hidden hover:shadow-premium hover:border-gold/40 transition-all"
                  >
                    {/* Preview */}
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {isImage ? (
                         
                        <img src={asset.url} alt={asset.alt || asset.filename} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full grid place-items-center">
                          <Icon className="h-10 w-10 text-muted-foreground" />
                        </div>
                      )}
                      {/* Hover actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center gap-1">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 w-7 p-0"
                            onClick={() => { onSelect(asset); onOpenChange(false) }}
                            title="Pilih media ini"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 w-7 p-0"
                            onClick={() => copyUrl(asset)}
                            title="Salin URL"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                            onClick={() => remove(asset)}
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-2">
                      <div className="text-[10px] font-medium text-navy dark:text-white truncate" title={asset.filename}>{asset.filename}</div>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
