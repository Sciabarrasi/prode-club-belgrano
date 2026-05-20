import { getFlag } from "@/lib/wc-api"

export interface MatchTeam {
  name: string
  code: string
  flag: string
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

function mapApiMatch(
  match: ApiMatch
): Match {
  return {
    id: match.id,

    matchNumber: match.match_number,

    group: match.group_name,

    homeTeam: {
      name: match.home_team,
      code: match.home_team_code,
      flag: getFlag(match.home_team),
    },

    awayTeam: {
      name: match.away_team,
      code: match.away_team_code,
      flag: getFlag(match.away_team),
    },

    stadium: match.stadium,

    city: match.stadium_city,

    country: match.stadium_country,

    kickoff: match.kickoff_utc,

    status: match.status,

    homeScore: match.home_score,

    awayScore: match.away_score,
  }
}

export async function fetchMatches(): Promise<
  Match[]
> {
  if (cachedMatches) {
    return cachedMatches
  }

  try {
    const response = await fetch(
      "/api/matches"
    )

    if (!response.ok) {
      throw new Error(
        `Error al obtener partidos`
      )
    }

    const data =
      await response.json()

    const matches = data.map(
      mapApiMatch
    )

    cachedMatches = matches

    return matches
  } catch (error) {
    console.error(error)

    return []
  }
}

export async function fetchGroupStageMatches(): Promise<
  Match[]
> {
  return fetchMatches()
}

export async function fetchGroups(): Promise<
  Group[]
> {
  if (cachedGroups) {
    return cachedGroups
  }

  try {
    const response = await fetch(
      "/api/groups"
    )

    if (!response.ok) {
      throw new Error(
        "Error al obtener grupos"
      )
    }

    const data: ApiGroup[] =
      await response.json()

    cachedGroups = data

    return data
  } catch (error) {
    console.error(error)

    return []
  }
}

export function getGroups(
  matches: Match[]
): string[] {
  return [
    ...new Set(
      matches.map(
        (match) => match.group
      )
    ),
  ]
}

export function getMatchesByGroup(
  matches: Match[],
  group: string
): Match[] {
  return matches.filter(
    (match) =>
      match.group === group
  )
}