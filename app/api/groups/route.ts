import { NextResponse } from "next/server"
import matchesData from "@/lib/data/allMatches.json"
import { MatchData } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const uniqueGroups = [...new Set(matchesData.map((m: MatchData) => m.group))]
    const groups = uniqueGroups.map((name) => ({
      id: name,
      name: name,
    }))
    return NextResponse.json(groups)
  } catch (error) {
    console.error("ERROR EN /api/groups:", error)
    return NextResponse.json(
      {
        error: "Error interno obteniendo grupos",
      },
      { status: 500 }
    )
  }
}