'use client'

import * as React from 'react'
import { X, Hash, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
  value: string  // comma-separated string
  onChange: (v: string) => void
  suggestions?: string[]  // existing tags from DB
  placeholder?: string
}

export function TagInput({ value, onChange, suggestions = [], placeholder }: TagInputProps) {
  const [input, setInput] = React.useState('')
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Parse current tags
  const tags = React.useMemo(() => {
    return value.split(',').map((t) => t.trim()).filter(Boolean)
  }, [value])

  // Filter suggestions (exclude already-added, match input prefix)
  const filteredSuggestions = React.useMemo(() => {
    if (!input.trim()) return []
    const lower = input.toLowerCase().trim()
    return suggestions
      .filter((s) => s.toLowerCase().includes(lower) && !tags.includes(s))
      .slice(0, 6)
  }, [input, suggestions, tags])

  const addTag = (tag: string) => {
    const cleaned = tag.trim().replace(/,/g, '')
    if (!cleaned) return
    if (tags.includes(cleaned)) {
      setInput('')
      return
    }
    const newTags = [...tags, cleaned]
    onChange(newTags.join(', '))
    setInput('')
    setShowSuggestions(false)
  }

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag)
    onChange(newTags.join(', '))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (input.trim()) addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Remove last tag on backspace
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 min-h-9 w-full rounded-md border border-border bg-background px-2 py-1 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px] border-gold/40 text-gold bg-gold/5 gap-1 pr-1">
            <Hash className="h-2.5 w-2.5" />
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
              className="ml-0.5 grid h-3.5 w-3.5 place-items-center rounded-full hover:bg-gold/20"
              aria-label={`Hapus ${tag}`}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? (placeholder || 'Tambah tag...') : ''}
          className="flex-1 min-w-[80px] bg-transparent outline-none text-xs"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-md border border-border bg-popover shadow-premium overflow-hidden">
          <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wide border-b border-border bg-muted/30">
            Saran tag
          </div>
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs hover:bg-accent text-left"
            >
              <Plus className="h-3 w-3 text-gold" />
              <Hash className="h-2.5 w-2.5 text-muted-foreground" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Hint */}
      {tags.length > 0 && (
        <p className="text-[10px] text-muted-foreground mt-1">
          {tags.length} tag · Enter atau koma untuk tambah · Backspace untuk hapus terakhir
        </p>
      )}
    </div>
  )
}
