import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const apiToken = process.env.API_WC_token

  if (!apiToken) {
    return NextResponse.json(
      { error: "API_WC_token no está configurada" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch("https://api.wc2026api.com/groups", {
      headers: {
        Authorization: apiToken,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error API WC2026: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error obteniendo grupos:", error)
    return NextResponse.json(
      { error: "Error interno obteniendo grupos" },
      { status: 500 }
    )
  }
}