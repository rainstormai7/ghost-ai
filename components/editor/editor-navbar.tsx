"use client"

import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Share2,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  /** When set, navbar shows workspace title and placeholder share / AI controls. */
  projectName?: string | null
  isAiSidebarOpen?: boolean
  onAiSidebarToggle?: () => void
  /** Opens the share dialog from the workspace toolbar. */
  onShareClick?: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  isAiSidebarOpen,
  onAiSidebarToggle,
  onShareClick,
}: EditorNavbarProps) {
  const isWorkspace = Boolean(projectName)

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-12 items-center border-b border-surface-border bg-surface px-3">
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
          <span className="truncate px-2 text-sm font-medium text-copy-primary">
            {projectName}
          </span>
        ) : null}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {isWorkspace ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Share project"
              onClick={onShareClick}
              disabled={!onShareClick}
              className={
                onShareClick ? undefined : "text-copy-muted opacity-60"
              }
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onAiSidebarToggle}
              aria-label={
                isAiSidebarOpen ? "Hide AI sidebar" : "Show AI sidebar"
              }
              aria-pressed={isAiSidebarOpen}
            >
              {isAiSidebarOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  )
}
