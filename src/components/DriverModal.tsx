'use client'

import { useEffect, useState } from 'react'
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

export default function DriverModal({ standing, onClose }: DriverModalProps) {
  const [career, setCareer] = useState<CareerData | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { Driver, Constructors, points, wins, position } = standing
  const constructor = Constructors[0]
  const colors = getTeamColors(constructor?.constructorId ?? '')
  const fullName = `${Driver.givenName} ${Driver.familyName}`
  const flag = COUNTRY_FLAGS[Driver.nationality] ?? '🏁'

  useEffect(() => {
    Promise.all([
      fetch(`/api/driver-career?driverId=${Driver.driverId}`).then(r => r.json()),
      Driver.url ? fetch(`/api/driver-photo?wikiUrl=${encodeURIComponent(Driver.url)}`).then(r => r.json()) : Promise.resolve({ photo: null }),
    ])
      .then(([careerData, photoData]) => {
        setCareer(careerData)
        setPhoto(photoData.photo)
      })
      .finally(() => setLoading(false))
  }, [Driver.driverId, Driver.url])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const sortedSeasons = career?.seasons
    .filter(s => s.DriverStandings?.length > 0)
    .sort((a, b) => parseInt(b.season) - parseInt(a.season)) ?? []

  const bestSeason = sortedSeasons.reduce((best, s) => {
    const pos = parseInt(s.DriverStandings[0]?.position ?? '99')
    const bestPos = parseInt(best?.DriverStandings[0]?.position ?? '99')
    return pos < bestPos ? s : best
  }, sortedSeasons[0])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#2e2e42] bg-[#0a0a0f] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <div className="h-1.5" style={{ backgroundColor: colors.primary }} />

        <div className="flex gap-4 p-5 border-b border-[#1e1e2e]">
          <div className="w-24 h-28 rounded-xl overflow-hidden bg-[#0d0d14] flex-shrink-0 border border-[#2e2e42]">
            {photo ? (
              <img src={photo} alt={fullName} className="w-full h-full object-cover object-top" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-3xl font-black"
                style={{ background: `linear-gradient(135deg, ${colors.primary}22, ${colors.primary}55)`, color: colors.primary }}
              >
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
            <div className="font-semibold text-sm mt-0.5" style={{ color: colors.primary }}>
              {constructor?.name}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-white font-bold">{points}<span className="text-xs text-[#6b6b88] ml-1">pts</span></span>
              <span className="text-white font-bold">P{position}<span className="text-xs text-[#6b6b88] ml-1">current</span></span>
              {Driver.permanentNumber && (
                <span className="text-white font-bold">#{Driver.permanentNumber}</span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl border border-[#2e2e42] text-[#6b6b88] hover:text-white transition-all text-lg"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#2e2e42] border-t-[#E8002D] rounded-full animate-spin" />
            </div>
          ) : career ? (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
                {[
                  { label: 'Races', value: career.totalRaces },
                  { label: 'Wins', value: career.wins },
                  { label: 'Podiums', value: career.podiums },
                  { label: 'Poles', value: career.poles },
                  { label: 'FL', value: career.fastestLaps },
                  { label: '🏆 WDC', value: career.championships },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-3 text-center">
                    <div
                      className="text-xl font-extrabold leading-none"
                      style={{ color: stat.label === '🏆 WDC' && career.championships > 0 ? colors.primary : '#f0f0f8' }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[9px] text-[#6b6b88] mt-1 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              {bestSeason && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl mb-4"
                  style={{ backgroundColor: colors.primary + '15', border: `1px solid ${colors.primary}33` }}
                >
                  <span className="text-xl">⭐</span>
                  <div className="text-sm">
                    <span className="text-white font-bold">Best season: {bestSeason.season}</span>
                    <span className="text-[#6b6b88] ml-2">
                      P{bestSeason.DriverStandings[0]?.position} · {bestSeason.DriverStandings[0]?.points} pts · {bestSeason.DriverStandings[0]?.wins} wins
                    </span>
                  </div>
                </div>
              )}

              <h3 className="text-xs font-bold uppercase tracking-widest text-[#6b6b88] mb-3">Season History</h3>
              <div className="space-y-2">
                {sortedSeasons.slice(0, 20).map(s => {
                  const sd = s.DriverStandings[0]
                  if (!sd) return null
                  const pos = parseInt(sd.position)
                  const pts = parseFloat(sd.points)
                  const maxPts = 450
                  const conId = sd.Constructors?.[0]?.constructorId ?? ''
                  const tc = getTeamColor(conId)
                  return (
                    <div key={s.season} className="flex items-center gap-3 py-1.5">
                      <div className="w-10 text-right text-xs font-bold text-[#6b6b88]">{s.season}</div>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                        style={{ backgroundColor: pos === 1 ? colors.primary : '#1e1e2e', color: pos === 1 ? colors.text : '#f0f0f8' }}
                      >
                        {pos}
                      </div>
                      <div className="flex-1">
                        <div className="h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min((pts / maxPts) * 100, 100)}%`, backgroundColor: tc }}
                          />
                        </div>
                      </div>
                      <div className="text-xs font-mono text-[#f0f0f8] w-12 text-right">{Math.round(pts)}pts</div>
                      <div className="text-xs text-[#6b6b88] w-8 text-right">{sd.wins}W</div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-[#6b6b88]">Failed to load career data</div>
          )}
        </div>
      </div>
    </div>
  )
}
