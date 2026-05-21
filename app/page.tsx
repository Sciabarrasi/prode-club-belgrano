"use client"

import { useState } from "react"
import { LandingView } from "@/components/landing-view"
import { AuthModal } from "@/components/auth-modal"

type AuthMode = "login" | "register" | null

function ProdeApp() {
  const [authMode, setAuthMode] = useState<AuthMode>(null)

  return (
    <>
      <LandingView
        onLogin={() => setAuthMode("login")}
        onRegister={() => setAuthMode("register")}
      />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={() =>
            setAuthMode(authMode === "login" ? "register" : "login")
          }
        />
      )}
    </>
  )
}

export default function Home() {
  return <ProdeApp />
}