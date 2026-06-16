"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  fetchGroupStageMatches,
  fetchGroups,
  getMatchesByGroup,
  Group,
  Match,
} from "@/lib/matches-data"
import { MatchCard } from "@/components/match-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PredictionsViewProps {
  onComplete?: () => void
}

export function PredictionsView({}: PredictionsViewProps) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedGroup, setSelectedGroup] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [groupsData, matchesData] = await Promise.all([
          fetchGroups(),
          fetchGroupStageMatches(),
        ])

        setGroups(groupsData)
        setMatches(matchesData)

        if (groupsData.length > 0) {
          setSelectedGroup(groupsData[0].name)
        }
      } catch (err) {
        console.error(err)
        setError("No se pudieron cargar los partidos.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const currentMatches = getMatchesByGroup(matches, selectedGroup)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">
            Cargando partidos del Mundial 2026…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">
                Mundial 2026
              </h1>
              <p className="text-sm text-muted-foreground">
                Hola, {user?.username}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/tabla">
                <Button variant="outline">
                  Ver Tabla
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-28">
        <h2 className="text-lg font-semibold mb-4">
          Fase de Grupos - Solo visualización
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-4">
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={selectedGroup === group.name ? "default" : "outline"}
              onClick={() => setSelectedGroup(group.name)}
              className={cn("min-w-25")}
            >
              {group.name}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {currentMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={undefined}
              onPrediction={() => {}}
              readOnly
            />
          ))}
        </div>

        {error && (
          <p className="text-destructive text-sm text-center mt-4">
            {error}
          </p>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <div className="container mx-auto">
          <Button
            disabled
            className="w-full opacity-60 cursor-not-allowed"
          >
            ⏳ Predicciones cerradas
          </Button>
        </div>
      </div>
    </div>
  )
}