import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const season = searchParams.get('season') ?? '2024'

  try {
    const [driversRes, constructorsRes] = await Promise.all([
      fetch(`${BASE}/${season}/driverStandings.json?limit=30`, { next: { revalidate: 300 } }),
      fetch(`${BASE}/${season}/constructorStandings.json?limit=15`, { next: { revalidate: 300 } }),
    ])

    const [driverData, constructorData] = await Promise.all([
      driversRes.json(),
      constructorsRes.json(),
    ])

    const drivers = driverData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []
    const constructors = constructorData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []

    return NextResponse.json({ drivers, constructors, season })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 })
  }
}
