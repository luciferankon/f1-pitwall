import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

async function fetchTotal(url: string): Promise<number> {
  const res = await fetch(url + '&limit=1', { next: { revalidate: 3600 } })
  const data = await res.json()
  return parseInt(data?.MRData?.total ?? '0', 10)
}

async function fetchAll<T>(url: string, extractFn: (data: Record<string, unknown>) => T[]): Promise<T[]> {
  // First get total count
  const countRes = await fetch(url + '&limit=1', { next: { revalidate: 3600 } })
  const countData = await countRes.json()
  const total = parseInt(countData?.MRData?.total ?? '0', 10)
  if (total === 0) return []

  // Fetch in pages of 100
  const pages = Math.ceil(total / 100)
  const requests = Array.from({ length: pages }, (_, i) =>
    fetch(`${url}&limit=100&offset=${i * 100}`, { next: { revalidate: 3600 } }).then(r => r.json())
  )
  const results = await Promise.all(requests)
  return results.flatMap(d => extractFn(d))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const driverId = searchParams.get('driverId')

  if (!driverId) return NextResponse.json({ error: 'No driverId' }, { status: 400 })

  try {
    // Fetch all data in parallel using targeted Ergast endpoints
    const [
      totalRacesData,
      winsData,
      p2CountData,
      p3CountData,
      polesData,
      fastestData,
      championshipsData,
      standingsData,
    ] = await Promise.all([
      // Total races entered
      fetch(`${BASE}/drivers/${driverId}/results.json?limit=1`, { next: { revalidate: 3600 } }).then(r => r.json()),
      // All wins (need full list for podium calc too if <200)
      fetch(`${BASE}/drivers/${driverId}/results/1.json?limit=300`, { next: { revalidate: 3600 } }).then(r => r.json()),
      // P2 count
      fetch(`${BASE}/drivers/${driverId}/results/2.json?limit=1`, { next: { revalidate: 3600 } }).then(r => r.json()),
      // P3 count
      fetch(`${BASE}/drivers/${driverId}/results/3.json?limit=1`, { next: { revalidate: 3600 } }).then(r => r.json()),
      // Pole positions
      fetch(`${BASE}/drivers/${driverId}/grid/1.json?limit=1`, { next: { revalidate: 3600 } }).then(r => r.json()),
      // Fastest laps ranked #1
      fetch(`${BASE}/drivers/${driverId}/fastest/1.json?limit=1`, { next: { revalidate: 3600 } }).then(r => r.json()),
      // Championship wins
      fetch(`${BASE}/drivers/${driverId}/driverStandings/1.json?limit=1`, { next: { revalidate: 3600 } }).then(r => r.json()),
      // All season standings (for season history)
      fetch(`${BASE}/drivers/${driverId}/driverStandings.json?limit=50`, { next: { revalidate: 3600 } }).then(r => r.json()),
    ])

    const totalRaces = parseInt(totalRacesData?.MRData?.total ?? '0', 10)
    const wins = parseInt(winsData?.MRData?.total ?? '0', 10)
    const p2 = parseInt(p2CountData?.MRData?.total ?? '0', 10)
    const p3 = parseInt(p3CountData?.MRData?.total ?? '0', 10)
    const podiums = wins + p2 + p3
    const poles = parseInt(polesData?.MRData?.total ?? '0', 10)
    const fastestLaps = parseInt(fastestData?.MRData?.total ?? '0', 10)
    const championships = parseInt(championshipsData?.MRData?.total ?? '0', 10)
    const seasons = standingsData?.MRData?.StandingsTable?.StandingsLists ?? []

    // Calculate total points from season standings
    let totalPoints = 0
    seasons.forEach((s: { DriverStandings?: Array<{ points: string }> }) => {
      const pts = parseFloat(s.DriverStandings?.[0]?.points ?? '0')
      if (!isNaN(pts)) totalPoints += pts
    })

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
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch career' }, { status: 500 })
  }
}
