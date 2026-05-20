"use client"

import { useState } from "react"
import { Match } from "@/lib/matches-data"
import { Prediction } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MatchCardProps {
  match: Match
  prediction?: Prediction
  onPrediction: (matchId: string, result: "home" | "draw" | "away") => void
  readOnly?: boolean
}

export function MatchCard({ match, prediction, onPrediction, readOnly = false }: MatchCardProps) {
  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground text-center mb-3">
          {match.date}
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            disabled={readOnly}
            onClick={() => onPrediction(match.id, "home")}
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
              prediction?.result === "home"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary text-card-foreground",
              readOnly && "cursor-default"
            )}
          >
            <span className="text-2xl">{match.homeFlag}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {match.homeTeam}
            </span>
          </button>
          
          <button
            disabled={readOnly}
            onClick={() => onPrediction(match.id, "draw")}
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
          
          <button
            disabled={readOnly}
            onClick={() => onPrediction(match.id, "away")}
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
              prediction?.result === "away"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 hover:bg-secondary text-card-foreground",
              readOnly && "cursor-default"
            )}
          >
            <span className="text-2xl">{match.awayFlag}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {match.awayTeam}
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
