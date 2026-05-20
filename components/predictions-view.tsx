"use client"

import {
  useEffect,
  useState,
} from "react"

import Link from "next/link"

import {
  Prediction,
  useAuth,
} from "@/lib/auth-context"

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

export function PredictionsView({
  onComplete,
}: PredictionsViewProps) {
  const {
    user,
    savePredictions,
  } = useAuth()

  const [groups, setGroups] =
    useState<Group[]>([])

  const [matches, setMatches] =
    useState<Match[]>([])

  const [selectedGroup, setSelectedGroup] =
    useState("")

  const [predictions, setPredictions] =
    useState<Prediction[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [
          groupsData,
          matchesData,
        ] = await Promise.all([
          fetchGroups(),
          fetchGroupStageMatches(),
        ])

        setGroups(groupsData)

        setMatches(matchesData)

        if (groupsData.length > 0) {
          setSelectedGroup(
            groupsData[0].name
          )
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handlePrediction = (
    matchId: string,
    result:
      | "home"
      | "draw"
      | "away"
  ) => {
    setPredictions((prev) => {
      const existing =
        prev.find(
          (p) =>
            p.matchId === matchId
        )

      if (existing) {
        return prev.map((p) =>
          p.matchId === matchId
            ? {
                ...p,
                result,
              }
            : p
        )
      }

      return [
        ...prev,
        {
          matchId,
          result,
        },
      ]
    })
  }

  const getPrediction = (
    matchId: string
  ) => {
    return predictions.find(
      (p) => p.matchId === matchId
    )
  }

  const currentMatches =
    getMatchesByGroup(
      matches,
      selectedGroup
    )

  const totalMatches =
    matches.length

  const allPredictionsMade =
    predictions.length ===
    totalMatches

  const handleSubmit = () => {
    savePredictions(
      predictions
    )

    onComplete()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando...
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
                Hola,{" "}
                {user?.username}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/tabla">
                <Button variant="outline">
                  Ver Tabla
                </Button>
              </Link>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Predicciones
                </p>

                <p className="text-lg font-bold text-primary">
                  {
                    predictions.length
                  }{" "}
                  / {totalMatches}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-28">
        <h2 className="text-lg font-semibold mb-4">
          Fase de Grupos
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-4">
          {groups.map((group) => (
            <Button
              key={group.id}
              variant={
                selectedGroup ===
                group.name
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                setSelectedGroup(
                  group.name
                )
              }
              className={cn(
                "min-w-[100px]"
              )}
            >
              {group.name}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {currentMatches.map(
            (match) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={getPrediction(
                  match.id.toString()
                )}
                onPrediction={
                  handlePrediction
                }
              />
            )
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
        <div className="container mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={
              !allPredictionsMade
            }
            className="w-full"
          >
            {allPredictionsMade
              ? "Confirmar Predicciones"
              : `Faltan ${
                  totalMatches -
                  predictions.length
                } predicciones`}
          </Button>
        </div>
      </div>
    </div>
  )
}