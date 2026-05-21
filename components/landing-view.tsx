"use client"

import { Button } from "@/components/ui/button"

interface LandingViewProps {
  onLogin: () => void
  onRegister: () => void
}

export function LandingView({ onLogin, onRegister }: LandingViewProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="mb-8">
            <div className="text-8xl mb-4">⚽</div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-balance">
              Bienvenido al Prode!
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Predice los resultados de la fase de grupos del Mundial 2026 y compite con tus amigos
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
            <Button
              onClick={onRegister}
              size="lg"
              className="w-full bg-primary hover:bg-accent text-primary-foreground text-lg py-6"
            >
              Registrarse
            </Button>
            <Button
              onClick={onLogin}
              variant="outline"
              size="lg"
              className="w-full border-border text-card-foreground hover:bg-secondary text-lg py-6"
            >
              Iniciar Sesion
            </Button>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Mundial 2026 - Estados Unidos, Mexico y Canada
        </p>
      </footer>
    </div>
  )
}
