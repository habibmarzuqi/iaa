'use client'

import * as React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { IAALogo } from '@/components/iaa-logo'
import { Badge } from '@/components/ui/badge'
import { Award, Calendar, Building2, Fingerprint, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MembershipCardProps {
  member: {
    memberNumber: string
    fullName: string
    position?: string | null
    workUnit?: string | null
    arsiparisLevel?: string | null
    status: string
    joinDate: string | Date
    photo?: string | null
  }
  email: string
}

const LEVEL_LABELS: Record<string, string> = {
  PEMULA: 'Pemula',
  MUDA: 'Muda',
  MADYA: 'Madya',
  UTAMA: 'Utama',
}

const STATUS_LABELS: Record<string, string> = {
  AKTIF: 'AKTIF',
  TIDAK_AKTIF: 'TIDAK AKTIF',
  PENSIUN: 'PENSIUN',
  MENINGGAL: 'ALMARHUM',
}

export function DigitalMembershipCard({ member, email }: MembershipCardProps) {
  const qrData = React.useMemo(() => {
    return JSON.stringify({
      no: member.memberNumber,
      name: member.fullName,
      status: member.status,
      issued: 'IAA Digital',
      verified: 'https://iaa-anri.go.id/verify',
    })
  }, [member])

  const initials = member.fullName
    .split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

  const joinDate = new Date(member.joinDate)

  return (
    <div className="w-full">
      {/* Card */}
      <div
        id="membership-card"
        className="relative aspect-[1.586/1] w-full max-w-[480px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#0a1e3f] via-[#1e3a6b] to-[#061229]"
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue/30 blur-3xl" />

        {/* Top: chip + logo */}
        <div className="relative p-5 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <IAALogo light />
            <div className="flex flex-col leading-none">
              <span className="font-display font-extrabold tracking-tight text-[13px] text-white">IAA Digital</span>
              <span className="text-[9px] tracking-wider uppercase mt-0.5 text-white/50">Membership Card</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-white/50 uppercase tracking-wider">Status</div>
            <div className={`text-[11px] font-bold ${member.status === 'AKTIF' ? 'text-emerald-300' : 'text-red-300'}`}>
              ● {STATUS_LABELS[member.status] ?? member.status}
            </div>
          </div>
        </div>

        {/* Middle: member info */}
        <div className="relative px-5 flex items-center gap-4">
          {/* Avatar circle */}
          <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-gold/40 shadow-lg bg-white/10 grid place-items-center">
            {member.photo ? (
              <img src={member.photo} alt={member.fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-white font-display font-bold text-xl">{initials}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[9px] text-white/50 uppercase tracking-wider mb-0.5">Nama Anggota</div>
            <div className="text-white font-display font-bold text-base leading-tight truncate">
              {member.fullName}
            </div>
            {member.position && (
              <div className="text-white/70 text-[11px] mt-0.5 flex items-center gap-1">
                <Award className="h-3 w-3 text-gold" /> {member.position}
              </div>
            )}
          </div>
        </div>

        {/* Bottom: meta + QR */}
        <div className="relative mt-4 px-5 pb-5 flex items-end justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px]">
              <Fingerprint className="h-3 w-3 text-gold flex-shrink-0" />
              <span className="text-white/50">No. Anggota:</span>
              <span className="text-white font-mono font-semibold">{member.memberNumber}</span>
            </div>
            {member.workUnit && (
              <div className="flex items-center gap-2 text-[10px]">
                <Building2 className="h-3 w-3 text-gold flex-shrink-0" />
                <span className="text-white/70 truncate">{member.workUnit}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[10px]">
              <Calendar className="h-3 w-3 text-gold flex-shrink-0" />
              <span className="text-white/50">Anggota sejak:</span>
              <span className="text-white/70">{joinDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
            </div>
            {member.arsiparisLevel && (
              <div className="inline-flex items-center gap-1 rounded-full bg-gold/20 border border-gold/30 px-2 py-0.5 text-[10px] text-gold font-semibold mt-1">
                <Award className="h-2.5 w-2.5" /> Arsiparis {LEVEL_LABELS[member.arsiparisLevel] ?? member.arsiparisLevel}
              </div>
            )}
          </div>

          {/* QR Code */}
          <div className="bg-white rounded-lg p-2 shadow-lg flex-shrink-0">
            <QRCodeSVG
              value={qrData}
              size={72}
              level="M"
              bgColor="#ffffff"
              fgColor="#0a1e3f"
            />
          </div>
        </div>

        {/* Footer strip */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold-gradient" />
      </div>

      {/* Verification note */}
      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Pindai QR Code untuk verifikasi keaslian kartu di portal IAA
      </p>
    </div>
  )
}
