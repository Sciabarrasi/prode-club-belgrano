import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.API_WC

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "API_WC no está configurada",
      },
      {
        status: 500,
      }
    )
  }

  try {
    const response = await fetch(
      "https://api.wc2026api.com/groups",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type":
            "application/json",
        },

        next: {
          revalidate: 3600,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Error API WC2026: ${response.status}`,
        },
        {
          status: response.status,
        }
      )
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error(
      "Error obteniendo grupos:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Error interno obteniendo grupos",
      },
      {
        status: 500,
      }
    )
  }
}