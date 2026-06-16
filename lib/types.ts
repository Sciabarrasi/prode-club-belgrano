// lib/types.ts
export interface PredictionResponse {
  matchId: number
  result: "home" | "draw" | "away"
  pointsEarned: number
  scored: boolean
}

export interface MatchData {
  id: number
  matchNumber: number
  round: string
  group: string
  homeTeam: string
  homeTeamCode: string
  awayTeam: string
  awayTeamCode: string
  stadium: string
  stadiumCity: string
  stadiumCountry: string
  kickoffUtc: string
  status: string
  homeScore: number | null
  awayScore: number | null
}