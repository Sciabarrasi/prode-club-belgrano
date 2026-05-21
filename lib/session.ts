import { SessionOptions } from "iron-session"

export interface SessionData {
  user?: {
    id: string
    ticketNumber: number
    firstName: string
    lastName: string
    email: string
    role: string
  }
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "prode-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
}