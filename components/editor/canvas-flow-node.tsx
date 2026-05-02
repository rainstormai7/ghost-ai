"use client"

import { memo } from "react"
import type { NodeProps } from "@xyflow/react"

import { cn } from "@/lib/utils"
import type { CanvasNode } from "@/types/canvas"
import { canvasLabelColorForFill } from "@/types/canvas"

export const CanvasFlowNode = memo(function CanvasFlowNode({
  id,
  data,
  selected,
}: NodeProps<CanvasNode>) {
  return (
    <div
      data-nodeid={id}
      data-shape={data.shape}
      className={cn(
        "flex size-full items-center justify-center rounded-xl border px-3 py-2",
        selected && "shadow-[inset_0_0_0_2px_var(--color-brand)]",
      )}
      style={{
        backgroundColor: data.color,
        borderColor: "var(--border-default)",
        color: canvasLabelColorForFill(data.color),
      }}
    >
      <span className="truncate text-center text-sm">{data.label || "\u00a0"}</span>
    </div>
  )
})
