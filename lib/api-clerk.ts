import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

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
