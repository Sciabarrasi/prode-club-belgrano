import { NextResponse } from "next/server"

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

let cachedMatches: ApiMatch[] | null = null
let lastFetchTime = 0
const CACHE_TTL = 24 * 60 * 60 * 1000

export async function GET() {
  const now = Date.now()
  
  if (cachedMatches && (now - lastFetchTime) < CACHE_TTL) {
    return NextResponse.json(cachedMatches)
  }

  const apiToken = process.env.API_WC_token

  if (!apiToken) {
    return NextResponse.json(
      { error: "API_WC_token no está configurada" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch("https://api.wc2026api.com/matches?round=group", {
      headers: {
        Authorization: apiToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error API matches:", errorText)
      return NextResponse.json(
        { error: `Error API WC2026: ${response.status}` },
        { status: response.status }
      )
    }

    const data: ApiMatch[] = await response.json()
    
    cachedMatches = data
    lastFetchTime = now
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error obteniendo partidos:", error)
    return NextResponse.json(
      { error: "Error interno obteniendo partidos" },
      { status: 500 }
    )
  }
}