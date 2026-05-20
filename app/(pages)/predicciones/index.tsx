"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { PredictionsView } from "@/components/predictions-view"

function PrediccionesContent() {
  const { user, hasCompletedPredictions } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
    } else if (hasCompletedPredictions) {
      router.push("/tabla")
    }
  }, [user, hasCompletedPredictions, router])

  if (!user || hasCompletedPredictions) {
    return null
  }

  const handleComplete = () => {
    router.push("/tabla")
  }

  return <PredictionsView onComplete={handleComplete} />
}

export default function PrediccionesPage() {
  return (
    <AuthProvider>
      <PrediccionesContent />
    </AuthProvider>
  )
}
