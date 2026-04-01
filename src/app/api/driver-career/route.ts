import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

// Jolpica /drivers/{id}/driverStandings.json (no year) returns HTTP 400.
// BUT /{year}/drivers/{id}/driverStandings.json works fine.
// So: derive race stats from cross-season results.json, then fetch per-season
// standings in parallel to get actual championship positions + count.

export async function GET(req: NextRequest) {
  const driverId = new URL(req.url).searchParams.get('driverId')
  if (!driverId) return NextResponse.json({ error: 'No driverId' }, { status: 400 })

  try {
    // Step 1: fast metadata call — get total race count
    const metaRes = await fetch(
      `${BASE}/drivers/${driverId}/results.json?limit=1`,
      { next: { revalidate: 3600 } }
    )
    if (!metaRes.ok) throw new Error(`meta HTTP ${metaRes.status}`)
    const meta = await metaRes.json()
    const totalRaces = parseInt(meta?.MRData?.total ?? '0') || 0

    // Step 2: fetch all result pages in parallel (Jolpica caps at 100/page)
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

    // Step 3: count stats and build per-season data from results
    let wins = 0, podiums = 0, poles = 0, fastestLaps = 0, totalPoints = 0
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

    // Step 4: fetch final standings for each season in parallel
    // /{year}/drivers/{id}/driverStandings.json works correctly with a year
    const seasonYears = Array.from(seasonsMap.keys())
    const standingsPages = await Promise.all(
      seasonYears.map(year =>
        fetch(`${BASE}/${year}/drivers/${driverId}/driverStandings.json`, {
          next: { revalidate: 3600 },
        })
          .then(r => r.ok ? r.json() : null)
          .then((d: any) => {
            const entry = d?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
            return { year, position: entry?.position ?? '' }
          })
          .catch(() => ({ year, position: '' }))
      )
    )

    const positionMap = new Map<string, string>()
    let championships = 0
    for (const { year, position } of standingsPages) {
      positionMap.set(year, position)
      if (position === '1') championships++
    }

    // Build seasons array sorted newest-first
    const seasons = Array.from(seasonsMap.entries())
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([season, data]) => ({
        season,
        DriverStandings: [{
          position: positionMap.get(season) ?? '',
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
      championships,
      totalPoints: Math.round(totalPoints),
    })
  } catch (err) {
    console.error('[driver-career]', err)
    return NextResponse.json({ error: 'Failed to fetch career' }, { status: 500 })
  }
}
