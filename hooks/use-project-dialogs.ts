"use client"

import { useCallback, useMemo, useState } from "react"

import type { MockProject } from "@/lib/mock-projects"
import { isValidProjectNameForSlug, slugifyProjectName } from "@/lib/project-slug"

export type ProjectDialogMode = "create" | "rename" | "delete" | null

export interface UseProjectDialogsOptions {
  onCreateProject: (name: string, slug: string) => void
  onRenameProject: (projectId: string, name: string, slug: string) => void
  onDeleteProject: (projectId: string) => void
}

export function useProjectDialogs({
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: UseProjectDialogsOptions) {
  const [dialog, setDialog] = useState<ProjectDialogMode>(null)
  const [renameTarget, setRenameTarget] = useState<MockProject | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MockProject | null>(null)
  const [createName, setCreateName] = useState("")
  const [renameName, setRenameName] = useState("")
  const [isPending, setIsPending] = useState(false)

  const closeDialog = useCallback(() => {
    setDialog(null)
    setRenameTarget(null)
    setDeleteTarget(null)
    setCreateName("")
    setRenameName("")
    setIsPending(false)
  }, [])

  const openCreate = useCallback(() => {
    setCreateName("")
    setDialog("create")
  }, [])

  const openRename = useCallback((project: MockProject) => {
    setRenameTarget(project)
    setRenameName(project.name)
    setDialog("rename")
  }, [])

  const openDelete = useCallback((project: MockProject) => {
    setDeleteTarget(project)
    setDialog("delete")
  }, [])

  const createSlugPreview = useMemo(
    () => slugifyProjectName(createName),
    [createName]
  )

  const submitCreate = useCallback(() => {
    const name = createName.trim()
    if (!name || !isValidProjectNameForSlug(createName)) return
    setIsPending(true)
    try {
      onCreateProject(name, slugifyProjectName(name))
      closeDialog()
    } finally {
      setIsPending(false)
    }
  }, [createName, onCreateProject, closeDialog])

  const submitRename = useCallback(() => {
    if (!renameTarget) return
    const name = renameName.trim()
    if (!name || !isValidProjectNameForSlug(renameName)) return
    setIsPending(true)
    try {
      onRenameProject(renameTarget.id, name, slugifyProjectName(name))
      closeDialog()
    } finally {
      setIsPending(false)
    }
  }, [renameTarget, renameName, onRenameProject, closeDialog])

  const submitDelete = useCallback(() => {
    if (!deleteTarget) return
    setIsPending(true)
    try {
      onDeleteProject(deleteTarget.id)
      closeDialog()
    } finally {
      setIsPending(false)
    }
  }, [deleteTarget, onDeleteProject, closeDialog])

  return {
    dialog,
    renameTarget,
    deleteTarget,
    createName,
    setCreateName,
    renameName,
    setRenameName,
    createSlugPreview,
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

export type UseProjectDialogsReturn = ReturnType<typeof useProjectDialogs>
