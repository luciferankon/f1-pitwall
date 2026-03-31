import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

async function safeTotal(url: string): Promise<number> {
  try {
    const res = await fetch(url, { cache: 'force-cache', next: { revalidate: 3600 } })
    if (!res.ok) return 0
    const data = await res.json()
    return parseInt(data?.MRData?.total ?? '0', 10) || 0
  } catch {
    return 0
  }
}

async function safeJSON(url: string) {
  try {
    const res = await fetch(url, { cache: 'force-cache', next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const driverId = searchParams.get('driverId')
  if (!driverId) return NextResponse.json({ error: 'No driverId' }, { status: 400 })

  try {
    // Batch 1 — high-confidence endpoints
    const [standingsData, totalRaces, wins, p2, p3] = await Promise.all([
      safeJSON(`${BASE}/drivers/${driverId}/driverStandings.json?limit=50`),
      safeTotal(`${BASE}/drivers/${driverId}/results.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/results/1.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/results/2.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/results/3.json?limit=1`),
    ])

    const seasons: Array<{
      season: string
      DriverStandings: Array<{ position: string; points: string; wins: string; Constructors: Array<{ name: string; constructorId: string }> }>
    }> = standingsData?.MRData?.StandingsTable?.StandingsLists ?? []

    // WDC — derived from seasons already fetched (no extra API call)
    const championships = seasons.filter(s => s.DriverStandings?.[0]?.position === '1').length

    // Batch 2 — less certain endpoints
    const [poles, fastestLaps] = await Promise.all([
      safeTotal(`${BASE}/drivers/${driverId}/qualifying/1.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/fastest/1.json?limit=1`),
    ])

    let totalPoints = 0
    seasons.forEach(s => {
      const pts = parseFloat(s.DriverStandings?.[0]?.points ?? '0')
      if (!isNaN(pts)) totalPoints += pts
    })

    return NextResponse.json({
      seasons,
      totalRaces,
      wins,
      podiums: wins + p2 + p3,
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
