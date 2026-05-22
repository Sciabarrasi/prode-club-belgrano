import { getFlagUrl, getTeamNameEs } from "@/lib/wc-api"

export interface MatchTeam {
  name: string
  nameEn: string
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

let cachedMatches: Match[] | null = null
let cachedGroups: Group[] | null = null
let lastFetchTime = 0
const CACHE_TTL = 24 * 60 * 60 * 1000

export async function fetchGroupStageMatches(): Promise<Match[]> {
  const now = Date.now()
  
  if (cachedMatches && (now - lastFetchTime) < CACHE_TTL) {
    return cachedMatches
  }

  try {
    const response = await fetch("/api/matches", { 
      cache: "force-cache",
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) throw new Error(`Error al obtener partidos: ${response.status}`)

    const data: ApiMatch[] = await response.json()

    cachedMatches = data.map((match) => ({
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
    
    lastFetchTime = now
    return cachedMatches
  } catch (error) {
    console.error(error)
    return cachedMatches || []
  }
}

export async function fetchGroups(): Promise<Group[]> {
  const now = Date.now()
  
  if (cachedGroups && (now - lastFetchTime) < CACHE_TTL) {
    return cachedGroups
  }

  try {
    const response = await fetch("/api/groups", { 
      cache: "force-cache",
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) throw new Error(`Error al obtener grupos: ${response.status}`)
    
    const data: ApiGroup[] = await response.json()
    cachedGroups = data
    lastFetchTime = now
    return cachedGroups
  } catch (error) {
    console.error(error)
    return cachedGroups || []
  }
}

export function getGroups(matches: Match[]): string[] {
  return [...new Set(matches.map((m) => m.group))]
}

export function getMatchesByGroup(matches: Match[], group: string): Match[] {
  return matches.filter((m) => m.group === group)
}

export const fetchMatches = fetchGroupStageMatches

export function invalidateStaticCache() {
  cachedMatches = null
  cachedGroups = null
  lastFetchTime = 0
}