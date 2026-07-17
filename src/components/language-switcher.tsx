'use client'

import * as React from 'react'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" aria-label="Switch language">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem
          onClick={() => setLocale('id')}
          className={`flex items-center justify-between ${locale === 'id' ? 'bg-accent' : ''}`}
        >
          <span className="flex items-center gap-2">
            <span className="text-base">🇮🇩</span> Indonesia
          </span>
          {mounted && locale === 'id' && <span className="text-xs text-gold font-bold">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale('en')}
          className={`flex items-center justify-between ${locale === 'en' ? 'bg-accent' : ''}`}
        >
          <span className="flex items-center gap-2">
            <span className="text-base">🇬🇧</span> English
          </span>
          {mounted && locale === 'en' && <span className="text-xs text-gold font-bold">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
