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
import { useRegister } from "@/hooks/useRegister";
import { useLogin } from "@/hooks/useLogin";

interface AuthModalProps {
  mode: "login" | "register";
  onClose: () => void;
  onSwitchMode: () => void;
}

export function AuthModal({ mode, onClose, onSwitchMode }: AuthModalProps) {
  const router = useRouter();

  const [ticketNumber, setTicketNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const { loading: registerLoading, error: registerError, register } = useRegister()
  const { loading: loginLoading, error: loginError, login } = useLogin()

  const loading = mode === "register" ? registerLoading : loginLoading;
  const error = mode === "register" ? registerError : loginError;

  const handleSuccess = () => {
    router.replace("/predicciones");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "register") {
      const success = await register({
        ticketNumber: Number(ticketNumber),
        firstName,
        lastName,
        email,
        phone,
        password,
      });
      if (success) handleSuccess();
      return;
    }

    const { success, role } = await login({ email, password });
    if (success) {
      const destination = role === "ADMIN" || role === "SUPERADMIN" ? "/dashboard" : "/predicciones";
      router.replace(destination)
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">
            {mode === "login" ? "Iniciar Sesión" : "Registrarse"}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {mode === "login"
              ? "Ingresa tus credenciales para continuar"
              : "Crea una cuenta para participar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ticketNumber" className="text-card-foreground">
                    Número de cartón
                  </Label>
                  <Input
                    id="ticketNumber"
                    type="number"
                    placeholder="Ej: 1042"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col gap-2 flex-1">
                    <Label htmlFor="firstName" className="text-card-foreground">
                      Nombre
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <Label htmlFor="lastName" className="text-card-foreground">
                      Apellido
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Pérez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone" className="text-card-foreground">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Ej: +54 9 11 1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </>
            )}

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
              {loading
                ? "Cargando..."
                : mode === "login"
                  ? "Iniciar Sesión"
                  : "Registrarse"}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>
                {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
              </span>
              <button
                type="button"
                onClick={onSwitchMode}
                className="text-primary hover:underline"
              >
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
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
  );
}