import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { EditorShell } from "@/components/editor/editor-shell"
import { getEditorProjectsForUser } from "@/lib/editor-projects-data"

type PageProps = {
  params: Promise<{ projectId: string }>
}

export default async function EditorWorkspacePage({ params }: PageProps) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const { projectId } = await params
  const user = await currentUser()
  const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? null
  const { ownedProjects, sharedProjects } = await getEditorProjectsForUser(
    userId,
    primaryEmail,
  )

  return (
    <EditorShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      activeProjectId={projectId}
    />
  )
}
