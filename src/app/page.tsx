'use client'

import { useState } from 'react'
import { DriverStandings, ConstructorStandings, HeadToHead } from '@/components/StandingsTable'
import { ConstructorBattleChart } from '@/components/BattleChart'
import { RaceAnalyst } from '@/components/RaceAnalyst'
import { CIRCUITS_2024 } from '@/lib/data'

const TABS = [
  { id: 'drivers',      label: '🏎️ Drivers' },
  { id: 'constructors', label: '🏭 Constructors' },
  { id: 'battle',       label: '⚔️ Championship Battle' },
  { id: 'h2h',          label: '🆚 Head-to-Head' },
  { id: 'calendar',     label: '🗓️ Race Calendar' },
  { id: 'analyst',      label: '🤖 AI Race Analyst' },
]

export default function Home() {
  const [tab, setTab] = useState('drivers')

  return (
    <main className="min-h-screen bg-[#050508]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 bg-[#050508]/90 backdrop-blur-xl border-b border-[#1e1e2e]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-5 rounded-sm bg-[#E8002D]" />
            <div className="w-2 h-5 rounded-sm bg-[#ffffff]" />
            <div className="w-2 h-5 rounded-sm bg-[#3671C6]" />
          </div>
          <span className="font-black text-[15px] tracking-tight text-white">PitWall</span>
          <span className="text-[10px] px-2 py-0.5 bg-[#E8002D]/20 text-[#E8002D] rounded-full font-bold border border-[#E8002D]/30">2024 Season</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[#6b6b88]">
          <a href="https://luciferankon.dev" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            by luciferankon →
          </a>
          <a href="https://github.com/luciferankon/f1-pitwall" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1e1e2e] rounded-lg hover:border-[#2e2e42] hover:text-white transition-all text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-10 px-8 text-center border-b border-[#1e1e2e]">
        <div className="inline-flex items-center gap-2 bg-[rgba(232,0,45,0.1)] border border-[rgba(232,0,45,0.3)] rounded-full px-4 py-1.5 text-[#E8002D] text-xs font-bold tracking-widest uppercase mb-5">
          🏁 Formula 1 · 2024 World Championship
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-4">
          The season, <span className="text-[#E8002D]">by the numbers.</span>
        </h1>
        <p className="text-[#6b6b88] text-lg max-w-lg mx-auto">
          24 races. 20 drivers. 10 teams. The complete data story of the 2024 F1 season — with AI race analysis.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {[
            { label: 'Champion', value: 'Verstappen', sub: 'Red Bull · 4th title' },
            { label: 'Constructors', value: 'McLaren', sub: '666 pts · 1st in 26 yrs' },
            { label: 'Closest Fight', value: '14 pts', sub: 'McLaren vs Ferrari final' },
            { label: 'Total Races', value: '24', sub: 'Longest season ever' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-[#6b6b88] mt-0.5">{s.label}</div>
              <div className="text-[10px] text-[#E8002D] font-semibold">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-14 z-40 bg-[#050508]/95 backdrop-blur-xl border-b border-[#1e1e2e]">
        <div className="max-w-[1200px] mx-auto px-6 flex gap-1 overflow-x-auto py-2 scrollbar-none">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                tab === t.id
                  ? 'bg-[rgba(232,0,45,0.15)] text-[#E8002D] border border-[rgba(232,0,45,0.3)]'
                  : 'text-[#6b6b88] hover:text-white',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {tab === 'drivers' && (
          <div>
            <h2 className="text-xl font-black text-white mb-5">2024 Driver Championship — Final Standings</h2>
            <DriverStandings />
          </div>
        )}
        {tab === 'constructors' && (
          <div>
            <h2 className="text-xl font-black text-white mb-5">2024 Constructor Championship — Final Standings</h2>
            <ConstructorStandings />
          </div>
        )}
        {tab === 'battle' && (
          <div>
            <h2 className="text-xl font-black text-white mb-2">Constructor Points Battle</h2>
            <p className="text-[#6b6b88] text-sm mb-6">Cumulative points after each race — one of the tightest constructor fights in F1 history</p>
            <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6">
              <ConstructorBattleChart />
            </div>
            <div className="mt-4 p-4 bg-[rgba(232,0,45,0.06)] border border-[rgba(232,0,45,0.2)] rounded-xl text-sm text-[#f0f0f8]">
              <span className="text-[#E8002D] font-bold">Key moment:</span> McLaren overhauled Red Bull at the Hungarian GP (Round 13) and never looked back. Ferrari challenged all the way to Abu Dhabi — just 14 points separated 1st and 2nd at the final flag.
            </div>
          </div>
        )}
        {tab === 'h2h' && (
          <div>
            <h2 className="text-xl font-black text-white mb-2">Driver Head-to-Head</h2>
            <p className="text-[#6b6b88] text-sm mb-6">Compare any two drivers from the 2024 season</p>
            <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 max-w-2xl">
              <HeadToHead />
            </div>
          </div>
        )}
        {tab === 'calendar' && (
          <div>
            <h2 className="text-xl font-black text-white mb-5">2024 Race Calendar — 24 Grands Prix</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CIRCUITS_2024.map(c => (
                <div key={c.round} className="p-4 bg-[#0d0d14] border border-[#1e1e2e] rounded-xl hover:border-[#2e2e42] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#6b6b88] uppercase tracking-widest">Round {c.round}</span>
                    <span className="text-xs text-[#6b6b88]">{c.date}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{c.country}</span>
                    <span className="font-bold text-white text-sm leading-tight">{c.name.replace(' Grand Prix', ' GP')}</span>
                  </div>
                  <div className="text-[10px] text-[#6b6b88] mb-2 leading-tight">{c.circuit}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#6b6b88]">Winner:</span>
                    <span className="text-xs font-bold text-[#E8002D]">🏆 {c.winner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'analyst' && (
          <div>
            <h2 className="text-xl font-black text-white mb-2">🤖 AI Race Analyst</h2>
            <p className="text-[#6b6b88] text-sm mb-6">
              Pick any 2024 GP and get an expert AI breakdown — strategy, key moments, championship impact. Powered by Claude.
            </p>
            <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 max-w-3xl">
              <RaceAnalyst />
            </div>
          </div>
        )}
      </div>

      <footer className="text-center py-10 text-sm text-[#6b6b88] border-t border-[#1e1e2e] mt-8">
        Built by <a href="https://luciferankon.dev" className="text-[#E8002D] hover:underline">luciferankon</a> · Data: 2024 F1 Season · AI: Claude
      </footer>
    </main>
  )
}
