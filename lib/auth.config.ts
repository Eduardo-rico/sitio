import type { NextAuthConfig } from "next-auth"

const authConfig = {
  trustHost: true,
  providers: [],
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
