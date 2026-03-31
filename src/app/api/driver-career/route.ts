import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const driverId = searchParams.get('driverId')

  if (!driverId) return NextResponse.json({ error: 'No driverId' }, { status: 400 })

  try {
    const [standingsRes, racesRes] = await Promise.all([
      fetch(`${BASE}/drivers/${driverId}/driverStandings.json?limit=40`, { next: { revalidate: 3600 } }),
      fetch(`${BASE}/drivers/${driverId}/results.json?limit=500`, { next: { revalidate: 3600 } }),
    ])

    const [standingsData, racesData] = await Promise.all([
      standingsRes.json(),
      racesRes.json(),
    ])

    const seasons = standingsData?.MRData?.StandingsTable?.StandingsLists ?? []
    const races = racesData?.MRData?.RaceTable?.Races ?? []

    // Aggregate stats
    let wins = 0, podiums = 0, poles = 0, points = 0, fastestLaps = 0
    races.forEach((race: { Results?: Array<{ position: string; grid: string; FastestLap?: { rank: string }; points: string }> }) => {
      const r = race.Results?.[0]
      if (!r) return
      const pos = parseInt(r.position)
      if (pos === 1) wins++
      if (pos <= 3) podiums++
      if (r.grid === '1') poles++
      if (r.FastestLap?.rank === '1') fastestLaps++
      points += parseFloat(r.points ?? '0')
    })

    const championships = seasons.filter(
      (s: { DriverStandings?: Array<{ position: string }> }) => s.DriverStandings?.[0]?.position === '1'
    ).length

    return NextResponse.json({
      seasons,
      totalRaces: races.length,
      wins,
      podiums,
      poles,
      fastestLaps,
      championships,
      totalPoints: Math.round(points),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch career' }, { status: 500 })
  }
}
