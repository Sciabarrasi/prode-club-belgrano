// lib/types.ts
export interface PredictionResponse {
  matchId: number
  result: "home" | "draw" | "away"
  pointsEarned: number
  scored: boolean
}