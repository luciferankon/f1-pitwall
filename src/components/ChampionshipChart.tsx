'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { getTeamColor } from '@/lib/teamColors'

interface Standing {
  position: string
  points: string
  wins: string
  Driver: { driverId: string; givenName: string; familyName: string; code?: string }
  Constructors: Array<{ constructorId: string; name: string }>
}

interface ChampionshipChartProps {
  season: number
  driverStandings: Standing[]
}

interface ChartRow { round: string; [driverId: string]: string | number }

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0))
  return (
    <div className="bg-[#13131e] border border-[#2e2e42] rounded-xl p-3 shadow-2xl min-w-[160px]">
      <div className="text-[10px] font-bold text-[#6b6b88] uppercase tracking-widest mb-2">{sorted[0]?.payload?.round}</div>
      {sorted.slice(0, 6).map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
          <span className="text-xs text-[#f0f0f8] flex-1">{e.name}</span>
          <span className="text-xs font-bold tabular-nums" style={{ color: e.color }}>{e.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ChampionshipChart({ season, driverStandings }: ChampionshipChartProps) {
  const [chartData, setChartData] = useState<ChartRow[]>([])
  const [loading, setLoading] = useState(true)

  const topDrivers = useMemo(() => driverStandings.slice(0, 10), [driverStandings])
  const driverInfo = useMemo(() => {
    const m = new Map<string, { label: string; constructorId: string }>()
    topDrivers.forEach(s => {
      m.set(s.Driver.driverId, {
        label: s.Driver.code || s.Driver.familyName.slice(0, 3).toUpperCase(),
        constructorId: s.Constructors[0]?.constructorId ?? '',
      })
    })
    return m
  }, [topDrivers])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        // Step 1: get total result count so we know how many pages to fetch
        const metaRes = await fetch(
          `https://api.jolpi.ca/ergast/f1/${season}/results.json?limit=1`
        )
        if (!metaRes.ok) throw new Error('meta failed')
        const meta = await metaRes.json()
        const total = parseInt(meta?.MRData?.total ?? '0') || 0
        const pageCount = Math.max(1, Math.ceil(total / 100))

        // Step 2: fetch all pages in parallel (Jolpica caps at 100/page)
        const pages = await Promise.all(
          Array.from({ length: pageCount }, (_, i) =>
            fetch(
              `https://api.jolpi.ca/ergast/f1/${season}/results.json?limit=100&offset=${i * 100}`
            )
              .then(r => (r.ok ? r.json() : null))
              .then((d: any) => (d?.MRData?.RaceTable?.Races ?? []) as any[])
              .catch(() => [] as any[])
          )
        )

        // Step 3: merge races — pagination can split a race across page boundaries
        const raceMap = new Map<string, any>()
        for (const page of pages) {
          for (const race of page) {
            if (!raceMap.has(race.round)) {
              raceMap.set(race.round, { ...race, Results: [] })
            }
            raceMap.get(race.round)!.Results.push(...(race.Results ?? []))
          }
        }
        const races = Array.from(raceMap.values())
          .sort((a, b) => parseInt(a.round) - parseInt(b.round))

        // Step 4: build cumulative points per driver per round
        const cumulative = new Map<string, number>()
        for (const [id] of driverInfo) cumulative.set(id, 0)

        const rows: ChartRow[] = []
        for (const race of races) {
          const row: ChartRow = { round: `R${race.round}` }
          for (const result of (race.Results ?? [])) {
            const id = result.Driver?.driverId
            if (driverInfo.has(id)) {
              const prev = cumulative.get(id) ?? 0
              cumulative.set(id, prev + (parseFloat(result.points) || 0))
            }
          }
          for (const [id] of driverInfo) {
            row[id] = cumulative.get(id) ?? 0
          }
          rows.push(row)
        }

        if (!cancelled) setChartData(rows)
      } catch (e) {
        console.error('ChampionshipChart:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [season, driverInfo])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 bg-[#0d0d14] rounded-2xl border border-[#1e1e2e]">
        <div className="w-8 h-8 border-2 border-[#2e2e42] border-t-[#E8002D] rounded-full animate-spin" />
      </div>
    )
  }

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-80 bg-[#0d0d14] rounded-2xl border border-[#1e1e2e]">
        <span className="text-[#6b6b88] text-sm">No race data available yet</span>
      </div>
    )
  }

  return (
    <div className="bg-[#0d0d14] rounded-2xl border border-[#1e1e2e] p-5" style={{ animation: 'slideUp 0.5s ease-out' }}>
      <h3 className="text-lg font-black text-white mb-4">Championship Battle</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" />
          <XAxis dataKey="round" stroke="#6b6b88" tick={{ fill: '#6b6b88', fontSize: 11 }} />
          <YAxis stroke="#6b6b88" tick={{ fill: '#6b6b88', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 12 }}
            formatter={(val: string) => <span className="text-xs text-[#f0f0f8]">{val}</span>}
          />
          {Array.from(driverInfo.entries()).map(([id, info]) => (
            <Line
              key={id}
              type="monotone"
              dataKey={id}
              name={info.label}
              stroke={getTeamColor(info.constructorId)}
              strokeWidth={2}
              dot={false}
              animationDuration={1200}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
