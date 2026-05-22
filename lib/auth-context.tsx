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

  // Función para cargar predicciones desde la API
  const loadPredictions = async () => {
    if (!user) return
    
    try {
      const predRes = await fetch("/api/predictions")
      if (predRes.ok) {
        const predData: PredictionResponse[] = await predRes.json()
        const loadedPredictions: Prediction[] = predData.map((p: PredictionResponse) => ({
          matchId: p.matchId.toString(),
          result: p.result,
        }))
        setPredictions(loadedPredictions)
        setHasCompletedPredictions(loadedPredictions.length > 0)
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

  // Función pública para refrescar predicciones
  const refreshPredictions = async () => {
    await loadPredictions()
  }

  // Al montar verifica si hay sesión activa via iron-session
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/users/me")
        const data = await res.json()
        if (data.user) {
          setUser({
            ...data.user,
            username: `${data.user.firstName} ${data.user.lastName}`,
          })
          
          // Cargar predicciones después de setear el usuario
          await loadPredictions()
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

      // Leer sesión para obtener datos del usuario
      const meRes = await fetch("/api/users/me")
      const meData = await meRes.json()

      if (meData.user) {
        setUser({
          ...meData.user,
          username: `${meData.user.firstName} ${meData.user.lastName}`,
        })
        
        // Cargar predicciones después del login
        await loadPredictions()
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