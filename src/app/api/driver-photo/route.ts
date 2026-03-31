import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const wikiUrl = searchParams.get('wikiUrl') ?? ''

  if (!wikiUrl) return NextResponse.json({ photo: null })

  try {
    // Extract page title from Wikipedia URL
    const pageName = wikiUrl.split('/wiki/').pop()
    if (!pageName) return NextResponse.json({ photo: null })

    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${pageName}`,
      { next: { revalidate: 86400 }, headers: { 'User-Agent': 'PitWall/1.0 (pitwall.dev)' } }
    )
    const data = await res.json()
    const photo = data?.thumbnail?.source ?? data?.originalimage?.source ?? null

    return NextResponse.json({ photo })
  } catch {
    return NextResponse.json({ photo: null })
  }
}
