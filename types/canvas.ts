import type { Edge, Node } from "@xyflow/react"

/**
 * Canonical node palettes (dark fill + label color). Mirrors `context/ui-context.md`.
 */
export const NODE_COLORS = [
  { fill: "#1F1F1F", label: "#EDEDED" },
  { fill: "#10233D", label: "#52A8FF" },
  { fill: "#2E1938", label: "#BF7AF0" },
  { fill: "#331B00", label: "#FF990A" },
  { fill: "#3C1618", label: "#FF6166" },
  { fill: "#3A1726", label: "#F75F8F" },
  { fill: "#0F2E18", label: "#62C073" },
  { fill: "#062822", label: "#0AC7B4" },
] as const

export type CanvasNodeColorFill = (typeof NODE_COLORS)[number]["fill"]

export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const

export type NodeShape = (typeof NODE_SHAPES)[number]

/** Drag-and-drop payloads from the canvas shape toolbar. See `CANVAS_SHAPE_DRAG_MIME`. */
export interface CanvasShapeDragPayload {
  shape: NodeShape
  width: number
  height: number
}

export const CANVAS_SHAPE_DRAG_MIME =
  "application/vnd.ghost-ai.canvas-shape+json" as const

/** Minimum node width/height when resizing (flow space, px). */
export const CANVAS_NODE_MIN_SIZE = {
  width: 72,
  height: 48,
} as const

/** Placeholder for empty node labels (display mode). */
export const CANVAS_NODE_LABEL_PLACEHOLDER = "Add label" as const

/** Default dimensions when a shape is dropped (flow space, px). */
export const CANVAS_SHAPE_DEFAULT_SIZE = {
  rectangle: { width: 192, height: 96 },
  diamond: { width: 156, height: 156 },
  circle: { width: 112, height: 112 },
  pill: { width: 208, height: 80 },
  /** Taller aspect reads as a classic vertical “database” cylinder on the canvas. */
  cylinder: { width: 132, height: 120 },
  hexagon: { width: 168, height: 112 },
} as const satisfies Record<NodeShape, { width: number; height: number }>

export function isNodeShape(value: unknown): value is NodeShape {
  return (
    typeof value === "string" &&
    (NODE_SHAPES as readonly string[]).includes(value as NodeShape)
  )
}

export function parseCanvasShapeDragJson(
  raw: string,
): CanvasShapeDragPayload | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    const rec = parsed as Record<string, unknown>
    const { shape, width, height } = rec
    if (!isNodeShape(shape)) return null
    if (typeof width !== "number" || typeof height !== "number") return null
    if (!Number.isFinite(width) || !Number.isFinite(height)) return null
    if (width <= 0 || height <= 0) return null
    return { shape, width, height }
  } catch {
    return null
  }
}

export function canvasLabelColorForFill(fill: CanvasNodeColorFill): string {
  const pair = NODE_COLORS.find((c) => c.fill === fill)
  return pair?.label ?? NODE_COLORS[0].label
}

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  /** Fill from NODE_COLORS */
  color: CanvasNodeColorFill
  shape: NodeShape
}

/** React Flow node type id for synced canvas nodes. */
export type CanvasNode = Node<CanvasNodeData, "canvasNode">

export interface CanvasEdgeData extends Record<string, unknown> {
  label: string
}

/** React Flow edge type id for synced canvas edges. */
export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">
