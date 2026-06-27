"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<string | null>(null)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [fixing, setFixing] = useState(false)
  const [fixResult, setFixResult] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/")
      return
    }
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      router.replace("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Cargando...</p>
      </div>
    )
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.replace("/")
  }

  const handleRefreshPoints = async () => {
    setRefreshing(true)
    setRefreshResult(null)
    setRefreshError(null)
    try {
      const res = await fetch("/api/admin/refresh-points", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setRefreshError(`Error: ${data.error}`)
      } else {
        setRefreshResult(`✓ ${data.message} (${data.updated} predicciones premiadas)`)
      }
    } catch {
      setRefreshError("No se pudo conectar con la API. Intentá de nuevo.")
    } finally {
      setRefreshing(false)
    }
  }

  const handleFixDoublePoints = async () => {
    setFixing(true)
    setFixResult(null)
    try {
      const res = await fetch("/api/admin/fix-double-points", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setFixResult(`❌ Error: ${data.error}`)
      } else {
        setFixResult(`✅ Corregidos: ${data.fixed} usuarios con puntos dobles (${data.errors} errores)`)
      }
    } catch {
      setFixResult("❌ No se pudo conectar con la API.")
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Dashboard Admin
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Panel de administración del Prode Mundial 2026
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 flex flex-col gap-6">
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

        <Card className="bg-card border-border transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-card-foreground">Resultados</CardTitle>
            <CardDescription>
              Consulta los resultados de la API y suma puntos a los usuarios que acertaron.
              {refreshResult && (
                <span className="block mt-1 text-primary">{refreshResult}</span>
              )}
              {refreshError && (
                <span className="block mt-1 text-destructive">{refreshError}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full border-border text-card-foreground hover:bg-secondary disabled:opacity-50"
              onClick={handleRefreshPoints}
              disabled={refreshing}
            >
              {refreshing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Actualizando…
                </span>
              ) : (
                "Refrescar resultados y calcular puntos"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-card-foreground">Corregir Puntos Dobles</CardTitle>
            <CardDescription>
              Busca y corrige automáticamente los puntos de los partidos que valen el doble.
              {fixResult && (
                <span className={`block mt-1 ${fixResult.startsWith('✅') ? 'text-primary' : 'text-destructive'}`}>
                  {fixResult}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full border-border text-card-foreground hover:bg-secondary disabled:opacity-50"
              onClick={handleFixDoublePoints}
              disabled={fixing}
            >
              {fixing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Corrigiendo...
                </span>
              ) : (
                "Corregir puntos de partidos dobles"
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}