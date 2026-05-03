"use client"

import type { RefObject } from "react"
import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

const ZOOM_ANIM_MS = 250

function isEventFromEditableField(event: KeyboardEvent): boolean {
  const path = event.composedPath()
  for (const node of path) {
    if (!(node instanceof Element)) continue
    const tag = node.tagName
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true
    if (node instanceof HTMLElement && node.isContentEditable) return true
  }
  return false
}

export function useKeyboardShortcuts(
  flowRef: RefObject<ReactFlowInstance<CanvasNode, CanvasEdge> | null>,
  {
    onUndo,
    onRedo,
    canUndo,
    canRedo,
  }: {
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
  },
): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEventFromEditableField(event)) return

      const rf = flowRef.current
      const mod = event.metaKey || event.ctrlKey
      const key = event.key

      if (mod && key.toLowerCase() === "z") {
        if (event.shiftKey) {
          if (!canRedo) return
          event.preventDefault()
          onRedo()
          return
        }
        if (!canUndo) return
        event.preventDefault()
        onUndo()
        return
      }

      if (mod && key.toLowerCase() === "y") {
        if (!canRedo) return
        event.preventDefault()
        onRedo()
        return
      }

      if (mod || event.altKey) return

      if (key === "+" || key === "=") {
        if (!rf?.viewportInitialized) return
        event.preventDefault()
        void rf.zoomIn({ duration: ZOOM_ANIM_MS })
        return
      }

      if (key === "-") {
        if (!rf?.viewportInitialized) return
        event.preventDefault()
        void rf.zoomOut({ duration: ZOOM_ANIM_MS })
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [flowRef, onUndo, onRedo, canUndo, canRedo])
}
