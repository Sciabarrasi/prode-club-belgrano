import { useState } from "react"
import { useRouter } from "next/navigation"

interface RegisterData {
  ticketNumber: number
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

interface UseRegisterReturn {
  loading: boolean
  error: string
  register: (data: RegisterData) => Promise<boolean>
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useRegister(): UseRegisterReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const register = async ({ ticketNumber, firstName, lastName, email, phone, password }: RegisterData): Promise<boolean> => {
    setError("")
    setLoading(true)

    try {
      if (!ticketNumber || !firstName || !lastName || !email || !phone || !password) {
        setError("Todos los campos son requeridos")
        return false
      }

      if (isNaN(ticketNumber) || ticketNumber <= 0) {
        setError("El número de cartón debe ser un número positivo")
        return false
      }

      if (!EMAIL_REGEX.test(email)) {
        setError("El formato del email no es válido")
        return false
      }

      if (password.length <= 8) {
        setError("La contraseña debe tener más de 8 caracteres")
        return false
      }

      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumber, firstName, lastName, email, phone, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Error al registrarse")
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

  return { loading, error, register }
}