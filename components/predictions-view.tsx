"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth, Prediction } from "@/lib/auth-context"
import { useLeaderboardData } from "@/hooks/useLeaderboardData"
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
  onComplete: () => void
}

export function PredictionsView({ onComplete }: PredictionsViewProps) {
  const { user, predictions: savedPredictions, savePredictions, refreshPredictions } = useAuth()
  console.log("savedPredictions al montar:", savedPredictions)
  const { refresh: refreshLeaderboard } = useLeaderboardData()
  

  const [groups, setGroups] = useState<Group[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedGroup, setSelectedGroup] = useState("")
  // Inicializa con las predicciones guardadas del usuario actual
  const [localPredictions, setLocalPredictions] = useState<Prediction[]>(savedPredictions)
  console.log("localPredictions inicial:", localPredictions)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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


  const handlePrediction = (matchId: string, result: "home" | "draw" | "away") => {
    setLocalPredictions((prev) => {
      const existing = prev.find((p) => p.matchId === matchId)
      if (existing) {
        return prev.map((p) => p.matchId === matchId ? { ...p, result } : p)
      }
      return [...prev, { matchId, result }]
    })
  }

  const getPrediction = (matchId: string) => {
    return localPredictions.find((p) => p.matchId === matchId)
  }

  const currentMatches = getMatchesByGroup(matches, selectedGroup)
  const totalMatches = matches.length
  const allPredictionsMade = localPredictions.length === totalMatches && totalMatches > 0
  const isUpdating = savedPredictions.length > 0

  const handleSubmit = async () => {
    if (!allPredictionsMade || !user) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          predictions: localPredictions.map((p) => ({
            matchId: Number(p.matchId),
            result: p.result,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Error al guardar")
      }

      savePredictions(localPredictions)
      await refreshPredictions()
      await refreshLeaderboard()
      onComplete()
    } catch (err) {
      console.error(err)
      setError("No se pudieron guardar las predicciones. Intentá de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Cargando partidos del Mundial 2026…</p>
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
              <h1 className="text-xl font-bold text-primary">Mundial 2026</h1>
              <p className="text-sm text-muted-foreground">Hola, {user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/tabla">
                <Button variant="outline">Ver Tabla</Button>
              </Link>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Predicciones</p>
                <p className="text-lg font-bold text-primary">
                  {localPredictions.length} / {totalMatches}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-28">
        <h2 className="text-lg font-semibold mb-4">Fase de Grupos</h2>

        <div className="flex gap-2 overflow-x-auto pb-4">
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={selectedGroup === group.name ? "default" : "outline"}
              onClick={() => setSelectedGroup(group.name)}
              className={cn("min-w-[100px]")}
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
              prediction={getPrediction(match.id.toString())}
              onPrediction={handlePrediction}
            />
          ))}
        </div>

        {error && (
          <p className="text-destructive text-sm text-center mt-4">{error}</p>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <div className="container mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={!allPredictionsMade || saving}
            className="w-full"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Guardando…
              </span>
            ) : allPredictionsMade ? (
              isUpdating ? "Actualizar Predicciones" : "Confirmar Predicciones"
            ) : (
              `Faltan ${totalMatches - localPredictions.length} predicciones`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}