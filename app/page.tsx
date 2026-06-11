"use client"

import { useState } from "react"
import { LandingView } from "@/components/landing-view"
import { AuthModal } from "@/components/auth-modal"

type AuthMode = "login" | null

function ProdeApp() {
  const [authMode, setAuthMode] = useState<AuthMode>(null)

  return (
    <>
      <LandingView
        onLogin={() => setAuthMode("login")}
      />

      {authMode && (
        <AuthModal
          onClose={() => setAuthMode(null)}
        />
      )}
    </>
  )
}

export default function Home() {
  return <ProdeApp />
}