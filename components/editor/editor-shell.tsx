"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { Button } from "@/components/ui/button"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { EditorProject } from "@/lib/editor-project"

interface EditorShellProps {
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
  activeProjectId: string | null
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
  activeProjectId,
}: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const actions = useProjectActions()

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null
    return (
      [...ownedProjects, ...sharedProjects].find(
        (p) => p.id === activeProjectId,
      ) ?? null
    )
  }, [ownedProjects, sharedProjects, activeProjectId])

  return (
    <div className="relative h-screen bg-base overflow-hidden">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        onNewProject={actions.openCreate}
        onRenameProject={actions.openRename}
        onDeleteProject={actions.openDelete}
      />
      <ProjectDialogs dialogs={actions} />

      <main className="flex h-full flex-col items-center justify-center px-4 pt-12">
        {activeProjectId ? (
          <div className="flex max-w-md flex-col items-center gap-2 text-center">
            <h1 className="font-heading text-xl font-medium text-copy-primary">
              {activeProject?.name ?? "Project"}
            </h1>
            <p className="font-mono text-xs text-copy-muted">{activeProjectId}</p>
            <p className="text-sm text-copy-muted">
              Canvas workspace will load here.
            </p>
          </div>
        ) : (
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-xl font-medium text-copy-primary">
              Create a project or open an existing one
            </h1>
            <p className="text-sm text-copy-muted">
              Start a new architecture workspace, or choose a project from the
              sidebar.
            </p>
            <Button
              type="button"
              className="gap-2"
              onClick={actions.openCreate}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
