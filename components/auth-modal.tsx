"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface AuthModalProps {
  mode: "login" | "register"
  onClose: () => void
  onSuccess: () => void
  onSwitchMode: () => void
}

export function AuthModal({ mode, onClose, onSuccess, onSwitchMode }: AuthModalProps) {
  const { login, register } = useAuth()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (mode === "login") {
      const success = login(email, password)
      if (success) {
        onSuccess()
      } else {
        setError("Credenciales incorrectas")
      }
    } else {
      if (!username || !email || !password) {
        setError("Todos los campos son requeridos")
        return
      }
      const success = register(username, email, password)
      if (success) {
        onSuccess()
      } else {
        setError("El email ya está registrado")
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">
            {mode === "login" ? "Iniciar Sesion" : "Registrarse"}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {mode === "login" 
              ? "Ingresa tus credenciales para continuar" 
              : "Crea una cuenta para participar"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="username" className="text-card-foreground">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-card-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-card-foreground">Contrasena</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
              />
            </div>
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            <Button type="submit" className="w-full bg-primary hover:bg-accent text-primary-foreground">
              {mode === "login" ? "Iniciar Sesion" : "Registrarse"}
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>
                {mode === "login" ? "No tienes cuenta?" : "Ya tienes cuenta?"}
              </span>
              <button
                type="button"
                onClick={onSwitchMode}
                className="text-primary hover:underline"
              >
                {mode === "login" ? "Registrate" : "Inicia sesion"}
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full border-border text-card-foreground hover:bg-secondary"
            >
              Cancelar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
