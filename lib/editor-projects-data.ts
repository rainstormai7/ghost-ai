import { prisma } from "@/lib/prisma"
import type { EditorProject } from "@/lib/editor-project"
import { slugifyProjectName } from "@/lib/project-slug"

/**
 * Loads owned and collaborated projects for the editor shell (server-only).
 */
export async function getEditorProjectsForUser(
  userId: string,
  verifiedEmails: string[],
): Promise<{ ownedProjects: EditorProject[]; sharedProjects: EditorProject[] }> {
  const owned = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  })

  const shared =
    verifiedEmails.length > 0
      ? await prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: {
              some: {
                email: {
                  in: verifiedEmails,
                  mode: "insensitive",
                },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        })
      : []

  const ownedProjects: EditorProject[] = owned.map((p) => ({
    id: p.id,
    name: p.name,
    slug: slugifyProjectName(p.name),
    isOwner: true,
  }))

  const sharedProjects: EditorProject[] = shared.map((p) => ({
    id: p.id,
    name: p.name,
    slug: slugifyProjectName(p.name),
    isOwner: false,
  }))

  return { ownedProjects, sharedProjects }
}
