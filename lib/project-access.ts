import { auth, currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

/** Clerk identity used for project membership checks (server-only). */
export type ClerkProjectIdentity = {
  userId: string
  primaryEmail: string | null
}

/** Minimal project fields when the user may access the workspace. */
export type AccessibleProjectSummary = {
  id: string
  name: string
}

/**
 * Returns the signed-in user id and primary email (server-only).
 * Call after confirming auth in the page, or treat null userId as unauthenticated.
 */
export async function getClerkProjectIdentity(): Promise<ClerkProjectIdentity | null> {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null
  return { userId, primaryEmail }
}

/**
 * Loads the project by id if the user owns it or is a collaborator (email match).
 * Returns null when the project does not exist or the user has no access.
 */
export async function findAccessibleProjectForUser(
  roomId: string,
  identity: ClerkProjectIdentity,
): Promise<AccessibleProjectSummary | null> {
  const email = identity.primaryEmail?.trim()
  const collaboratorClause =
    email && email.length > 0
      ? ({
          collaborators: {
            some: {
              email: {
                equals: email,
                mode: "insensitive" as const,
              },
            },
          },
        } as const)
      : null

  const project = await prisma.project.findFirst({
    where: {
      id: roomId,
      OR: [{ ownerId: identity.userId }, ...(collaboratorClause ? [collaboratorClause] : [])],
    },
    select: { id: true, name: true },
  })

  return project
}

/** Result of verifying the user may open the share dialog for a project. */
export type ProjectShareAccessResult =
  | { ok: false; status: 404 }
  | { ok: false; status: 403 }
  | { ok: true; project: { id: string; ownerId: string }; isOwner: boolean }

/**
 * Loads the project and checks the user is the owner or a listed collaborator.
 * 404 when the project id does not exist; 403 when it exists but the user has no access.
 */
export async function getProjectShareAccess(
  projectId: string,
  identity: ClerkProjectIdentity,
): Promise<ProjectShareAccessResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  })
  if (!project) {
    return { ok: false, status: 404 }
  }

  if (project.ownerId === identity.userId) {
    return { ok: true, project, isOwner: true }
  }

  const email = identity.primaryEmail?.trim()
  if (!email || email.length === 0) {
    return { ok: false, status: 403 }
  }

  const collaborator = await prisma.projectCollaborator.findFirst({
    where: {
      projectId,
      email: { equals: email, mode: "insensitive" },
    },
  })
  if (!collaborator) {
    return { ok: false, status: 403 }
  }

  return { ok: true, project, isOwner: false }
}
