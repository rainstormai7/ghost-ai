"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowDownToLine } from "lucide-react"

import { CanvasNodeShapeVisual } from "@/components/editor/canvas-node-shape-visual"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CANVAS_SHAPE_DEFAULT_SIZE,
  canvasLabelColorForFill,
  type CanvasNode,
} from "@/types/canvas"

const PREVIEW_PAD = 14
const FALLBACK_PREVIEW_W = 280

function nodeSize(n: CanvasNode): { w: number; h: number } {
  const shape = n.data.shape
  const w = n.width ?? CANVAS_SHAPE_DEFAULT_SIZE[shape].width
  const h = n.height ?? CANVAS_SHAPE_DEFAULT_SIZE[shape].height
  return { w, h }
}

function diagramBounds(nodes: CanvasNode[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const n of nodes) {
    const { w, h } = nodeSize(n)
    minX = Math.min(minX, n.position.x)
    minY = Math.min(minY, n.position.y)
    maxX = Math.max(maxX, n.position.x + w)
    maxY = Math.max(maxY, n.position.y + h)
  }
  if (!Number.isFinite(minX)) {
    return {
      minX: 0,
      minY: 0,
      maxX: FALLBACK_PREVIEW_W,
      maxY: 140,
      bw: 1,
      bh: 1,
    }
  }
  return { minX, minY, maxX, maxY, bw: maxX - minX, bh: maxY - minY }
}

function nodeCenterLocal(n: CanvasNode, minX: number, minY: number) {
  const { w, h } = nodeSize(n)
  return { x: n.position.x - minX + w / 2, y: n.position.y - minY + h / 2 }
}

function TemplateCardPreview({
  template,
  isVisible,
}: {
  template: CanvasTemplate
  isVisible: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [previewW, setPreviewW] = useState(FALLBACK_PREVIEW_W)

  useEffect(() => {
    if (!isVisible) return
    const el = containerRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const measure = () => {
      const w = el.getBoundingClientRect().width
      if (w > 0) setPreviewW(Math.floor(w))
    }
    measure()
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w > 0) setPreviewW(Math.floor(w))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [isVisible, template.id])

  const previewH = Math.max(120, Math.round(previewW * (140 / FALLBACK_PREVIEW_W)))

  const { minX, minY, bw, bh } = useMemo(
    () => diagramBounds(template.nodes),
    [template.nodes],
  )

  const layout = useMemo(() => {
    const innerW = previewW - 2 * PREVIEW_PAD
    const innerH = previewH - 2 * PREVIEW_PAD
    const scale = Math.min(
      innerW / bw,
      innerH / bh,
      bw > 0 && bh > 0 ? 1.35 : 1,
    )
    const ox = PREVIEW_PAD + (innerW - bw * scale) / 2
    const oy = PREVIEW_PAD + (innerH - bh * scale) / 2
    return { scale, ox, oy }
  }, [bw, bh, previewW, previewH])

  const nodeById = useMemo(
    () => new Map(template.nodes.map((n) => [n.id, n])),
    [template.nodes],
  )

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-white/8 bg-black"
      style={{ height: previewH }}
      aria-hidden
    >
      <div
        className="absolute overflow-visible"
        style={{
          left: layout.ox,
          top: layout.oy,
          width: bw * layout.scale,
          height: bh * layout.scale,
        }}
      >
        <div
          className="relative"
          style={{
            width: bw,
            height: bh,
            transform: `scale(${layout.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <svg
            width={bw}
            height={bh}
            className="pointer-events-none absolute inset-0 text-white/35"
          >
            <g>
              {template.edges.map((e) => {
                const s = nodeById.get(e.source)
                const t = nodeById.get(e.target)
                if (!s || !t) return null
                const p1 = nodeCenterLocal(s, minX, minY)
                const p2 = nodeCenterLocal(t, minX, minY)
                return (
                  <line
                    key={e.id}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="currentColor"
                    strokeWidth={1.35 / layout.scale}
                    strokeLinecap="round"
                  />
                )
              })}
            </g>
          </svg>
          {template.nodes.map((n) => {
            const { w, h } = nodeSize(n)
            return (
              <div
                key={n.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: n.position.x - minX,
                  top: n.position.y - minY,
                  width: w,
                  height: h,
                }}
              >
                <CanvasNodeShapeVisual
                  shape={n.data.shape}
                  fill={n.data.color}
                  label={n.data.label}
                  labelColor={canvasLabelColorForFill(n.data.color)}
                  variant="node"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: CanvasTemplate[]
  onImport: (template: CanvasTemplate) => Promise<boolean> | boolean | void
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  templates,
  onImport,
}: StarterTemplatesModalProps) {
  const handleImport = async (template: CanvasTemplate) => {
    const result = onImport(template)
    if (result instanceof Promise) {
      const success = await result
      if (success !== false) {
        onOpenChange(false)
      }
    } else if (result !== false) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(40rem,calc(100vh-2rem))] gap-0 border border-white/10 bg-[#121212] p-0 text-copy-primary shadow-2xl sm:max-w-[min(70rem,calc(100vw-2rem))]"
        showCloseButton
      >
        <DialogHeader className="border-b border-white/6 px-8 pt-8 pb-6">
          <DialogTitle className="text-lg font-semibold tracking-tight text-white">
            Import Template
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-3xl text-sm leading-relaxed text-white/55">
            Choose a starter template to add to your canvas. New shapes are
            placed below your current diagram, and the view zooms to fit
            them. Use{" "}
            <kbd className="rounded-md border border-white/15 bg-white/6 px-1.5 py-0.5 font-mono text-xs text-white/80">
              ⌘Z
            </kbd>{" "}
            /{" "}
            <kbd className="rounded-md border border-white/15 bg-white/6 px-1.5 py-0.5 font-mono text-xs text-white/80">
              Ctrl+Z
            </kbd>{" "}
            to undo.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-8 pt-7">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7">
            {templates.map((template) => (
              <article
                key={template.id}
                className="flex min-w-0 flex-col gap-5 rounded-2xl border border-white/8 bg-[#1a1a1a] p-5 transition-colors hover:border-white/12"
              >
                <TemplateCardPreview template={template} isVisible={open} />
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="font-semibold tracking-tight text-white">
                    {template.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-white/50">
                    {template.description}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-10 w-full gap-2 rounded-xl border-white/25 bg-transparent text-white shadow-none hover:border-white/40 hover:bg-white/4 hover:text-white"
                  onClick={() => handleImport(template)}
                >
                  <ArrowDownToLine
                    className="size-4 opacity-90"
                    strokeWidth={2}
                    aria-hidden
                  />
                  Import
                </Button>
              </article>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
