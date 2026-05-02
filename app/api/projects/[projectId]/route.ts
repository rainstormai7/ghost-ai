import { NextResponse } from "next/server"

import { requireClerkUserId } from "@/lib/api-clerk"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ projectId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()
  if ("unauthorized" in authResult) {
    return authResult.unauthorized
  }
  const { userId } = authResult

  const { projectId } = await context.params

  const raw = await request.json().catch(() => null)
  const body =
    raw !== null && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}

  if (typeof body.name !== "string") {
    return NextResponse.json(
      { error: "Invalid body: name must be a string" },
      { status: 400 },
    )
  }

  const name = body.name.trim()
  if (name.length === 0) {
    return NextResponse.json(
      { error: "Invalid body: name cannot be empty" },
      { status: 400 },
    )
  }

  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  })
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (existing.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const updated = await prisma.project.updateMany({
    where: { id: projectId, ownerId: userId },
    data: { name },
  })
  if (updated.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  
  return NextResponse.json({ project })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireClerkUserId()
  if ("unauthorized" in authResult) {
    return authResult.unauthorized
  }
  const { userId } = authResult

  const { projectId } = await context.params

  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (existing.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.project.delete({
    where: { id: projectId },
  })

  return new NextResponse(null, { status: 204 })
}
