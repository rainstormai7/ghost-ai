import type { ReactFlowInstance } from "@xyflow/react"

import type {
  CanvasEdge,
  CanvasNode,
  CanvasNodeColorFill,
  CanvasShapeDragPayload,
} from "@/types/canvas"

/**
 * Places a synced canvas node so that `screenPoint` lands at the shape center.
 * Matches drop-from-toolbar behaviour (ids + data shape).
 */
export function addCanvasShapeNodeAtScreenPoint(
  rf: ReactFlowInstance<CanvasNode, CanvasEdge>,
  screenPoint: { x: number; y: number },
  payload: CanvasShapeDragPayload,
  defaultFill: CanvasNodeColorFill,
): void {
  if (!rf.viewportInitialized) return
  const flowPos = rf.screenToFlowPosition(screenPoint)
  const id = `${payload.shape}-${crypto.randomUUID()}`
  rf.addNodes([
    {
      id,
      type: "canvasNode",
      position: {
        x: flowPos.x - payload.width / 2,
        y: flowPos.y - payload.height / 2,
      },
      data: {
        label: "",
        color: defaultFill,
        shape: payload.shape,
      },
      width: payload.width,
      height: payload.height,
    },
  ])
}
