import { normalizeAuthUrlEnv } from "@/lib/normalize-auth-url-env";
import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";
import { NextResponse } from "next/server";

normalizeAuthUrlEnv();

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");

  // Allow auth routes to be accessed even when logged in
  // (user can choose to sign in with different account)
  // Only redirect if explicitly trying to access auth while having a valid session
  // and there's no error or success message in the URL
  const hasQueryParams = nextUrl.searchParams.toString().length > 0;
  
  // Protect dashboard routes - require authentication
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl)
    );
  }

  // Protect admin routes - require admin role
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl)
    );
  }

  if (isAdminRoute && isLoggedIn && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
