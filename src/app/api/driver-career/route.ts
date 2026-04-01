import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

// Jolpica does NOT support /drivers/{id}/driverStandings.json without season_year.
// Everything is derived from /drivers/{id}/results.json which works cross-season.

export async function GET(req: NextRequest) {
  const driverId = new URL(req.url).searchParams.get('driverId')
  if (!driverId) return NextResponse.json({ error: 'No driverId' }, { status: 400 })

  try {
    // Step 1: fast metadata call — gives us total race count instantly
    const metaRes = await fetch(
      `${BASE}/drivers/${driverId}/results.json?limit=1`,
      { next: { revalidate: 3600 } }
    )
    if (!metaRes.ok) throw new Error(`meta HTTP ${metaRes.status}`)
    const meta = await metaRes.json()
    const totalRaces = parseInt(meta?.MRData?.total ?? '0') || 0

    // Step 2: fetch all result pages in parallel (100/page)
    const pageCount = Math.max(1, Math.ceil(totalRaces / 100))
    const pageResults = await Promise.all(
      Array.from({ length: pageCount }, (_, i) =>
        fetch(`${BASE}/drivers/${driverId}/results.json?limit=100&offset=${i * 100}`, {
          next: { revalidate: 3600 },
        })
          .then(r => (r.ok ? r.json() : null))
          .then((d: any) => (d?.MRData?.RaceTable?.Races ?? []) as any[])
          .catch(() => [] as any[])
      )
    )

    const allRaces = pageResults.flat()

    // Step 3: count everything from results
    let wins = 0, podiums = 0, poles = 0, fastestLaps = 0, totalPoints = 0

    // Track per-season stats for the seasons history
    const seasonsMap = new Map<string, {
      wins: number; points: number;
      constructorId: string; constructorName: string;
    }>()

    for (const race of allRaces) {
      const season: string = race.season ?? ''
      if (!seasonsMap.has(season)) {
        seasonsMap.set(season, { wins: 0, points: 0, constructorId: '', constructorName: '' })
      }
      const seasonData = seasonsMap.get(season)!

      for (const r of (race.Results ?? [])) {
        const pos = parseInt(r.position)
        if (isNaN(pos)) continue
        const pts = parseFloat(r.points ?? '0') || 0

        if (pos === 1) { wins++; seasonData.wins++ }
        if (pos <= 3) podiums++
        if (parseInt(r.grid) === 1) poles++
        if (r.FastestLap?.rank === '1') fastestLaps++
        totalPoints += pts
        seasonData.points += pts

        if (!seasonData.constructorId && r.Constructor?.constructorId) {
          seasonData.constructorId = r.Constructor.constructorId
          seasonData.constructorName = r.Constructor.name ?? ''
        }
      }
    }

    // Build seasons array sorted newest-first
    const seasons = Array.from(seasonsMap.entries())
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([season, data]) => ({
        season,
        DriverStandings: [{
          position: '',
          points: data.points.toFixed(1),
          wins: data.wins.toString(),
          Constructors: [{ name: data.constructorName, constructorId: data.constructorId }],
        }],
      }))

    return NextResponse.json({
      seasons,
      totalRaces,
      wins,
      podiums,
      poles,
      fastestLaps,
      championships: -1,   // unavailable: Jolpica standings requires season_year
      totalPoints: Math.round(totalPoints),
    })
  } catch (err) {
    console.error('[driver-career]', err)
    return NextResponse.json({ error: 'Failed to fetch career' }, { status: 500 })
  }
}
