import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIronSession } from "iron-session"
import { sessionOptions, SessionData } from "@/lib/session"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Obtener sesión para saber el rol del usuario
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    const isAdmin = session.user?.role === "ADMIN" || session.user?.role === "SUPERADMIN"

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        ticketNumber: true,
        points: true,
        phone: isAdmin, // Solo incluir teléfono si es admin
        predictions: {
          select: {
            matchId: true,
            result: true,
            pointsEarned: true,
            scored: true,
          },
        },
      },
      orderBy: { points: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("[LEADERBOARD ERROR]", error)
    return NextResponse.json(
      { error: "Error al obtener la tabla" },
      { status: 500 }
    )
  }
}