"use client"

import { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import type { EditorProject } from "@/lib/editor-project"
import { isValidProjectNameForSlug, slugifyProjectName } from "@/lib/project-slug"

const ROOM_SUFFIX_ALNUM = "abcdefghijklmnopqrstuvwxyz0123456789"

function generateShortSuffix(length = 6): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ""
  for (let i = 0; i < length; i++) {
    out += ROOM_SUFFIX_ALNUM[bytes[i]! % ROOM_SUFFIX_ALNUM.length]!
  }
  return out
}

export type ProjectDialogMode = "create" | "rename" | "delete" | null

export function useProjectActions() {
  const router = useRouter()
  const pathname = usePathname()

  const [dialog, setDialog] = useState<ProjectDialogMode>(null)
  const [renameTarget, setRenameTarget] = useState<EditorProject | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EditorProject | null>(null)
  const [createName, setCreateName] = useState("")
  const [createRoomSuffix, setCreateRoomSuffix] = useState("")
  const [renameName, setRenameName] = useState("")
  const [isPending, setIsPending] = useState(false)

  const closeDialog = useCallback(() => {
    setDialog(null)
    setRenameTarget(null)
    setDeleteTarget(null)
    setCreateName("")
    setCreateRoomSuffix("")
    setRenameName("")
  }, [])

  const openCreate = useCallback(() => {
    setCreateName("")
    setCreateRoomSuffix(generateShortSuffix())
    setDialog("create")
  }, [])

  const openRename = useCallback((project: EditorProject) => {
    setRenameTarget(project)
    setRenameName(project.name)
    setDialog("rename")
  }, [])

  const openDelete = useCallback((project: EditorProject) => {
    setDeleteTarget(project)
    setDialog("delete")
  }, [])

  const roomIdPreview = useMemo(() => {
    const base = slugifyProjectName(createName)
    if (!base || !createRoomSuffix) return ""
    return `${base}-${createRoomSuffix}`
  }, [createName, createRoomSuffix])

  const submitCreate = useCallback(async () => {
    if (isPending) return
    const name = createName.trim()
    if (!name || !isValidProjectNameForSlug(createName)) return
    setIsPending(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { project?: { id?: string } }
      const id = data.project?.id
      if (typeof id !== "string" || id.length === 0) return
      closeDialog()
      router.push(`/editor/${id}`)
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }, [createName, closeDialog, router, isPending])

  const submitRename = useCallback(async () => {
    if (isPending) return
    if (!renameTarget) return
    const name = renameName.trim()
    if (!name || !isValidProjectNameForSlug(renameName)) return
    setIsPending(true)
    try {
      const res = await fetch(`/api/projects/${renameTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) return
      closeDialog()
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }, [renameTarget, renameName, closeDialog, router, isPending])

  const submitDelete = useCallback(async () => {
    if (isPending) return
    if (!deleteTarget) return
    const deletedId = deleteTarget.id
    setIsPending(true)
    try {
      const res = await fetch(`/api/projects/${deletedId}`, {
        method: "DELETE",
      })
      if (!res.ok) return
      closeDialog()
      if (pathname === `/editor/${deletedId}`) {
        router.replace("/editor")
      }
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }, [deleteTarget, closeDialog, pathname, router, isPending])

  return {
    dialog,
    renameTarget,
    deleteTarget,
    createName,
    setCreateName,
    renameName,
    setRenameName,
    roomIdPreview,
    isPending,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  }
}

export type UseProjectActionsReturn = ReturnType<typeof useProjectActions>
