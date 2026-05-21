"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { PredictionsView } from "@/components/predictions-view"

export default function PrediccionesPage() {
  const { user, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/")
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await fetch("/api/users/logout", { method: "POST" })
    router.replace("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Cargando...</p>
      </div>
    )
  }

  if (!user) return null

  const handleComplete = () => {
    router.push("/tabla")
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
      <PredictionsView onComplete={handleComplete} />
    </div>
  )
}