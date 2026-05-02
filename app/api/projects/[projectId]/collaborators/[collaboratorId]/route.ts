import { NextResponse } from "next/server"

import { requireClerkUser } from "@/lib/api-clerk"
import { getProjectShareAccess } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ projectId: string; collaboratorId: string }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUser()
  if ("unauthorized" in authResult) {
    return authResult.unauthorized
  }
  const { userId, primaryEmail } = authResult
  const identity = { userId, primaryEmail }

  const { projectId, collaboratorId } = await context.params

  const share = await getProjectShareAccess(projectId, identity)
  if (!share.ok) {
    return NextResponse.json(
      { error: share.status === 404 ? "Not found" : "Forbidden" },
      { status: share.status },
    )
  }
  if (!share.isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const deleted = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  })
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
