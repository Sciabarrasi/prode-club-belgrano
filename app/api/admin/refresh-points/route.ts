import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { invalidateStaticCache } from "@/lib/matches-data"
import { getMatchWinner, getUserPrediction } from "@/lib/get-match-winner"
import matchesData from "@/lib/data/allMatches.json"
import { MatchData } from "@/lib/types"

const DOUBLE_POINTS_MATCHES = [13, 21, 32, 39, 46, 54, 66]

export async function POST() {
  try {
    const session = await auth()
    const role = session?.user?.role

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    invalidateStaticCache()

    const finishedMatches = matchesData.filter(
      (match: MatchData) =>
        match.status === "finished" &&
        match.homeScore !== null &&
        match.awayScore !== null
    )

    if (finishedMatches.length === 0) {
      return NextResponse.json({
        message: "No hay partidos finalizados para procesar",
        updated: 0,
      })
    }

    let totalNew = 0
    let totalCorrected = 0

    for (const match of finishedMatches) {
      const matchId = match.id
      const realWinner = getMatchWinner({
        home_score: match.homeScore,
        away_score: match.awayScore,
      })

      if (!realWinner) continue

      const isDoublePoints = DOUBLE_POINTS_MATCHES.includes(matchId)
      const correctPoints = isDoublePoints ? 2 : 1

      const predictions = await prisma.prediction.findMany({
        where: { matchId },
      })

      for (const prediction of predictions) {
        const userPrediction = getUserPrediction(
          prediction.predictedHome,
          prediction.predictedAway
        )

        const acertó = userPrediction === realWinner

        if (acertó) {
          if (prediction.pointsEarned === 0 && !prediction.scored) {
            // Nunca fue procesada — sumar puntos correctos
            await prisma.$transaction([
              prisma.prediction.update({
                where: { id: prediction.id },
                data: { pointsEarned: correctPoints, scored: true },
              }),
              prisma.user.update({
                where: { id: prediction.userId },
                data: { points: { increment: correctPoints } },
              }),
            ])
            totalNew++
          } else if (prediction.pointsEarned > 0 && prediction.pointsEarned < correctPoints) {
            // Fue procesada pero con menos puntos de los que corresponde (ej: sumó 1 en vez de 2)
            const diff = correctPoints - prediction.pointsEarned
            await prisma.$transaction([
              prisma.prediction.update({
                where: { id: prediction.id },
                data: { pointsEarned: correctPoints, scored: true },
              }),
              prisma.user.update({
                where: { id: prediction.userId },
                data: { points: { increment: diff } },
              }),
            ])
            totalCorrected++
          }
          // Si pointsEarned === correctPoints → ya está bien, no tocar
        } else {
          // No acertó — marcar como procesada si no lo estaba
          if (!prediction.scored) {
            await prisma.prediction.update({
              where: { id: prediction.id },
              data: { scored: true },
            })
          }
        }
      }
    }

    return NextResponse.json({
      message: "Puntos verificados y corregidos correctamente",
      nuevos: totalNew,
      corregidos: totalCorrected,
    })
  } catch (error) {
    console.error("[REFRESH POINTS ERROR]", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}