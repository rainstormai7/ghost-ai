"use client"

import { memo, type CSSProperties } from "react"

import { cn } from "@/lib/utils"
import { NODE_COLORS, type CanvasNodeColorFill } from "@/types/canvas"

export const CanvasNodeColorToolbar = memo(function CanvasNodeColorToolbar({
  currentFill,
  onSelectFill,
}: {
  currentFill: CanvasNodeColorFill
  onSelectFill: (fill: CanvasNodeColorFill) => void
}) {
  return (
    <div
      role="toolbar"
      aria-label="Node colors"
      className={cn(
        "nodrag nopan nowheel pointer-events-auto",
        "absolute left-1/2 z-50 mb-2 flex -translate-x-1/2 items-center gap-1",
        "bottom-full rounded-full border border-surface-border-subtle bg-elevated px-2 py-1.5 shadow-lg",
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map((pair) => {
        const active = pair.fill === currentFill
        return (
          <button
            key={pair.fill}
            type="button"
            aria-pressed={active}
            aria-label={`Set node colors (${pair.label} accent)`}
            className={cn(
              "relative size-6 shrink-0 rounded-full border border-[color-mix(in_oklab,var(--border-default)_55%,transparent)]",
              "transition-[box-shadow,transform] duration-150",
              "hover:[box-shadow:0_0_6px_1px_var(--swatch-label)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-elevated",
              active &&
                "ring-2 ring-(--swatch-label) ring-offset-2 ring-offset-elevated",
            )}
            style={
              {
                backgroundColor: pair.fill,
                "--swatch-label": pair.label,
              } as CSSProperties & { "--swatch-label": string }
            }
            onClick={() => onSelectFill(pair.fill)}
            onPointerDown={(e) => e.stopPropagation()}
          />
        )
      })}
    </div>
  )
})
