import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

const authConfig = {
  trustHost: true,
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
    jwt({ token, user }) {
      const tokenWithRole = token as { role?: string }
      if (user) {
        tokenWithRole.role = (user as { role?: string }).role || "user"
      }
      return tokenWithRole
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || session.user.id
        session.user.role = (token as { role?: string }).role || "user"
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
} satisfies NextAuthConfig

export default authConfig
