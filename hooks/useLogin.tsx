import { useState } from "react"
import { useRouter } from "next/navigation"

interface LoginData {
  email: string
  password: string
}

interface UseLoginReturn {
  loading: boolean
  error: string
  login: (data: LoginData) => Promise<boolean>
}

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const login = async ({ email, password }: LoginData): Promise<boolean> => {
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
        return false
      }

      router.replace("/predicciones")
      return true
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
      return false
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, login }
}