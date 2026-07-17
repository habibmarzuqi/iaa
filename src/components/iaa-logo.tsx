/**
 * IAA Digital — Logo SVG component
 */
import { cn } from '@/lib/utils'

export function IAALogo({ className, withText = false, light = false }: { className?: string; withText?: boolean; light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 48 48" className={cn('h-9 w-9', className)} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield */}
        <path d="M24 2L4 10v14c0 12 8.5 19.5 20 22 11.5-2.5 20-10 20-22V10L24 2z" fill="url(#iaa-gradient)" />
        {/* Inner arch / book shape */}
        <path d="M14 22v10c0 1 .8 2 2 2h16c1.2 0 2-1 2-2V22c0-5.5-4.5-10-10-10s-10 4.5-10 10z" fill="white" fillOpacity="0.95" />
        <path d="M14 22c0 5.5 4.5 10 10 10s10-4.5 10-10" stroke="#0a1e3f" strokeWidth="1.5" fill="none" />
        {/* Pillars */}
        <rect x="17" y="24" width="2" height="6" rx="1" fill="#0a1e3f" />
        <rect x="23" y="24" width="2" height="6" rx="1" fill="#0a1e3f" />
        <rect x="29" y="24" width="2" height="6" rx="1" fill="#0a1e3f" />
        <rect x="16" y="31" width="16" height="1.5" rx="0.75" fill="#c9a227" />
        <defs>
          <linearGradient id="iaa-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0a1e3f" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
      {withText && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-display font-extrabold tracking-tight text-[15px]', light ? 'text-white' : 'text-navy')}>
            IAA Digital
          </span>
          <span className={cn('text-[10px] tracking-wider uppercase mt-0.5', light ? 'text-white/60' : 'text-muted-foreground')}>
            Ikatan Arsiparis ANRI
          </span>
        </div>
      )}
    </div>
  )
}
