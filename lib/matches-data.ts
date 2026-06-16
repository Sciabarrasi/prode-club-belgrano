import { getFlagUrl, getTeamNameEs } from "@/lib/wc-api"
import { MatchData } from "@/lib/types"

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

    const data: MatchData[] = await response.json()

    cachedMatches = data.map((match) => ({
      id: match.id,
      matchNumber: match.matchNumber,
      group: match.group,
      homeTeam: {
        name: getTeamNameEs(match.homeTeam),
        nameEn: match.homeTeam,
        code: match.homeTeamCode,
        flagUrl: getFlagUrl(match.homeTeam),
      },
      awayTeam: {
        name: getTeamNameEs(match.awayTeam),
        nameEn: match.awayTeam,
        code: match.awayTeamCode,
        flagUrl: getFlagUrl(match.awayTeam),
      },
      stadium: match.stadium,
      city: match.stadiumCity,
      country: match.stadiumCountry,
      kickoff: match.kickoffUtc,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
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
    
    const data: Group[] = await response.json()
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