"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/useSession"
import { LeaderboardView } from "@/components/leaderboard-view"

export default function TablaPage() {
  const { user, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace("/")
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return null

  const handleLogout = async () => {
    await fetch("/api/users/logout", { method: "POST" })
    router.replace("/")
  }

  return (
    <LeaderboardView
      currentUserId={user.id}
      onLogout={handleLogout}
    />
  )
}