import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const season = searchParams.get('season') ?? '2024'
  const round = searchParams.get('round') ?? '1'

  try {
    const [resultsRes, qualyRes, pitsRes] = await Promise.all([
      fetch(`${BASE}/${season}/${round}/results.json?limit=25`, { next: { revalidate: 3600 } }),
      fetch(`${BASE}/${season}/${round}/qualifying.json?limit=25`, { next: { revalidate: 3600 } }),
      fetch(`${BASE}/${season}/${round}/pitstops.json?limit=100`, { next: { revalidate: 3600 } }),
    ])

    const [resultsData, qualyData, pitsData] = await Promise.all([
      resultsRes.json(),
      qualyRes.json(),
      pitsRes.json(),
    ])

    const race = resultsData?.MRData?.RaceTable?.Races?.[0] ?? null
    const results = race?.Results ?? []
    const qualifying = qualyData?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults ?? []
    const pitStops = pitsData?.MRData?.RaceTable?.Races?.[0]?.PitStops ?? []

    return NextResponse.json({ race, results, qualifying, pitStops })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch race data' }, { status: 500 })
  }
}
