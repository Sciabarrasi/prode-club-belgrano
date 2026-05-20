"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { LandingView } from "@/components/landing-view"
import { AuthModal } from "@/components/auth-modal"

type AuthMode = "login" | "register" | null

function ProdeApp() {
  const { user, hasCompletedPredictions, loading } = useAuth()

  const [authMode, setAuthMode] = useState<AuthMode>(null)

  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (user) {
      if (hasCompletedPredictions) {
        router.replace("/tabla")
      } else {
        router.replace("/predicciones")
      }
    }
  }, [user, hasCompletedPredictions, loading, router])

  if (loading || user) {
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
          onSwitchMode={() =>
            setAuthMode(authMode === "login" ? "register" : "login")
          }
        />
      )}
    </>
  )
}

export default function Home() {
  return <ProdeApp />
}