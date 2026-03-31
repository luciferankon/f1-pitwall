import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { race, winner, context } = await request.json()
    if (!race) return NextResponse.json({ error: 'No race provided' }, { status: 400 })

    const prompt = `You are an expert F1 analyst with deep knowledge of the 2024 Formula 1 season.

Analyze the ${race} from the 2024 F1 season.
Winner: ${winner}
Additional context: ${context || 'General race analysis'}

Write a punchy, expert race analysis covering:

KEY MOMENT:
[The single defining moment of the race — be specific and dramatic]

STRATEGY:
[Pit stop strategies that won or lost the race — technical but accessible]

PERFORMANCE:
[Standout driver performances beyond the winner — who impressed, who disappointed]

CHAMPIONSHIP IMPACT:
[How this result shifted the title fight — be specific about points gaps]

VERDICT:
[One sharp sentence summing up what this race meant for the season]

Write like Martin Brundle's grid walk — direct, opinionated, technically sharp. No filler.`

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
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
