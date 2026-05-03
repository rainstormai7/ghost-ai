"use client"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import {
  CANVAS_NODE_LABEL_PLACEHOLDER,
  type NodeShape,
} from "@/types/canvas"

const SVG_STROKE_REST = "var(--border-subtle)"
const SVG_STROKE_SELECTED = "var(--accent-primary)"

export interface CanvasNodeShapeVisualProps {
  shape: NodeShape
  fill: string
  label: string
  labelColor: string
  selected?: boolean
  /** Softer look for palette drag ghost */
  variant?: "node" | "ghost"
  /** Hide visible label while keeping layout (e.g. textarea overlay). */
  labelHidden?: boolean
  /** Centered hint when `label` is empty and `labelHidden` is false. */
  placeholderLabel?: string
}

/** Stroke width in viewBox units (~100); scales with node size via SVG. */
const SVG_STROKE = 2.25

/** Shared layout for label text: wrap inside node, stay centered, clip excess. */
const LABEL_TEXT_CLASS =
  "max-h-20 min-h-0 min-w-0 max-w-full flex-none overflow-hidden px-1 text-center text-sm leading-snug wrap-break-word [overflow-wrap:anywhere] hyphens-auto line-clamp-4"

/** Horizontal extent of label column vs widened cylinder body in viewBox (~rx/cx). */
const CYLINDER_LABEL_INSET_CLASS = "max-w-[70%] w-full"

/**
 * Typography inside the square label frame (`@container-[size]` on that frame).
 * `cqw` matches the frame side so font and max-height track resize.
 */
const CYLINDER_LABEL_TEXT_CLASS =
  "min-h-0 min-w-0 max-w-full flex-none overflow-hidden px-0 text-center leading-tight wrap-break-word [overflow-wrap:anywhere] hyphens-auto text-[clamp(0.5rem,10.5cqw,0.8125rem)] max-h-[40cqw]"

function CenteredNodeLabel({
  label,
  labelColor,
  labelHidden,
  placeholderLabel,
  variant = "default",
}: {
  label: string
  labelColor: string
  labelHidden?: boolean
  placeholderLabel?: string
  variant?: "default" | "cylinder"
}) {
  const textClass =
    variant === "cylinder" ? CYLINDER_LABEL_TEXT_CLASS : LABEL_TEXT_CLASS
  if (labelHidden) {
    return (
      <span
        className={cn("invisible select-none", textClass)}
        aria-hidden
      >
        {"\u00a0"}
      </span>
    )
  }
  if (!label) {
    if (placeholderLabel === undefined) {
      return (
        <span className={textClass}>
          {"\u00a0"}
        </span>
      )
    }
    return (
      <span
        className={cn(
          "text-copy-muted opacity-80",
          textClass,
          variant === "default" ? "line-clamp-2" : "line-clamp-3 max-h-[22cqw]",
        )}
      >
        {placeholderLabel}
      </span>
    )
  }
  return (
    <span className={textClass} style={{ color: labelColor }}>
      {label}
    </span>
  )
}

function SvgShapeShell({ children }: { children: ReactNode }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {children}
    </svg>
  )
}

/**
 * ViewBox aspect matches `CANVAS_SHAPE_DEFAULT_SIZE.cylinder` (132×120) so `meet` scales
 * into the node rect without letterboxing; geometry uses full width/height.
 */
const CYLINDER_VIEWBOX_W = 110
const CYLINDER_VIEWBOX_H = 100

/** Cylinder / DB icon wrapper: uniform scale so ellipses keep correct 3D proportions. */
function SvgCylinderShell({ children }: { children: ReactNode }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox={`0 0 ${CYLINDER_VIEWBOX_W} ${CYLINDER_VIEWBOX_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** 3D-style DB cylinder: fills the cylinder viewBox; all fills opaque. */
function CylinderDbSvg({
  fill,
  stroke,
  strokeWidth,
}: {
  fill: string
  stroke: string
  strokeWidth: number
}) {
  const cx = CYLINDER_VIEWBOX_W / 2
  const cyTop = 11
  const cyBot = CYLINDER_VIEWBOX_H - 11
  const rx = (CYLINDER_VIEWBOX_W - 16) / 2
  const ry = 9
  const xL = cx - rx
  const xR = cx + rx
  /** Top closes along the lower rim of the lid ellipse (not a horizontal chord through the cap). */
  const sidePath = `M ${xL} ${cyBot} A ${rx} ${ry} 0 0 1 ${xR} ${cyBot} L ${xR} ${cyTop} A ${rx} ${ry} 0 0 0 ${xL} ${cyTop} Z`
  /** Upper / “back” half of the bottom ellipse (completes the 3D rim with the body’s front arc). */
  const bottomBackArc = `M ${xL} ${cyBot} A ${rx} ${ry} 0 0 0 ${xR} ${cyBot}`

  return (
    <>
      <ellipse
        cx={cx}
        cy={cyBot}
        rx={rx}
        ry={ry}
        fill={fill}
      />
      <path
        d={sidePath}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d={bottomBackArc}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <ellipse
        cx={cx}
        cy={cyTop}
        rx={rx}
        ry={ry}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </>
  )
}

function CssShapeShell({
  className,
  selected,
  fill,
  labelColor,
  label,
  labelHidden,
  placeholderLabel,
  borderStyle,
}: {
  className?: string
  selected?: boolean
  fill: string
  labelColor: string
  label: string
  labelHidden?: boolean
  placeholderLabel?: string
  borderStyle: {
    rest: string
    selected: string
  }
}) {
  const borderColor = selected ? borderStyle.selected : borderStyle.rest
  return (
    <div
      className={cn(
        "flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden px-3 py-2",
        className,
      )}
      style={{
        backgroundColor: fill,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor,
        color: labelColor,
        boxShadow: selected
          ? "inset 0 0 0 1px var(--accent-primary)"
          : undefined,
      }}
    >
      <CenteredNodeLabel
        label={label}
        labelColor={labelColor}
        labelHidden={labelHidden}
        placeholderLabel={placeholderLabel}
      />
    </div>
  )
}

function renderShapeInner({
  shape,
  fill,
  label,
  labelColor,
  selected,
  labelHidden,
  placeholderLabel,
}: Omit<CanvasNodeShapeVisualProps, "variant">): ReactNode {
  const borderRest = "var(--border-subtle)"
  const borderSelected = "var(--accent-primary)"

  switch (shape) {
    case "rectangle":
      return (
        <CssShapeShell
          className="rounded-xl"
          selected={selected}
          fill={fill}
          labelColor={labelColor}
          label={label}
          labelHidden={labelHidden}
          placeholderLabel={placeholderLabel}
          borderStyle={{ rest: borderRest, selected: borderSelected }}
        />
      )
    case "pill":
      return (
        <CssShapeShell
          className="rounded-full px-4"
          selected={selected}
          fill={fill}
          labelColor={labelColor}
          label={label}
          labelHidden={labelHidden}
          placeholderLabel={placeholderLabel}
          borderStyle={{ rest: borderRest, selected: borderSelected }}
        />
      )
    case "circle":
      return (
        <CssShapeShell
          className="rounded-full"
          selected={selected}
          fill={fill}
          labelColor={labelColor}
          label={label}
          labelHidden={labelHidden}
          placeholderLabel={placeholderLabel}
          borderStyle={{ rest: borderRest, selected: borderSelected }}
        />
      )
    case "diamond": {
      const stroke = selected ? SVG_STROKE_SELECTED : SVG_STROKE_REST
      return (
        <div className="relative size-full min-h-0 min-w-0 overflow-hidden">
          <SvgShapeShell>
            <polygon
              points="50,3 97,50 50,97 3,50"
              fill={fill}
              stroke={stroke}
              strokeWidth={SVG_STROKE}
              strokeLinejoin="round"
            />
          </SvgShapeShell>
          <div className="relative z-1 flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden px-2">
            <CenteredNodeLabel
              label={label}
              labelColor={labelColor}
              labelHidden={labelHidden}
              placeholderLabel={placeholderLabel}
            />
          </div>
        </div>
      )
    }
    case "hexagon": {
      const stroke = selected ? SVG_STROKE_SELECTED : SVG_STROKE_REST
      return (
        <div className="relative size-full min-h-0 min-w-0 overflow-hidden">
          <SvgShapeShell>
            <polygon
              points="50,4 92,26 92,74 50,96 8,74 8,26"
              fill={fill}
              stroke={stroke}
              strokeWidth={SVG_STROKE}
              strokeLinejoin="round"
            />
          </SvgShapeShell>
          <div className="relative z-1 flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden px-2">
            <CenteredNodeLabel
              label={label}
              labelColor={labelColor}
              labelHidden={labelHidden}
              placeholderLabel={placeholderLabel}
            />
          </div>
        </div>
      )
    }
    case "cylinder": {
      const stroke = selected ? SVG_STROKE_SELECTED : SVG_STROKE_REST
      /** Match `meet` square; nested `@container-[size]` makes `cqw`/`cqh` == frame side for type ramp. */
      const CYLINDER_LABEL_FRAME =
        "flex h-[min(100cqw,100cqh)] w-[min(100cqw,100cqh)] min-h-0 min-w-0 shrink-0 items-center justify-center overflow-hidden px-1 @container-[size]"
      return (
        <div className="relative size-full min-h-0 min-w-0 overflow-hidden @container-[size]">
          <SvgCylinderShell>
            <CylinderDbSvg
              fill={fill}
              stroke={stroke}
              strokeWidth={SVG_STROKE}
            />
          </SvgCylinderShell>
          <div className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center overflow-hidden">
            <div className={CYLINDER_LABEL_FRAME}>
              <div
                className={cn(
                  "flex min-h-0 min-w-0 flex-col items-center justify-center",
                  CYLINDER_LABEL_INSET_CLASS,
                )}
              >
                <CenteredNodeLabel
                  label={label}
                  labelColor={labelColor}
                  labelHidden={labelHidden}
                  placeholderLabel={placeholderLabel}
                  variant="cylinder"
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
    default: {
      const _exhaustive: never = shape
      return _exhaustive
    }
  }
}

export function CanvasNodeShapeVisual({
  shape,
  fill,
  label,
  labelColor,
  selected = false,
  variant = "node",
  labelHidden = false,
  placeholderLabel,
}: CanvasNodeShapeVisualProps) {
  return (
    <div
      className={cn(
        "size-full min-h-0 min-w-0",
        variant === "ghost" && "opacity-[0.68]",
      )}
    >
      {renderShapeInner({
        shape,
        fill,
        label,
        labelColor,
        selected,
        labelHidden,
        placeholderLabel:
          variant === "ghost"
            ? undefined
            : (placeholderLabel ?? CANVAS_NODE_LABEL_PLACEHOLDER),
      })}
    </div>
  )
}
