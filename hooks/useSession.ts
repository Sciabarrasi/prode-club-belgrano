import { useState, useEffect } from "react"

interface SessionUser {
  id: string
  ticketNumber: number
  firstName: string
  lastName: string
  email: string
  role: string
}

interface UseSessionReturn {
  user: SessionUser | null
  loading: boolean
  refresh: () => Promise<void>
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/session")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user ?? null)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSession()
  }, [])

  return { user, loading, refresh: fetchSession }
}