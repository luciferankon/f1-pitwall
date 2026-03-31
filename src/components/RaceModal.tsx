'use client'

import { useEffect, useState, useCallback } from 'react'
import { RaceResult, QualifyingResult, PitStop, Race } from '@/lib/types'
import { getTeamColor } from '@/lib/teamColors'

const SECTION_STYLES: Record<string, { label: string; color: string; border: string; bg: string }> = {
  'KEY MOMENT':          { label: '⚡ Key Moment',         color: '#f5c842', border: 'border-[rgba(245,200,66,0.3)]',  bg: 'bg-[rgba(245,200,66,0.06)]'  },
  'STRATEGY':            { label: '🧠 Strategy',            color: '#4f8fff', border: 'border-[rgba(79,143,255,0.3)]',  bg: 'bg-[rgba(79,143,255,0.06)]'  },
  'PERFORMANCE':         { label: '🏎️ Performance',         color: '#3ecf8e', border: 'border-[rgba(62,207,142,0.3)]',  bg: 'bg-[rgba(62,207,142,0.06)]'  },
  'CHAMPIONSHIP IMPACT': { label: '🏆 Championship Impact', color: '#ff8000', border: 'border-[rgba(255,128,0,0.3)]',   bg: 'bg-[rgba(255,128,0,0.06)]'   },
  'VERDICT':             { label: '📋 Verdict',             color: '#ff4f4f', border: 'border-[rgba(255,79,79,0.3)]',   bg: 'bg-[rgba(255,79,79,0.06)]'   },
}
const KEYS = ['KEY MOMENT', 'STRATEGY', 'PERFORMANCE', 'CHAMPIONSHIP IMPACT', 'VERDICT']

function parseAnalysis(text: string): Record<string, string> | null {
  const result: Record<string, string> = {}
  KEYS.forEach((key, i) => {
    const next = KEYS[i + 1]
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const nextEsc = next?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pat = nextEsc
      ? new RegExp(`${escaped}:\\s*([\\s\\S]*?)(?=${nextEsc}:|$)`, 'i')
      : new RegExp(`${escaped}:\\s*([\\s\\S]*)`, 'i')
    const m = text.match(pat)
    if (m?.[1]?.trim()) result[key] = m[1].trim()
  })
  return Object.keys(result).length > 0 ? result : null
}

interface RaceModalProps {
  season: number
  round: number
  onClose: () => void
}

export default function RaceModal({ season, round, onClose }: RaceModalProps) {
  const [loading, setLoading] = useState(true)
  const [race, setRace] = useState<Race | null>(null)
  const [results, setResults] = useState<RaceResult[]>([])
  const [qualifying, setQualifying] = useState<QualifyingResult[]>([])
  const [pitStops, setPitStops] = useState<PitStop[]>([])
  const [activeTab, setActiveTab] = useState<'race' | 'qualifying' | 'pitstops' | 'ai'>('race')
  const [aiText, setAiText] = useState('')
  const [aiParsed, setAiParsed] = useState<Record<string, string> | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiDone, setAiDone] = useState(false)

  useEffect(() => {
    fetch(`/api/race-results?season=${season}&round=${round}`)
      .then(r => r.json())
      .then(d => {
        setRace(d.race)
        setResults(d.results ?? [])
        setQualifying(d.qualifying ?? [])
        setPitStops(d.pitStops ?? [])
      })
      .finally(() => setLoading(false))
  }, [season, round])

  const runAI = useCallback(async () => {
    if (!race) return
    setAiLoading(true)
    setAiText('')
    setAiDone(false)
    setAiParsed(null)

    const winner = results[0]
    const res = await fetch('/api/race-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        race: race.raceName,
        winner: winner ? `${winner.Driver.givenName} ${winner.Driver.familyName}` : 'Unknown',
        context: `Round ${round} of the ${season} F1 season at ${race.Circuit.circuitName}, ${race.Circuit.Location.locality}`,
        results,
      }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let acc = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      acc += decoder.decode(value, { stream: true })
      setAiText(acc)
    }
    setAiParsed(parseAnalysis(acc))
    setAiDone(true)
    setAiLoading(false)
  }, [race, results, round, season])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const tabs = [
    { id: 'race', label: '🏁 Race' },
    { id: 'qualifying', label: '⏱️ Qualifying' },
    { id: 'pitstops', label: '🔧 Pit Stops' },
    { id: 'ai', label: '🤖 AI Analysis' },
  ] as const

  const winner = results[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#2e2e42] bg-[#0a0a0f] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#1e1e2e] p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-[#6b6b88] uppercase tracking-widest">
                  {season} · Round {round}
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
                {loading ? 'Loading…' : (race?.raceName ?? 'Race Details')}
              </h2>
              {race && (
                <p className="text-sm text-[#6b6b88] mt-0.5">
                  {race.Circuit.circuitName} · {race.Circuit.Location.locality}, {race.Circuit.Location.country}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-[#2e2e42] text-[#6b6b88] hover:text-white hover:border-[#3e3e52] transition-all text-lg"
            >
              ×
            </button>
          </div>

          {/* Winner banner */}
          {winner && (
            <div
              className="mt-3 flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{ backgroundColor: getTeamColor(winner.Constructor.constructorId) + '22', border: `1px solid ${getTeamColor(winner.Constructor.constructorId)}44` }}
            >
              <span className="text-xl">🏆</span>
              <div>
                <div className="font-bold text-white text-sm">
                  {winner.Driver.givenName} {winner.Driver.familyName}
                </div>
                <div className="text-xs" style={{ color: getTeamColor(winner.Constructor.constructorId) }}>
                  {winner.Constructor.name} · {winner.Time?.time ?? winner.status}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex gap-1 px-5 pt-3 border-b border-[#1e1e2e] pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'ai' && !aiText && !aiLoading) runAI() }}
              className={[
                'px-3 py-2 text-xs font-semibold rounded-t-xl transition-all',
                activeTab === tab.id
                  ? 'bg-[#E8002D]/15 text-[#E8002D] border border-b-0 border-[rgba(232,0,45,0.3)]'
                  : 'text-[#6b6b88] hover:text-white',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#2e2e42] border-t-[#E8002D] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Race Results */}
              {activeTab === 'race' && (
                <div className="space-y-1.5">
                  {results.length === 0 ? (
                    <div className="text-center py-8 text-[#6b6b88]">No results available yet</div>
                  ) : results.map(r => {
                    const color = getTeamColor(r.Constructor.constructorId)
                    const pos = parseInt(r.position)
                    return (
                      <div
                        key={r.Driver.driverId}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] hover:border-[#2e2e42] transition-all"
                      >
                        <div className="w-7 text-center flex-shrink-0">
                          {pos <= 3
                            ? <span>{pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉'}</span>
                            : <span className="text-sm font-bold text-[#6b6b88]">{pos}</span>
                          }
                        </div>
                        <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-sm">
                            {r.Driver.givenName} {r.Driver.familyName}
                          </div>
                          <div className="text-xs" style={{ color }}>{r.Constructor.name}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-mono text-[#f0f0f8]">
                            {pos === 1
                              ? (r.Time?.time ?? r.status)
                              : r.Time?.time
                                ? `+${r.Time.time.replace(/^\+/, '')}`
                                : r.status}
                          </div>
                          <div className="text-[10px] text-[#6b6b88]">
                            {pos === 1 ? '🏁 Race time' : `${r.points} pts`}
                          </div>
                        </div>
                        {r.FastestLap?.rank === '1' && (
                          <div className="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30 font-bold">FL</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Qualifying */}
              {activeTab === 'qualifying' && (
                <div className="space-y-1.5">
                  {qualifying.length === 0 ? (
                    <div className="text-center py-8 text-[#6b6b88]">No qualifying data available</div>
                  ) : qualifying.map(q => {
                    const color = getTeamColor(q.Constructor.constructorId)
                    return (
                      <div
                        key={q.Driver.driverId}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]"
                      >
                        <div className="w-6 text-center text-sm font-bold text-[#6b6b88]">{q.position}</div>
                        <div className="w-0.5 h-7 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <div className="flex-1">
                          <div className="font-bold text-white text-sm">
                            {q.Driver.givenName} {q.Driver.familyName}
                          </div>
                          <div className="text-xs" style={{ color }}>{q.Constructor.name}</div>
                        </div>
                        <div className="flex gap-3 text-right text-xs font-mono">
                          {q.Q3 && <div><div className="text-[#f0f0f8] font-bold">{q.Q3}</div><div className="text-[#6b6b88]">Q3</div></div>}
                          {q.Q2 && <div><div className="text-[#f0f0f8]">{q.Q2}</div><div className="text-[#6b6b88]">Q2</div></div>}
                          {q.Q1 && <div><div className="text-[#f0f0f8]">{q.Q1}</div><div className="text-[#6b6b88]">Q1</div></div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pit Stops */}
              {activeTab === 'pitstops' && (
                <div>
                  {pitStops.length === 0 ? (
                    <div className="text-center py-8 text-[#6b6b88]">No pit stop data available</div>
                  ) : (
                    <div className="space-y-1.5">
                      {pitStops.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]">
                          <div className="text-[10px] px-2 py-1 bg-[#1e1e2e] rounded-lg text-[#6b6b88] font-mono font-bold min-w-[2.5rem] text-center">
                            L{p.lap}
                          </div>
                          <div className="flex-1 text-sm font-semibold text-white">
                            {p.driverId.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-[#6b6b88]">Stop {p.stop}</div>
                          <div className="text-sm font-mono font-bold text-[#E8002D]">{p.duration}s</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AI Analysis */}
              {activeTab === 'ai' && (
                <div>
                  {aiLoading && !aiText && (
                    <div className="flex items-center justify-center gap-3 py-12 text-[#6b6b88]">
                      <span className="w-5 h-5 border-2 border-[#6b6b88]/30 border-t-[#E8002D] rounded-full animate-spin" />
                      <span className="text-sm">Crunching the data…</span>
                    </div>
                  )}

                  {aiDone && aiParsed ? (
                    <div className="space-y-3">
                      {KEYS.map(key => {
                        const val = aiParsed[key]
                        if (!val) return null
                        const style = SECTION_STYLES[key]
                        return (
                          <div key={key} className={`rounded-xl border overflow-hidden ${style.border}`}>
                            <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${style.bg}`} style={{ color: style.color }}>
                              {style.label}
                            </div>
                            <div className="px-4 py-3 text-sm text-[#f0f0f8] leading-relaxed bg-[#13131e]/50 whitespace-pre-wrap">
                              {val}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : aiText && (
                    <pre className="text-sm text-[#f0f0f8] font-mono whitespace-pre-wrap leading-relaxed p-4 bg-[#13131e] rounded-xl border border-[#1e1e2e]">
                      {aiText}
                      {aiLoading && <span className="animate-pulse text-[#E8002D]">▋</span>}
                    </pre>
                  )}

                  {!aiLoading && !aiText && (
                    <div className="text-center py-8">
                      <button
                        onClick={runAI}
                        className="px-5 py-3 bg-[#E8002D] text-white font-bold rounded-xl hover:shadow-[0_4px_20px_rgba(232,0,45,0.4)] transition-all"
                      >
                        🏁 Analyse This Race
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
