"use client"

import type { DragEventHandler } from "react"
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  Pill,
  Square,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  CANVAS_SHAPE_DEFAULT_SIZE,
  CANVAS_SHAPE_DRAG_MIME,
  type NodeShape,
} from "@/types/canvas"

const SHAPE_ITEMS: {
  shape: NodeShape
  label: string
  Icon: typeof Square
}[] = [
  { shape: "rectangle", label: "Rectangle", Icon: Square },
  { shape: "diamond", label: "Diamond", Icon: Diamond },
  { shape: "circle", label: "Circle", Icon: Circle },
  { shape: "pill", label: "Pill", Icon: Pill },
  { shape: "cylinder", label: "Cylinder", Icon: Cylinder },
  { shape: "hexagon", label: "Hexagon", Icon: Hexagon },
]

function ToolbarShapeSlot({
  shape,
  iconLabel,
  Icon,
}: {
  shape: NodeShape
  iconLabel: string
  Icon: typeof Square
}) {
  const dims = CANVAS_SHAPE_DEFAULT_SIZE[shape]

  const onDragStart: DragEventHandler<HTMLButtonElement> = (event) => {
    const payload = JSON.stringify({
      shape,
      width: dims.width,
      height: dims.height,
    })
    event.dataTransfer.setData(CANVAS_SHAPE_DRAG_MIME, payload)
    event.dataTransfer.effectAllowed = "copy"
  }

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      aria-label={`Drag ${iconLabel} onto canvas`}
      title={`${iconLabel} — drag onto canvas`}
      className={cn(
        "nodrag nopan group flex size-[31.5px] shrink-0 cursor-grab flex-col items-center justify-center rounded-lg border-2 md:size-[33.75px]",
        "border-surface-border-subtle bg-base/80 backdrop-blur-sm",
        "text-copy-muted transition-[color,background-color,border-color,box-shadow] duration-150 ease-out",
        "hover:z-10 hover:border-brand hover:bg-brand/22 hover:text-brand",
        "hover:shadow-[0_0_0_1px_oklch(0_0_0/0),0_0_18px_-4px_var(--accent-primary),0_4px_12px_-6px_var(--accent-primary)]",
        "focus-visible:border-brand focus-visible:bg-brand/15 focus-visible:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45",
        "active:cursor-grabbing active:border-brand active:bg-brand/30 active:text-base",
      )}
    >
      <Icon
        className="h-[15.75px] w-[15.75px] shrink-0 stroke-[1.3125] transition-colors md:h-[1.040625rem] md:w-[1.040625rem]"
        aria-hidden
      />
    </button>
  )
}

export function EditorCanvasShapeToolbar({
  className,
}: {
  className?: string
}) {
  return (
    <nav
      aria-label="Shape palette"
      className={cn(
        "inline-flex items-center gap-3.75 rounded-[999px] border-2 border-surface-border bg-elevated/95 px-[11.25px] py-1.5 shadow-lg backdrop-blur-md md:gap-5.25 md:px-[15.75px] md:py-2.25",
        className,
      )}
    >
      {SHAPE_ITEMS.map(({ shape, label, Icon }) => (
        <ToolbarShapeSlot key={shape} shape={shape} iconLabel={label} Icon={Icon} />
      ))}
    </nav>
  )
}
