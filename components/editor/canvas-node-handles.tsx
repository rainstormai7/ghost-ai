"use client"

import { Handle, Position, useConnection } from "@xyflow/react"

import { cn } from "@/lib/utils"

/**
 * Cardinal connection anchors. Subtle white dots with a dark border; hidden
 * until the node is hovered or while a connection drag is in progress.
 */
export function CanvasNodeHandles() {
  const connection = useConnection()
  const wiring = connection.inProgress === true

  const dot = cn(
    "!z-20 !h-[10px] !w-[10px] !min-h-[10px] !min-w-[10px] !rounded-full",
    "!border !border-[var(--border-default)] !bg-[var(--text-primary)]",
    "transition-[opacity,transform] duration-150 ease-out group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100",
    "pointer-events-none opacity-0 scale-95",
    wiring && "!pointer-events-auto !opacity-100 !scale-100",
    "hover:scale-110",
  )

  return (
    <>
      <Handle type="target" position={Position.Top} id="in-top" className={dot} />
      <Handle type="source" position={Position.Top} id="out-top" className={dot} />

      <Handle type="target" position={Position.Right} id="in-right" className={dot} />
      <Handle type="source" position={Position.Right} id="out-right" className={dot} />

      <Handle type="target" position={Position.Bottom} id="in-bottom" className={dot} />
      <Handle type="source" position={Position.Bottom} id="out-bottom" className={dot} />

      <Handle type="target" position={Position.Left} id="in-left" className={dot} />
      <Handle type="source" position={Position.Left} id="out-left" className={dot} />
    </>
  )
}
