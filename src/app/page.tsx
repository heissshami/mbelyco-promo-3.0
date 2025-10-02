import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function Home() {
  // Server-side entry point: determine destination based on session cookie
  const sessionToken = cookies().get("better-auth.session_token")?.value

  // If no session cookie, go to login
  if (!sessionToken) {
    redirect("/login")
  }

  // Validate session via Better Auth API to prevent forged cookies
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/auth/session`, {
      headers: { cookie: `better-auth.session_token=${sessionToken}` },
      cache: "no-store",
    })
    if (!res.ok) {
      redirect("/login")
    }
    const data = await res.json()
    if (!data?.session?.token) {
      redirect("/login")
    }
  } catch {
    redirect("/login")
  }

  // Authenticated: route to dashboard
  redirect("/dashboard")
}
