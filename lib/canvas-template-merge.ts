import type { CanvasTemplate } from "@/components/editor/starter-templates"
import {
  CANVAS_SHAPE_DEFAULT_SIZE,
  type CanvasEdge,
  type CanvasNode,
} from "@/types/canvas"

/** Vertical gap (flow px) between existing diagram bottom and imported template top. */
export const CANVAS_TEMPLATE_IMPORT_GAP_Y = 96

function nodeFootprint(n: CanvasNode): { w: number; h: number } {
  const { shape } = n.data
  return {
    w: n.width ?? CANVAS_SHAPE_DEFAULT_SIZE[shape].width,
    h: n.height ?? CANVAS_SHAPE_DEFAULT_SIZE[shape].height,
  }
}

function boundsOfNodes(nodes: CanvasNode[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const n of nodes) {
    const { w, h } = nodeFootprint(n)
    minX = Math.min(minX, n.position.x)
    minY = Math.min(minY, n.position.y)
    maxX = Math.max(maxX, n.position.x + w)
    maxY = Math.max(maxY, n.position.y + h)
  }
  return { minX, minY, maxX, maxY }
}

/**
 * Copies template nodes/edges with fresh ids (avoids collisions) and translates
 * the template so its bounding box sits below `existingNodes` (or at origin if empty).
 */
export function buildTemplateImportGraphMergedBelow(
  template: CanvasTemplate,
  existingNodes: CanvasNode[],
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const idMap = new Map<string, string>()

  let offsetX = 0
  let offsetY = 0
  if (existingNodes.length > 0 && template.nodes.length > 0) {
    const ex = boundsOfNodes(existingNodes)
    const tn = boundsOfNodes(template.nodes)
    offsetX = ex.minX - tn.minX
    offsetY = ex.maxY + CANVAS_TEMPLATE_IMPORT_GAP_Y - tn.minY
  }

  const nodes: CanvasNode[] = template.nodes.map((n) => {
    const newId = `tpl-${n.data.shape}-${crypto.randomUUID()}`
    idMap.set(n.id, newId)
    return {
      ...n,
      id: newId,
      position: {
        x: n.position.x + offsetX,
        y: n.position.y + offsetY,
      },
      selected: false,
    }
  })

  const edges: CanvasEdge[] = template.edges.map((e) => {
    const source = idMap.get(e.source)
    const target = idMap.get(e.target)
    return {
      ...e,
      id: `tpl-edge-${crypto.randomUUID()}`,
      source: source ?? e.source,
      target: target ?? e.target,
      selected: false,
    }
  })

  return { nodes, edges }
}
