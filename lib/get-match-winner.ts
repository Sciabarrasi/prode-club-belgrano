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
  // Si la API ya trae winner
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

  // Validar scores
  if (
    match.home_score === null ||
    match.away_score === null
  ) {
    return null
  }

  // Gana local
  if (
    match.home_score >
    match.away_score
  ) {
    return "home"
  }

  // Gana visitante
  if (
    match.away_score >
    match.home_score
  ) {
    return "away"
  }

  // Empate
  return "draw"
}