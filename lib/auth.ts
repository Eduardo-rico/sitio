import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./prisma"
import Credentials from "next-auth/providers/credentials"
import authConfig from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    ...(authConfig.providers || []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        // Verify password
        const { verifyPassword } = await import("./password")
        const isValid = await verifyPassword(password, user.passwordHash)

        if (!isValid) {
          return null
        }

        // Return user object (without passwordHash)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
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
