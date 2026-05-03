"use client"

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react"
import type { NodeProps } from "@xyflow/react"
import { NodeResizer, useReactFlow } from "@xyflow/react"

import { CanvasNodeColorToolbar } from "@/components/editor/canvas-node-color-toolbar"
import { CanvasNodeHandles } from "@/components/editor/canvas-node-handles"
import { CanvasNodeShapeVisual } from "@/components/editor/canvas-node-shape-visual"
import {
  CANVAS_NODE_LABEL_PLACEHOLDER,
  CANVAS_NODE_MIN_SIZE,
  canvasLabelColorForFill,
  type CanvasNode,
  type CanvasNodeColorFill,
} from "@/types/canvas"
import { cn } from "@/lib/utils"

export const CanvasFlowNode = memo(function CanvasFlowNode({
  id,
  data,
  selected,
}: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode>()
  const [editingLabel, setEditingLabel] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const labelColor = canvasLabelColorForFill(data.color)

  useEffect(() => {
    if (!editingLabel) return
    const el = textareaRef.current
    if (!el) return
    el.focus()
    const len = el.value.length
    el.setSelectionRange(len, len)
  }, [editingLabel])

  const pushLabel = useCallback(
    (label: string) => {
      updateNodeData(id, { label })
    },
    [id, updateNodeData],
  )

  const onSelectFill = useCallback(
    (fill: CanvasNodeColorFill) => {
      updateNodeData(id, { color: fill })
    },
    [id, updateNodeData],
  )

  const startEditing = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setEditingLabel(true)
  }, [])

  const stopEditing = useCallback(() => {
    setEditingLabel(false)
  }, [])

  const onDraftChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      pushLabel(event.target.value)
    },
    [pushLabel],
  )

  const onDraftKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        stopEditing()
        textareaRef.current?.blur()
      }
    },
    [stopEditing],
  )

  return (
    <div
      data-nodeid={id}
      data-shape={data.shape}
      className="group relative flex size-full overflow-visible"
    >
      {selected ? (
        <CanvasNodeColorToolbar
          currentFill={data.color}
          onSelectFill={onSelectFill}
        />
      ) : null}
      <NodeResizer
        isVisible={selected}
        minWidth={CANVAS_NODE_MIN_SIZE.width}
        minHeight={CANVAS_NODE_MIN_SIZE.height}
        color="var(--border-subtle)"
        handleClassName={cn(
          "!h-2 !w-2 !min-h-2 !min-w-2 !rounded-[3px]",
          "!border !border-[var(--border-default)] !bg-[var(--bg-elevated)]",
          "!shadow-none",
        )}
        lineClassName="!border-[var(--border-subtle)]"
      />
      <div
        className="relative flex size-full min-h-0 min-w-0 overflow-hidden"
        onDoubleClick={startEditing}
      >
        <CanvasNodeShapeVisual
          shape={data.shape}
          fill={data.color}
          label={data.label}
          labelColor={labelColor}
          selected={selected}
          variant="node"
          labelHidden={editingLabel}
        />
        {editingLabel ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-15 flex items-center justify-center overflow-hidden",
              data.shape === "cylinder" && "@container-[size]",
            )}
          >
            <div
              className={cn(
                "flex min-h-0 min-w-0 items-center justify-center overflow-hidden",
                data.shape === "cylinder"
                  ? "h-[min(100cqw,100cqh)] w-[min(100cqw,100cqh)] shrink-0 px-1 @container-[size]"
                  : "w-full min-w-0 px-3 py-2",
              )}
            >
              <div
                className={cn(
                  data.shape === "cylinder"
                    ? "flex w-full max-w-[56%] min-w-0 justify-center"
                    : "w-full min-w-0",
                )}
              >
                <textarea
                  ref={textareaRef}
                  rows={2}
                  spellCheck={false}
                  className={cn(
                    "nodrag nopan nowheel pointer-events-auto",
                    "m-0 box-border min-h-lh w-full min-w-0 max-w-full shrink-0 resize-none",
                    "overflow-x-hidden overflow-y-auto",
                    "border-0 bg-transparent text-center wrap-break-word whitespace-pre-wrap",
                    "outline-none ring-0 focus:ring-0 focus-visible:ring-0",
                    data.shape === "cylinder"
                      ? "text-[clamp(0.5rem,10.5cqw,0.8125rem)] leading-tight max-h-[40cqw]"
                      : "text-sm leading-snug max-h-[min(100%,5rem)]",
                  )}
                style={{ color: labelColor }}
                value={data.label}
                placeholder={CANVAS_NODE_LABEL_PLACEHOLDER}
                onChange={onDraftChange}
                onBlur={stopEditing}
                onKeyDown={onDraftKeyDown}
                onPointerDown={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
                aria-label="Node label"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <CanvasNodeHandles />
    </div>
  )
})
