"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LeaderboardView } from "@/components/leaderboard-view"

function TablaContent() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleLogout = () => {
    router.push("/")
  }

  return <LeaderboardView onLogout={handleLogout} />
}

export default function TablaPage() {
  return (
    <AuthProvider>
      <TablaContent />
    </AuthProvider>
  )
}
