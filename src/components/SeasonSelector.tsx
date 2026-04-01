'use client'

interface SeasonSelectorProps {
  season: number
  onChange: (season: number) => void
}

export default function SeasonSelector({ season, onChange }: SeasonSelectorProps) {
  const years: number[] = []
  for (let y = new Date().getFullYear(); y >= 1950; y--) years.push(y)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-[#6b6b88] uppercase tracking-widest">Season</span>
      <div className="relative">
        <select
          value={season}
          onChange={e => onChange(parseInt(e.target.value))}
          className="appearance-none bg-[#0d0d14] border border-[#2e2e42] rounded-xl pl-3 pr-7 py-2 text-sm font-bold text-white outline-none cursor-pointer hover:border-[#3e3e52] transition-all focus:border-[#E8002D]"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6b88] text-xs">▼</div>
      </div>
    </div>
  )
}
