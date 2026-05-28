import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const apiToken = process.env.API_WC_TOKEN

    console.log("TOKEN EXISTS:", !!apiToken)

    if (!apiToken) {
      return NextResponse.json(
        { error: "API_WC_TOKEN no está configurada" },
        { status: 500 }
      )
    }

    const response = await fetch("https://api.wc2026api.com/groups", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    console.log("GROUPS STATUS:", response.status)

    const responseText = await response.text()

    console.log("GROUPS RESPONSE:", responseText)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Error API WC2026: ${response.status}`,
          details: responseText,
        },
        { status: response.status }
      )
    }

    const data = JSON.parse(responseText)

    return NextResponse.json(data)
  } catch (error) {
    console.error("ERROR EN /api/groups:", error)

    return NextResponse.json(
      {
        error: "Error interno obteniendo grupos",
      },
      { status: 500 }
    )
  }
}