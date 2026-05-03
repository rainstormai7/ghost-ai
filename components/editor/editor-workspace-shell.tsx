"use client"

import { useMemo, useRef, useState } from "react"
import { Bot, Sparkles } from "lucide-react"

import { EditorCollaborativeCanvas } from "@/components/editor/editor-collaborative-canvas"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { cn } from "@/lib/utils"
import type { EditorProject } from "@/lib/editor-project"
import { useProjectActions } from "@/hooks/use-project-actions"

/** Aligns floating panels with editor home gutters (navbar row + `p-3`). */
const WORKSPACE_FLOAT_TOP = "[top:calc(3.5rem+0.75rem)]"

/**
 * MiniMap inset when AI rail open: mirrors `aside` width
 * (`min(18rem, 100vw - 1.5rem)`) + `right-3` + gap (stacking keeps map under fixed UI).
 */
const AI_RAIL_MINIMAP_CLEARANCE =
  "calc(min(18rem, 100vw - 1.5rem) + 0.75rem + 0.75rem)"

interface EditorWorkspaceShellProps {
  ownedProjects: EditorProject[]
  sharedProjects: EditorProject[]
  roomId: string
  projectName: string
}

export function EditorWorkspaceShell({
  ownedProjects,
  sharedProjects,
  roomId,
  projectName,
}: EditorWorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [starterTemplatesOpen, setStarterTemplatesOpen] = useState(false)
  const importFlowRef = useRef<
    ((template: CanvasTemplate) => Promise<boolean>) | null
  >(null)
  const actions = useProjectActions()

  const activeProject = useMemo(() => {
    const owned = ownedProjects.find((p) => p.id === roomId)
    if (owned) return owned
    return sharedProjects.find((p) => p.id === roomId) ?? null
  }, [ownedProjects, sharedProjects, roomId])

  const title = activeProject?.name ?? projectName

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        projectName={title}
        workspaceSubtitle="Workspace"
        isAiSidebarOpen={isAiPanelOpen}
        onAiSidebarToggle={() => setIsAiPanelOpen((prev) => !prev)}
        onShareClick={() => setShareDialogOpen(true)}
        onStarterTemplatesClick={() => setStarterTemplatesOpen(true)}
      />
      <StarterTemplatesModal
        open={starterTemplatesOpen}
        onOpenChange={setStarterTemplatesOpen}
        templates={CANVAS_TEMPLATES}
        onImport={async (template) => {
          const handler = importFlowRef.current
          if (handler) {
            return await handler(template)
          }
          return false
        }}
      />
      <ProjectDialogs dialogs={actions} />
      <ShareDialog
        projectId={roomId}
        isOwner={activeProject?.isOwner ?? false}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />

      {/* Full-bleed canvas: edge-to-edge below the navbar; sidebars stack above. */}
      <section
        className="fixed inset-x-0 top-14 bottom-0 z-0 overflow-hidden bg-surface"
        aria-label="Canvas workspace"
      >
        <EditorCollaborativeCanvas
          roomId={roomId}
          importFlowRef={importFlowRef}
          minimapRightRailInset={
            isAiPanelOpen ? AI_RAIL_MINIMAP_CLEARANCE : undefined
          }
        />
      </section>

      <ProjectSidebar
        layout="floating"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeProjectId={roomId}
        onNewProject={actions.openCreate}
        onRenameProject={actions.openRename}
        onDeleteProject={actions.openDelete}
      />

      {isAiPanelOpen ? (
        <aside
          className={cn(
            "fixed z-40 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-xl md:w-72",
            WORKSPACE_FLOAT_TOP,
            "bottom-3 right-3",
          )}
          aria-label="AI Copilot"
        >
          <div className="flex items-start justify-between border-b border-surface-border px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-copy-primary">
                AI Copilot
              </p>
              <p className="mt-0.5 text-xs text-copy-muted">
                Placeholder panel
              </p>
            </div>
            <Sparkles className="h-4 w-4 shrink-0 text-ai-text" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-3">
            <div className="shrink-0">
              <div className="rounded-2xl border border-surface-border bg-elevated p-4">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-ai/15">
                  <Bot className="h-4 w-4 text-ai-text" />
                </div>
                <p className="text-sm font-medium text-copy-primary">
                  Chat surface pending
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-copy-muted">
                  This pane is wired. Messaging and generation are intentionally
                  out of scope here.
                </p>
              </div>
            </div>

            <div aria-hidden className="min-h-16 flex-1" />

            <div className="shrink-0">
              <div className="rounded-2xl border border-surface-border-subtle bg-subtle p-4 shadow-sm">
                <p className="mb-2 text-[0.7rem] font-semibold tracking-[0.14em] text-copy-muted uppercase">
                  Future hooks
                </p>
                <p className="text-xs leading-relaxed text-copy-secondary">
                  Prompt composer, run status, and architecture guidance will
                  attach to this sidebar.
                </p>
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
