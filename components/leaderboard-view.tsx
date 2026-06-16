"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLeaderboardData } from "@/hooks/useLeaderboardData"
import { getMatchesByGroup } from "@/lib/matches-data"
import { MatchCard } from "@/components/match-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface LeaderboardViewProps {
  currentUserId: string
  onLogout: () => void
}

export function LeaderboardView({ currentUserId, onLogout }: LeaderboardViewProps) {
  const { users, groups, matches, loading, error, refresh } = useLeaderboardData()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const isMobile = useIsMobile()

  useEffect(() => {
    refresh()
  }, [refresh])

  const selectedUser = users.find((u) => u.id === selectedUserId)

  const getPrediction = (matchId: number) => {
    if (!selectedUser) return undefined
    const pred = selectedUser.predictions.find(
      (p) => p.matchId === matchId
    )
    if (!pred) return undefined
    return {
      matchId: matchId.toString(),
      result: pred.result as "home" | "draw" | "away",
    }
  }

  const activeGroup = selectedGroup || (groups.length > 0 ? groups[0].name : "")
  const currentMatches = getMatchesByGroup(matches, activeGroup)

  const handleBackToList = () => {
    setSelectedUserId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={refresh} className="mt-4">Reintentar</Button>
        </div>
      </div>
    )
  }

  const showParticipants = !isMobile || !selectedUserId
  const showPredictions = !isMobile || selectedUserId

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-bold text-primary truncate">Prode Mundial 2026</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Tabla de Posiciones</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/predicciones">
                <Button variant="outline" size="sm">
                  <span className="hidden sm:inline">Mis Predicciones</span>
                  <span className="sm:hidden">Predic.</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {showParticipants && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="py-3 md:py-4">
                  <CardTitle className="text-base md:text-lg">Participantes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border max-h-[65vh] overflow-y-auto">
                    {users.map((u, index) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 md:p-4 transition-colors text-left",
                          selectedUserId === u.id
                            ? "bg-primary/10"
                            : "hover:bg-secondary/50 active:bg-secondary/70"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary font-bold text-xs md:text-sm shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={cn(
                              "font-medium text-sm md:text-base truncate",
                              u.id === currentUserId && "text-primary"
                            )}>
                              {u.firstName} {u.lastName}
                              {u.id === currentUserId && " (Vos)"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cartón #{u.ticketNumber} · {u.predictions.length} pred.
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-base md:text-lg font-bold text-primary">{u.points}</p>
                          <p className="text-xs text-muted-foreground">pts</p>
                        </div>
                      </button>
                    ))}

                    {users.length === 0 && (
                      <p className="text-center text-muted-foreground py-8 text-sm">
                        No hay participantes aún
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {showPredictions && (
            <div className="lg:col-span-2">
              {selectedUserId && selectedUser ? (
                <Card className="overflow-hidden">
                  <CardHeader className="py-3 md:py-4 px-4 md:px-6">
                    <div className="flex items-center gap-2">
                      {isMobile && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleBackToList}
                          className="-ml-2 shrink-0"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                      )}
                      <CardTitle className="text-base md:text-lg truncate flex-1">
                        Predicciones de {selectedUser.firstName}
                      </CardTitle>
                      {!isMobile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUserId(null)}
                          className="shrink-0"
                        >
                          Cerrar
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 md:px-6">
                    {groups.length > 0 && (
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 pb-4">
                        {groups.map((group) => (
                          <Button
                            key={group.id}
                            variant={activeGroup === group.name ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedGroup(group.name)}
                            className="w-full px-0"
                          >
                            {group.name}
                          </Button>
                        ))}
                      </div>
                    )}

                    {selectedUser.predictions.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        Este participante aún no cargó sus predicciones
                      </div>
                    ) : currentMatches.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No hay partidos en el grupo {activeGroup}
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {currentMatches.map((match) => (
                          <MatchCard
                            key={match.id}
                            match={match}
                            prediction={getPrediction(match.id)}
                            onPrediction={() => {}}
                            readOnly
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <CardContent className="text-center">
                    <div className="text-6xl mb-4">⚽</div>
                    <h3 className="text-xl font-semibold mb-2">
                      Seleccioná un participante
                    </h3>
                    <p className="text-muted-foreground">
                      Hacé clic en un usuario para ver sus predicciones
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}