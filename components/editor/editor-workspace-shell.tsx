"use client"

import { useMemo, useState } from "react"
import { Bot, Compass, Sparkles } from "lucide-react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import type { EditorProject } from "@/lib/editor-project"
import { useProjectActions } from "@/hooks/use-project-actions"

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
  const actions = useProjectActions()

  const activeProject = useMemo(() => {
    const owned = ownedProjects.find((p) => p.id === roomId)
    if (owned) return owned
    return sharedProjects.find((p) => p.id === roomId) ?? null
  }, [ownedProjects, sharedProjects, roomId])

  const title = activeProject?.name ?? projectName

  return (
    <div className="relative h-screen overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((prev) => !prev)}
        projectName={title}
        isAiSidebarOpen={isAiPanelOpen}
        onAiSidebarToggle={() => setIsAiPanelOpen((prev) => !prev)}
        onShareClick={() => setShareDialogOpen(true)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
        activeProjectId={roomId}
        onNewProject={actions.openCreate}
        onRenameProject={actions.openRename}
        onDeleteProject={actions.openDelete}
      />
      <ProjectDialogs dialogs={actions} />
      <ShareDialog
        projectId={roomId}
        isOwner={activeProject?.isOwner ?? false}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />

      <div className="flex h-full min-h-0 flex-col pt-12">
        <div className="flex min-h-0 flex-1 flex-row">
          {/* ── Canvas placeholder ── */}
          <section
            className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden bg-base"
            aria-label="Canvas workspace"
          >
            {/* Radial ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="h-112 w-md rounded-full bg-brand/4 blur-3xl" />
              <div className="absolute h-48 w-48 rounded-full bg-brand/6 blur-2xl" />
            </div>

            <div className="relative flex flex-col items-center gap-4 px-6 text-center">
              {/* Icon bubble */}
              <div className="mb-2 flex h-15 w-15 items-center justify-center rounded-2xl border border-brand/20 bg-linear-to-br from-brand/20 via-brand/10 to-transparent shadow-lg shadow-brand/10">
                <Compass className="h-7 w-7 text-brand" strokeWidth={1.5} />
              </div>

              {/* Label */}
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.25em] text-copy-muted">
                Workspace Shell
              </p>

              {/* Heading */}
              <h1 className="max-w-md text-2xl font-semibold leading-snug text-copy-primary">
                Canvas and collaboration tooling land here next.
              </h1>

              {/* Description */}
              <p className="max-w-sm text-sm leading-relaxed text-copy-muted">
                This room is ready for the shared architecture canvas, durable AI
                workflows, and real-time presence. For now, the shell is wired
                with project context and navigation only.
              </p>
            </div>
          </section>

          {/* ── AI sidebar ── */}
          {isAiPanelOpen ? (
            <aside
              className="flex w-72 shrink-0 flex-col overflow-hidden border-l border-surface-border bg-surface"
              aria-label="AI Copilot"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-surface-border px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-copy-primary">
                    AI Copilot
                  </p>
                  <p className="mt-0.5 text-xs text-copy-muted">
                    Placeholder pane.
                  </p>
                </div>
                <Sparkles className="h-4 w-4 shrink-0 text-ai-text" />
              </div>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {/* Chat surface pending */}
                <div className="rounded-2xl border border-surface-border bg-elevated p-4">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-ai/15">
                    <Bot className="h-4 w-4 text-ai-text" />
                  </div>
                  <p className="text-sm font-medium text-copy-primary">
                    Chat surface pending
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-copy-muted">
                    This pane is wired. Messaging and generation are
                    intentionally out of scope here.
                  </p>
                </div>

                {/* Future hooks — dimmed placeholder */}
                <div className="rounded-2xl border border-surface-border/50 bg-elevated/40 p-4 opacity-50">
                  <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-copy-faint">
                    Future Hooks
                  </p>
                  <p className="text-xs leading-relaxed text-copy-faint">
                    Prompt composer, run status, and architecture guidance will
                    attach to this sidebar.
                  </p>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </div>
  )
}
