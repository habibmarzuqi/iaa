'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataPaginationProps {
  page: number          // 1-indexed current page
  pageSize: number      // items per page
  total: number         // total items
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?: number[]
  className?: string
  showTotal?: boolean
  showPageSize?: boolean
}

/**
 * Reusable server-side pagination control.
 * Shows: "<< <  Page X of Y  > >>" + total + optional page size selector.
 */
export function DataPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
  showTotal = true,
  showPageSize = true,
}: DataPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startItem = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endItem = Math.min(safePage * pageSize, total)

  const canPrev = safePage > 1
  const canNext = safePage < totalPages

  // Compact page button list (current ± 1, with ellipsis)
  const pageNumbers: (number | 'ellipsis')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)
  } else {
    pageNumbers.push(1)
    if (safePage > 3) pageNumbers.push('ellipsis')
    const start = Math.max(2, safePage - 1)
    const end = Math.min(totalPages - 1, safePage + 1)
    for (let i = start; i <= end; i++) pageNumbers.push(i)
    if (safePage < totalPages - 2) pageNumbers.push('ellipsis')
    pageNumbers.push(totalPages)
  }

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-2', className)}>
      {showTotal && (
        <div className="text-xs text-muted-foreground">
          Menampilkan <span className="font-semibold text-navy dark:text-white">{startItem}-{endItem}</span> dari{' '}
          <span className="font-semibold text-navy dark:text-white">{total.toLocaleString('id-ID')}</span> data
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Per hal</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs cursor-pointer hover:bg-accent"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={!canPrev}
            onClick={() => onPageChange(1)}
            title="Halaman pertama"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={!canPrev}
            onClick={() => onPageChange(safePage - 1)}
            title="Halaman sebelumnya"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {pageNumbers.map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`e-${i}`} className="px-1 text-muted-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </span>
            ) : (
              <Button
                key={p}
                variant={p === safePage ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-8 min-w-[32px] px-2 text-xs font-semibold',
                  p === safePage && 'bg-navy-gradient text-white hover:bg-navy-gradient',
                )}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={!canNext}
            onClick={() => onPageChange(safePage + 1)}
            title="Halaman berikutnya"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={!canNext}
            onClick={() => onPageChange(totalPages)}
            title="Halaman terakhir"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
