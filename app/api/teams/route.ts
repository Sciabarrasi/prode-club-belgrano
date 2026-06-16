import { NextResponse } from "next/server"
import matchesData from "@/lib/data/allMatches.json"
import { MatchData } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const teamsMap = new Map<string, {
      id: string
      name: string
      code: string
      flagUrl: string
    }>()
    
    matchesData.forEach((match: MatchData) => {
      if (!teamsMap.has(match.homeTeamCode)) {
        teamsMap.set(match.homeTeamCode, {
          id: match.homeTeamCode,
          name: match.homeTeam,
          code: match.homeTeamCode,
          flagUrl: `https://flagcdn.com/${match.homeTeamCode.toLowerCase()}.svg`,
        })
      }
      if (!teamsMap.has(match.awayTeamCode)) {
        teamsMap.set(match.awayTeamCode, {
          id: match.awayTeamCode,
          name: match.awayTeam,
          code: match.awayTeamCode,
          flagUrl: `https://flagcdn.com/${match.awayTeamCode.toLowerCase()}.svg`,
        })
      }
    })

    const teams = Array.from(teamsMap.values())
    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error obteniendo equipos:", error)
    return NextResponse.json(
      { error: "Error interno obteniendo equipos" },
      { status: 500 }
    )
  }
}