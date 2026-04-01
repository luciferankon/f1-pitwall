import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

async function jolpicaFetch(url: string): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 7500)
  try {
    const res = await fetch(url, { cache: 'no-store', signal: controller.signal })
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
    // Fetch standings + first results page in parallel
    const [standingsData, resultsPage1] = await Promise.all([
      jolpicaFetch(`${BASE}/drivers/${driverId}/driverStandings.json?limit=100`),
      jolpicaFetch(`${BASE}/drivers/${driverId}/results.json?limit=100&offset=0`),
    ])

    // Build season history from standings
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

    // Derive wins, championships, totalPoints from standings — no extra API calls needed
    const wins = standingsLists.reduce(
      (sum: number, s: any) => sum + (parseInt(s.DriverStandings?.[0]?.wins ?? '0') || 0),
      0
    )
    const championships = standingsLists.filter(
      (s: any) => s.DriverStandings?.[0]?.position === '1'
    ).length
    const totalPoints = Math.round(
      standingsLists.reduce(
        (sum: number, s: any) => sum + (parseFloat(s.DriverStandings?.[0]?.points ?? '0') || 0),
        0
      )
    )

    // Race count from metadata
    const totalRaces = parseInt(resultsPage1?.MRData?.total ?? '0') || 0

    // Collect all race results (paginate, max 500 to stay within timeout)
    const allRaces: any[] = [...(resultsPage1?.MRData?.RaceTable?.Races ?? [])]
    const limit = 100
    const extraPages = Math.min(Math.ceil(totalRaces / limit) - 1, 4) // max 4 extra pages (500 results total)

    if (extraPages > 0) {
      const pages = await Promise.all(
        Array.from({ length: extraPages }, (_, i) =>
          jolpicaFetch(`${BASE}/drivers/${driverId}/results.json?limit=${limit}&offset=${(i + 1) * limit}`)
            .then((d: any) => d?.MRData?.RaceTable?.Races ?? [])
            .catch(() => [])
        )
      )
      pages.forEach(p => allRaces.push(...p))
    }

    // Count podiums, poles, fastest laps from results
    let podiums = 0, poles = 0, fastestLaps = 0
    for (const race of allRaces) {
      for (const r of (race.Results ?? [])) {
        const pos = parseInt(r.position)
        if (isNaN(pos)) continue
        if (pos <= 3) podiums++
        if (parseInt(r.grid) === 1) poles++
        if (r.FastestLap?.rank === '1') fastestLaps++
      }
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
