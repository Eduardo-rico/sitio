import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Protected routes
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");

  // Allow API auth routes to proceed
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard routes - require authentication
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl)
    );
  }

  // Protect admin routes - require admin role
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl)
      );
    }

    if (userRole !== "admin") {
      // Redirect non-admin users to dashboard
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

// Configure matcher for routes that should trigger this middleware
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/admin/:path*",
    // Auth routes
    "/auth/:path*",
    // Exclude static files and API routes that don't need protection
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
