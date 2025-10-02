import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { auth } from "@/lib/auth"

// Basic RBAC: restrict access to admin-only routes under /dashboard/settings
const adminMatchers = [/^\/dashboard\/settings(\/.*)?$/]

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const url = new URL(request.url)

  // Allow public paths
  const publicPaths = ["/", "/login", "/api/auth"]
  if (publicPaths.some((p) => url.pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Require session for dashboard
  if (url.pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Admin check: fetch the session via API to inspect user role
  if (adminMatchers.some((re) => re.test(url.pathname))) {
    // We use Better Auth API endpoint to validate role server-side
    try {
      const res = await auth.api.session({
        headers: { cookie: request.headers.get("cookie") ?? "" },
      })
      if (!res.ok) return NextResponse.redirect(new URL("/login", request.url))
      const data = await res.json()
      const role = data?.user?.role ?? "user"
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}