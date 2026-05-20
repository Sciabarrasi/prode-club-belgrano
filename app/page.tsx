"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LandingView } from "@/components/landing-view"
import { AuthModal } from "@/components/auth-modal"

type AuthMode = "login" | "register" | null

function ProdeApp() {
  const { user, hasCompletedPredictions } = useAuth()
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (hasCompletedPredictions) {
        router.push("/tabla")
      } else {
        router.push("/predicciones")
      }
    }
  }, [user, hasCompletedPredictions, router])

  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Cargando...</p>
      </div>
    )
  }

  const handleAuthSuccess = () => {
    setAuthMode(null)
  }

  return (
    <>
      <LandingView
        onLogin={() => setAuthMode("login")}
        onRegister={() => setAuthMode("register")}
      />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={handleAuthSuccess}
          onSwitchMode={() => setAuthMode(authMode === "login" ? "register" : "login")}
        />
      )}
    </>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <ProdeApp />
    </AuthProvider>
  )
}
