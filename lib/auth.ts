import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = (user as any).role || "user"
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

// Helper to check if user is admin
export async function isAdmin(req: Request) {
  const session = await auth()
  return session?.user?.role === "admin"
}

// Helper to require authentication
export async function requireAuth(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return null
  }
  return session
}
