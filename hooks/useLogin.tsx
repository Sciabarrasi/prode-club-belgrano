import { useState } from "react"

interface LoginData {
  email: string
  password: string
}

interface UseLoginReturn {
  loading: boolean
  error: string
  login: (data: LoginData) => Promise<{ success: boolean; role?: string }>
}

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const login = async ({ email, password }: LoginData): Promise<{ success: boolean; role?: string }> => {
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Credenciales incorrectas")
        return { success: false }
      }

      return { success: true, role: data.user.role }
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, login }
}