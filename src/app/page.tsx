'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import { DriverStanding, ConstructorStanding, Race } from '@/lib/types'
import { DriverStandings, ConstructorStandings } from '@/components/StandingsTable'
import DriverCard from '@/components/DriverCard'
import RaceCard from '@/components/RaceCard'
import SeasonSelector from '@/components/SeasonSelector'

// Modals
const RaceModal = dynamic(() => import('@/components/RaceModal'), { ssr: false })
const DriverModal = dynamic(() => import('@/components/DriverModal'), { ssr: false })

// Three.js hero (client-only)
const HeroScene = dynamic(() => import('@/components/HeroScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#050508]" />,
})

const TABS = [
  { id: 'drivers',      label: '🏎️ Drivers' },
  { id: 'constructors', label: '🏭 Constructors' },
  { id: 'cards',        label: '🃏 Driver Cards' },
  { id: 'races',        label: '🗓️ Race Calendar' },
]

// Map constructorId to a human-readable team colour for hero
const HERO_COLORS: Record<string, string> = {
  mclaren: '#FF8000', ferrari: '#E8002D', red_bull: '#3671C6',
  mercedes: '#27F4D2', aston_martin: '#229971', alpine: '#FF87BC',
  haas: '#B6BABD', rb: '#6692FF', williams: '#64C4FF', kick_sauber: '#52E252',
}

export default function Home() {
  const [season, setSeason] = useState(2024)
  const [tab, setTab] = useState('drivers')
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([])
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([])
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRace, setSelectedRace] = useState<number | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<DriverStanding | null>(null)
  const [heroColor, setHeroColor] = useState('#E8002D')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [standingsRes, racesRes] = await Promise.all([
        fetch(`/api/standings?season=${season}`),
        fetch(`/api/races?season=${season}`),
      ])
      const [standingsData, racesData] = await Promise.all([
        standingsRes.json(),
        racesRes.json(),
      ])
      setDriverStandings(standingsData.drivers ?? [])
      setConstructorStandings(standingsData.constructors ?? [])
      setRaces(racesData.races ?? [])

      // Set hero color from leading constructor
      const leadConstructor = standingsData.constructors?.[0]?.Constructor?.constructorId
      if (leadConstructor && HERO_COLORS[leadConstructor]) {
        setHeroColor(HERO_COLORS[leadConstructor])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [season])

  useEffect(() => { fetchData() }, [fetchData])

  const champion = driverStandings[0]
  const constructorChamp = constructorStandings[0]
  const today = new Date()
  const pastRaces = races.filter(r => new Date(r.date) < today)
  const upcomingRaces = races.filter(r => new Date(r.date) >= today)

  return (
    <main className="min-h-screen bg-[#050508] overflow-x-hidden">
      {/* ── HERO ────────────────────────────────────────────────── */}
      <div className="relative h-[420px] sm:h-[480px] overflow-hidden">
        {/* Three.js canvas background */}
        <div className="absolute inset-0">
          <HeroScene teamColor={heroColor} />
        </div>

        {/* Gradient overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/40 via-transparent to-[#050508]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050508]/60 via-transparent to-transparent" />

        {/* Nav bar */}
        <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              <div className="w-2 h-5 rounded-sm" style={{ backgroundColor: '#E8002D' }} />
              <div className="w-2 h-5 rounded-sm bg-white" />
              <div className="w-2 h-5 rounded-sm" style={{ backgroundColor: '#3671C6' }} />
            </div>
            <span className="font-black text-[15px] tracking-tight text-white">PitWall</span>
          </div>
          <div className="flex items-center gap-3">
            <SeasonSelector season={season} onChange={setSeason} />
            <a
              href="https://github.com/luciferankon/f1-pitwall"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 rounded-lg hover:border-white/40 hover:text-white text-white/60 transition-all text-xs backdrop-blur-sm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </nav>

        {/* Hero text */}
        <div className="absolute bottom-12 left-0 right-0 px-6 sm:px-10">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-3 backdrop-blur-sm"
            style={{ backgroundColor: heroColor + '25', border: `1px solid ${heroColor}50`, color: heroColor }}
          >
            🏁 Formula 1 · {season} World Championship
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
            The season,{' '}
            <span style={{ color: heroColor }}>by the numbers.</span>
          </h1>

          {/* Quick stats */}
          {!loading && (
            <div className="flex flex-wrap gap-5">
              {champion && (
                <div>
                  <div className="text-lg font-black text-white">{champion.Driver.familyName}</div>
                  <div className="text-[10px] text-white/50 uppercase tracking-wider">WDC Leader</div>
                </div>
              )}
              {constructorChamp && (
                <div>
                  <div className="text-lg font-black text-white">{constructorChamp.Constructor.name}</div>
                  <div className="text-[10px] text-white/50 uppercase tracking-wider">WCC Leader</div>
                </div>
              )}
              <div>
                <div className="text-lg font-black text-white">{races.length}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Rounds</div>
              </div>
              <div>
                <div className="text-lg font-black text-white">{pastRaces.length}</div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Completed</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#050508]/95 backdrop-blur-xl border-b border-[#1e1e2e]">
        <div className="max-w-[1200px] mx-auto px-6 flex gap-1 overflow-x-auto py-2 scrollbar-none">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap',
                tab === t.id
                  ? 'text-white border'
                  : 'text-[#6b6b88] hover:text-white',
              ].join(' ')}
              style={tab === t.id
                ? { backgroundColor: heroColor + '20', color: heroColor, borderColor: heroColor + '50' }
                : {}
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-2 border-[#2e2e42] border-t-[#E8002D] rounded-full animate-spin" />
            <p className="text-[#6b6b88] text-sm">Loading {season} season data…</p>
          </div>
        ) : (
          <>
            {tab === 'drivers' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-white">{season} Driver Championship</h2>
                  <span className="text-xs text-[#6b6b88]">Click any driver to view profile</span>
                </div>
                <DriverStandings standings={driverStandings} onDriverClick={setSelectedDriver} />
              </div>
            )}

            {tab === 'constructors' && (
              <div>
                <h2 className="text-xl font-black text-white mb-5">{season} Constructor Championship</h2>
                <ConstructorStandings standings={constructorStandings} />
              </div>
            )}

            {tab === 'cards' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black text-white">{season} Driver Cards</h2>
                  <span className="text-xs text-[#6b6b88]">Hover to flip · Click for full profile</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {driverStandings.map(s => (
                    <DriverCard
                      key={s.Driver.driverId}
                      standing={s}
                      onClick={() => setSelectedDriver(s)}
                    />
                  ))}
                </div>
              </div>
            )}

            {tab === 'races' && (
              <div>
                <h2 className="text-xl font-black text-white mb-5">{season} Race Calendar — {races.length} Grands Prix</h2>

                {upcomingRaces.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#6b6b88] mb-3">Upcoming</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                      {upcomingRaces.map(r => (
                        <RaceCard
                          key={r.round}
                          race={r}
                          index={parseInt(r.round)}
                          isPast={false}
                          onClick={() => setSelectedRace(parseInt(r.round))}
                        />
                      ))}
                    </div>
                  </>
                )}

                {pastRaces.length > 0 && (
                  <>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#6b6b88] mb-3">Completed</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {pastRaces.slice().reverse().map(r => (
                        <RaceCard
                          key={r.round}
                          race={r}
                          index={parseInt(r.round)}
                          isPast={true}
                          onClick={() => setSelectedRace(parseInt(r.round))}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-[#6b6b88] border-t border-[#1e1e2e] mt-8">
        Built by{' '}
        <a href="https://luciferankon.dev" className="hover:underline" style={{ color: heroColor }}>luciferankon</a>
        {' '}· Data: Ergast/Jolpica F1 API · Photos: Wikipedia · AI: Claude
      </footer>

      {/* ── MODALS ────────────────────────────────────────────────── */}
      {selectedRace !== null && (
        <RaceModal
          season={season}
          round={selectedRace}
          onClose={() => setSelectedRace(null)}
        />
      )}
      {selectedDriver !== null && (
        <DriverModal
          standing={selectedDriver}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </main>
  )
}
