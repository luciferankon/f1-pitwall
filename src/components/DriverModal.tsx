'use client'

import { useEffect, useState, useRef } from 'react'
import { DriverStanding } from '@/lib/types'
import { getTeamColors, getTeamColor, COUNTRY_FLAGS } from '@/lib/teamColors'

interface CareerData {
  seasons: Array<{ season: string; DriverStandings: Array<{ position: string; points: string; wins: string; Constructors: Array<{ name: string; constructorId: string }> }> }>
  totalRaces: number
  wins: number
  podiums: number
  poles: number
  fastestLaps: number
  championships: number
  totalPoints: number
}

interface DriverModalProps {
  standing: DriverStanding
  onClose: () => void
}

function AnimatedNumber({ target, duration = 1000 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>(0)
  useEffect(() => {
    if (target === 0) { setCurrent(0); return }
    const start = performance.now()
    function step(now: number) {
      const pct = Math.min((now - start) / duration, 1)
      const eased = pct === 1 ? 1 : 1 - Math.pow(2, -10 * pct)
      setCurrent(Math.round(eased * target))
      if (pct < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])
  return <>{current}</>
}

export default function DriverModal({ standing, onClose }: DriverModalProps) {
  const [career, setCareer] = useState<CareerData | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsVisible, setStatsVisible] = useState(false)

  const { Driver, Constructors, points, wins, position } = standing
  const constructor = Constructors[0]
  const colors = getTeamColors(constructor?.constructorId ?? '')
  const fullName = `${Driver.givenName} ${Driver.familyName}`
  const flag = COUNTRY_FLAGS[Driver.nationality] ?? '🏁'

  useEffect(() => {
    Promise.all([
      fetch(`/api/driver-career?driverId=${Driver.driverId}`).then(r => r.json()),
      Driver.url
        ? fetch(`/api/driver-photo?wikiUrl=${encodeURIComponent(Driver.url)}`).then(r => r.json())
        : Promise.resolve({ photo: null }),
    ])
      .then(([careerData, photoData]) => {
        if (careerData && typeof careerData.totalRaces === 'number') {
          setCareer(careerData)
          setTimeout(() => setStatsVisible(true), 100)
        }
        setPhoto(photoData?.photo ?? null)
      })
      .finally(() => setLoading(false))
  }, [Driver.driverId, Driver.url])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const sortedSeasons = (career?.seasons ?? [])
    .filter((s) => (s.DriverStandings?.length ?? 0) > 0)
    .sort((a, b) => parseInt(b.season) - parseInt(a.season))

  const bestSeason = sortedSeasons.reduce((best, s) => {
    const pos = parseInt(s.DriverStandings[0]?.position ?? '99')
    const bestPos = parseInt(best?.DriverStandings[0]?.position ?? '99')
    return pos < bestPos ? s : best
  }, sortedSeasons[0])

  const maxPts = Math.max(...sortedSeasons.map(s => parseFloat(s.DriverStandings[0]?.points ?? '0')), 1)

  const stats = career ? [
    { label: 'Races', value: career.totalRaces, icon: '🏁' },
    { label: 'Wins', value: career.wins, icon: '🏆' },
    { label: 'Podiums', value: career.podiums, icon: '🥇' },
    { label: 'Poles', value: career.poles, icon: '⚡' },
    ...(career.fastestLaps >= 0 ? [{ label: 'Fastest Laps', value: career.fastestLaps, icon: '🟣' }] : []),
    { label: 'Championships', value: career.championships, icon: '👑' },
  ] : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" style={{ animation: 'fadeIn 0.2s ease-out' }} />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#2e2e42] bg-[#0a0a0f] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        <div className="h-1.5 relative overflow-hidden" style={{ backgroundColor: colors.primary }}>
          <div className="absolute inset-y-0 w-1/3 bg-white/30" style={{ animation: 'shimmer 2s ease-in-out infinite', left: '-33%' }} />
        </div>

        <div className="flex gap-4 p-5 border-b border-[#1e1e2e]">
          <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-[#2e2e42]"
               style={{ background: `linear-gradient(135deg, ${colors.primary}22, ${colors.primary}55)` }}>
            {photo ? (
              <img src={photo} alt={fullName} className="w-full h-full object-cover object-top" style={{ animation: 'fadeIn 0.5s ease-out' }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ color: colors.primary }}>
                {Driver.givenName[0]}{Driver.familyName[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{flag}</span>
              <span className="text-[10px] font-bold text-[#6b6b88] uppercase tracking-widest">{Driver.nationality}</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight">{fullName}</h2>
            <div className="font-semibold text-sm mt-0.5" style={{ color: colors.primary }}>{constructor?.name}</div>
            <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
              <span className="text-white font-bold">{points}<span className="text-xs text-[#6b6b88] ml-1">pts</span></span>
              <span className="text-white font-bold">P{position}</span>
              {wins !== '0' && wins && <span className="text-white font-bold">{wins}<span className="text-xs text-[#6b6b88] ml-1">wins</span></span>}
              {Driver.permanentNumber && <span className="font-black text-lg" style={{ color: colors.primary }}>#{Driver.permanentNumber}</span>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl border border-[#2e2e42] text-[#6b6b88] hover:text-white hover:border-[#3e3e52] transition-all text-lg">x</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-[#2e2e42] border-t-[#E8002D] rounded-full animate-spin" />
              <span className="text-xs text-[#6b6b88]">Fetching career data...</span>
            </div>
          ) : career ? (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
                {stats.map((stat, idx) => (
                  <div key={stat.label}
                       className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-3 text-center card-lift"
                       style={{
                         animation: `slideUp 0.4s ease-out ${idx * 0.06}s both`,
                         borderColor: stat.label === 'Championships' && career.championships > 0 ? colors.primary + '55' : undefined,
                         background: stat.label === 'Championships' && career.championships > 0 ? colors.primary + '10' : undefined,
                       }}>
                    <div className="text-xs mb-1">{stat.icon}</div>
                    <div className="text-xl font-extrabold leading-none tabular-nums"
                         style={{ color: stat.label === 'Championships' && career.championships > 0 ? colors.primary : '#f0f0f8' }}>
                      {statsVisible ? <AnimatedNumber target={stat.value} duration={900 + idx * 80} /> : 0}
                    </div>
                    <div className="text-[8px] text-[#6b6b88] mt-1 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl mb-4 bg-[#0d0d14] border border-[#1e1e2e]"
                   style={{ animation: 'slideUp 0.4s ease-out 0.35s both' }}>
                <span className="text-xl">📊</span>
                <div className="text-sm">
                  <span className="text-white font-bold">{career.totalPoints.toLocaleString()}</span>
                  <span className="text-[#6b6b88] ml-2">career points across {sortedSeasons.length} seasons</span>
                </div>
              </div>

              {bestSeason && (
                <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                     style={{ backgroundColor: colors.primary + '15', border: `1px solid ${colors.primary}33`, animation: 'slideUp 0.4s ease-out 0.4s both' }}>
                  <span className="text-xl">⭐</span>
                  <div className="text-sm">
                    <span className="text-white font-bold">Best: {bestSeason.season}</span>
                    <span className="text-[#6b6b88] ml-2">P{bestSeason.DriverStandings[0]?.position} · {bestSeason.DriverStandings[0]?.points} pts · {bestSeason.DriverStandings[0]?.wins} wins</span>
                  </div>
                </div>
              )}

              {career.championships > 0 && (
                <div className="flex flex-wrap gap-2 mb-4" style={{ animation: 'slideUp 0.4s ease-out 0.5s both' }}>
                  {sortedSeasons.filter(s => s.DriverStandings[0]?.position === '1').map(s => (
                    <div key={s.season}
                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                         style={{ backgroundColor: colors.primary + '25', color: colors.primary, border: `1px solid ${colors.primary}50` }}>
                      👑 {s.season} World Champion
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-xs font-bold uppercase tracking-widest text-[#6b6b88] mb-3" style={{ animation: 'slideUp 0.4s ease-out 0.55s both' }}>Season History</h3>
              <div className="space-y-2">
                {sortedSeasons.slice(0, 25).map((s, i) => {
                  const sd = s.DriverStandings[0]
                  if (!sd) return null
                  const pos = parseInt(sd.position)
                  const pts = parseFloat(sd.points)
                  const conId = sd.Constructors?.[0]?.constructorId ?? ''
                  const tc = getTeamColor(conId)
                  const isChamp = pos === 1
                  return (
                    <div key={s.season} className="flex items-center gap-3 py-1.5 group" style={{ animation: `slideUp 0.35s ease-out ${0.6 + i * 0.03}s both` }}>
                      <div className="w-10 text-right text-xs font-bold text-[#6b6b88]">{s.season}</div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-transform group-hover:scale-110"
                           style={{ backgroundColor: isChamp ? colors.primary : '#1e1e2e', color: isChamp ? colors.text : '#f0f0f8', boxShadow: isChamp ? `0 0 12px ${colors.primary}66` : 'none' }}>
                        {isChamp ? '👑' : pos}
                      </div>
                      <div className="flex-1">
                        <div className="h-2 bg-[#1e1e2e] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${Math.min((pts / maxPts) * 100, 100)}%`, backgroundColor: tc, transition: 'width 0.8s ease-out', transitionDelay: `${0.6 + i * 0.03}s` }} />
                        </div>
                      </div>
                      <div className="text-xs font-mono text-[#f0f0f8] w-14 text-right tabular-nums">{Math.round(pts)}pts</div>
                      <div className="text-xs text-[#6b6b88] w-8 text-right">{sd.wins}W</div>
                      <div className="text-[10px] text-[#6b6b88] w-16 text-right truncate hidden sm:block">{sd.Constructors?.[0]?.name ?? ''}</div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-[#6b6b88]">Could not load career data</div>
          )}
        </div>
      </div>
    </div>
  )
}
