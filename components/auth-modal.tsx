"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useLogin";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { loading: loginLoading, error: loginError, login } = useLogin()

  const loading = loginLoading;
  const error = loginError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { success, role } = await login({ email, password });
    if (success) {
      let destination = "/predicciones";
      
      if (role === "ADMIN" || role === "SUPERADMIN") {
        destination = "/dashboard";
      } else if (role === "USER") {
        destination = "/tabla";
      }
      
      router.replace(destination);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Ingresa tus credenciales para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-card-foreground">
                Email
              </Label>
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
              <Label htmlFor="password" className="text-card-foreground">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-accent text-primary-foreground"
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </Button>

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
  );
}