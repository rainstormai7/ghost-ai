"use client"

import Link from "next/link"
import { Pencil, Plus, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { EditorProject } from "@/lib/editor-project"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
  /** Highlights the open workspace row when set. */
  activeProjectId?: string | null
  onNewProject: () => void
  onRenameProject: (project: EditorProject) => void
  onDeleteProject: (project: EditorProject) => void
}

function ProjectListRow({
  project,
  activeProjectId,
  onRename,
  onDelete,
}: {
  project: EditorProject
  activeProjectId?: string | null
  onRename: (project: EditorProject) => void
  onDelete: (project: EditorProject) => void
}) {
  const isActive = activeProjectId === project.id

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg py-1.5 pr-1 pl-2",
        isActive
          ? "bg-brand/10 ring-1 ring-brand/20"
          : "hover:bg-elevated"
      )}
    >
      {/* Active dot indicator */}
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full transition-opacity",
          isActive ? "bg-brand opacity-100" : "opacity-0"
        )}
      />
      <Link
        href={`/editor/${project.id}`}
        className="min-w-0 flex-1 truncate text-left text-sm text-copy-primary hover:underline"
      >
        {project.name}
      </Link>
      {project.isOwner ? (
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-copy-muted hover:text-copy-primary"
            aria-label={`Rename ${project.name}`}
            onClick={() => onRename(project)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-copy-muted hover:text-destructive"
            aria-label={`Delete ${project.name}`}
            onClick={() => onDelete(project)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  activeProjectId = null,
  onNewProject,
  onRenameProject,
  onDeleteProject,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
        />
      ) : null}

      <div
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-surface-border bg-surface transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <span className="text-sm font-semibold text-copy-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden px-3 py-3">
          <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="w-full shrink-0">
              <TabsTrigger value="my-projects" className="flex-1">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="flex-1">
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="my-projects"
              className="mt-3 min-h-0 flex-1 data-[state=inactive]:hidden"
            >
              {ownedProjects.length === 0 ? (
                <p className="py-8 text-center text-sm text-copy-muted">
                  No projects yet
                </p>
              ) : (
                <ScrollArea className="h-full max-h-[calc(100vh-220px)]">
                  <div className="flex flex-col gap-0.5 pr-2 pb-2">
                    {ownedProjects.map((project) => (
                      <ProjectListRow
                        key={project.id}
                        project={project}
                        activeProjectId={activeProjectId}
                        onRename={onRenameProject}
                        onDelete={onDeleteProject}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent
              value="shared"
              className="mt-3 min-h-0 flex-1 data-[state=inactive]:hidden"
            >
              {sharedProjects.length === 0 ? (
                <p className="py-8 text-center text-sm text-copy-muted">
                  No shared projects
                </p>
              ) : (
                <ScrollArea className="h-full max-h-[calc(100vh-220px)]">
                  <div className="flex flex-col gap-0.5 pr-2 pb-2">
                    {sharedProjects.map((project) => (
                      <ProjectListRow
                        key={project.id}
                        project={project}
                        activeProjectId={activeProjectId}
                        onRename={onRenameProject}
                        onDelete={onDeleteProject}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t border-surface-border px-3 py-3">
          <Button
            type="button"
            className="w-full gap-2 bg-brand text-base hover:bg-brand/85 focus-visible:ring-brand/40"
            onClick={onNewProject}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>
    </>
  )
}
