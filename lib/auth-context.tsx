"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { PredictionResponse } from "./types"

export interface User {
  id: string
  ticketNumber: number
  firstName: string
  lastName: string
  username: string
  email: string
  role: string
}

export interface Prediction {
  matchId: string
  result: "home" | "draw" | "away"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  predictions: Prediction[]
  savePredictions: (predictions: Prediction[]) => void
  refreshPredictions: () => Promise<void>
  hasCompletedPredictions: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [hasCompletedPredictions, setHasCompletedPredictions] = useState(false)
  const [loading, setLoading] = useState(true)

  // Recibe el userId explícitamente para evitar el problema del closure con el estado
  const loadPredictionsForUser = async (_userId: string) => {
    try {
      const predRes = await fetch("/api/predictions")
      if (predRes.ok) {
        const predData: PredictionResponse[] = await predRes.json()
        const loaded: Prediction[] = predData.map((p: PredictionResponse) => ({
          matchId: p.matchId.toString(),
          result: p.result,
        }))
        setPredictions(loaded)
        setHasCompletedPredictions(loaded.length > 0)
      } else {
        setPredictions([])
        setHasCompletedPredictions(false)
      }
    } catch (error) {
      console.error("Error loading predictions:", error)
      setPredictions([])
      setHasCompletedPredictions(false)
    }
  }

  // Usa el user del estado (para llamadas posteriores al login)
  const refreshPredictions = async () => {
    if (!user) return
    await loadPredictionsForUser(user.id)
  }

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/users/me")
        const data = await res.json()

        if (data.user) {
          const sessionUser: User = {
            ...data.user,
            username: `${data.user.firstName} ${data.user.lastName}`,
          }
          setUser(sessionUser)
          // Pasamos el id directo, no dependemos del estado
          await loadPredictionsForUser(sessionUser.id)
        }
      } catch {
        // Sin sesión
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { ok: false, error: data.error ?? "Error al iniciar sesión" }
      }

      const meRes = await fetch("/api/users/me")
      const meData = await meRes.json()

      if (meData.user) {
        const loggedUser: User = {
          ...meData.user,
          username: `${meData.user.firstName} ${meData.user.lastName}`,
        }
        setUser(loggedUser)
        // Limpiamos predicciones anteriores antes de cargar las nuevas
        setPredictions([])
        setHasCompletedPredictions(false)
        // Pasamos el id directo del usuario recién logueado
        await loadPredictionsForUser(loggedUser.id)
      }

      return { ok: true }
    } catch {
      return { ok: false, error: "Error de conexión" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/users/logout", { method: "POST" })
    } finally {
      setUser(null)
      setPredictions([])
      setHasCompletedPredictions(false)
    }
  }

  const savePredictions = (newPredictions: Prediction[]) => {
    setPredictions(newPredictions)
    setHasCompletedPredictions(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        predictions,
        savePredictions,
        refreshPredictions,
        hasCompletedPredictions,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}