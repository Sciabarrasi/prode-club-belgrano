export type MatchWinner =
  | "home"
  | "away"
  | "draw"

interface MatchData {
  winner?: string | null

  home_score: number | null
  away_score: number | null

  home_pen?: number | null
  away_pen?: number | null
}

export function getMatchWinner(
  match: MatchData
): MatchWinner | null {
  if (match.winner) {
    const winner =
      match.winner.toLowerCase()

    if (
      winner === "home" ||
      winner === "away" ||
      winner === "draw"
    ) {
      return winner
    }
  }

  if (
    match.home_score === null ||
    match.away_score === null
  ) {
    return null
  }

  if (
    match.home_score >
    match.away_score
  ) {
    return "home"
  }

  if (
    match.away_score >
    match.home_score
  ) {
    return "away"
  }

  return "draw"
}

export function getUserPrediction(
  predictedHome: number,
  predictedAway: number
): MatchWinner {
  if (predictedHome > predictedAway) return "home"
  if (predictedAway > predictedHome) return "away"
  return "draw"
}