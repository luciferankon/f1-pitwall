import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

export async function GET(req: NextRequest) {
  const driverId = new URL(req.url).searchParams.get('driverId')
  if (!driverId) return NextResponse.json({ error: 'No driverId' }, { status: 400 })

  try {
    // Parallel: standings (wins/champs/points) + results metadata (totalRaces)
    const [standingsRes, resultsMetaRes] = await Promise.all([
      fetch(`${BASE}/drivers/${driverId}/driverStandings.json?limit=100`, { next: { revalidate: 3600 } }),
      fetch(`${BASE}/drivers/${driverId}/results.json?limit=1`, { next: { revalidate: 3600 } }),
    ])

    if (!standingsRes.ok) throw new Error(`Standings HTTP ${standingsRes.status}`)
    if (!resultsMetaRes.ok) throw new Error(`Results HTTP ${resultsMetaRes.status}`)

    const [standingsData, resultsMeta] = await Promise.all([
      standingsRes.json(),
      resultsMetaRes.json(),
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

    // Reliable stats from standings
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
    const totalRaces = parseInt(resultsMeta?.MRData?.total ?? '0') || 0

    // Best-effort: one page of results for podiums/poles/FL
    let podiums = -1, poles = -1, fastestLaps = -1
    try {
      const resultsPageRes = await fetch(
        `${BASE}/drivers/${driverId}/results.json?limit=100&offset=0`,
        { next: { revalidate: 3600 } }
      )
      if (resultsPageRes.ok) {
        const resultsPage = await resultsPageRes.json()
        const pageRaces: any[] = resultsPage?.MRData?.RaceTable?.Races ?? []
        const apiTotal = parseInt(resultsPage?.MRData?.total ?? '0') || 0
        // Only show if we got the full career in one page
        if (pageRaces.length > 0 && pageRaces.length >= apiTotal) {
          podiums = 0; poles = 0; fastestLaps = 0
          for (const race of pageRaces) {
            for (const r of (race.Results ?? [])) {
              const pos = parseInt(r.position)
              if (isNaN(pos)) continue
              if (pos <= 3) podiums++
              if (parseInt(r.grid) === 1) poles++
              if (r.FastestLap?.rank === '1') fastestLaps++
            }
          }
        }
      }
    } catch {
      // best-effort — leave as -1
    }

    return NextResponse.json({ seasons, totalRaces, wins, podiums, poles, fastestLaps, championships, totalPoints })
  } catch (err) {
    console.error('[driver-career]', err)
    return NextResponse.json({ error: 'Failed to fetch career' }, { status: 500 })
  }
}
