"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { Button } from "@/components/ui/button"
import { useProjectDialogs } from "@/hooks/use-project-dialogs"
import { INITIAL_MOCK_PROJECTS, type MockProject } from "@/lib/mock-projects"

export default function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [projects, setProjects] = useState<MockProject[]>(INITIAL_MOCK_PROJECTS)

  const dialogs = useProjectDialogs({
    onCreateProject: (name, slug) => {
      setProjects((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name, slug, isOwner: true },
      ])
    },
    onRenameProject: (projectId, name, slug) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, name, slug } : p))
      )
    },
    onDeleteProject: (projectId) => {
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    },
  })

  const ownedProjects = useMemo(
    () => projects.filter((p) => p.isOwner),
    [projects]
  )
  const sharedProjects = useMemo(
    () => projects.filter((p) => !p.isOwner),
    [projects]
  )

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
        onNewProject={dialogs.openCreate}
        onRenameProject={dialogs.openRename}
        onDeleteProject={dialogs.openDelete}
      />
      <ProjectDialogs dialogs={dialogs} />

      <main className="flex h-full flex-col items-center justify-center px-4 pt-12">
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
            onClick={dialogs.openCreate}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </main>
    </div>
  )
}
