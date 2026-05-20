"use client"

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
              <Link href="/tabla">
                <Button className="w-full">
                  Ver tabla de posiciones
                </Button>
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
              <Button className="w-full">
                Cargar participante
              </Button>
                </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}