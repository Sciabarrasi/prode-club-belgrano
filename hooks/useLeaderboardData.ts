import { useState, useCallback } from "react"
import {
  fetchGroups,
  fetchGroupStageMatches,
  Group,
  Match,
} from "@/lib/matches-data"

interface DbPrediction {
  matchId: number
  result: string
  pointsEarned: number
  scored: boolean
}

interface DbUser {
  id: string
  firstName: string
  lastName: string
  ticketNumber: number
  points: number
  predictions: DbPrediction[]
}

interface UseLeaderboardDataReturn {
  users: DbUser[]
  groups: Group[]
  matches: Match[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useLeaderboardData(): UseLeaderboardDataReturn {
  const [users, setUsers] = useState<DbUser[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersRes, groupsData, matchesData] = await Promise.all([
        fetch("/api/leaderboard", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          }
        }).then((r) => {
          if (!r.ok) throw new Error("Error al cargar leaderboard")
          return r.json()
        }),
        fetchGroups(),
        fetchGroupStageMatches(),
      ])

      setUsers(usersRes)
      setGroups(groupsData)
      setMatches(matchesData)
    } catch (err) {
      console.error(err)
      setError("No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }, [])

  return { users, groups, matches, loading, error, refresh }
}