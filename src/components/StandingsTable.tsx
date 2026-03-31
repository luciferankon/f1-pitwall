'use client'

import { DriverStanding, ConstructorStanding } from '@/lib/types'
import { getTeamColor, COUNTRY_FLAGS } from '@/lib/teamColors'

interface DriverStandingsProps {
  standings: DriverStanding[]
  onDriverClick: (standing: DriverStanding) => void
}

export function DriverStandings({ standings, onDriverClick }: DriverStandingsProps) {
  if (standings.length === 0) return (
    <div className="text-center py-12 text-[#6b6b88]">No standings data available</div>
  )

  const maxPts = parseFloat(standings[0]?.points ?? '1')

  return (
    <div className="space-y-2 stagger-in">
      {standings.map((s, idx) => {
        const color = getTeamColor(s.Constructors[0]?.constructorId ?? '')
        const driver = s.Driver
        const flag = COUNTRY_FLAGS[driver.nationality] ?? '🏁'
        const pos = parseInt(s.position)

        return (
          <div
            key={driver.driverId}
            onClick={() => onDriverClick(s)}
            className="group flex items-center gap-4 p-4 rounded-xl border border-[#1e1e2e] hover:border-[#2e2e42] bg-[#0d0d14] hover:bg-[#13131e] transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
            style={{ '--team-color': color, animationDelay: `${idx * 0.04}s` } as React.CSSProperties}
          >
            <div className="w-8 text-center flex-shrink-0">
              {pos <= 3
                ? <span className="text-lg">{pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}</span>
                : <span className="text-sm font-bold text-[#6b6b88]">{pos}</span>
              }
            </div>

            <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base">{flag}</span>
                <span className="font-bold text-[#f0f0f8] text-sm">
                  {driver.givenName} {driver.familyName}
                </span>
                <span className="text-xs font-mono text-[#6b6b88]">
                  {driver.code ?? driver.familyName.slice(0, 3).toUpperCase()}
                </span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: color + 'cc' }}>
                {s.Constructors[0]?.name ?? '—'}
              </div>
            </div>

            <div className="flex-1 hidden sm:block">
              <div className="h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(parseFloat(s.points) / maxPts) * 100}%`, backgroundColor: color }}
                />
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-lg font-extrabold tracking-tight" style={{ color }}>
                {s.points}
              </div>
              <div className="text-[10px] text-[#6b6b88]">pts</div>
            </div>

            <div className="hidden lg:flex gap-4 text-center flex-shrink-0">
              {[{ label: 'W', value: s.wins }].map(stat => (
                <div key={stat.label}>
                  <div className="text-sm font-bold text-[#f0f0f8]">{stat.value}</div>
                  <div className="text-[10px] text-[#6b6b88]">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-[#6b6b88] group-hover:text-white transition-colors hidden sm:block">→</div>
          </div>
        )
      })}
    </div>
  )
}

interface ConstructorStandingsProps {
  standings: ConstructorStanding[]
}

export function ConstructorStandings({ standings }: ConstructorStandingsProps) {
  if (standings.length === 0) return (
    <div className="text-center py-12 text-[#6b6b88]">No standings data available</div>
  )

  const max = parseFloat(standings[0]?.points ?? '1')

  return (
    <div className="space-y-3 stagger-in">
      {standings.map((s, idx) => {
        const color = getTeamColor(s.Constructor.constructorId)
        return (
          <div
            key={s.Constructor.constructorId}
            className="p-4 rounded-xl border border-[#1e1e2e] bg-[#0d0d14] hover:border-[#2e2e42] hover:bg-[#13131e] transition-all hover:-translate-y-0.5"
            style={{ animationDelay: `${idx * 0.04}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#6b6b88]">P{s.position}</span>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-bold text-[#f0f0f8]">{s.Constructor.name}</span>
                <span className="text-xs text-[#6b6b88]">{s.Constructor.nationality}</span>
              </div>
              <span className="text-xl font-extrabold" style={{ color }}>{s.points}</span>
            </div>
            <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(parseFloat(s.points) / max) * 100}%`, backgroundColor: color }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-[#6b6b88]">
              <span>{s.wins} wins</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
