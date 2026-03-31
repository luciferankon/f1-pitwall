// 2024 F1 Season — Final Results

export const CONSTRUCTOR_COLORS: Record<string, string> = {
  'Red Bull':     '#3671C6',
  'McLaren':      '#FF8000',
  'Ferrari':      '#E8002D',
  'Mercedes':     '#27F4D2',
  'Aston Martin': '#229971',
  'Alpine':       '#FF87BC',
  'Haas':         '#B6BABD',
  'RB':           '#6692FF',
  'Williams':     '#64C4FF',
  'Kick Sauber':  '#52E252',
}

export const CONSTRUCTOR_TEXT: Record<string, string> = {
  'Red Bull':     '#fff',
  'McLaren':      '#000',
  'Ferrari':      '#fff',
  'Mercedes':     '#000',
  'Aston Martin': '#fff',
  'Alpine':       '#000',
  'Haas':         '#000',
  'RB':           '#fff',
  'Williams':     '#000',
  'Kick Sauber':  '#000',
}

export interface Driver {
  position: number
  code: string
  name: string
  team: string
  nationality: string
  points: number
  wins: number
  podiums: number
  poles: number
  fastestLaps: number
  flag: string
}

export interface Constructor {
  position: number
  name: string
  points: number
  wins: number
  podiums: number
  poles: number
}

export const DRIVERS_2024: Driver[] = [
  { position: 1,  code: 'VER', name: 'Max Verstappen',    team: 'Red Bull',     nationality: 'Dutch',         points: 437, wins: 9,  podiums: 16, poles: 12, fastestLaps: 5,  flag: '🇳🇱' },
  { position: 2,  code: 'NOR', name: 'Lando Norris',      team: 'McLaren',      nationality: 'British',       points: 374, wins: 4,  podiums: 15, poles: 5,  fastestLaps: 6,  flag: '🇬🇧' },
  { position: 3,  code: 'LEC', name: 'Charles Leclerc',   team: 'Ferrari',      nationality: 'Monégasque',    points: 356, wins: 3,  podiums: 10, poles: 7,  fastestLaps: 3,  flag: '🇲🇨' },
  { position: 4,  code: 'PIA', name: 'Oscar Piastri',     team: 'McLaren',      nationality: 'Australian',    points: 292, wins: 2,  podiums: 9,  poles: 0,  fastestLaps: 4,  flag: '🇦🇺' },
  { position: 5,  code: 'SAI', name: 'Carlos Sainz',      team: 'Ferrari',      nationality: 'Spanish',       points: 290, wins: 2,  podiums: 8,  poles: 4,  fastestLaps: 2,  flag: '🇪🇸' },
  { position: 6,  code: 'RUS', name: 'George Russell',    team: 'Mercedes',     nationality: 'British',       points: 245, wins: 1,  podiums: 7,  poles: 1,  fastestLaps: 3,  flag: '🇬🇧' },
  { position: 7,  code: 'HAM', name: 'Lewis Hamilton',    team: 'Mercedes',     nationality: 'British',       points: 223, wins: 1,  podiums: 6,  poles: 0,  fastestLaps: 2,  flag: '🇬🇧' },
  { position: 8,  code: 'ALO', name: 'Fernando Alonso',   team: 'Aston Martin', nationality: 'Spanish',       points: 162, wins: 0,  podiums: 2,  poles: 0,  fastestLaps: 1,  flag: '🇪🇸' },
  { position: 9,  code: 'HUL', name: 'Nico Hülkenberg',   team: 'Haas',         nationality: 'German',        points: 31,  wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇩🇪' },
  { position: 10, code: 'STR', name: 'Lance Stroll',      team: 'Aston Martin', nationality: 'Canadian',      points: 24,  wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇨🇦' },
  { position: 11, code: 'TSU', name: 'Yuki Tsunoda',      team: 'RB',           nationality: 'Japanese',      points: 22,  wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 1,  flag: '🇯🇵' },
  { position: 12, code: 'ALB', name: 'Alexander Albon',   team: 'Williams',     nationality: 'Thai',          points: 12,  wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇹🇭' },
  { position: 13, code: 'GAS', name: 'Pierre Gasly',      team: 'Alpine',       nationality: 'French',        points: 8,   wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇫🇷' },
  { position: 14, code: 'OCO', name: 'Esteban Ocon',      team: 'Alpine',       nationality: 'French',        points: 5,   wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇫🇷' },
  { position: 15, code: 'MAG', name: 'Kevin Magnussen',   team: 'Haas',         nationality: 'Danish',        points: 4,   wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇩🇰' },
  { position: 16, code: 'LAW', name: 'Liam Lawson',       team: 'RB',           nationality: 'New Zealander', points: 4,   wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇳🇿' },
  { position: 17, code: 'ANT', name: 'Jack Doohan',       team: 'Alpine',       nationality: 'Australian',    points: 0,   wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇦🇺' },
  { position: 18, code: 'BOT', name: 'Valtteri Bottas',   team: 'Kick Sauber',  nationality: 'Finnish',       points: 0,   wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇫🇮' },
  { position: 19, code: 'ZHO', name: 'Guanyu Zhou',       team: 'Kick Sauber',  nationality: 'Chinese',       points: 0,   wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇨🇳' },
  { position: 20, code: 'SAR', name: 'Logan Sargeant',    team: 'Williams',     nationality: 'American',      points: 0,   wins: 0,  podiums: 0,  poles: 0,  fastestLaps: 0,  flag: '🇺🇸' },
]

export const CONSTRUCTORS_2024: Constructor[] = [
  { position: 1,  name: 'McLaren',      points: 666, wins: 6,  podiums: 24, poles: 5  },
  { position: 2,  name: 'Ferrari',      points: 652, wins: 5,  podiums: 18, poles: 11 },
  { position: 3,  name: 'Red Bull',     points: 589, wins: 9,  podiums: 17, poles: 12 },
  { position: 4,  name: 'Mercedes',     points: 468, wins: 2,  podiums: 13, poles: 1  },
  { position: 5,  name: 'Aston Martin', points: 94,  wins: 0,  podiums: 2,  poles: 0  },
  { position: 6,  name: 'Alpine',       points: 65,  wins: 0,  podiums: 0,  poles: 0  },
  { position: 7,  name: 'Haas',         points: 58,  wins: 0,  podiums: 0,  poles: 0  },
  { position: 8,  name: 'RB',           points: 46,  wins: 0,  podiums: 0,  poles: 0  },
  { position: 9,  name: 'Williams',     points: 17,  wins: 0,  podiums: 0,  poles: 0  },
  { position: 10, name: 'Kick Sauber',  points: 4,   wins: 0,  podiums: 0,  poles: 0  },
]

export const POINTS_BATTLE = [
  { race: 'Bahrain',     McLaren: 20,  Ferrari: 30,  'Red Bull': 44,  Mercedes: 12  },
  { race: 'Saudi',       McLaren: 38,  Ferrari: 58,  'Red Bull': 88,  Mercedes: 24  },
  { race: 'Australia',   McLaren: 56,  Ferrari: 106, 'Red Bull': 101, Mercedes: 40  },
  { race: 'Japan',       McLaren: 90,  Ferrari: 136, 'Red Bull': 135, Mercedes: 52  },
  { race: 'China',       McLaren: 133, Ferrari: 162, 'Red Bull': 175, Mercedes: 72  },
  { race: 'Miami',       McLaren: 166, Ferrari: 190, 'Red Bull': 215, Mercedes: 98  },
  { race: 'Monaco',      McLaren: 196, Ferrari: 229, 'Red Bull': 249, Mercedes: 116 },
  { race: 'Canada',      McLaren: 226, Ferrari: 262, 'Red Bull': 283, Mercedes: 140 },
  { race: 'Spain',       McLaren: 256, Ferrari: 300, 'Red Bull': 313, Mercedes: 164 },
  { race: 'Austria',     McLaren: 309, Ferrari: 336, 'Red Bull': 339, Mercedes: 186 },
  { race: 'Britain',     McLaren: 349, Ferrari: 362, 'Red Bull': 367, Mercedes: 222 },
  { race: 'Hungary',     McLaren: 391, Ferrari: 388, 'Red Bull': 381, Mercedes: 250 },
  { race: 'Belgium',     McLaren: 429, Ferrari: 410, 'Red Bull': 407, Mercedes: 274 },
  { race: 'Netherlands', McLaren: 455, Ferrari: 434, 'Red Bull': 443, Mercedes: 298 },
  { race: 'Italy',       McLaren: 493, Ferrari: 468, 'Red Bull': 457, Mercedes: 322 },
  { race: 'Azerbaijan',  McLaren: 519, Ferrari: 502, 'Red Bull': 481, Mercedes: 340 },
  { race: 'Singapore',   McLaren: 545, Ferrari: 540, 'Red Bull': 497, Mercedes: 358 },
  { race: 'Austin',      McLaren: 583, Ferrari: 572, 'Red Bull': 527, Mercedes: 386 },
  { race: 'Mexico',      McLaren: 611, Ferrari: 600, 'Red Bull': 551, Mercedes: 410 },
  { race: 'Brazil',      McLaren: 639, Ferrari: 620, 'Red Bull': 563, Mercedes: 436 },
  { race: 'Las Vegas',   McLaren: 655, Ferrari: 636, 'Red Bull': 577, Mercedes: 456 },
  { race: 'Qatar',       McLaren: 660, Ferrari: 644, 'Red Bull': 583, Mercedes: 462 },
  { race: 'Abu Dhabi',   McLaren: 666, Ferrari: 652, 'Red Bull': 589, Mercedes: 468 },
]

export const CIRCUITS_2024 = [
  { round: 1,  name: 'Bahrain Grand Prix',         circuit: 'Bahrain International Circuit',        country: '🇧🇭', winner: 'Verstappen', date: '2 Mar'  },
  { round: 2,  name: 'Saudi Arabian Grand Prix',   circuit: 'Jeddah Corniche Circuit',              country: '🇸🇦', winner: 'Verstappen', date: '9 Mar'  },
  { round: 3,  name: 'Australian Grand Prix',      circuit: 'Albert Park Circuit',                  country: '🇦🇺', winner: 'Sainz',      date: '24 Mar' },
  { round: 4,  name: 'Japanese Grand Prix',        circuit: 'Suzuka International Racing Course',   country: '🇯🇵', winner: 'Verstappen', date: '7 Apr'  },
  { round: 5,  name: 'Chinese Grand Prix',         circuit: 'Shanghai International Circuit',       country: '🇨🇳', winner: 'Verstappen', date: '21 Apr' },
  { round: 6,  name: 'Miami Grand Prix',           circuit: 'Miami International Autodrome',        country: '🇺🇸', winner: 'Norris',     date: '5 May'  },
  { round: 7,  name: 'Emilia Romagna Grand Prix',  circuit: 'Autodromo Enzo e Dino Ferrari',        country: '🇮🇹', winner: 'Verstappen', date: '19 May' },
  { round: 8,  name: 'Monaco Grand Prix',          circuit: 'Circuit de Monaco',                    country: '🇲🇨', winner: 'Leclerc',    date: '26 May' },
  { round: 9,  name: 'Canadian Grand Prix',        circuit: 'Circuit Gilles Villeneuve',            country: '🇨🇦', winner: 'Verstappen', date: '9 Jun'  },
  { round: 10, name: 'Spanish Grand Prix',         circuit: 'Circuit de Barcelona-Catalunya',       country: '🇪🇸', winner: 'Verstappen', date: '23 Jun' },
  { round: 11, name: 'Austrian Grand Prix',        circuit: 'Red Bull Ring',                        country: '🇦🇹', winner: 'Russell',    date: '30 Jun' },
  { round: 12, name: 'British Grand Prix',         circuit: 'Silverstone Circuit',                  country: '🇬🇧', winner: 'Hamilton',   date: '7 Jul'  },
  { round: 13, name: 'Hungarian Grand Prix',       circuit: 'Hungaroring',                          country: '🇭🇺', winner: 'Piastri',    date: '21 Jul' },
  { round: 14, name: 'Belgian Grand Prix',         circuit: 'Circuit de Spa-Francorchamps',         country: '🇧🇪', winner: 'Leclerc',    date: '28 Jul' },
  { round: 15, name: 'Dutch Grand Prix',           circuit: 'Circuit Zandvoort',                    country: '🇳🇱', winner: 'Norris',     date: '25 Aug' },
  { round: 16, name: 'Italian Grand Prix',         circuit: 'Autodromo Nazionale Monza',            country: '🇮🇹', winner: 'Leclerc',    date: '1 Sep'  },
  { round: 17, name: 'Azerbaijan Grand Prix',      circuit: 'Baku City Circuit',                    country: '🇦🇿', winner: 'Piastri',    date: '15 Sep' },
  { round: 18, name: 'Singapore Grand Prix',       circuit: 'Marina Bay Street Circuit',            country: '🇸🇬', winner: 'Norris',     date: '22 Sep' },
  { round: 19, name: 'United States Grand Prix',   circuit: 'Circuit of the Americas',              country: '🇺🇸', winner: 'Sainz',      date: '20 Oct' },
  { round: 20, name: 'Mexico City Grand Prix',     circuit: 'Autodromo Hermanos Rodriguez',         country: '🇲🇽', winner: 'Verstappen', date: '27 Oct' },
  { round: 21, name: 'São Paulo Grand Prix',       circuit: 'Autodromo Jose Carlos Pace',           country: '🇧🇷', winner: 'Verstappen', date: '3 Nov'  },
  { round: 22, name: 'Las Vegas Grand Prix',       circuit: 'Las Vegas Street Circuit',             country: '🇺🇸', winner: 'Norris',     date: '23 Nov' },
  { round: 23, name: 'Qatar Grand Prix',           circuit: 'Lusail International Circuit',         country: '🇶🇦', winner: 'Verstappen', date: '1 Dec'  },
  { round: 24, name: 'Abu Dhabi Grand Prix',       circuit: 'Yas Marina Circuit',                   country: '🇦🇪', winner: 'Verstappen', date: '8 Dec'  },
]
