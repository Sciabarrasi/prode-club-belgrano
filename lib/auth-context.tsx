"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { PredictionResponse } from "./types"

export interface Prediction {
  matchId: string
  result: "home" | "draw" | "away"
}

interface AuthContextType {
  user: {
    id: string
    ticketNumber: number
    firstName: string
    lastName: string
    username: string
    email: string
    role: string
  } | null
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
  const { data: session, status } = useSession()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [hasCompletedPredictions, setHasCompletedPredictions] = useState(false)
  const [predictionsLoading, setPredictionsLoading] = useState(false)

  const loading = status === "loading" || predictionsLoading

  const loadPredictions = async () => {
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

  useEffect(() => {
    if (status === "authenticated") {
      setPredictionsLoading(true)
      loadPredictions().finally(() => setPredictionsLoading(false))
    } else if (status === "unauthenticated") {
      setPredictions([])
      setHasCompletedPredictions(false)
    }
  }, [status])

  const refreshPredictions = async () => {
    if (!session) return
    await loadPredictions()
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (!result || result.error) {
      return { ok: false, error: "Credenciales incorrectas" }
    }

    return { ok: true }
    // las predicciones se cargan solas via el useEffect cuando status cambia a "authenticated"
  }

  const logout = async () => {
    setPredictions([])
    setHasCompletedPredictions(false)
    await signOut({ redirect: false })
  }

  const savePredictions = (newPredictions: Prediction[]) => {
    setPredictions(newPredictions)
    setHasCompletedPredictions(true)
  }

  const user = session?.user
    ? {
        id: session.user.id,
        ticketNumber: session.user.ticketNumber,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        username: `${session.user.firstName} ${session.user.lastName}`,
        email: session.user.email ?? "",
        role: session.user.role,
      }
    : null

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