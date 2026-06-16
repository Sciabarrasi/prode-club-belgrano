import { NextResponse } from "next/server"
import matchesData from "@/lib/data/allMatches.json"
import { MatchData } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json(matchesData)
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