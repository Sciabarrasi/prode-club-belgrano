"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth, Prediction } from "@/lib/auth-context"
import { groupStageMatches, groups, getMatchesByGroup } from "@/lib/matches-data"
import { MatchCard } from "@/components/match-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PredictionsViewProps {
  onComplete: () => void
}

export function PredictionsView({ onComplete }: PredictionsViewProps) {
  const { user, savePredictions } = useAuth()
  const [selectedGroup, setSelectedGroup] = useState("A")
  const [predictions, setPredictions] = useState<Prediction[]>([])

  const handlePrediction = (matchId: string, result: "home" | "draw" | "away") => {
    setPredictions(prev => {
      const existing = prev.find(p => p.matchId === matchId)
      if (existing) {
        return prev.map(p => p.matchId === matchId ? { ...p, result } : p)
      }
      return [...prev, { matchId, result }]
    })
  }

  const getPrediction = (matchId: string) => {
    return predictions.find(p => p.matchId === matchId)
  }

  const allPredictionsMade = predictions.length === groupStageMatches.length

  const handleSubmit = () => {
    if (allPredictionsMade) {
      savePredictions(predictions)
      onComplete()
    }
  }

  const matchesInGroup = getMatchesByGroup(selectedGroup)
  const predictionsInGroup = matchesInGroup.filter(m => getPrediction(m.id)).length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">Mundial 2026</h1>
              <p className="text-sm text-muted-foreground">
                Hola, {user?.username}
              </p>
            </div>
            <div className="text-right flex items-center gap-4">
              <Link href="/tabla">
                <Button
                  variant="outline"
                  className="border-border text-card-foreground hover:bg-secondary"
                >
                  Ver Tabla
                </Button>
              </Link>
              <div>
                <p className="text-sm text-muted-foreground">Predicciones</p>
                <p className="text-lg font-bold text-primary">
                  {predictions.length} / {groupStageMatches.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">
            Fase de Grupos
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {groups.map(group => (
              <Button
                key={group}
                variant={selectedGroup === group ? "default" : "outline"}
                onClick={() => setSelectedGroup(group)}
                className={cn(
                  "min-w-[80px]",
                  selectedGroup === group 
                    ? "bg-primary text-primary-foreground" 
                    : "border-border text-card-foreground hover:bg-secondary"
                )}
              >
                Grupo {group}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {predictionsInGroup} de {matchesInGroup.length} partidos predichos en este grupo
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matchesInGroup.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={getPrediction(match.id)}
              onPrediction={handlePrediction}
            />
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/95 backdrop-blur border-t border-border">
          <div className="container mx-auto">
            <Button
              onClick={handleSubmit}
              disabled={!allPredictionsMade}
              className="w-full bg-primary hover:bg-accent text-primary-foreground disabled:opacity-50"
            >
              {allPredictionsMade 
                ? "Confirmar Predicciones" 
                : `Faltan ${groupStageMatches.length - predictions.length} predicciones`
              }
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
