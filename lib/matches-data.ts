import { getFlagUrl, getTeamNameEs } from "@/lib/wc-api"

export interface MatchTeam {
  name: string      // nombre en español
  nameEn: string    // nombre original en inglés (para el mapeo de banderas)
  code: string
  flagUrl: string
}

export interface Match {
  id: number
  matchNumber: number
  group: string
  homeTeam: MatchTeam
  awayTeam: MatchTeam
  stadium: string
  city: string
  country: string
  kickoff: string
  status: string
  homeScore: number | null
  awayScore: number | null
}

export interface Group {
  id: string
  name: string
}

interface ApiMatch {
  id: number
  match_number: number
  group_name: string
  home_team: string
  home_team_code: string
  away_team: string
  away_team_code: string
  stadium: string
  stadium_city: string
  stadium_country: string
  kickoff_utc: string
  status: string
  home_score: number | null
  away_score: number | null
}

interface ApiGroup {
  id: string
  name: string
}

export async function fetchGroupStageMatches(): Promise<Match[]> {
  try {
    const response = await fetch("/api/matches", { cache: "no-store" })
    if (!response.ok) throw new Error(`Error al obtener partidos: ${response.status}`)

    const data: ApiMatch[] = await response.json()

    return data.map((match) => ({
      id: match.id,
      matchNumber: match.match_number,
      group: match.group_name,
      homeTeam: {
        name: getTeamNameEs(match.home_team),
        nameEn: match.home_team,
        code: match.home_team_code,
        flagUrl: getFlagUrl(match.home_team),
      },
      awayTeam: {
        name: getTeamNameEs(match.away_team),
        nameEn: match.away_team,
        code: match.away_team_code,
        flagUrl: getFlagUrl(match.away_team),
      },
      stadium: match.stadium,
      city: match.stadium_city,
      country: match.stadium_country,
      kickoff: match.kickoff_utc,
      status: match.status,
      homeScore: match.home_score,
      awayScore: match.away_score,
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function fetchGroups(): Promise<Group[]> {
  try {
    const response = await fetch("/api/groups", { cache: "no-store" })
    if (!response.ok) throw new Error(`Error al obtener grupos: ${response.status}`)
    const data: ApiGroup[] = await response.json()
    return data
  } catch (error) {
    console.error(error)
    return []
  }
}

export function getGroups(matches: Match[]): string[] {
  return [...new Set(matches.map((m) => m.group))]
}

export function getMatchesByGroup(matches: Match[], group: string): Match[] {
  return matches.filter((m) => m.group === group)
}

// Alias para compatibilidad con cargarParticipante/page.tsx
export const fetchMatches = fetchGroupStageMatches