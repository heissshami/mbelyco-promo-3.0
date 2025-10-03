import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

// Export handlers via Better Auth Next.js adapter (pass auth.handler)
export const { GET, POST } = toNextJsHandler(auth.handler)