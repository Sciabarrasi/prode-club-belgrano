import { useState } from "react";
import { signIn } from "next-auth/react";

interface RegisterData {
  ticketNumber: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface UseRegisterReturn {
  loading: boolean;
  error: string;
  register: (data: RegisterData) => Promise<boolean>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useRegister(): UseRegisterReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async ({
    ticketNumber,
    firstName,
    lastName,
    email,
    phone,
    password,
  }: RegisterData): Promise<boolean> => {
    setError("");
    setLoading(true);

    try {
      if (!ticketNumber || !firstName || !lastName || !email || !phone || !password) {
        setError("Todos los campos son requeridos");
        return false;
      }

      if (isNaN(ticketNumber) || ticketNumber <= 0) {
        setError("El número de cartón debe ser un número positivo");
        return false;
      }

      if (!EMAIL_REGEX.test(email)) {
        setError("El formato del email no es válido");
        return false;
      }

      if (password.length <= 8) {
        setError("La contraseña debe tener más de 8 caracteres");
        return false;
      }

      // 1. Crear el usuario en la DB (tu API de registro no cambia)
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumber, firstName, lastName, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrarse");
        return false;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        return true;
      }

      return true;
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, register };
}