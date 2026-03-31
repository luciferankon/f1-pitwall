'use client'

import { DRIVERS_2024, CONSTRUCTORS_2024, CONSTRUCTOR_COLORS, type Driver } from '@/lib/data'
import { useState } from 'react'

function DriverRow({ d, rank }: { d: Driver; rank: number }) {
  const color = CONSTRUCTOR_COLORS[d.team]
  const maxPts = DRIVERS_2024[0].points

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-[#1e1e2e] hover:border-[#2e2e42] bg-[#0d0d14] hover:bg-[#13131e] transition-all">
      <div className="w-8 text-center">
        {rank <= 3 ? (
          <span className="text-lg">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>
        ) : (
          <span className="text-sm font-bold text-[#6b6b88]">{rank}</span>
        )}
      </div>
      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{d.flag}</span>
          <span className="font-bold text-[#f0f0f8] text-sm">{d.name}</span>
          <span className="text-xs font-mono text-[#6b6b88] ml-1">{d.code}</span>
        </div>
        <div className="text-xs text-[#6b6b88] mt-0.5" style={{ color: color + 'cc' }}>{d.team}</div>
      </div>
      <div className="flex-1 hidden sm:block">
        <div className="h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(d.points / maxPts) * 100}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-lg font-extrabold tracking-tight" style={{ color }}>{d.points}</div>
        <div className="text-[10px] text-[#6b6b88]">pts</div>
      </div>
      <div className="hidden lg:flex gap-4 text-center flex-shrink-0">
        {[{ label: 'W', value: d.wins }, { label: 'POD', value: d.podiums }, { label: 'PP', value: d.poles }].map(s => (
          <div key={s.label}>
            <div className="text-sm font-bold text-[#f0f0f8]">{s.value}</div>
            <div className="text-[10px] text-[#6b6b88]">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DriverStandings() {
  return (
    <div className="space-y-2">
      {DRIVERS_2024.map((d) => (
        <DriverRow key={d.code} d={d} rank={d.position} />
      ))}
    </div>
  )
}

export function ConstructorStandings() {
  const max = CONSTRUCTORS_2024[0].points
  return (
    <div className="space-y-3">
      {CONSTRUCTORS_2024.map((c) => {
        const color = CONSTRUCTOR_COLORS[c.name]
        return (
          <div key={c.name} className="p-4 rounded-xl border border-[#1e1e2e] bg-[#0d0d14]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#6b6b88]">P{c.position}</span>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-bold text-[#f0f0f8]">{c.name}</span>
              </div>
              <span className="text-xl font-extrabold" style={{ color }}>{c.points}</span>
            </div>
            <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(c.points / max) * 100}%`, backgroundColor: color }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-[#6b6b88]">
              <span>{c.wins} wins</span>
              <span>{c.podiums} podiums</span>
              <span>{c.poles} poles</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function HeadToHead() {
  const [d1, setD1] = useState('VER')
  const [d2, setD2] = useState('NOR')

  const driver1 = DRIVERS_2024.find(d => d.code === d1)!
  const driver2 = DRIVERS_2024.find(d => d.code === d2)!
  const c1 = CONSTRUCTOR_COLORS[driver1.team]
  const c2 = CONSTRUCTOR_COLORS[driver2.team]

  const stats = [
    { label: 'Points', key: 'points' as keyof Driver },
    { label: 'Wins', key: 'wins' as keyof Driver },
    { label: 'Podiums', key: 'podiums' as keyof Driver },
    { label: 'Pole Positions', key: 'poles' as keyof Driver },
    { label: 'Fastest Laps', key: 'fastestLaps' as keyof Driver },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[{ val: d1, set: setD1, color: c1, driver: driver1 }, { val: d2, set: setD2, color: c2, driver: driver2 }].map(({ val, set, color, driver }, i) => (
          <div key={i}>
            <select
              value={val}
              onChange={e => set(e.target.value)}
              className="w-full bg-[#13131e] border border-[#2e2e42] rounded-xl px-4 py-3 text-[#f0f0f8] text-sm font-semibold outline-none cursor-pointer mb-2"
              style={{ borderColor: color + '66' }}
            >
              {DRIVERS_2024.map(d => (
                <option key={d.code} value={d.code}>{d.flag} {d.name}</option>
              ))}
            </select>
            <div className="text-center">
              <div className="text-2xl font-extrabold tracking-tight" style={{ color }}>{driver.name.split(' ')[1]}</div>
              <div className="text-xs text-[#6b6b88]" style={{ color: color + 'aa' }}>{driver.team}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {stats.map(({ label, key }) => {
          const v1 = driver1[key] as number
          const v2 = driver2[key] as number
          const max = Math.max(v1, v2, 1)
          const winner = v1 > v2 ? 'd1' : v2 > v1 ? 'd2' : 'tie'
          return (
            <div key={key}>
              <div className="flex justify-between text-xs text-[#6b6b88] mb-1.5">
                <span className={`font-bold ${winner === 'd1' ? 'text-[#f0f0f8]' : ''}`}>{v1}</span>
                <span className="uppercase tracking-widest">{label}</span>
                <span className={`font-bold ${winner === 'd2' ? 'text-[#f0f0f8]' : ''}`}>{v2}</span>
              </div>
              <div className="flex gap-1 h-3">
                <div className="flex-1 flex justify-end">
                  <div className="h-full rounded-l-full" style={{ width: `${(v1 / max) * 100}%`, backgroundColor: c1 }} />
                </div>
                <div className="w-px bg-[#2e2e42]" />
                <div className="flex-1">
                  <div className="h-full rounded-r-full" style={{ width: `${(v2 / max) * 100}%`, backgroundColor: c2 }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
