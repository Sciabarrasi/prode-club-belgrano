import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { sessionOptions, SessionData } from "@/lib/session"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

interface PredictionInput {
  matchId: number
  result: "home" | "away" | "draw"
}

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

    if (!session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { predictions } = body as { predictions: PredictionInput[] }

    if (!Array.isArray(predictions) || predictions.length === 0) {
      return NextResponse.json(
        { error: "Predicciones inválidas" },
        { status: 400 }
      )
    }

    const results = await prisma.$transaction(
      predictions.map((p) =>
        prisma.prediction.upsert({
          where: {
            userId_matchId: {
              userId: session.user!.id,
              matchId: p.matchId,
            },
          },
          create: {
            userId: session.user!.id,
            matchId: p.matchId,
            result: p.result,
          },
          update: {
            result: p.result,
          },
        })
      )
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
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

    if (!session.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      )
    }

    const predictions = await prisma.prediction.findMany({
      where: { userId: session.user.id },
      select: {
        matchId: true,
        result: true,
        pointsEarned: true,
        scored: true,
      },
    })

    return NextResponse.json(predictions)
  } catch (error) {
    console.error("[PREDICTIONS GET ERROR]", error)
    return NextResponse.json(
      { error: "Error interno al obtener predicciones" },
      { status: 500 }
    )
  }
}