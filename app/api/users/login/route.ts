import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIronSession } from "iron-session"
import { sessionOptions, SessionData } from "@/lib/session"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      )
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

    session.user = {
      id: user.id,
      ticketNumber: user.ticketNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    }

    await session.save()

    return NextResponse.json({
      message: "Login exitoso",
      user: session.user,
    })
  } catch (error) {
    console.error("[LOGIN ERROR]", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}