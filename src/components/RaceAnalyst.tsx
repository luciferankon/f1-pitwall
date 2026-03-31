'use client'

import { useState } from 'react'
import { CIRCUITS_2024 } from '@/lib/data'

const SECTION_STYLES: Record<string, { label: string; color: string; border: string; bg: string }> = {
  'KEY MOMENT':          { label: '⚡ Key Moment',         color: '#f5c842', border: 'border-[rgba(245,200,66,0.3)]',  bg: 'bg-[rgba(245,200,66,0.06)]'  },
  'STRATEGY':            { label: '🧠 Strategy',            color: '#4f8fff', border: 'border-[rgba(79,143,255,0.3)]',  bg: 'bg-[rgba(79,143,255,0.06)]'  },
  'PERFORMANCE':         { label: '🏎️ Performance',         color: '#3ecf8e', border: 'border-[rgba(62,207,142,0.3)]',  bg: 'bg-[rgba(62,207,142,0.06)]'  },
  'CHAMPIONSHIP IMPACT': { label: '🏆 Championship Impact', color: '#ff8000', border: 'border-[rgba(255,128,0,0.3)]',   bg: 'bg-[rgba(255,128,0,0.06)]'   },
  'VERDICT':             { label: '📋 Verdict',              color: '#ff4f4f', border: 'border-[rgba(255,79,79,0.3)]',   bg: 'bg-[rgba(255,79,79,0.06)]'   },
}

const KEYS = ['KEY MOMENT', 'STRATEGY', 'PERFORMANCE', 'CHAMPIONSHIP IMPACT', 'VERDICT']

function parseAnalysis(text: string) {
  const result: Record<string, string> = {}
  KEYS.forEach((key, i) => {
    const nextKey = KEYS[i + 1]
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const nextEscaped = nextKey?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pat = nextEscaped
      ? new RegExp(`${escaped}:\\s*([\\s\\S]*?)(?=${nextEscaped}:|$)`, 'i')
      : new RegExp(`${escaped}:\\s*([\\s\\S]*)`, 'i')
    const m = text.match(pat)
    if (m?.[1]?.trim()) result[key] = m[1].trim()
  })
  return Object.keys(result).length > 0 ? result : null
}

export function RaceAnalyst() {
  const [selectedRound, setSelectedRound] = useState(6)
  const [rawOutput, setRawOutput] = useState('')
  const [parsed, setParsed] = useState<Record<string, string> | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)

  const race = CIRCUITS_2024.find(c => c.round === selectedRound)!

  const analyze = async () => {
    setStreaming(true)
    setParsed(null)
    setDone(false)
    setRawOutput('')

    try {
      const res = await fetch('/api/race-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          race: race.name,
          winner: race.winner,
          context: `Round ${race.round} of 24, held at ${race.circuit}`,
        }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done: d, value } = await reader.read()
        if (d) break
        accumulated += decoder.decode(value, { stream: true })
        setRawOutput(accumulated)
      }

      const p = parseAnalysis(accumulated)
      setParsed(p)
      setDone(true)
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <select
          value={selectedRound}
          onChange={e => { setSelectedRound(Number(e.target.value)); setRawOutput(''); setParsed(null); setDone(false) }}
          className="flex-1 bg-[#13131e] border border-[#2e2e42] rounded-xl px-4 py-3 text-[#f0f0f8] text-sm font-semibold outline-none cursor-pointer"
        >
          {CIRCUITS_2024.map(c => (
            <option key={c.round} value={c.round}>
              R{c.round} · {c.name} — {c.winner} ✓
            </option>
          ))}
        </select>
        <button
          onClick={analyze}
          disabled={streaming}
          className="flex items-center gap-2 px-5 py-3 bg-[#E8002D] text-white font-bold text-sm rounded-xl disabled:opacity-40 hover:shadow-[0_4px_24px_rgba(232,0,45,0.4)] hover:-translate-y-px transition-all"
        >
          {streaming
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analysing…</>
            : '🏁 Analyse Race'
          }
        </button>
      </div>

      {streaming && !rawOutput && (
        <div className="flex items-center justify-center gap-3 py-12 text-[#6b6b88]">
          <span className="w-5 h-5 border-2 border-[#6b6b88]/30 border-t-[#E8002D] rounded-full animate-spin" />
          <span className="text-sm">Crunching the data…</span>
        </div>
      )}

      {done && parsed ? (
        <div className="space-y-3">
          {KEYS.map(key => {
            const val = parsed[key]
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
      ) : rawOutput && (
        <pre className="text-sm text-[#f0f0f8] font-mono whitespace-pre-wrap leading-relaxed p-4 bg-[#13131e] rounded-xl border border-[#1e1e2e]">
          {rawOutput}
          {streaming && <span className="animate-pulse text-[#E8002D]">▋</span>}
        </pre>
      )}

      {!streaming && !rawOutput && (
        <div className="text-center py-8 text-[#6b6b88]">
          <div className="text-4xl mb-2">🏁</div>
          <p className="text-sm">Select a race and hit Analyse Race</p>
        </div>
      )}
    </div>
  )
}
