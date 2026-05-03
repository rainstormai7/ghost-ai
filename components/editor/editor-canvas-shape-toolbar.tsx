"use client"

import { useCallback, useRef } from "react"
import type {
  DragEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react"
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
  type CanvasShapeDragPayload,
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

function canvasShapePickPayload(shape: NodeShape): CanvasShapeDragPayload {
  const { width, height } = CANVAS_SHAPE_DEFAULT_SIZE[shape]
  return { shape, width, height }
}

function ToolbarShapeSlot({
  shape,
  iconLabel,
  Icon,
  onInstantiateShape,
  onPaletteDragStart,
  onPaletteDragEnd,
}: {
  shape: NodeShape
  iconLabel: string
  Icon: typeof Square
  onInstantiateShape?: (payload: CanvasShapeDragPayload) => void
  onPaletteDragStart?: (
    payload: CanvasShapeDragPayload,
    clientX: number,
    clientY: number,
  ) => void
  onPaletteDragEnd?: () => void
}) {
  const keyboardDuplicateClickGuardRef = useRef(false)

  const pick = useCallback(() => {
    onInstantiateShape?.(canvasShapePickPayload(shape))
  }, [shape, onInstantiateShape])

  const onDragStart: DragEventHandler<HTMLButtonElement> = (event) => {
    const picked = canvasShapePickPayload(shape)
    event.dataTransfer.setData(CANVAS_SHAPE_DRAG_MIME, JSON.stringify(picked))
    event.dataTransfer.effectAllowed = "copy"
    onPaletteDragStart?.(picked, event.clientX, event.clientY)
  }

  const onDragEnd: DragEventHandler<HTMLButtonElement> = () => {
    onPaletteDragEnd?.()
  }

  const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation()
    if (keyboardDuplicateClickGuardRef.current) {
      keyboardDuplicateClickGuardRef.current = false
      return
    }
    pick()
  }

  const onKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    event.stopPropagation()
    keyboardDuplicateClickGuardRef.current = true
    pick()
    window.setTimeout(() => {
      keyboardDuplicateClickGuardRef.current = false
    }, 400)
  }

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onKeyDown={onKeyDown}
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

export interface EditorCanvasShapeToolbarProps {
  className?: string
  /** Adds a node without drag (click / keyboard); typically viewport-centered in flow space. */
  onInstantiateShape?: (payload: CanvasShapeDragPayload) => void
  /** Drag-from-palette lifecycle for ghost preview (screen coords). */
  onPaletteDragStart?: (
    payload: CanvasShapeDragPayload,
    clientX: number,
    clientY: number,
  ) => void
  onPaletteDragEnd?: () => void
}

export function EditorCanvasShapeToolbar({
  className,
  onInstantiateShape,
  onPaletteDragStart,
  onPaletteDragEnd,
}: EditorCanvasShapeToolbarProps) {
  return (
    <nav
      aria-label="Shape palette"
      className={cn(
        "inline-flex items-center gap-3.75 rounded-[999px] border-2 border-surface-border bg-elevated/95 px-[11.25px] py-1.5 shadow-lg backdrop-blur-md md:gap-5.25 md:px-[15.75px] md:py-2.25",
        className,
      )}
    >
      {SHAPE_ITEMS.map(({ shape, label, Icon }) => (
        <ToolbarShapeSlot
          key={shape}
          shape={shape}
          iconLabel={label}
          Icon={Icon}
          onInstantiateShape={onInstantiateShape}
          onPaletteDragStart={onPaletteDragStart}
          onPaletteDragEnd={onPaletteDragEnd}
        />
      ))}
    </nav>
  )
}
