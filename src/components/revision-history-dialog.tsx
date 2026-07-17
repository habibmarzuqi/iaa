'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ScrollArea,
} from '@/components/ui/scroll-area'
import {
  History, Clock, User, RotateCcw, GitBranch, ArrowRight, Eye,
} from 'lucide-react'
import { formatDateTime, timeAgo } from '@/lib/helpers'
import { toast } from 'sonner'

interface Revision {
  id: string
  version: number
  title: string
  excerpt: string
  content: string
  changeLog: string | null
  createdAt: string
  editedBy: { name: string }
}

interface RevisionHistoryDialogProps {
  open: boolean
  onOpenChange: (o: boolean) => void
  articleId: string | null
  currentTitle?: string
  currentContent?: string
  onRestore?: (revision: Revision) => void  // callback to restore content
}

export function RevisionHistoryDialog({
  open, onOpenChange, articleId, currentTitle, currentContent, onRestore,
}: RevisionHistoryDialogProps) {
  const [revisions, setRevisions] = React.useState<Revision[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedRev, setSelectedRev] = React.useState<Revision | null>(null)
  const [compareWith, setCompareWith] = React.useState<Revision | null>(null)

  const load = React.useCallback(() => {
    if (!articleId) return
    setLoading(true)
    fetch(`/api/articles-revisions?articleId=${articleId}`)
      .then((r) => r.json())
      .then((d) => {
        setRevisions(d.revisions ?? [])
        if (d.revisions?.length > 0) setSelectedRev(d.revisions[0])
      })
      .finally(() => setLoading(false))
  }, [articleId])

  React.useEffect(() => {
    if (open && articleId) load()
  }, [open, articleId, load])

  const restore = (rev: Revision) => {
    if (!confirm(`Restore ke versi ${rev.version}? Konten akan diganti tapi revisi baru akan dibuat (tidak menghapus history).`)) return
    if (onRestore) {
      onRestore(rev)
      toast.success(`Konten di-restore ke versi ${rev.version}. Klik Simpan untuk menyimpan perubahan.`)
      onOpenChange(false)
    }
  }

  // Simple diff: highlight lines that differ
  const diff = React.useMemo(() => {
    if (!selectedRev) return null
    const oldLines = (compareWith?.content || currentContent || '').split('\n')
    const newLines = selectedRev.content.split('\n')
    return { oldLines, newLines }
  }, [selectedRev, compareWith, currentContent])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-navy dark:text-white">
            <History className="h-5 w-5 text-gold" /> Riwayat Revisi Artikel
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center">
            <div className="animate-pulse">Memuat riwayat revisi...</div>
          </div>
        ) : revisions.length === 0 ? (
          <div className="py-12 text-center">
            <History className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada riwayat revisi</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr] gap-4 flex-1 overflow-hidden">
            {/* Revision list */}
            <div className="space-y-2 overflow-y-auto scrollbar-premium">
              {revisions.map((rev, i) => (
                <motion.button
                  key={rev.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedRev(rev)}
                  className={`w-full text-left rounded-lg border p-3 transition-all ${
                    selectedRev?.id === rev.id
                      ? 'border-gold bg-gold/5 shadow-premium'
                      : 'border-border bg-card hover:border-gold/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-[10px] border-navy/30 text-navy dark:text-white">
                      v{rev.version}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(rev.createdAt)}</span>
                  </div>
                  <div className="text-xs font-medium text-navy dark:text-white line-clamp-1">{rev.title}</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                    <User className="h-2.5 w-2.5" /> {rev.editedBy.name}
                  </div>
                  {rev.changeLog && (
                    <div className="text-[10px] text-muted-foreground mt-1 italic line-clamp-1">"{rev.changeLog}"</div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Detail view */}
            <div className="space-y-3 overflow-hidden flex flex-col">
              {selectedRev && (
                <>
                  <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 flex-shrink-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-navy/30 text-navy dark:text-white">Versi {selectedRev.version}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDateTime(selectedRev.createdAt)}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => restore(selectedRev)} className="border-gold/40 text-gold hover:bg-gold/10">
                        <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore ke Versi Ini
                      </Button>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Diedit oleh: </span>
                      <span className="font-medium text-navy dark:text-white">{selectedRev.editedBy.name}</span>
                    </div>
                    {selectedRev.changeLog && (
                      <div className="text-xs italic text-muted-foreground bg-card p-2 rounded">"{selectedRev.changeLog}"</div>
                    )}
                  </div>

                  {/* Content preview */}
                  <div className="flex-1 overflow-y-auto scrollbar-premium rounded-lg border border-border bg-card p-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Konten Versi {selectedRev.version}</div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {selectedRev.content.split('\n').map((line, i) => (
                        <p key={i} className="text-foreground/80 leading-relaxed mb-2 whitespace-pre-wrap">{line || '\u00A0'}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
