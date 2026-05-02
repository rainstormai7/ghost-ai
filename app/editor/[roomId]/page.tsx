import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/editor/access-denied"
import { EditorWorkspaceShell } from "@/components/editor/editor-workspace-shell"
import { getEditorProjectsForUser } from "@/lib/editor-projects-data"
import {
  findAccessibleProjectForUser,
  getClerkProjectIdentity,
} from "@/lib/project-access"

type PageProps = {
  params: Promise<{ roomId: string }>
}

export default async function EditorWorkspacePage({ params }: PageProps) {
  const identity = await getClerkProjectIdentity()
  if (!identity) {
    redirect("/sign-in")
  }

  const { roomId } = await params

  const project = await findAccessibleProjectForUser(roomId, identity)
  if (!project) {
    return <AccessDenied />
  }

  const { ownedProjects, sharedProjects } = await getEditorProjectsForUser(
    identity.userId,
    identity.verifiedEmails,
  )

  return (
    <EditorWorkspaceShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      roomId={roomId}
      projectName={project.name}
    />
  )
}
