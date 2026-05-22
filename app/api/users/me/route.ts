import { NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { sessionOptions, SessionData } from "@/lib/session"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

    if (!session.user) {
      return NextResponse.json({ user: null })
    }

    const predictionsCount = await prisma.prediction.count({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      user: session.user,
      hasPredictions: predictionsCount > 0,
    })
  } catch (error) {
    console.error("[ME ERROR]", error)
    return NextResponse.json({ user: null })
  }
}