import { NextRequest, NextResponse } from "next/server"

// Basic RBAC: restrict access to admin-only routes under /dashboard/settings
const adminMatchers = [/^\/dashboard\/settings(\/.*)?$/]

export async function middleware(request: NextRequest) {
  const url = new URL(request.url)

  // Validate session for all dashboard routes via Better Auth API
  if (url.pathname.startsWith("/dashboard")) {
    try {
      const cookieHeader = request.headers.get("cookie") ?? ""
      if (!cookieHeader.includes("better-auth.session_token=")) {
        return NextResponse.redirect(new URL("/login", request.url))
      }

      const origin = url.origin
      const res = await fetch(`${origin}/api/auth/get-session`, {
        headers: { cookie: cookieHeader },
      })
      if (!res.ok) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      const data = await res.json()
      const role = data?.user?.role ?? "user"

      // Admin-only route guard
      if (adminMatchers.some((re) => re.test(url.pathname))) {
        if (role !== "admin") {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
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