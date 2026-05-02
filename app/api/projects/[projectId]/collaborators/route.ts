import { NextResponse } from "next/server"

import { Prisma } from "@/app/generated/prisma/client"
import { enrichCollaboratorsByEmail } from "@/lib/clerk-collaborator-enrichment"
import { requireClerkUser } from "@/lib/api-clerk"
import { getProjectShareAccess } from "@/lib/project-access"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ projectId: string }>
}

function normalizeInviteEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

function isValidInviteEmail(email: string): boolean {
  if (email.length === 0 || email.length > 320) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUser()
  if ("unauthorized" in authResult) {
    return authResult.unauthorized
  }
  const { userId, user } = authResult
  const verifiedEmails = user?.emailAddresses
    .filter((ea) => ea.verification?.status === "verified")
    .map((ea) => ea.emailAddress) ?? []
  const identity = { userId, verifiedEmails }

  const { projectId } = await context.params

  const share = await getProjectShareAccess(projectId, identity)
  if (!share.ok) {
    return NextResponse.json(
      { error: share.status === 404 ? "Not found" : "Forbidden" },
      { status: share.status },
    )
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, createdAt: true },
  })

  const enriched = await enrichCollaboratorsByEmail(collaborators)

  return NextResponse.json({
    collaborators: enriched.map((c) => ({
      id: c.id,
      email: c.email,
      createdAt: c.createdAt.toISOString(),
      displayName: c.displayName,
      imageUrl: c.imageUrl,
    })),
    isOwner: share.isOwner,
  })
}

export async function POST(request: Request, context: RouteContext) {
  const authResult = await requireClerkUser()
  if ("unauthorized" in authResult) {
    return authResult.unauthorized
  }
  const { userId, user } = authResult
  const verifiedEmails = user?.emailAddresses
    .filter((ea) => ea.verification?.status === "verified")
    .map((ea) => ea.emailAddress) ?? []
  const identity = { userId, verifiedEmails }

  const { projectId } = await context.params

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

  const raw = await request.json().catch(() => null)
  const body =
    raw !== null && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}

  if (typeof body.email !== "string") {
    return NextResponse.json(
      { error: "Invalid body: email must be a string" },
      { status: 400 },
    )
  }

  const emailInput = normalizeInviteEmail(body.email)
  if (!isValidInviteEmail(emailInput)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    )
  }

  if (!user) {
    return NextResponse.json(
      { error: "Unable to verify invite at this time" },
      { status: 503 },
    )
  }

  const ownerEmails = new Set(
    user.emailAddresses.map((a) => a.emailAddress.toLowerCase()),
  )
  if (ownerEmails.has(emailInput)) {
    return NextResponse.json(
      { error: "You cannot add yourself as a collaborator" },
      { status: 400 },
    )
  }

  const existingCollaborator = await prisma.projectCollaborator.findFirst({
    where: {
      projectId,
      email: { equals: emailInput, mode: "insensitive" },
    },
  })
  if (existingCollaborator) {
    return NextResponse.json(
      { error: "That email is already a collaborator" },
      { status: 409 },
    )
  }

  try {
    const created = await prisma.projectCollaborator.create({
      data: { projectId, email: emailInput },
      select: { id: true, email: true, createdAt: true },
    })
    const enriched = await enrichCollaboratorsByEmail([created])
    const c = enriched[0]!
    return NextResponse.json(
      {
        collaborator: {
          id: c.id,
          email: c.email,
          createdAt: c.createdAt.toISOString(),
          displayName: c.displayName,
          imageUrl: c.imageUrl,
        },
      },
      { status: 201 },
    )
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "That email is already a collaborator" },
        { status: 409 },
      )
    }
    throw e
  }
}
