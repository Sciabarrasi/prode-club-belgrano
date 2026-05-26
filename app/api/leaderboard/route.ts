import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIronSession } from "iron-session"
import { sessionOptions, SessionData } from "@/lib/session"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    const isAdmin = session.user?.role === "ADMIN" || session.user?.role === "SUPERADMIN"

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        ticketNumber: true,
        points: true,
        phone: isAdmin,
        predictions: {
          select: {
            matchId: true,
            predictedHome: true,
            predictedAway: true,
            pointsEarned: true,
          },
        },
      },
      orderBy: { points: "desc" },
    })

    const decoded = users.map((u) => ({
      ...u,
      predictions: u.predictions.map((p) => ({
        matchId: p.matchId,
        result:
          p.predictedHome === 1 ? "home" :
          p.predictedAway === 1 ? "away" :
          "draw",
        pointsEarned: p.pointsEarned,
      })),
    }))

    return NextResponse.json(decoded)
  } catch (error) {
    console.error("[LEADERBOARD ERROR]", error)
    return NextResponse.json(
      { error: "Error al obtener la tabla" },
      { status: 500 }
    )
  }
}