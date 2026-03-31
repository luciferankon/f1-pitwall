export interface ErgastDriver {
  driverId: string
  permanentNumber?: string
  code?: string
  url: string
  givenName: string
  familyName: string
  dateOfBirth: string
  nationality: string
}

export interface ErgastConstructor {
  constructorId: string
  url: string
  name: string
  nationality: string
}

export interface DriverStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Driver: ErgastDriver
  Constructors: ErgastConstructor[]
}

export interface ConstructorStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Constructor: ErgastConstructor
}

export interface Race {
  season: string
  round: string
  url: string
  raceName: string
  Circuit: {
    circuitId: string
    url: string
    circuitName: string
    Location: {
      lat: string
      long: string
      locality: string
      country: string
    }
  }
  date: string
  time?: string
}

export interface RaceResult {
  number: string
  position: string
  positionText: string
  points: string
  Driver: ErgastDriver
  Constructor: ErgastConstructor
  grid: string
  laps: string
  status: string
  Time?: { millis: string; time: string }
  FastestLap?: {
    rank: string
    lap: string
    Time: { time: string }
    AverageSpeed: { units: string; speed: string }
  }
}

export interface QualifyingResult {
  number: string
  position: string
  Driver: ErgastDriver
  Constructor: ErgastConstructor
  Q1?: string
  Q2?: string
  Q3?: string
}

export interface PitStop {
  driverId: string
  lap: string
  stop: string
  time: string
  duration: string
}

export interface SeasonResult {
  season: string
  round: string
  DriverStandings: DriverStanding[]
}
