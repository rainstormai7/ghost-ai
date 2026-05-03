"use client"

import type { RefObject } from "react"
import { useCallback } from "react"
import type { ReactFlowInstance } from "@xyflow/react"
import { Expand, Minus, Plus, Redo2, Undo2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { CanvasEdge, CanvasNode } from "@/types/canvas"

const ZOOM_ANIM_MS = 250

export interface EditorCanvasViewToolbarProps {
  flowRef: RefObject<ReactFlowInstance<CanvasNode, CanvasEdge> | null>
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export function EditorCanvasViewToolbar({
  flowRef,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorCanvasViewToolbarProps) {
  const handleZoomIn = useCallback(() => {
    const rf = flowRef.current
    if (!rf?.viewportInitialized) return
    void rf.zoomIn({ duration: ZOOM_ANIM_MS })
  }, [flowRef])

  const handleZoomOut = useCallback(() => {
    const rf = flowRef.current
    if (!rf?.viewportInitialized) return
    void rf.zoomOut({ duration: ZOOM_ANIM_MS })
  }, [flowRef])

  const handleFitView = useCallback(() => {
    const rf = flowRef.current
    if (!rf?.viewportInitialized) return
    void rf.fitView({ padding: 0.2, duration: ZOOM_ANIM_MS })
  }, [flowRef])

  const iconClass =
    "h-[15px] w-[15px] shrink-0 stroke-[1.35] md:h-4 md:w-4"

  const btnClass = cn(
    "flex size-9 items-center justify-center rounded-full border border-transparent",
    "text-copy-secondary transition-colors",
    "hover:border-surface-border hover:bg-subtle hover:text-copy-primary",
    "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45",
    "disabled:pointer-events-none disabled:opacity-35",
  )

  return (
    <nav
      aria-label="Canvas view and history"
      className={cn(
        "inline-flex items-center gap-2 rounded-[999px] border-2 border-surface-border bg-elevated/95 px-2 py-1.5 shadow-lg backdrop-blur-md md:gap-2.5 md:px-2.5 md:py-2",
      )}
    >
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className={btnClass}
          aria-label="Zoom out"
          onClick={handleZoomOut}
        >
          <Minus className={iconClass} aria-hidden />
        </button>
        <button
          type="button"
          className={btnClass}
          aria-label="Fit view"
          onClick={handleFitView}
        >
          <Expand className={iconClass} aria-hidden />
        </button>
        <button
          type="button"
          className={btnClass}
          aria-label="Zoom in"
          onClick={handleZoomIn}
        >
          <Plus className={iconClass} aria-hidden />
        </button>
      </div>

      <div
        className="h-6 w-px shrink-0 bg-surface-border-subtle"
        aria-hidden
      />

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className={btnClass}
          aria-label="Undo"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <Undo2 className={iconClass} aria-hidden />
        </button>
        <button
          type="button"
          className={btnClass}
          aria-label="Redo"
          disabled={!canRedo}
          onClick={onRedo}
        >
          <Redo2 className={iconClass} aria-hidden />
        </button>
      </div>
    </nav>
  )
}
