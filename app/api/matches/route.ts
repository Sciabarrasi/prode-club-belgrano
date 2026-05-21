import { NextResponse } from "next/server"

// Fuerza que este route nunca se cachee a nivel de Next.js
export const dynamic = "force-dynamic"

export async function GET() {
  const apiKey = process.env.API_WC

  if (!apiKey) {
    return NextResponse.json(
      { error: "API_WC no está configurada" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch("https://api.wc2026api.com/matches?round=group", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error API matches:", errorText)
      return NextResponse.json(
        { error: `Error API WC2026: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error obteniendo partidos:", error)
    return NextResponse.json(
      { error: "Error interno obteniendo partidos" },
      { status: 500 }
    )
  }
}