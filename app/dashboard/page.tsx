"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"
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
  const { user, loading } = useSession()
  const router = useRouter()

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
    await fetch("/api/users/logout", { method: "POST" })
    router.replace("/")
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
      </main>
    </div>
  )
}