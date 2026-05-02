"use client"

import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { UseProjectActionsReturn } from "@/hooks/use-project-actions"
import {
  filterProjectNameInput,
  isValidProjectNameForSlug,
} from "@/lib/project-slug"

interface ProjectDialogsProps {
  dialogs: UseProjectActionsReturn
}

export function ProjectDialogs({ dialogs }: ProjectDialogsProps) {
  const {
    dialog,
    renameTarget,
    deleteTarget,
    createName,
    setCreateName,
    renameName,
    setRenameName,
    roomIdPreview,
    isPending,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  } = dialogs

  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (dialog !== "rename") return
    const id = window.requestAnimationFrame(() => {
      const el = renameInputRef.current
      if (!el) return
      el.focus()
      el.select()
    })
    return () => window.cancelAnimationFrame(id)
  }, [dialog])

  const createValid = isValidProjectNameForSlug(createName)
  const renameValid = isValidProjectNameForSlug(renameName)
  const createShowSlugHint =
    createName.trim().length > 0 && !createValid
  const renameShowSlugHint =
    renameName.trim().length > 0 && !renameValid

  return (
    <>
      <Dialog
        open={dialog === "create"}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Choose a name. You can change it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <label
                htmlFor="project-create-name"
                className="text-xs font-medium text-copy-secondary"
              >
                Project name
              </label>
              <Input
                id="project-create-name"
                value={createName}
                onChange={(e) =>
                  setCreateName(filterProjectNameInput(e.target.value))
                }
                placeholder="My architecture workspace"
                autoComplete="off"
                aria-invalid={createShowSlugHint}
                aria-describedby={
                  createShowSlugHint ? "project-create-hint" : undefined
                }
              />
            </div>
            {createShowSlugHint ? (
              <p
                id="project-create-hint"
                className="text-xs text-error"
                role="alert"
              >
                Use at least one letter or number. Symbols alone can&apos;t form a
                project URL.
              </p>
            ) : null}
            <p className="text-xs text-copy-secondary">
              <span className="font-medium text-copy-primary">Room ID preview:</span>{" "}
              {roomIdPreview ? (
                <span className="font-mono text-foreground">{roomIdPreview}</span>
              ) : (
                <span className="text-copy-muted">—</span>
              )}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitCreate}
              disabled={!createValid || isPending}
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog === "rename" && renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Current project name:{" "}
              <span className="font-medium text-foreground">
                {renameTarget?.name ?? ""}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <label
              htmlFor="project-rename-name"
              className="text-xs font-medium text-copy-secondary"
            >
              New name
            </label>
            <Input
              ref={renameInputRef}
              id="project-rename-name"
              value={renameName}
              onChange={(e) =>
                setRenameName(filterProjectNameInput(e.target.value))
              }
              onKeyDown={(e) => {
                if (e.key !== "Enter") return
                if (!renameValid || isPending) return
                e.preventDefault()
                submitRename()
              }}
              autoComplete="off"
              aria-invalid={renameShowSlugHint}
              aria-describedby={
                renameShowSlugHint ? "project-rename-hint" : undefined
              }
            />
            {renameShowSlugHint ? (
              <p
                id="project-rename-hint"
                className="text-xs text-error"
                role="alert"
              >
                Use at least one letter or number. Symbols alone can&apos;t form a
                project URL.
              </p>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitRename}
              disabled={!renameValid || isPending}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialog === "delete" && deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              This will remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name ?? ""}
              </span>{" "}
              from your workspace. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={submitDelete}
              disabled={isPending}
            >
              Delete project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
