import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

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

    // Buscar predicciones en partidos dobles que tienen 1 punto (deberían tener 2)
    const predictionsToFix = await prisma.prediction.findMany({
      where: {
        matchId: { in: DOUBLE_POINTS_MATCHES },
        pointsEarned: 1,
      }
    })

    let fixed = 0
    let errors = 0

    for (const pred of predictionsToFix) {
      try {
        await prisma.$transaction([
          prisma.prediction.update({
            where: { id: pred.id },
            data: { pointsEarned: 2 }
          }),
          prisma.user.update({
            where: { id: pred.userId },
            data: { points: { increment: 1 } }
          })
        ])
        fixed++
      } catch (error) {
        console.error(`Error corrigiendo predicción ${pred.id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      message: `Corrección completada`,
      fixed,
      errors,
      total: predictionsToFix.length
    })
  } catch (error) {
    console.error("[FIX DOUBLE POINTS ERROR]", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}