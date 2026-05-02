import { clerkClient } from "@clerk/nextjs/server"

export interface ClerkCollaboratorProfile {
  displayName: string | null
  imageUrl: string | null
}

/** Normalize for map keys so collaborator rows match Clerk emails case-insensitively. */
function normalizeLookupEmail(email: string): string {
  return email.trim().toLowerCase()
}

function profileFromClerkUser(user: {
  firstName: string | null | undefined
  lastName: string | null | undefined
  username: string | null | undefined
  imageUrl: string | null | undefined
  emailAddresses?: Array<{ emailAddress: string }>
}): ClerkCollaboratorProfile {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    null

  return {
    displayName,
    imageUrl: user.imageUrl ?? null,
  }
}

/**
 * Looks up a Clerk user by exact email match. Returns empty profile when not found or on error.
 */
export async function lookupClerkProfileByEmail(
  email: string,
): Promise<ClerkCollaboratorProfile> {
  const normalized = email.trim()
  if (normalized.length === 0) {
    return { displayName: null, imageUrl: null }
  }

  try {
    const clerk = await clerkClient()
    const { data } = await clerk.users.getUserList({
      emailAddress: [normalized],
      limit: 1,
    })
    const user = data[0]
    if (!user) {
      return { displayName: null, imageUrl: null }
    }

    return profileFromClerkUser(user)
  } catch {
    return { displayName: null, imageUrl: null }
  }
}

/** Clerk list filters are safest in modest chunks to avoid oversized queries. */
const EMAIL_BATCH_SIZE = 25

async function applyBatchProfilesFromClerk(
  emails: string[],
  profileByEmail: Map<string, ClerkCollaboratorProfile>,
): Promise<void> {
  if (emails.length === 0) return

  try {
    const clerk = await clerkClient()
    // Request extra headroom: one Clerk user can own several emails, so the
    // result set may be larger than the number of invite addresses we filter on.
    const { data } = await clerk.users.getUserList({
      emailAddress: emails,
      limit: Math.min(500, emails.length * 2),
    })

    for (const user of data) {
      const profile = profileFromClerkUser(user)
      for (const ea of user.emailAddresses ?? []) {
        const k = normalizeLookupEmail(ea.emailAddress)
        if (k.length > 0) {
          profileByEmail.set(k, profile)
        }
      }
    }
  } catch {
    await Promise.all(
      emails.map(async (email) => {
        const key = normalizeLookupEmail(email)
        if (key.length === 0) return
        const p = await lookupClerkProfileByEmail(email)
        profileByEmail.set(key, p)
      }),
    )
  }
}

export async function enrichCollaboratorsByEmail<
  T extends { email: string },
>(rows: T[]): Promise<(T & ClerkCollaboratorProfile)[]> {
  if (rows.length === 0) return []

  const profileByEmail = new Map<string, ClerkCollaboratorProfile>()

  const uniqueKeys = [
    ...new Set(
      rows
        .map((r) => normalizeLookupEmail(r.email))
        .filter((k) => k.length > 0),
    ),
  ]

  for (let i = 0; i < uniqueKeys.length; i += EMAIL_BATCH_SIZE) {
    const chunk = uniqueKeys.slice(i, i + EMAIL_BATCH_SIZE)
    await applyBatchProfilesFromClerk(chunk, profileByEmail)
  }

  await Promise.all(
    uniqueKeys
      .filter((key) => !profileByEmail.has(key))
      .map(async (key) => {
        const representative =
          rows.find((r) => normalizeLookupEmail(r.email) === key)?.email ?? key
        const p = await lookupClerkProfileByEmail(representative)
        profileByEmail.set(key, p)
      }),
  )

  return rows.map((row) => {
    const key = normalizeLookupEmail(row.email)
    if (key.length === 0) {
      return {
        ...row,
        displayName: null,
        imageUrl: null,
      }
    }

    const profile = profileByEmail.get(key) ?? {
      displayName: null,
      imageUrl: null,
    }

    return { ...row, ...profile }
  })
}
