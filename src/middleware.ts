import { NextRequest, NextResponse } from "next/server"

// Basic RBAC: restrict access to admin-only routes under /dashboard/settings
const adminMatchers = [/^\/dashboard\/settings(\/.*)?$/]

export async function middleware(request: NextRequest) {
  const url = new URL(request.url)
  const sessionCookie = request.cookies.get("better-auth.session_token")?.value

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
    // We call the Better Auth session endpoint via fetch in the Edge runtime
    try {
      const origin = url.origin
      const res = await fetch(`${origin}/api/auth/session`, {
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