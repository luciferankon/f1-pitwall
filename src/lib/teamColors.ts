export const TEAM_COLORS: Record<string, { primary: string; secondary: string; text: string }> = {
  // 2024 teams
  red_bull:     { primary: '#3671C6', secondary: '#CC1E4A', text: '#fff' },
  mclaren:      { primary: '#FF8000', secondary: '#000000', text: '#000' },
  ferrari:      { primary: '#E8002D', secondary: '#FFFFFF', text: '#fff' },
  mercedes:     { primary: '#27F4D2', secondary: '#000000', text: '#000' },
  aston_martin: { primary: '#229971', secondary: '#CEDC00', text: '#fff' },
  alpine:       { primary: '#FF87BC', secondary: '#0093CC', text: '#000' },
  haas:         { primary: '#B6BABD', secondary: '#E8002D', text: '#000' },
  rb:           { primary: '#6692FF', secondary: '#1E1E3C', text: '#fff' },
  williams:     { primary: '#64C4FF', secondary: '#00275B', text: '#000' },
  kick_sauber:  { primary: '#52E252', secondary: '#000000', text: '#000' },
  // Historical
  sauber:       { primary: '#00CF4A', secondary: '#000000', text: '#000' },
  alfa:         { primary: '#900000', secondary: '#FFFFFF', text: '#fff' },
  alfa_romeo:   { primary: '#900000', secondary: '#FFFFFF', text: '#fff' },
  renault:      { primary: '#FFD800', secondary: '#000000', text: '#000' },
  toro_rosso:   { primary: '#00008B', secondary: '#FFFFFF', text: '#fff' },
  racing_point: { primary: '#F596C8', secondary: '#000000', text: '#000' },
  force_india:  { primary: '#F596C8', secondary: '#FF7800', text: '#000' },
  manor:        { primary: '#C00000', secondary: '#FFFFFF', text: '#fff' },
  marussia:     { primary: '#6E0000', secondary: '#FFFFFF', text: '#fff' },
  caterham:     { primary: '#00512F', secondary: '#FFED00', text: '#fff' },
  lotus_f1:     { primary: '#000000', secondary: '#FFD700', text: '#fff' },
  lotus:        { primary: '#004225', secondary: '#FFD700', text: '#fff' },
  hrt:          { primary: '#888888', secondary: '#000000', text: '#fff' },
  virgin:       { primary: '#CC0000', secondary: '#FFFFFF', text: '#fff' },
  bmw_sauber:   { primary: '#001C75', secondary: '#FFFFFF', text: '#fff' },
  toyota:       { primary: '#CC0000', secondary: '#FFFFFF', text: '#fff' },
  honda:        { primary: '#CC0000', secondary: '#FFFFFF', text: '#fff' },
  super_aguri:  { primary: '#CC0000', secondary: '#FFFFFF', text: '#fff' },
  spyker:       { primary: '#FF6B00', secondary: '#000000', text: '#fff' },
  jordan:       { primary: '#FFFF00', secondary: '#000000', text: '#000' },
  bar:          { primary: '#999999', secondary: '#CC0000', text: '#fff' },
  jaguar:       { primary: '#005000', secondary: '#FFFFFF', text: '#fff' },
  arrows:       { primary: '#FF6B00', secondary: '#000000', text: '#fff' },
  minardi:      { primary: '#000080', secondary: '#FFFFFF', text: '#fff' },
  benetton:     { primary: '#00A651', secondary: '#FFD700', text: '#fff' },
  tyrrell:      { primary: '#003399', secondary: '#FFFFFF', text: '#fff' },
  brabham:      { primary: '#006400', secondary: '#FFFFFF', text: '#fff' },
  default:      { primary: '#6b6b88', secondary: '#FFFFFF', text: '#fff' },
}

export function getTeamColor(constructorId: string): string {
  const key = normalise(constructorId)
  return TEAM_COLORS[key]?.primary ?? TEAM_COLORS.default.primary
}

export function getTeamColors(constructorId: string) {
  const key = normalise(constructorId)
  return TEAM_COLORS[key] ?? TEAM_COLORS.default
}

function normalise(id: string) {
  return id.toLowerCase().replace(/[\s-]/g, '_')
}

export const COUNTRY_FLAGS: Record<string, string> = {
  British: '🇬🇧', German: '🇩🇪', Spanish: '🇪🇸', Finnish: '🇫🇮', French: '🇫🇷',
  Dutch: '🇳🇱', Australian: '🇦🇺', Brazilian: '🇧🇷', Canadian: '🇨🇦', Mexican: '🇲🇽',
  Italian: '🇮🇹', Austrian: '🇦🇹', American: '🇺🇸', Japanese: '🇯🇵', Chinese: '🇨🇳',
  'New Zealander': '🇳🇿', Thai: '🇹🇭', Monégasque: '🇲🇨', Danish: '🇩🇰', Polish: '🇵🇱',
  Malaysian: '🇲🇾', Colombian: '🇨🇴', Venezuelan: '🇻🇪', Argentinian: '🇦🇷', South_African: '🇿🇦',
  Swedish: '🇸🇪', Swiss: '🇨🇭', Belgian: '🇧🇪', Russian: '🇷🇺', Portuguese: '🇵🇹',
  Hungarian: '🇭🇺', Singaporean: '🇸🇬', Indonesian: '🇮🇩',
}
