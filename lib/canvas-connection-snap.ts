import {
  type Connection,
  ConnectionMode,
  type FinalConnectionState,
  getHandlePosition,
  type Handle,
  type InternalNodeBase,
} from "@xyflow/system"

import type { ReactFlowInstance } from "@xyflow/react"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

/** Flow-space search radius when the pointer landed on a node (not necessarily on a handle). */
const SNAP_RADIUS_ON_NODE_FLOW = 140

/** Fallback radius when no node bbox contains the pointer. */
const SNAP_RADIUS_NEAR_FLOW = 72

function clientPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
  if ("clientX" in event) {
    return { x: event.clientX, y: event.clientY }
  }
  const t = event.changedTouches?.[0]
  return t ? { x: t.clientX, y: t.clientY } : { x: 0, y: 0 }
}

function sameHandle(
  a: { nodeId: string; id?: string | null; type: string },
  b: { nodeId: string; id?: string | null; type: string },
): boolean {
  return a.nodeId === b.nodeId && a.type === b.type && a.id === b.id
}

function handlePairAllowed(
  mode: ConnectionMode,
  fromType: "source" | "target",
  toType: "source" | "target",
): boolean {
  if (mode === ConnectionMode.Strict) {
    return fromType === "source" ? toType === "target" : toType === "source"
  }
  return true
}

function buildConnection(
  fromIsSource: boolean,
  fromNodeId: string,
  fromHandleId: string | null,
  h: { nodeId: string; id?: string | null },
): Connection {
  if (fromIsSource) {
    return {
      source: fromNodeId,
      sourceHandle: fromHandleId,
      target: h.nodeId,
      targetHandle: h.id ?? null,
    }
  }
  return {
    source: h.nodeId,
    sourceHandle: h.id ?? null,
    target: fromNodeId,
    targetHandle: fromHandleId,
  }
}

function iterHandles(internal: InternalNodeBase, _mode: ConnectionMode): Handle[] {
  const b = internal.internals.handleBounds
  if (!b) return []
  return [...(b.source ?? []), ...(b.target ?? [])]
}

/**
 * When a connection drag ends without a handle hit (e.g. handles use `pointer-events-none`),
 * snap to the nearest valid handle if the user released on / near a node.
 */
export function trySnapConnectionOnPointerUp(
  rf: ReactFlowInstance<CanvasNode, CanvasEdge>,
  event: MouseEvent | TouchEvent,
  connectionState: FinalConnectionState,
  mode: ConnectionMode,
  isValidConnection?: (connection: Connection) => boolean,
): Connection | null {
  if (connectionState.isValid === true) return null

  const fromNode = connectionState.fromNode
  const fromHandle = connectionState.fromHandle
  if (!fromNode || !fromHandle) return null

  const { x: clientX, y: clientY } = clientPoint(event)
  const p = rf.screenToFlowPosition({ x: clientX, y: clientY })

  const fromIsSource = fromHandle.type === "source"
  const fromNodeId = fromNode.id
  const fromHandleId = fromHandle.id ?? null

  const hitNodes = rf.getIntersectingNodes(
    { x: p.x, y: p.y, width: 4, height: 4 },
    true,
  )
  const preferIds = new Set(
    hitNodes.map((n) => n.id).filter((id) => id !== fromNodeId),
  )
  const snapLimit =
    preferIds.size > 0 ? SNAP_RADIUS_ON_NODE_FLOW : SNAP_RADIUS_NEAR_FLOW

  let best: { dist: number; conn: Connection } | null = null
  const validate = isValidConnection ?? (() => true)

  for (const n of rf.getNodes()) {
    if (n.id === fromNodeId) continue
    if (preferIds.size > 0 && !preferIds.has(n.id)) continue

    const internal = rf.getInternalNode(n.id) as InternalNodeBase | undefined
    if (!internal?.internals.handleBounds) continue

    for (const h of iterHandles(internal, mode)) {
      if (sameHandle(fromHandle, h)) continue
      if (!handlePairAllowed(mode, fromHandle.type, h.type)) continue

      const conn = buildConnection(fromIsSource, fromNodeId, fromHandleId, h)
      if (!validate(conn)) continue

      const pos = getHandlePosition(internal, h, h.position, true)
      const dist = Math.hypot(pos.x - p.x, pos.y - p.y)
      if (dist > snapLimit) continue

      if (!best || dist < best.dist) {
        best = { dist, conn }
      }
    }
  }

  if (!best && preferIds.size > 0) {
    for (const n of rf.getNodes()) {
      if (n.id === fromNodeId) continue

      const internal = rf.getInternalNode(n.id) as InternalNodeBase | undefined
      if (!internal?.internals.handleBounds) continue

      for (const h of iterHandles(internal, mode)) {
        if (sameHandle(fromHandle, h)) continue
        if (!handlePairAllowed(mode, fromHandle.type, h.type)) continue

        const conn = buildConnection(fromIsSource, fromNodeId, fromHandleId, h)
        if (!validate(conn)) continue

        const pos = getHandlePosition(internal, h, h.position, true)
        const dist = Math.hypot(pos.x - p.x, pos.y - p.y)
        if (dist > SNAP_RADIUS_NEAR_FLOW) continue

        if (!best || dist < best.dist) {
          best = { dist, conn }
        }
      }
    }
  }

  return best?.conn ?? null
}
