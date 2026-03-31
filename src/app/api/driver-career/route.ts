import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'
const MAX_RETRIES = 2

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < retries) await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500))
    }
  }
  throw lastError
}

export async function GET(req: NextRequest) {
  const driverId = new URL(req.url).searchParams.get('driverId')
  if (!driverId) return NextResponse.json({ error: 'No driverId' }, { status: 400 })

  try {
    // Fetch standings + results in parallel
    const [standingsData, resultsData] = await Promise.all([
      fetchWithRetry(`${BASE}/drivers/${driverId}/driverStandings.json?limit=50`),
      fetchWithRetry(`${BASE}/drivers/${driverId}/results.json?limit=1000`),
    ])

    // Build season history
    const standingsLists = standingsData?.MRData?.StandingsTable?.StandingsLists ?? []
    const seasons = standingsLists.map((s: any) => ({
      season: s.season,
      DriverStandings: (s.DriverStandings ?? []).map((ds: any) => ({
        position: ds.position,
        points: ds.points,
        wins: ds.wins,
        Constructors: (ds.Constructors ?? []).map((c: any) => ({ name: c.name, constructorId: c.constructorId })),
      })),
    })).sort((a: any, b: any) => parseInt(b.season) - parseInt(a.season))

    // Count stats from race results
    const races = resultsData?.MRData?.RaceTable?.Races ?? []
    let totalRaces = 0, wins = 0, podiums = 0, poles = 0, fastestLaps = 0

    for (const race of races) {
      for (const r of (race.Results ?? [])) {
        const pos = parseInt(r.position)
        if (isNaN(pos)) continue
        totalRaces++
        if (pos === 1) wins++
        if (pos <= 3) podiums++
        if (parseInt(r.grid) === 1) poles++
        if (r.FastestLap?.rank === '1') fastestLaps++
      }
    }

    // Championships from standings
    const championships = seasons.filter((s: any) => s.DriverStandings?.[0]?.position === '1').length

    // Total career points
    let totalPoints = 0
    for (const s of seasons) {
      totalPoints += parseFloat(s.DriverStandings?.[0]?.points ?? '0') || 0
    }

    return NextResponse.json({
      seasons,
      totalRaces,
      wins,
      podiums,
      poles,
      fastestLaps,
      championships,
      totalPoints: Math.round(totalPoints),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (err) {
    console.error('[driver-career]', err)
    return NextResponse.json({ error: 'Failed to fetch career' }, { status: 500 })
  }
}
