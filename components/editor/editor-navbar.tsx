"use client"

import {
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  /** When set, navbar shows workspace title and placeholder share / AI controls. */
  projectName?: string | null
  /** Shown under the project title on the workspace route (e.g. “Workspace”). */
  workspaceSubtitle?: string | null
  isAiSidebarOpen?: boolean
  onAiSidebarToggle?: () => void
  /** Opens the share dialog from the workspace toolbar. */
  onShareClick?: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  workspaceSubtitle,
  isAiSidebarOpen,
  onAiSidebarToggle,
  onShareClick,
}: EditorNavbarProps) {
  const isWorkspace = Boolean(projectName)

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center border-b border-surface-border bg-base px-3",
        isWorkspace && workspaceSubtitle
          ? "min-h-14 gap-2 py-2"
          : "h-12",
      )}
    >
      <div className="flex min-w-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
        {isWorkspace ? (
          <div className="min-w-0 px-2">
            <span className="block truncate text-sm font-semibold text-copy-primary">
              {projectName}
            </span>
            {workspaceSubtitle ? (
              <span className="mt-px block truncate text-xs font-normal tracking-normal normal-case text-copy-muted">
                {workspaceSubtitle}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {isWorkspace ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="default"
              aria-label="Share project"
              onClick={onShareClick}
              disabled={!onShareClick}
              className={cn(
                "h-9 gap-2 rounded-xl border border-surface-border bg-elevated px-3 text-copy-primary hover:bg-subtle hover:text-copy-primary",
                !onShareClick && "pointer-events-none opacity-50",
              )}
            >
              <Share2 className="h-4 w-4 shrink-0" />
              <span className="hidden text-sm font-medium sm:inline">
                Share
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={() => onAiSidebarToggle?.()}
              disabled={!onAiSidebarToggle}
              aria-label={
                isAiSidebarOpen ? "Hide AI Copilot" : "Show AI Copilot"
              }
              aria-pressed={isAiSidebarOpen}
              className={cn(
                "h-9 gap-2 rounded-xl border border-brand/30 bg-brand px-3 text-sm font-semibold text-base shadow-sm shadow-brand/10 hover:bg-brand/90",
                isAiSidebarOpen &&
                  "ring-2 ring-brand/40 ring-offset-2 ring-offset-base",
              )}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              AI
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  )
}
