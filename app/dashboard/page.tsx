"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [refreshError, setRefreshError] = useState<string | null>(null)

const handleRefresh = async () => {
  setRefreshing(true)
  setRefreshError(null)

  try {
    const [groupsRes, matchesRes, teamsRes] = await Promise.all([
      fetch("/api/groups", { cache: "no-store" }),
      fetch("/api/matches", { cache: "no-store" }),
      fetch("/api/teams", { cache: "no-store" }),
    ])

    if (!groupsRes.ok || !matchesRes.ok || !teamsRes.ok) {
      throw new Error("Error al obtener datos de la API")
    }

    router.refresh()

    setLastRefresh(
      new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    )
  } catch {
    setRefreshError("No se pudo conectar con la API. Intentá de nuevo.")
  } finally {
    setRefreshing(false)
  }
}

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-5">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Dashboard Admin
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Panel de administración del Prode Mundial 2026
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-border transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Tabla de Posiciones
              </CardTitle>
              <CardDescription>
                Visualizar la tabla general de participantes y puntos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tablaPosiciones">
                <Button className="w-full">Ver tabla de posiciones</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-card border-border transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Participantes
              </CardTitle>
              <CardDescription>
                Agregar nuevos participantes al prode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/cargarParticipante">
                <Button className="w-full">Cargar participante</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Botón Refrescar Resultados */}
        <div className="mt-6">
          <Card className="bg-card border-border transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-card-foreground">Resultados</CardTitle>
              <CardDescription>
                Trae los datos más recientes de partidos y grupos desde la API del Mundial.
                {lastRefresh && (
                  <span className="block mt-1 text-primary">
                    Último refresco: {lastRefresh}
                  </span>
                )}
                {refreshError && (
                  <span className="block mt-1 text-destructive">
                    {refreshError}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-border text-card-foreground hover:bg-secondary disabled:opacity-50"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Refrescando…
                  </span>
                ) : (
                  "Refrescar Resultados"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}