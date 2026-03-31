import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { race, winner, context, results } = await request.json()
    if (!race) return NextResponse.json({ error: 'No race provided' }, { status: 400 })

    const topResults = results
      ? results.slice(0, 10).map((r: { position: string; Driver: { code: string }; Constructor: { name: string }; Time?: { time: string }; status: string; points: string }, i: number) =>
          `P${i + 1}: ${r.Driver.code} (${r.Constructor.name}) — ${r.Time?.time ?? r.status} — ${r.points}pts`
        ).join('\n')
      : 'Race result data not available'

    const prompt = `You are an expert F1 analyst with deep knowledge of every Formula 1 season.

Race: ${race}
Winner: ${winner}
Context: ${context || ''}

Top 10 Results:
${topResults}

Write a punchy, expert race analysis:

KEY MOMENT:
[The single defining moment — specific and dramatic]

STRATEGY:
[Pit stop strategies that won or lost the race]

PERFORMANCE:
[Standout performances beyond the winner — who shone, who disappointed]

CHAMPIONSHIP IMPACT:
[How this shifted the title fight — specific points gaps]

VERDICT:
[One sharp sentence summing up what this race meant]

Write like Martin Brundle — direct, opinionated, technically sharp. No filler.`

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
