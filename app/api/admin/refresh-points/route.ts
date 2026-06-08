import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getMatchWinner } from "@/lib/get-match-winner"
import { invalidateStaticCache } from "@/lib/matches-data"

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

    const res = await fetch("https://api.wc2026api.com/matches", {
      headers: {
        Authorization: process.env.API_WC_token ?? "",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Error API:", errorText)
      return NextResponse.json(
        { error: "Error al obtener partidos" },
        { status: 502 }
      )
    }

    const matches = await res.json()

    const finishedMatches = matches.filter(
      (m: {
        status: string
        home_score: number | null
        away_score: number | null
      }) =>
        m.status === "finished" &&
        m.home_score !== null &&
        m.away_score !== null
    )

    if (finishedMatches.length === 0) {
      return NextResponse.json({
        message: "No hay partidos finalizados",
        updated: 0,
      })
    }

    let totalUpdated = 0

    for (const match of finishedMatches) {
      const matchId = match.id
      const realWinner = getMatchWinner(match)

      if (!realWinner) continue

      const predictions = await prisma.prediction.findMany({
        where: {
          matchId,
          scored: false,
        },
      })

      for (const prediction of predictions) {
        const acertó = prediction.result === realWinner

        if (acertó) {
          await prisma.$transaction([
            prisma.prediction.update({
              where: { id: prediction.id },
              data: { scored: true, pointsEarned: 1 },
            }),
            prisma.user.update({
              where: { id: prediction.userId },
              data: { points: { increment: 1 } },
            }),
          ])
          totalUpdated++
        } else {
          await prisma.prediction.update({
            where: { id: prediction.id },
            data: { scored: true },
          })
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