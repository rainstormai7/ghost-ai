"use client"

import Link from "next/link"
import { Pencil, Plus, Trash2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { EditorProject } from "@/lib/editor-project"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ProjectSidebarLayout = "overlay" | "island" | "floating"

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
  /**
   * `overlay` — full-height edge drawer (editor home).
   * `island` — rounded in-flow panel with gutters (legacy workspace column).
   * `floating` — fixed overlay on the canvas below the navbar (full-bleed workspace).
   */
  layout?: ProjectSidebarLayout
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
  layout = "overlay",
}: ProjectSidebarProps) {
  const isIsland = layout === "island"
  const isFloating = layout === "floating"

  /** Closed drawer/panel stays mounted (slide/hidden) — remove from a11y tree and block hit targets. */
  const suppressInteraction =
    (layout === "overlay" && !isOpen) ||
    (layout === "floating" && !isOpen) ||
    (layout === "island" && !isOpen)

  const panel = (
    <div
      aria-hidden={suppressInteraction ? true : undefined}
      className={cn(
        "flex w-full flex-col overflow-hidden bg-surface",
        suppressInteraction && "pointer-events-none",
        isIsland || isFloating
          ? cn(
              "h-full min-h-0 max-h-full rounded-2xl border border-surface-border",
              isFloating ? "shadow-xl" : "shadow-sm",
            )
          : cn(
              "fixed top-0 left-0 z-40 h-full w-72 max-w-[min(18rem,calc(100vw-1.5rem))] border-r border-surface-border transition-transform duration-300 ease-in-out md:max-w-none",
              isOpen ? "translate-x-0" : "-translate-x-full",
            ),
      )}
      {...(suppressInteraction ? ({ inert: true } as const) : {})}
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

        <div className="flex flex-1 flex-col overflow-hidden px-3 pt-2 pb-3">
          <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1 flex-col gap-0">
            <TabsList className="h-auto min-h-10 w-full shrink-0 gap-1 rounded-xl border border-surface-border bg-subtle p-1 text-copy-muted shadow-none">
              <TabsTrigger
                value="my-projects"
                className={cn(
                  "min-h-9 flex-1 rounded-lg border-transparent py-2 text-sm font-medium shadow-none",
                  "bg-transparent text-copy-muted ring-0 outline-none after:hidden",
                  "hover:text-copy-secondary",
                  "data-active:border-transparent data-active:bg-base! data-active:text-copy-primary!",
                  "dark:data-active:bg-base! dark:data-active:text-copy-primary!",
                )}
              >
                My Projects
              </TabsTrigger>
              <TabsTrigger
                value="shared"
                className={cn(
                  "min-h-9 flex-1 rounded-lg border-transparent py-2 text-sm font-medium shadow-none",
                  "bg-transparent text-copy-muted ring-0 outline-none after:hidden",
                  "hover:text-copy-secondary",
                  "data-active:border-transparent data-active:bg-base! data-active:text-copy-primary!",
                  "dark:data-active:bg-base! dark:data-active:text-copy-primary!",
                )}
              >
                Shared
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="my-projects"
              className="mt-2 min-h-0 flex-1 data-[state=inactive]:hidden"
            >
              {ownedProjects.length === 0 ? (
                <p className="py-8 text-center text-sm text-copy-muted">
                  No projects yet
                </p>
              ) : (
                <ScrollArea
                  className={cn(
                    isIsland || isFloating
                      ? "min-h-0 flex-1"
                      : "h-full max-h-[calc(100vh-220px)]",
                  )}
                >
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
              className="mt-2 min-h-0 flex-1 data-[state=inactive]:hidden"
            >
              {sharedProjects.length === 0 ? (
                <p className="py-8 text-center text-sm text-copy-muted">
                  No shared projects
                </p>
              ) : (
                <ScrollArea
                  className={cn(
                    isIsland || isFloating
                      ? "min-h-0 flex-1"
                      : "h-full max-h-[calc(100vh-220px)]",
                  )}
                >
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
  )

  if (isFloating) {
    return (
      <>
        {isOpen ? (
          <button
            type="button"
            aria-label="Dismiss projects panel"
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] md:hidden"
            onClick={onClose}
          />
        ) : null}
        <div
          className={cn(
            "fixed z-40 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col md:w-72",
            "top-17 bottom-3 left-3",
            !isOpen && "hidden",
          )}
        >
          {panel}
        </div>
      </>
    )
  }

  if (isIsland) {
    return (
      <div
        className={cn(
          "flex min-h-0 w-full shrink-0 flex-col md:h-full md:w-72",
          !isOpen && "hidden",
        )}
      >
        {panel}
      </div>
    )
  }

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
      {panel}
    </>
  )
}
