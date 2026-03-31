'use client'

import { useState, useEffect } from 'react'
import { DriverStanding } from '@/lib/types'
import { getTeamColors, COUNTRY_FLAGS } from '@/lib/teamColors'

interface DriverCardProps {
  standing: DriverStanding
  onClick: () => void
}

export default function DriverCard({ standing, onClick }: DriverCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [loadingPhoto, setLoadingPhoto] = useState(true)

  const { Driver, Constructors, points, wins, position } = standing
  const constructor = Constructors[0]
  const colors = getTeamColors(constructor?.constructorId ?? '')
  const fullName = `${Driver.givenName} ${Driver.familyName}`
  const flag = COUNTRY_FLAGS[Driver.nationality] ?? '🏁'

  useEffect(() => {
    if (!Driver.url) return
    fetch(`/api/driver-photo?wikiUrl=${encodeURIComponent(Driver.url)}`)
      .then(r => r.json())
      .then(d => setPhoto(d.photo))
      .catch(() => {})
      .finally(() => setLoadingPhoto(false))
  }, [Driver.url])

  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: '1000px', height: '260px' }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={onClick}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border"
          style={{ backfaceVisibility: 'hidden', borderColor: colors.primary + '44' }}
        >
          {/* Team color header bar */}
          <div className="h-1.5 w-full" style={{ backgroundColor: colors.primary }} />

          {/* Photo area */}
          <div className="relative h-36 overflow-hidden bg-[#0d0d14]">
            {loadingPhoto ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#2e2e42] border-t-white/40 rounded-full animate-spin" />
              </div>
            ) : photo ? (
              <img
                src={photo}
                alt={fullName}
                className="w-full h-full object-cover object-top"
                style={{ filter: 'grayscale(10%) contrast(1.05)' }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-5xl font-black"
                style={{ background: `linear-gradient(135deg, ${colors.primary}22, ${colors.primary}55)`, color: colors.primary }}
              >
                {Driver.givenName[0]}{Driver.familyName[0]}
              </div>
            )}
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, #0d0d14 0%, transparent 60%)` }}
            />
            {/* Position badge */}
            <div
              className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{ backgroundColor: colors.primary, color: colors.text }}
            >
              {position}
            </div>
            {/* Code badge */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-xs font-mono font-bold">
              {Driver.code ?? Driver.familyName.slice(0, 3).toUpperCase()}
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-[#0d0d14]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-base">{flag}</span>
              <span className="font-black text-white text-sm leading-tight">{fullName}</span>
            </div>
            <div className="text-xs font-semibold mb-2" style={{ color: colors.primary }}>
              {constructor?.name}
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-2xl font-extrabold" style={{ color: colors.primary }}>{points}</span>
                <span className="text-xs text-[#6b6b88] ml-1">pts</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white">{wins}</span>
                <span className="text-xs text-[#6b6b88] ml-1">wins</span>
              </div>
            </div>
          </div>

          {/* Click hint */}
          <div className="absolute bottom-0 inset-x-0 text-center text-[9px] text-[#6b6b88] pb-1 opacity-0 hover:opacity-100 transition-opacity">
            click for full profile
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden border bg-[#0d0d14] p-4"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderColor: colors.primary + '44' }}
        >
          <div className="h-1.5 w-full rounded-full mb-3" style={{ backgroundColor: colors.primary }} />
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: colors.primary }}>
            {flag} {fullName}
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { label: 'Points', value: points },
              { label: 'Wins', value: wins },
              { label: 'Nationality', value: Driver.nationality },
              { label: 'Number', value: Driver.permanentNumber ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#13131e] rounded-xl p-2">
                <div className="text-lg font-extrabold text-white leading-none">{value}</div>
                <div className="text-[9px] text-[#6b6b88] mt-0.5 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center">
            <div
              className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ backgroundColor: colors.primary + '22', color: colors.primary, border: `1px solid ${colors.primary}44` }}
            >
              Click for full career →
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
