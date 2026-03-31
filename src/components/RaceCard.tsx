'use client'

import { Race } from '@/lib/types'

const COUNTRY_FLAGS: Record<string, string> = {
  Australia: '🇦🇺', Bahrain: '🇧🇭', China: '🇨🇳', Japan: '🇯🇵', 'Saudi Arabia': '🇸🇦',
  USA: '🇺🇸', 'United States': '🇺🇸', Italy: '🇮🇹', Monaco: '🇲🇨', Spain: '🇪🇸',
  Canada: '🇨🇦', Austria: '🇦🇹', 'United Kingdom': '🇬🇧', Hungary: '🇭🇺', Belgium: '🇧🇪',
  Netherlands: '🇳🇱', Singapore: '🇸🇬', Mexico: '🇲🇽', Brazil: '🇧🇷', 'Las Vegas': '🇺🇸',
  Qatar: '🇶🇦', UAE: '🇦🇪', Azerbaijan: '🇦🇿', France: '🇫🇷', Germany: '🇩🇪',
  Russia: '🇷🇺', Turkey: '🇹🇷', Portugal: '🇵🇹', Bahamas: '🇧🇸',
}

function getFlag(country: string): string {
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (country.includes(key) || key.includes(country)) return flag
  }
  return '🏁'
}

interface RaceCardProps {
  race: Race
  index: number
  isPast: boolean
  onClick: () => void
}

export default function RaceCard({ race, index, isPast, onClick }: RaceCardProps) {
  const flag = getFlag(race.Circuit.Location.country)
  const date = new Date(race.date)
  const month = date.toLocaleString('en', { month: 'short' })
  const day = date.getDate()

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(232,0,45,0.2)]"
      style={{
        borderColor: isPast ? '#2e2e42' : '#E8002D44',
        background: isPast ? '#0d0d14' : 'linear-gradient(135deg, #0d0d14 0%, #1a0808 100%)',
      }}
    >
      {/* Top accent */}
      <div
        className="h-0.5 w-full transition-all duration-300 group-hover:h-1"
        style={{ backgroundColor: isPast ? '#2e2e42' : '#E8002D' }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-[#6b6b88] uppercase tracking-widest">
                R{race.round}
              </span>
              {isPast ? (
                <span className="text-[9px] px-1.5 py-0.5 bg-[#2e2e42] text-[#6b6b88] rounded-full font-bold uppercase">done</span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 bg-[rgba(232,0,45,0.2)] text-[#E8002D] rounded-full font-bold uppercase border border-[rgba(232,0,45,0.3)]">upcoming</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{flag}</span>
              <span className="font-black text-white text-sm leading-tight">
                {race.raceName.replace(' Grand Prix', ' GP')}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black text-white">{day}</div>
            <div className="text-[10px] text-[#6b6b88] uppercase font-bold">{month}</div>
          </div>
        </div>

        <div className="text-[10px] text-[#6b6b88] mb-3 leading-tight">
          {race.Circuit.circuitName}
        </div>

        {/* View button */}
        <div
          className="flex items-center justify-between text-xs font-bold transition-all"
          style={{ color: isPast ? '#6b6b88' : '#E8002D' }}
        >
          <span>{isPast ? 'View results' : 'Preview'}</span>
          <span className="text-base transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl"
        style={{ boxShadow: `inset 0 0 40px ${isPast ? 'rgba(100,100,150,0.05)' : 'rgba(232,0,45,0.08)'}` }}
      />
    </div>
  )
}
