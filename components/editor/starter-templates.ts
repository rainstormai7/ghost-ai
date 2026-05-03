import { MarkerType } from "@xyflow/react"

import {
  CANVAS_SHAPE_DEFAULT_SIZE,
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeColorFill,
  type NodeShape,
} from "@/types/canvas"

/** Predefined canvas snapshot for starter import. */
export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

function paletteFill(index: number): CanvasNodeColorFill {
  return NODE_COLORS[index % NODE_COLORS.length].fill
}

/** Build a synced canvas node with default dimensions for its shape. */
export function templateNode(
  id: string,
  label: string,
  shape: NodeShape,
  position: { x: number; y: number },
  paletteIndex = 0,
): CanvasNode {
  const color = paletteFill(paletteIndex)
  const { width, height } = CANVAS_SHAPE_DEFAULT_SIZE[shape]
  return {
    id,
    type: "canvasNode",
    position,
    data: { label, color, shape },
    width,
    height,
  }
}

/** Canvas edge matching `handleConnect` defaults in the collaborative canvas. */
export function templateEdge(
  id: string,
  source: string,
  target: string,
  opts?: {
    sourceHandle?: string
    targetHandle?: string
    label?: string
  },
): CanvasEdge {
  return {
    id,
    type: "canvasEdge",
    source,
    target,
    sourceHandle: opts?.sourceHandle ?? "out-right",
    targetHandle: opts?.targetHandle ?? "in-left",
    data: { label: opts?.label ?? "" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: "var(--text-primary)",
    },
    style: {
      stroke: "var(--text-primary)",
      strokeWidth: 1.35,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
  }
}

const microservicesNodes: CanvasNode[] = [
  templateNode("ms-gw", "API Gateway", "hexagon", { x: 40, y: 160 }, 1),
  templateNode("ms-auth", "Auth service", "rectangle", { x: 320, y: 60 }, 2),
  templateNode("ms-users", "Users service", "rectangle", { x: 320, y: 200 }, 3),
  templateNode("ms-orders", "Orders service", "rectangle", { x: 320, y: 340 }, 4),
  templateNode("ms-db-users", "Users DB", "cylinder", { x: 600, y: 160 }, 5),
  templateNode("ms-db-orders", "Orders DB", "cylinder", { x: 600, y: 320 }, 6),
  templateNode("ms-queue", "Message queue", "pill", { x: 600, y: 0 }, 7),
]

const microservicesEdges: CanvasEdge[] = [
  templateEdge("e-ms-1", "ms-gw", "ms-auth"),
  templateEdge("e-ms-2", "ms-gw", "ms-users"),
  templateEdge("e-ms-3", "ms-gw", "ms-orders"),
  templateEdge("e-ms-4", "ms-users", "ms-db-users"),
  templateEdge("e-ms-5", "ms-orders", "ms-db-orders"),
  templateEdge("e-ms-6", "ms-orders", "ms-queue", {
    sourceHandle: "out-top",
    targetHandle: "in-bottom",
  }),
]

const cicdNodes: CanvasNode[] = [
  templateNode("cd-repo", "Source repo", "rectangle", { x: 40, y: 200 }, 0),
  templateNode("cd-build", "Build", "rectangle", { x: 280, y: 200 }, 1),
  templateNode("cd-test", "Test", "rectangle", { x: 520, y: 200 }, 2),
  templateNode("cd-stage", "Staging deploy", "diamond", { x: 760, y: 200 }, 3),
  templateNode("cd-prod", "Production", "circle", { x: 1000, y: 200 }, 6),
]

const cicdEdges: CanvasEdge[] = [
  templateEdge("e-cd-1", "cd-repo", "cd-build"),
  templateEdge("e-cd-2", "cd-build", "cd-test"),
  templateEdge("e-cd-3", "cd-test", "cd-stage"),
  templateEdge("e-cd-4", "cd-stage", "cd-prod"),
]

const eventDrivenNodes: CanvasNode[] = [
  templateNode("ev-producer", "Producer", "rectangle", { x: 40, y: 220 }, 2),
  templateNode("ev-bus", "Event bus", "hexagon", { x: 380, y: 220 }, 1),
  templateNode("ev-cons-a", "Consumer A", "rectangle", { x: 720, y: 80 }, 3),
  templateNode("ev-cons-b", "Consumer B", "rectangle", { x: 720, y: 220 }, 4),
  templateNode("ev-dlq", "Dead letter queue", "cylinder", { x: 720, y: 380 }, 5),
]

const eventDrivenEdges: CanvasEdge[] = [
  templateEdge("e-ev-1", "ev-producer", "ev-bus"),
  templateEdge("e-ev-2", "ev-bus", "ev-cons-a"),
  templateEdge("e-ev-3", "ev-bus", "ev-cons-b"),
  templateEdge("e-ev-4", "ev-bus", "ev-dlq", {
    sourceHandle: "out-bottom",
    targetHandle: "in-top",
  }),
]

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description:
      "API Gateway routes traffic to isolated services, each backed by a dedicated database and connected via a shared message bus.",
    nodes: microservicesNodes,
    edges: microservicesEdges,
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "End-to-end delivery from source commit through build, test, containerisation, and staged deployment to production.",
    nodes: cicdNodes,
    edges: cicdEdges,
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description:
      "Producers publish events to a central bus. Independent consumers handle emails, push notifications, analytics, and error queues.",
    nodes: eventDrivenNodes,
    edges: eventDrivenEdges,
  },
]
