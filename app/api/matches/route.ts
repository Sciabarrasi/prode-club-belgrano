import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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
  try {
    const now = Date.now()

    if (cachedMatches && now - lastFetchTime < CACHE_TTL) {
      console.log("USANDO CACHE MATCHES")

      return NextResponse.json(cachedMatches)
    }

    const apiToken = process.env.API_WC_TOKEN

    console.log("TOKEN EXISTS:", !!apiToken)

    if (!apiToken) {
      return NextResponse.json(
        { error: "API_WC_TOKEN no está configurada" },
        { status: 500 }
      )
    }

    const response = await fetch(
      "https://api.wc2026api.com/matches?round=group",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    )

    console.log("MATCHES STATUS:", response.status)

    const responseText = await response.text()

    console.log("MATCHES RESPONSE:", responseText)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Error API WC2026: ${response.status}`,
          details: responseText,
        },
        { status: response.status }
      )
    }

    const data: ApiMatch[] = JSON.parse(responseText)

    cachedMatches = data
    lastFetchTime = now

    return NextResponse.json(data)
  } catch (error) {
    console.error("ERROR EN /api/matches:", error)

    return NextResponse.json(
      {
        error: "Error interno obteniendo partidos",
      },
      { status: 500 }
    )
  }
}