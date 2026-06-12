import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { invalidateStaticCache } from "@/lib/matches-data"
import { getMatchWinner, getUserPrediction } from "@/lib/get-match-winner"

const DOUBLE_POINTS_MATCHES = [13, 21, 32, 39, 46, 54, 66]

export async function POST() {
  try {
    const session = await auth()
    const role = session?.user?.role

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    invalidateStaticCache()

    const res = await fetch(
      "https://api.wc2026api.com/matches?status=completed",
      {
        headers: {
          Authorization: `Bearer ${process.env.API_WC_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    )

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Error API:", errorText)
      return NextResponse.json(
        { error: "Error al obtener partidos" },
        { status: 502 }
      )
    }

    const matches = await res.json()

    let totalUpdated = 0

    for (const match of matches) {
      const matchId = match.id
      const homeScore = match.home_score
      const awayScore = match.away_score

      if (homeScore === null || awayScore === null) {
        continue
      }

      const realWinner = getMatchWinner({
        home_score: homeScore,
        away_score: awayScore,
      })

      if (!realWinner) continue

      const isDoublePoints = DOUBLE_POINTS_MATCHES.includes(matchId)
      const pointsValue = isDoublePoints ? 2 : 1

      const predictions = await prisma.prediction.findMany({
        where: { matchId },
      })

      for (const prediction of predictions) {
        if (prediction.pointsEarned > 0) {
          continue
        }

        const userPrediction = getUserPrediction(
          prediction.predictedHome,
          prediction.predictedAway
        )

        if (userPrediction === realWinner) {
          await prisma.$transaction([
            prisma.prediction.update({
              where: { id: prediction.id },
              data: { pointsEarned: pointsValue },
            }),
            prisma.user.update({
              where: { id: prediction.userId },
              data: { points: { increment: pointsValue } },
            }),
          ])
          totalUpdated++
        }
      }
    }

    return NextResponse.json({
      message: "Puntos actualizados correctamente",
      updated: totalUpdated,
    })
  } catch (error) {
    console.error("[REFRESH POINTS ERROR]", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}