"use client"

import { Match } from "@/lib/matches-data"
import { Prediction } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MatchCardProps {
  match: Match

  prediction?: Prediction

  onPrediction: (
    matchId: string,
    result: "home" | "draw" | "away"
  ) => void

  readOnly?: boolean
}

export function MatchCard({
  match,
  prediction,
  onPrediction,
  readOnly = false,
}: MatchCardProps) {
  const formattedDate =
    new Date(
      match.kickoff
    ).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground text-center mb-3">
          {formattedDate}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            disabled={readOnly}
            onClick={() =>
              onPrediction(
                match.id.toString(),
                "home"
              )
            }
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
              prediction?.result ===
                "home"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary text-card-foreground",
              readOnly &&
                "cursor-default"
            )}
          >
            <span className="text-2xl">
              {
                match.homeTeam
                  .flag
              }
            </span>

            <span className="text-xs font-medium text-center leading-tight">
              {
                match.homeTeam
                  .name
              }
            </span>
          </button>

          <button
            disabled={readOnly}
            onClick={() =>
              onPrediction(
                match.id.toString(),
                "draw"
              )
            }
            className={cn(
              "px-4 py-3 rounded-lg transition-all font-bold",
              prediction?.result ===
                "draw"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary text-card-foreground",
              readOnly &&
                "cursor-default"
            )}
          >
            X
          </button>

          <button
            disabled={readOnly}
            onClick={() =>
              onPrediction(
                match.id.toString(),
                "away"
              )
            }
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
              prediction?.result ===
                "away"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary text-card-foreground",
              readOnly &&
                "cursor-default"
            )}
          >
            <span className="text-2xl">
              {
                match.awayTeam
                  .flag
              }
            </span>

            <span className="text-xs font-medium text-center leading-tight">
              {
                match.awayTeam
                  .name
              }
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}