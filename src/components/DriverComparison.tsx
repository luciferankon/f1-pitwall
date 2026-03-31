'use client'

import { useState, useEffect, useMemo } from 'react'
import { DriverStanding } from '@/lib/types'
import { getTeamColor } from '@/lib/teamColors'

interface DriverComparisonProps {
  driverStandings: DriverStanding[]
}

interface CompStat { label: string; a: number; b: number }

export default function DriverComparison({ driverStandings }: DriverComparisonProps) {
  const [driverA, setDriverA] = useState<string>('')
  const [driverB, setDriverB] = useState<string>('')
  const [statsA, setStatsA] = useState<any>(null)
  const [statsB, setStatsB] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const standingA = useMemo(() => driverStandings.find(s => s.Driver.driverId === driverA), [driverA, driverStandings])
  const standingB = useMemo(() => driverStandings.find(s => s.Driver.driverId === driverB), [driverB, driverStandings])

  useEffect(() => {
    if (driverStandings.length >= 2) {
      setDriverA(driverStandings[0].Driver.driverId)
      setDriverB(driverStandings[1].Driver.driverId)
    }
  }, [driverStandings])

  useEffect(() => {
    if (!driverA || !driverB) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/api/driver-career?driverId=${driverA}`).then(r => r.json()),
      fetch(`/api/driver-career?driverId=${driverB}`).then(r => r.json()),
    ]).then(([a, b]) => {
      if (!cancelled) { setStatsA(a); setStatsB(b) }
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [driverA, driverB])

  const colorA = getTeamColor(standingA?.Constructors[0]?.constructorId ?? '')
  const colorB = getTeamColor(standingB?.Constructors[0]?.constructorId ?? '')

  const compStats: CompStat[] = statsA && statsB ? [
    { label: 'Career Races', a: statsA.totalRaces, b: statsB.totalRaces },
    { label: 'Wins', a: statsA.wins, b: statsB.wins },
    { label: 'Podiums', a: statsA.podiums, b: statsB.podiums },
    { label: 'Poles', a: statsA.poles, b: statsB.poles },
    { label: 'Championships', a: statsA.championships, b: statsB.championships },
    { label: 'Career Points', a: statsA.totalPoints, b: statsB.totalPoints },
    { label: 'Season Points', a: parseFloat(standingA?.points ?? '0'), b: parseFloat(standingB?.points ?? '0') },
  ] : []

  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-[#1e1e2e] p-5" style={{ animation: 'slideUp 0.5s ease-out' }}>
      <h3 className="text-lg font-black text-white mb-4">Head-to-Head</h3>
      <div className="flex gap-3 mb-5">
        {[{ val: driverA, set: setDriverA, color: colorA }, { val: driverB, set: setDriverB, color: colorB }].map((sel, idx) => (
          <select
            key={idx}
            value={sel.val}
            onChange={e => sel.set(e.target.value)}
            className="flex-1 bg-[#13131e] border border-[#2e2e42] rounded-xl px-3 py-2.5 text-sm font-bold text-white appearance-none cursor-pointer focus:outline-none focus:border-[#4e4e62] transition-all"
            style={{ borderColor: sel.color + '44' }}
          >
            <option value="">Select driver</option>
            {driverStandings.map(s => (
              <option key={s.Driver.driverId} value={s.Driver.driverId}>
                {s.Driver.givenName} {s.Driver.familyName}
              </option>
            ))}
          </select>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#2e2e42] border-t-[#E8002D] rounded-full animate-spin" />
        </div>
      ) : compStats.length > 0 ? (
        <div className="space-y-3">
          {compStats.map((stat, i) => {
            const max = Math.max(stat.a, stat.b, 1)
            const pctA = (stat.a / max) * 100
            const pctB = (stat.b / max) * 100
            const winnerA = stat.a > stat.b
            const winnerB = stat.b > stat.a
            return (
              <div key={stat.label} style={{ animation: `slideUp 0.4s ease-out ${i * 0.05}s both` }}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-bold tabular-nums ${winnerA ? 'text-white' : 'text-[#6b6b88]'}`}>{stat.a.toLocaleString()}</span>
                  <span className="text-[10px] text-[#6b6b88] uppercase tracking-widest font-bold">{stat.label}</span>
                  <span className={`text-sm font-bold tabular-nums ${winnerB ? 'text-white' : 'text-[#6b6b88]'}`}>{stat.b.toLocaleString()}</span>
                </div>
                <div className="flex gap-1 h-2">
                  <div className="flex-1 flex justify-end">
                    <div className="h-full rounded-l-full transition-all duration-700" style={{ width: `${pctA}%`, backgroundColor: colorA, opacity: winnerA ? 1 : 0.4 }} />
                  </div>
                  <div className="flex-1">
                    <div className="h-full rounded-r-full transition-all duration-700" style={{ width: `${pctB}%`, backgroundColor: colorB, opacity: winnerB ? 1 : 0.4 }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-[#6b6b88] text-sm">Select two drivers to compare</div>
      )}
    </div>
  )
}
