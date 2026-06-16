export type MatchWinner = "home" | "away" | "draw"

interface MatchData {
  winner?: string | null
  home_score: number | null
  away_score: number | null
  home_pen?: number | null
  away_pen?: number | null
}

export function getMatchWinner(match: MatchData): MatchWinner | null {
  // 1. Si la API ya trae un winner explícito, usarlo
  if (match.winner) {
    const winner = match.winner.toLowerCase()
    if (winner === "home" || winner === "away" || winner === "draw") {
      return winner
    }
  }

  // 2. Si no hay scores, no se puede determinar
  if (match.home_score === null || match.away_score === null) {
    return null
  }

  // 3. Determinar por goles
  if (match.home_score > match.away_score) {
    return "home"
  }

  if (match.away_score > match.home_score) {
    return "away"
  }

  // 4. Empate
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