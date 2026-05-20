"use client"

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react"

export interface User {
  id: string
  username: string
  email: string
}

export interface Prediction {
  matchId: string
  result: "home" | "draw" | "away"
}

interface AuthContextType {
  user: User | null
  users: User[]
  predictions: Record<string, Prediction[]>
  loading: boolean

  login: (email: string, password: string) => boolean

  register: (
    username: string,
    email: string,
    password: string
  ) => boolean

  logout: () => void

  savePredictions: (
    predictions: Prediction[]
  ) => void

  hasCompletedPredictions: boolean
}

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined)

const mockUsers: {
  user: User
  password: string
}[] = [
  {
    user: {
      id: "1",
      username: "Carlos",
      email: "carlos@email.com",
    },
    password: "123456",
  },

  {
    user: {
      id: "2",
      username: "Maria",
      email: "maria@email.com",
    },
    password: "123456",
  },

  {
    user: {
      id: "3",
      username: "Juan",
      email: "juan@email.com",
    },
    password: "123456",
  },

  {
    user: {
      id: "4",
      username: "Admin",
      email: "admin@prode.com",
    },
    password: "Pr0de#2026!",
  },
]

const mockPredictions: Record<
  string,
  Prediction[]
> = {
  "1": [
    {
      matchId: "A1",
      result: "home",
    },
    {
      matchId: "A2",
      result: "draw",
    },
    {
      matchId: "A3",
      result: "away",
    },
  ],

  "2": [
    {
      matchId: "A1",
      result: "draw",
    },
    {
      matchId: "A2",
      result: "home",
    },
    {
      matchId: "A3",
      result: "home",
    },
  ],

  "3": [
    {
      matchId: "A1",
      result: "away",
    },
    {
      matchId: "A2",
      result: "away",
    },
    {
      matchId: "A3",
      result: "draw",
    },
  ],
}

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const loading = false

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null
    }

    const savedUser =
      localStorage.getItem("prode_user")

    return savedUser
      ? JSON.parse(savedUser)
      : null
  })

  const [users, setUsers] = useState<User[]>(
    mockUsers.map((u) => u.user)
  )

  const [allPasswords, setAllPasswords] =
    useState<Record<string, string>>(
      mockUsers.reduce(
        (acc, u) => ({
          ...acc,
          [u.user.email]: u.password,
        }),
        {}
      )
    )

  const [predictions, setPredictions] =
    useState<Record<string, Prediction[]>>(
      mockPredictions
    )

  const [
    hasCompletedPredictions,
    setHasCompletedPredictions,
  ] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false
    }

    const savedUser =
      localStorage.getItem("prode_user")

    if (!savedUser) {
      return false
    }

    const parsedUser: User =
      JSON.parse(savedUser)

    return !!mockPredictions[
      parsedUser.id
    ]?.length
  })

  const login = (
    email: string,
    password: string
  ): boolean => {
    const foundUser = users.find(
      (u) => u.email === email
    )

    if (
      foundUser &&
      allPasswords[email] === password
    ) {
      setUser(foundUser)

      localStorage.setItem(
        "prode_user",
        JSON.stringify(foundUser)
      )

      const hasPredictions =
        !!predictions[foundUser.id]?.length

      setHasCompletedPredictions(
        hasPredictions
      )

      return true
    }

    return false
  }

  const register = (
    username: string,
    email: string,
    password: string
  ): boolean => {
    const existingUser = users.find(
      (u) => u.email === email
    )

    if (existingUser) {
      return false
    }

    const newUser: User = {
      id: String(users.length + 1),
      username,
      email,
    }

    setUsers([...users, newUser])

    setAllPasswords({
      ...allPasswords,
      [email]: password,
    })

    setUser(newUser)

    localStorage.setItem(
      "prode_user",
      JSON.stringify(newUser)
    )

    setHasCompletedPredictions(false)

    return true
  }

  const logout = () => {
    setUser(null)

    setHasCompletedPredictions(false)

    localStorage.removeItem("prode_user")
  }

  const savePredictions = (
    userPredictions: Prediction[]
  ) => {
    if (!user) return

    const updatedPredictions = {
      ...predictions,
      [user.id]: userPredictions,
    }

    setPredictions(updatedPredictions)

    setHasCompletedPredictions(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        predictions,
        loading,

        login,
        register,
        logout,

        savePredictions,

        hasCompletedPredictions,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    )
  }

  return context
}