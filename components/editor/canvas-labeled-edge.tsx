"use client"

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react"
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react"

import {
  CANVAS_NODE_LABEL_PLACEHOLDER,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas"
import { cn } from "@/lib/utils"

export const CanvasLabeledEdge = memo(function CanvasLabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>()
  const saved = data?.label ?? ""
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(saved)
  const inputRef = useRef<HTMLInputElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [inputWidth, setInputWidth] = useState(48)

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  })

  const bright = selected || hovered

  useEffect(() => {
    if (!editing) setDraft(saved)
  }, [saved, editing])

  useEffect(() => {
    if (!editing) return
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editing])

  useLayoutEffect(() => {
    if (!editing) return
    const el = measureRef.current
    if (!el) return
    setInputWidth(Math.max(40, el.offsetWidth + 12))
  }, [editing, draft])

  const commit = useCallback(() => {
    const trimmedLabel = draft.trim()
    updateEdgeData(id, { label: trimmedLabel })
    setEditing(false)
  }, [draft, id, updateEdgeData])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault()
        commit()
      }
    },
    [commit],
  )

  const onPathDoubleClick = useCallback((event: MouseEvent<SVGPathElement>) => {
    event.stopPropagation()
    setEditing(true)
  }, [])

  const showHint =
    (selected || hovered) && !saved.trim() && !editing

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="var(--text-primary)"
        strokeOpacity={0}
        strokeWidth={28}
        className="react-flow__edge-interaction"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={onPathDoubleClick}
      />
      <path
        id={id}
        d={edgePath}
        fill="none"
        markerEnd={markerEnd}
        className="react-flow__edge-path"
        style={{
          stroke: "var(--text-primary)",
          strokeWidth: 1.35,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          opacity: bright ? 1 : 0.38,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className={cn("nodrag nopan", !editing && "pointer-events-none")}
        >
          {editing ? (
            <div className="relative inline-flex justify-center">
              <span
                ref={measureRef}
                className={cn(
                  "invisible absolute left-0 whitespace-pre",
                  "px-2 py-0.5 text-xs font-medium",
                )}
                aria-hidden
              >
                {draft || "\u00a0"}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={commit}
                onKeyDown={onKeyDown}
                onPointerDown={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
                className={cn(
                  "nodrag nopan nowheel",
                  "m-0 box-border rounded-full border border-surface-border",
                  "bg-elevated px-2 py-0.5 text-center text-xs text-copy-primary",
                  "outline-none ring-0 focus-visible:ring-2 focus-visible:ring-(--accent-primary)/40",
                )}
                style={{ width: inputWidth }}
                placeholder={CANVAS_NODE_LABEL_PLACEHOLDER}
                aria-label="Edge label"
              />
            </div>
          ) : saved.trim() ? (
            <span
              className={cn(
                "inline-block max-w-56 truncate rounded-full border border-surface-border-subtle",
                "bg-subtle px-2 py-0.5 text-center text-xs text-copy-secondary",
              )}
            >
              {saved}
            </span>
          ) : showHint ? (
            <span className="whitespace-nowrap text-[0.7rem] text-copy-faint">
              {CANVAS_NODE_LABEL_PLACEHOLDER}
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
})
