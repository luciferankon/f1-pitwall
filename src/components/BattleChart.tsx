'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { POINTS_BATTLE, CONSTRUCTOR_COLORS } from '@/lib/data'

const TEAMS = ['McLaren', 'Ferrari', 'Red Bull', 'Mercedes']

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => b.value - a.value)
  return (
    <div className="bg-[#0d0d14] border border-[#2e2e42] rounded-xl p-3 text-xs shadow-2xl">
      <p className="text-[#f0f0f8] font-bold mb-2">{label}</p>
      {sorted.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span style={{ color: p.color }} className="font-semibold w-24">{p.name}</span>
          <span className="text-[#f0f0f8] font-mono font-bold">{p.value} pts</span>
        </div>
      ))}
    </div>
  )
}

export function ConstructorBattleChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={POINTS_BATTLE} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
        <defs>
          {TEAMS.map(team => (
            <linearGradient key={team} id={`grad-${team.replace(' ', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CONSTRUCTOR_COLORS[team]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CONSTRUCTOR_COLORS[team]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
        <XAxis dataKey="race" tick={{ fill: '#6b6b88', fontSize: 9 }} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
        <YAxis tick={{ fill: '#6b6b88', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(v) => <span className="text-xs font-semibold" style={{ color: CONSTRUCTOR_COLORS[v] }}>{v}</span>} />
        {TEAMS.map(team => (
          <Area
            key={team}
            type="monotone"
            dataKey={team}
            stroke={CONSTRUCTOR_COLORS[team]}
            strokeWidth={2.5}
            fill={`url(#grad-${team.replace(' ', '')})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
