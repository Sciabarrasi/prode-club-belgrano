import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Tu Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;

          const userFound = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!userFound) return null;

          const validPassword = await bcrypt.compare(
            credentials.password as string,
            userFound.passwordHash
          );

          if (!validPassword) return null;

          return {
            id: userFound.id,
            name: `${userFound.firstName} ${userFound.lastName}`,
            email: userFound.email,
            role: userFound.role,
            ticketNumber: userFound.ticketNumber,
            firstName: userFound.firstName,
            lastName: userFound.lastName,
          };
        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.ticketNumber = (user as any).ticketNumber;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          ticketNumber: token.ticketNumber as number,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
        },
      };
    },
  },

  pages: {
    error: "/access-denied",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});