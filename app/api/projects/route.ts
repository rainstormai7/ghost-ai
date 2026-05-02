import { NextResponse } from "next/server"

import { requireClerkUserId } from "@/lib/api-clerk"
import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@/app/generated/prisma/enums"

const DEFAULT_PROJECT_NAME = "Untitled Project"

export async function GET() {
  const authResult = await requireClerkUserId()
  if ("unauthorized" in authResult) {
    return authResult.unauthorized
  }
  const { userId } = authResult

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ projects })
}

export async function POST(request: Request) {
  const authResult = await requireClerkUserId()
  if ("unauthorized" in authResult) {
    return authResult.unauthorized
  }
  const { userId } = authResult

  const raw = await request.json().catch(() => null)
  const body =
    raw !== null && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}

  let name = DEFAULT_PROJECT_NAME
  if (typeof body.name === "string") {
    const trimmed = body.name.trim()
    if (trimmed.length > 0) {
      name = trimmed
    }
  }

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
      status: ProjectStatus.DRAFT,
    },
  })

  return NextResponse.json({ project }, { status: 201 })
}
