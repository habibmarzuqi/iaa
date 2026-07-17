/**
 * IAA Digital — shared types & helpers
 */
import { createHash } from 'crypto'

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', opts ?? { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(d)
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'baru saja'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} menit lalu`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} jam lalu`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} hari lalu`
  const mo = Math.floor(day / 30)
  if (mo < 12) return `${mo} bulan lalu`
  return `${Math.floor(mo / 12)} tahun lalu`
}

export function classNames(...args: (string | false | null | undefined)[]) {
  return args.filter(Boolean).join(' ')
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`
}
