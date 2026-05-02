import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

type ClerkCurrentUser = Awaited<ReturnType<typeof currentUser>>

/**
 * Resolves the authenticated Clerk user id for API handlers, or a 401 response.
 */
export async function requireClerkUserId(): Promise<
  | { userId: string }
  | { unauthorized: NextResponse }
> {
  const { userId } = await auth()
  if (!userId) {
    return {
      unauthorized: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    }
  }
  return { userId }
}

/**
 * Single auth round-trip for handlers that need user id plus primary email (or other user fields).
 */
export async function requireClerkUser(): Promise<
  | {
      userId: string
      user: ClerkCurrentUser
      primaryEmail: string | null
    }
  | { unauthorized: NextResponse }
> {
  const { userId } = await auth()
  if (!userId) {
    return {
      unauthorized: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      ),
    }
  }

  const user = await currentUser()
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null

  return { userId, user, primaryEmail }
}
