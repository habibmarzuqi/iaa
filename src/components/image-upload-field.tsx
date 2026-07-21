'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadFieldProps {
  label: string
  value: string
  onChange: (url: string) => void
  uploadEndpoint?: string
  hint?: string
  aspectRatio?: string
}

export function ImageUploadField({
  label, value, onChange, uploadEndpoint = '/api/articles-admin/upload', hint, aspectRatio = 'aspect-video',
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = React.useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(uploadEndpoint, { method: 'POST', body: fd })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error || 'Gagal upload'); return }
      onChange(d.url)
      toast.success('Gambar terunggah')
    } catch { toast.error('Gagal upload gambar') } finally { setUploading(false) }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-start gap-3">
        <div className={`${aspectRatio} w-32 flex-shrink-0 rounded-lg border border-border bg-muted overflow-hidden grid place-items-center`}>
          {value ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id={`upload-${label.replace(/\s/g, '-').toLowerCase()}`}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f) }}
          />
          <label htmlFor={`upload-${label.replace(/\s/g, '-').toLowerCase()}`}>
            <Button type="button" variant="outline" size="sm" disabled={uploading} className="cursor-pointer">
              {uploading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}
              Upload
            </Button>
          </label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/uploads/... atau URL"
            className="font-mono text-xs"
          />
          {value && (
            <Button type="button" variant="ghost" size="sm" className="text-red-600 h-7" onClick={() => onChange('')}>
              <X className="h-3.5 w-3.5 mr-1" /> Hapus
            </Button>
          )}
        </div>
      </div>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
