import { useState } from "react";
import { signIn } from "next-auth/react";

interface LoginData {
  email: string;
  password: string;
}

interface UseLoginReturn {
  loading: boolean;
  error: string;
  login: (data: LoginData) => Promise<{ success: boolean; role?: string }>;
}

export function useLogin(): UseLoginReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async ({ email, password }: LoginData): Promise<{ success: boolean; role?: string }> => {
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Credenciales incorrectas");
        return { success: false };
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      return { success: true, role: session?.user?.role };
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, login };
}