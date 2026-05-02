import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { EditorShell } from "@/components/editor/editor-shell"
import { getEditorProjectsForUser } from "@/lib/editor-projects-data"

export default async function EditorPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }

  const user = await currentUser()
  const verifiedEmails = user?.emailAddresses
    .filter((ea) => ea.verification?.status === "verified")
    .map((ea) => ea.emailAddress) ?? []
  const { ownedProjects, sharedProjects } = await getEditorProjectsForUser(
    userId,
    verifiedEmails,
  )

  return (
    <EditorShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
      activeProjectId={null}
    />
  )
}
