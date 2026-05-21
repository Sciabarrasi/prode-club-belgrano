import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIronSession } from "iron-session"
import { sessionOptions, SessionData } from "@/lib/session"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Solo ADMIN o SUPERADMIN pueden ejecutar esto
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    const role = session.user?.role

    if (role !== "ADMIN" && role !== "SUPERADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // 1. Traer todos los partidos finalizados de la API externa
    const res = await fetch(`${process.env.API_WC}/matches`, {
      headers: {
        Authorization: `Bearer ${process.env.API_WC_TOKEN}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error al obtener partidos de la API externa" },
        { status: 502 }
      )
    }

    const matches = await res.json()

    // 2. Filtrar solo los partidos finalizados con resultado real
    const finishedMatches = matches.filter(
      (m: { status: string; home_score: number | null; away_score: number | null }) =>
        m.status === "finished" &&
        m.home_score !== null &&
        m.away_score !== null
    )

    if (finishedMatches.length === 0) {
      return NextResponse.json({ message: "No hay partidos finalizados aún", updated: 0 })
    }

    let totalUpdated = 0

    // 3. Para cada partido finalizado, calcular puntos
    for (const match of finishedMatches) {
      const { id: matchId, home_score, away_score } = match

      // Buscar predicciones de este partido que aún no fueron puntuadas
      const predictions = await prisma.prediction.findMany({
        where: {
          matchId,
          pointsEarned: 0, // solo las que no tienen puntos todavía
        },
      })

      for (const prediction of predictions) {
        const acertó =
          prediction.predictedHome === home_score &&
          prediction.predictedAway === away_score

        if (acertó) {
          // Sumar 1 punto a la predicción y al usuario en una transacción
          await prisma.$transaction([
            prisma.prediction.update({
              where: { id: prediction.id },
              data: { pointsEarned: 1 },
            }),
            prisma.user.update({
              where: { id: prediction.userId },
              data: { points: { increment: 1 } },
            }),
          ])

          totalUpdated++
        }
      }
    }

    return NextResponse.json({
      message: `Puntos actualizados correctamente`,
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