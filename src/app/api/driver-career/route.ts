import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

async function jFetch(url: string, timeoutMs = 6000): Promise<any> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { cache: 'no-store', signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(req: NextRequest) {
  const driverId = new URL(req.url).searchParams.get('driverId')
  if (!driverId) return NextResponse.json({ error: 'No driverId' }, { status: 400 })

  try {
    // Two lightweight calls in parallel:
    // 1. standings — gives us wins/championships/points/seasons
    // 2. results?limit=1 — gives us totalRaces from MRData.total (no data transferred)
    const [standingsData, resultsMetaData] = await Promise.all([
      jFetch(`${BASE}/drivers/${driverId}/driverStandings.json?limit=100`),
      jFetch(`${BASE}/drivers/${driverId}/results.json?limit=1&offset=0`),
    ])

    // Build season history
    const standingsLists: any[] = standingsData?.MRData?.StandingsTable?.StandingsLists ?? []
    const seasons = standingsLists
      .map((s: any) => ({
        season: s.season,
        DriverStandings: (s.DriverStandings ?? []).map((ds: any) => ({
          position: ds.position,
          points: ds.points,
          wins: ds.wins,
          Constructors: (ds.Constructors ?? []).map((c: any) => ({
            name: c.name,
            constructorId: c.constructorId,
          })),
        })),
      }))
      .sort((a: any, b: any) => parseInt(b.season) - parseInt(a.season))

    // Derive from standings — always fast and reliable
    const wins = standingsLists.reduce(
      (sum: number, s: any) => sum + (parseInt(s.DriverStandings?.[0]?.wins ?? '0') || 0), 0
    )
    const championships = standingsLists.filter(
      (s: any) => s.DriverStandings?.[0]?.position === '1'
    ).length
    const totalPoints = Math.round(
      standingsLists.reduce(
        (sum: number, s: any) => sum + (parseFloat(s.DriverStandings?.[0]?.points ?? '0') || 0), 0
      )
    )

    // Total races from metadata (limit=1 is instant)
    const totalRaces = parseInt(resultsMetaData?.MRData?.total ?? '0') || 0

    // Best-effort: fetch ONE page of results to count podiums/poles/FL
    // If it's slow or fails, we fall back to -1 (UI hides those rows)
    let podiums = -1, poles = -1, fastestLaps = -1
    try {
      const resultsPage = await jFetch(
        `${BASE}/drivers/${driverId}/results.json?limit=100&offset=0`,
        5000
      )
      const races: any[] = resultsPage?.MRData?.RaceTable?.Races ?? []
      const pageTotal = parseInt(resultsPage?.MRData?.total ?? '0') || 0

      // Only compute stats if we got ALL results in one page (careers ≤ 100 races)
      // For longer careers, skip rather than show wrong partial numbers
      if (races.length === pageTotal) {
        podiums = 0; poles = 0; fastestLaps = 0
        for (const race of races) {
          for (const r of (race.Results ?? [])) {
            const pos = parseInt(r.position)
            if (isNaN(pos)) continue
            if (pos <= 3) podiums++
            if (parseInt(r.grid) === 1) poles++
            if (r.FastestLap?.rank === '1') fastestLaps++
          }
        }
      }
    } catch {
      // best-effort — leave as -1
    }

    return NextResponse.json(
      { seasons, totalRaces, wins, podiums, poles, fastestLaps, championships, totalPoints },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    )
  } catch (err) {
    console.error('[driver-career]', err)
    return NextResponse.json({ error: 'Failed to fetch career' }, { status: 500 })
  }
}
