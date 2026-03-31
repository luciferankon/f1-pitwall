# PitWall — F1 2024 Season Analytics

A full-stack F1 analytics dashboard for the complete 2024 Formula 1 season, built with Next.js 15, Recharts, and Claude AI.

## Features

- **Driver Standings** — All 20 drivers with team-colored progress bars, wins, podiums, poles
- **Constructor Standings** — All 10 teams with visual points comparison
- **Championship Battle** — Recharts AreaChart showing the points fight across all 24 races
- **Head-to-Head** — Compare any two drivers with mirrored stat bars in team colors
- **Race Calendar** — All 24 GPs with circuit info and winners
- **AI Race Analyst** — Pick any GP and get a streaming Claude analysis: key moment, strategy, performance, championship impact, verdict

## Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS
- Recharts
- Anthropic Claude (claude-haiku)

## Deploy

```bash
npm install
npm run dev
```

Set `ANTHROPIC_API_KEY` in your environment.
