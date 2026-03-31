'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback, useRef } from 'react'
import { DriverStanding, ConstructorStanding, Race } from '@/lib/types'
import { DriverStandings, ConstructorStandings } from '@/components/StandingsTable'
import DriverCard from '@/components/DriverCard'
import RaceCard from '@/components/RaceCard'
import SeasonSelector from '@/components/SeasonSelector'
import ChampionshipChart from '@/components/ChampionshipChart'
import DriverComparison from '@/components/DriverComparison'

const RaceModal = dynamic(() => import('@/components/RaceModal'), { ssr: false })
const DriverModal = dynamic(() => import('@/components/DriverModal'), { ssr: false })
const HeroScene = dynamic(() => import('@/components/HeroScene'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#050508]" />,
})

const HERO_COLORS: Record<string, string> = {
  mclaren: '#FF8000', ferrari: '#E8002D', red_bull: '#3671C6',
  mercedes: '#27F4D2', aston_martin: '#229971', alpine: '#FF87BC',
  haas: '#B6BABD', rb: '#6692FF', williams: '#64C4FF', kick_sauber: '#52E252',
}

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    el.querySelectorAll('.reveal').forEach(c => observer.observe(c))
    return () => observer.disconnect()
  }, [])
  return ref
}

function AnimatedCounter({ target, suffix = '' }: { target: number | string; suffix?: string }) {
  const [val, setVal] = useState(0)
  const num = typeof target === 'string' ? parseInt(target) || 0 : target
  useEffect(() => {
    if (!num) { setVal(0); return }
    const start = performance.now()
    const dur = 1200
    function step(now: number) {
      const p = Math.min((now - start) / dur, 1)
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setVal(Math.round(eased * num))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [num])
  return <>{val}{suffix}</>
}

export default function Home() {
  const [season, setSeason] = useState(2024)
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([])
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([])
  const [races, setRaces] = useState<Race[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRace, setSelectedRace] = useState<number | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<DriverStanding | null>(null)
  const [heroColor, setHeroColor] = useState('#E8002D')
  const scrollRef = useScrollReveal()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [standingsRes, racesRes] = await Promise.all([
        fetch(`/api/standings?season=${season}`),
        fetch(`/api/races?season=${season}`),
      ])
      const [standingsData, racesData] = await Promise.all([standingsRes.json(), racesRes.json()])
      setDriverStandings(standingsData.drivers ?? [])
      setConstructorStandings(standingsData.constructors ?? [])
      setRaces(racesData.races ?? [])
      const lead = standingsData.constructors?.[0]?.Constructor?.constructorId
      if (lead && HERO_COLORS[lead]) setHeroColor(HERO_COLORS[lead])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [season])

  useEffect(() => { fetchData() }, [fetchData])

  const champion = driverStandings[0]
  const constructorChamp = constructorStandings[0]
  const today = new Date()
  const pastRaces = races.filter(r => new Date(r.date) < today)
  const upcomingRaces = races.filter(r => new Date(r.date) >= today)
  const nextRace = upcomingRaces[0]

  return (
    <main className="min-h-screen bg-[#050508] overflow-x-hidden" ref={scrollRef}>

      <div className="relative h-[520px] sm:h-[560px] overflow-hidden">
        <div className="absolute inset-0"><HeroScene teamColor={heroColor} /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/30 via-transparent to-[#050508]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050508]/70 via-transparent to-transparent" />

        <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 h-14 glass">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              <div className="w-2 h-5 rounded-sm" style={{ backgroundColor: '#E8002D' }} />
              <div className="w-2 h-5 rounded-sm bg-white" />
              <div className="w-2 h-5 rounded-sm" style={{ backgroundColor: '#3671C6' }} />
            </div>
            <span className="font-black text-[15px] tracking-tight text-white">PitWall</span>
            <span className="text-[9px] text-[#6b6b88] font-bold uppercase tracking-widest ml-1">v2</span>
          </div>
          <div className="flex items-center gap-3">
            <SeasonSelector season={season} onChange={setSeason} />
            <a href="https://github.com/luciferankon/f1-pitwall" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 px-3 py-1.5 border border-white/15 rounded-lg hover:border-white/30 text-white/50 hover:text-white transition-all text-xs">
              GitHub
            </a>
          </div>
        </nav>

        <div className="absolute bottom-14 left-0 right-0 px-6 sm:px-10" style={{ animation: 'slideUp 0.6s ease-out 0.3s both' }}>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase mb-3"
               style={{ backgroundColor: heroColor + '20', border: `1px solid ${heroColor}40`, color: heroColor }}>
            Formula 1 · {season} World Championship
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4 leading-[1.1]">
            The season,{' '}<span className="gradient-text">decoded.</span>
          </h1>
          {!loading && (
            <div className="flex flex-wrap gap-6" style={{ animation: 'slideUp 0.5s ease-out 0.5s both' }}>
              {champion && (
                <div>
                  <div className="text-2xl font-black text-white"><AnimatedCounter target={champion.points} /></div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">{champion.Driver.familyName} · WDC Leader</div>
                </div>
              )}
              {constructorChamp && (
                <div>
                  <div className="text-2xl font-black text-white"><AnimatedCounter target={constructorChamp.points} /></div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">{constructorChamp.Constructor.name} · WCC</div>
                </div>
              )}
              <div>
                <div className="text-2xl font-black text-white"><AnimatedCounter target={pastRaces.length} />/{races.length}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Races Complete</div>
              </div>
              {nextRace && (
                <div>
                  <div className="text-2xl font-black text-white">{nextRace.raceName.replace(' Grand Prix', ' GP')}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Next Race · R{nextRace.round}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1300px] mx-auto px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-2 border-[#2e2e42] border-t-[#E8002D] rounded-full animate-spin" />
            <p className="text-[#6b6b88] text-sm">Loading {season} season data...</p>
          </div>
        ) : (
          <>
            <section className="py-10 reveal">
              <ChampionshipChart season={season} driverStandings={driverStandings} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 py-6">
              <div className="lg:col-span-3 reveal">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black text-white">{season} Driver Standings</h2>
                  <span className="text-xs text-[#6b6b88]">Click for full profile</span>
                </div>
                <DriverStandings standings={driverStandings} onDriverClick={setSelectedDriver} />
              </div>
              <div className="lg:col-span-2 reveal">
                <DriverComparison driverStandings={driverStandings} />
              </div>
            </section>

            <section className="py-8 reveal">
              <h2 className="text-xl font-black text-white mb-4">{season} Constructor Championship</h2>
              <ConstructorStandings standings={constructorStandings} />
            </section>

            <section className="py-8 reveal">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white">Driver Cards</h2>
                <span className="text-xs text-[#6b6b88]">Hover to flip · Click for profile</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {driverStandings.map(s => (
                  <DriverCard key={s.Driver.driverId} standing={s} onClick={() => setSelectedDriver(s)} />
                ))}
              </div>
            </section>

            <section className="py-8 reveal">
              <h2 className="text-xl font-black text-white mb-5">{season} Race Calendar — {races.length} Grands Prix</h2>
              {upcomingRaces.length > 0 && (
                <>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#6b6b88] mb-3">Upcoming</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                    {upcomingRaces.map(r => (
                      <RaceCard key={r.round} race={r} index={parseInt(r.round)} isPast={false} onClick={() => setSelectedRace(parseInt(r.round))} />
                    ))}
                  </div>
                </>
              )}
              {pastRaces.length > 0 && (
                <>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#6b6b88] mb-3">Completed</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pastRaces.slice().reverse().map(r => (
                      <RaceCard key={r.round} race={r} index={parseInt(r.round)} isPast={true} onClick={() => setSelectedRace(parseInt(r.round))} />
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>

      <footer className="text-center py-10 text-sm text-[#6b6b88] border-t border-[#1e1e2e] mt-8">
        Built by{' '}
        <a href="https://luciferankon.dev" className="hover:underline" style={{ color: heroColor }}>luciferankon</a>
        {' '}· Data: Jolpica F1 API · AI: Claude
      </footer>

      {selectedRace !== null && (
        <RaceModal season={season} round={selectedRace} onClose={() => setSelectedRace(null)} />
      )}
      {selectedDriver !== null && (
        <DriverModal standing={selectedDriver} onClose={() => setSelectedDriver(null)} />
      )}
    </main>
  )
}
