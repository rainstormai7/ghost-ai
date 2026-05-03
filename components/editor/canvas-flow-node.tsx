"use client"

import { memo } from "react"
import type { CSSProperties } from "react"
import type { NodeProps } from "@xyflow/react"

import { cn } from "@/lib/utils"
import type { CanvasNode } from "@/types/canvas"
import { canvasLabelColorForFill, type NodeShape } from "@/types/canvas"

const SELECTED_RING =
  "shadow-[inset_0_0_0_2px_var(--color-brand)]" as const

function shapeChrome(shape: NodeShape): {
  className: string
  clipStyle?: CSSProperties
} {
  switch (shape) {
    case "rectangle":
      return { className: "rounded-xl border px-3 py-2" }
    case "circle":
      return { className: "rounded-full border px-3 py-2" }
    case "pill":
      return { className: "rounded-full border px-4 py-2" }
    case "diamond":
      return {
        className: "border px-3 py-2",
        clipStyle: {
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
        },
      }
    case "hexagon":
      return {
        className: "border px-2 py-2",
        clipStyle: {
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        },
      }
    case "cylinder":
      return {
        className:
          "border px-3 py-2 rounded-t-[999px] rounded-b-xl border-b-[3px]",
      }
  }
}

export const CanvasFlowNode = memo(function CanvasFlowNode({
  id,
  data,
  selected,
}: NodeProps<CanvasNode>) {
  const { className: shapeClassName, clipStyle } = shapeChrome(data.shape)

  return (
    <div
      data-nodeid={id}
      data-shape={data.shape}
      className={cn(
        "flex size-full items-center justify-center",
        shapeClassName,
        selected && SELECTED_RING,
      )}
      style={{
        backgroundColor: data.color,
        borderColor: "var(--border-default)",
        color: canvasLabelColorForFill(data.color),
        ...clipStyle,
      }}
    >
      <span className="truncate text-center text-sm">{data.label || "\u00a0"}</span>
    </div>
  )
})
