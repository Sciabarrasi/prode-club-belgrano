import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

interface PredictionInput {
  matchId: number
  result: "home" | "away" | "draw"
}

const resultEncoding = {
  home: { predictedHome: 1, predictedAway: 0 },
  draw: { predictedHome: 0, predictedAway: 0 },
  away: { predictedHome: 0, predictedAway: 1 },
} as const

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const { predictions } = body as { predictions: PredictionInput[] }

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return NextResponse.json({ error: "Predicciones inválidas" }, { status: 400 })
    }

    const results = await prisma.$transaction(
      predictions.map((p) => {
        const encoded = resultEncoding[p.result]
        return prisma.prediction.upsert({
          where: {
            userId_matchId: {
              userId: session.user!.id,
              matchId: p.matchId,
            },
          },
          create: {
            userId: session.user!.id,
            matchId: p.matchId,
            ...encoded,
          },
          update: {
            ...encoded,
          },
        })
      })
    )

    return NextResponse.json({ ok: true, saved: results.length })
  } catch (error) {
    console.error("[PREDICTIONS POST ERROR]", error)
    return NextResponse.json(
      { error: "Error interno al guardar predicciones" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const predictions = await prisma.prediction.findMany({
      where: { userId: session.user.id },
      select: {
        matchId: true,
        predictedHome: true,
        predictedAway: true,
        pointsEarned: true,
      },
    })

    const decoded = predictions.map((p) => ({
      matchId: p.matchId,
      result:
        p.predictedHome === 1 ? "home" :
        p.predictedAway === 1 ? "away" :
        "draw",
      pointsEarned: p.pointsEarned,
    }))

    return NextResponse.json(decoded)
  } catch (error) {
    console.error("[PREDICTIONS GET ERROR]", error)
    return NextResponse.json(
      { error: "Error interno al obtener predicciones" },
      { status: 500 }
    )
  }
}