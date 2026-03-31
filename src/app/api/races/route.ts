import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.jolpi.ca/ergast/f1'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const season = searchParams.get('season') ?? '2024'

  try {
    const res = await fetch(`${BASE}/${season}.json?limit=30`, { next: { revalidate: 300 } })
    const data = await res.json()
    const races = data?.MRData?.RaceTable?.Races ?? []
    return NextResponse.json({ races, season })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch races' }, { status: 500 })
  }
}
