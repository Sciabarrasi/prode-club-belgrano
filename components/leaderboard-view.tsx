"use client"

import {
  useEffect,
  useState,
} from "react"

import Link from "next/link"

import { useAuth } from "@/lib/auth-context"

import {
  fetchGroups,
  fetchGroupStageMatches,
  getMatchesByGroup,
  Group,
  Match,
} from "@/lib/matches-data"

import { MatchCard } from "@/components/match-card"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { cn } from "@/lib/utils"

interface LeaderboardViewProps {
  onLogout: () => void
}

export function LeaderboardView({
  onLogout,
}: LeaderboardViewProps) {
  const {
    user,
    users,
    predictions,
    logout,
  } = useAuth()

  const [groups, setGroups] =
    useState<Group[]>([])

  const [matches, setMatches] =
    useState<Match[]>([])

  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null)

  const [selectedGroup, setSelectedGroup] =
    useState("")

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

  const handleLogout = () => {
    logout()

    onLogout()
  }

  const selectedUserPredictions =
    selectedUserId
      ? predictions[
          selectedUserId
        ] || []
      : []

  const getPrediction = (
    matchId: string
  ) => {
    return selectedUserPredictions.find(
      (p) =>
        p.matchId === matchId
    )
  }

  const currentMatches =
    getMatchesByGroup(
      matches,
      selectedGroup
    )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">
                Prode Mundial 2026
              </h1>

              <p className="text-sm text-muted-foreground">
                Bienvenido,{" "}
                {user?.username}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/predicciones">
                <Button variant="outline">
                  Mis Predicciones
                </Button>
              </Link>

              <Button
                variant="outline"
                onClick={
                  handleLogout
                }
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  Participantes
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {users.map(
                    (u, index) => (
                      <button
                        key={u.id}
                        onClick={() =>
                          setSelectedUserId(
                            u.id
                          )
                        }
                        className={cn(
                          "w-full flex items-center justify-between p-4 transition-colors text-left",
                          selectedUserId ===
                            u.id
                            ? "bg-primary/10"
                            : "hover:bg-secondary/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary font-bold text-sm">
                            {index + 1}
                          </span>

                          <div>
                            <p
                              className={cn(
                                "font-medium",
                                u.id ===
                                  user?.id
                                  ? "text-primary"
                                  : ""
                              )}
                            >
                              {
                                u.username
                              }

                              {u.id ===
                                user?.id &&
                                " (Tu)"}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {predictions[
                                u.id
                              ]
                                ?.length ||
                                0}{" "}
                              predicciones
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            0
                          </p>

                          <p className="text-xs text-muted-foreground">
                            puntos
                          </p>
                        </div>
                      </button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedUserId ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Predicciones
                    de{" "}
                    {
                      users.find(
                        (
                          u
                        ) =>
                          u.id ===
                          selectedUserId
                      )?.username
                    }
                  </h2>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelectedUserId(
                        null
                      )
                    }
                  >
                    Cerrar
                  </Button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                  {groups.map(
                    (group) => (
                      <Button
                        key={group.id}
                        variant={
                          selectedGroup ===
                          group.name
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          setSelectedGroup(
                            group.name
                          )
                        }
                      >
                        {group.name}
                      </Button>
                    )
                  )}
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
                        onPrediction={() => {}}
                        readOnly
                      />
                    )
                  )}
                </div>
              </div>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center">
                  <div className="text-6xl mb-4">
                    ⚽
                  </div>

                  <h3 className="text-xl font-semibold mb-2">
                    Selecciona un
                    participante
                  </h3>

                  <p className="text-muted-foreground">
                    Haz clic en un
                    usuario para ver
                    sus predicciones
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}