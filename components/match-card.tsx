"use client"

import { Match } from "@/lib/matches-data"
import { Prediction } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// IDs de partidos que dan el doble de puntos
const DOUBLE_POINTS_MATCH_IDS = new Set([13, 21, 32, 39, 46, 54, 66])

interface MatchCardProps {
  match: Match
  prediction?: Prediction
  onPrediction: (
    matchId: string,
    result: "home" | "draw" | "away"
  ) => void
  readOnly?: boolean
}

function TeamFlag({ flagUrl, name }: { flagUrl: string; name: string }) {
  if (!flagUrl) {
    return (
      <span className="w-10 h-7 bg-secondary rounded flex items-center justify-center text-xs text-muted-foreground">
        ?
      </span>
    )
  }
  return (
    <img
      src={flagUrl}
      alt={name}
      className="w-10 h-7 object-cover rounded shadow-sm"
    />
  )
}

export function MatchCard({
  match,
  prediction,
  onPrediction,
  readOnly = false,
}: MatchCardProps) {
  const formattedDate = new Date(match.kickoff).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  const isDoublePoints = DOUBLE_POINTS_MATCH_IDS.has(match.id)

  return (
    <Card className={cn(
      "border-border bg-card overflow-hidden",
      isDoublePoints && "border-yellow-500/50"
    )}>
      <CardContent className="p-4">
        {/* Badge doble puntos */}
        {isDoublePoints && (
          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 text-xs font-semibold">
              ⭐ Este partido vale el doble de puntos
            </span>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center mb-3">
          {formattedDate}
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Local */}
          <button
            disabled={readOnly}
            onClick={() => onPrediction(match.id.toString(), "home")}
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
              prediction?.result === "home"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary text-card-foreground",
              readOnly && "cursor-default"
            )}
          >
            <TeamFlag flagUrl={match.homeTeam.flagUrl} name={match.homeTeam.name} />
            <span className="text-xs font-medium text-center leading-tight uppercase">
              {match.homeTeam.name}
            </span>
          </button>

          {/* Empate */}
          <button
            disabled={readOnly}
            onClick={() => onPrediction(match.id.toString(), "draw")}
            className={cn(
              "px-4 py-3 rounded-lg transition-all font-bold",
              prediction?.result === "draw"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary text-card-foreground",
              readOnly && "cursor-default"
            )}
          >
            X
          </button>

          {/* Visitante */}
          <button
            disabled={readOnly}
            onClick={() => onPrediction(match.id.toString(), "away")}
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
              prediction?.result === "away"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary text-card-foreground",
              readOnly && "cursor-default"
            )}
          >
            <TeamFlag flagUrl={match.awayTeam.flagUrl} name={match.awayTeam.name} />
            <span className="text-xs font-medium text-center leading-tight uppercase">
              {match.awayTeam.name}
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}