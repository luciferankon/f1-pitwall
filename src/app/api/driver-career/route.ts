import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

async function safeTotal(url: string): Promise<number> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return 0
    const data = await res.json()
    return parseInt(data?.MRData?.total ?? '0', 10) || 0
  } catch {
    return 0
  }
}

async function safeJSON(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
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
    const [
      totalRaces,
      wins,
      p2,
      p3,
      poles,
      fastestLaps,
      championships,
      standingsData,
    ] = await Promise.all([
      safeTotal(`${BASE}/drivers/${driverId}/results.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/results/1.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/results/2.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/results/3.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/grid/1.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/fastest/1.json?limit=1`),
      safeTotal(`${BASE}/drivers/${driverId}/driverStandings/1.json?limit=1`),
      safeJSON(`${BASE}/drivers/${driverId}/driverStandings.json?limit=50`),
    ])

    const seasons = standingsData?.MRData?.StandingsTable?.StandingsLists ?? []

    let totalPoints = 0
    seasons.forEach((s: { DriverStandings?: Array<{ points: string }> }) => {
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
