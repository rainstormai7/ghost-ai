"use client"

import "@/liveblocks.config"
import "@liveblocks/react-flow/styles.css"
import "@xyflow/react/dist/style.css"

import { useCallback, useRef, useState, type DragEventHandler, type ReactNode } from "react"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  Panel,
  ReactFlow,
  type EdgeTypes,
  type NodeTypes,
  type ReactFlowInstance,
  SmoothStepEdge,
} from "@xyflow/react"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from "@liveblocks/react/suspense"
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow"

import { CanvasFlowNode } from "@/components/editor/canvas-flow-node"
import { EditorCanvasShapeToolbar } from "@/components/editor/editor-canvas-shape-toolbar"
import {
  CANVAS_SHAPE_DRAG_MIME,
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  parseCanvasShapeDragJson,
} from "@/types/canvas"

const canvasEdgeTypes: EdgeTypes = {
  canvasEdge: SmoothStepEdge,
}

const canvasNodeTypes = {
  canvasNode: CanvasFlowNode,
} satisfies NodeTypes

const defaultCanvasNodeFill = NODE_COLORS[0].fill

function LiveCanvasConnectionErrors({
  children,
}: {
  children: (error: { title: string; detail: string } | null) => ReactNode
}) {
  const [connectionError, setConnectionError] = useState<{
    title: string
    detail: string
  } | null>(null)

  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") {
      const { code } = error.context
      const messages: Record<number, { title: string; detail: string }> = {
        [-1]: {
          title: "Authentication failed",
          detail: "Could not sign in to the collaboration session. Try refreshing.",
        },
        4001: {
          title: "No access to this room",
          detail: "You may not have permission for this project.",
        },
        4005: {
          title: "Room is full",
          detail: "Too many collaborators are connected right now.",
        },
        4006: {
          title: "Room changed",
          detail: "The collaboration room was updated. Try reloading the page.",
        },
      }
      setConnectionError(
        messages[code] ?? {
          title: "Connection issue",
          detail: "Liveblocks could not connect. Check your network and try again.",
        },
      )
    }
  })

  return <>{children(connectionError)}</>
}

function EditorFlowSurface({
  minimapRightRailInset,
}: {
  minimapRightRailInset?: string | null
}) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
  } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
    nodes: { initial: [] },
    edges: { initial: [] },
  })

  const flowRef = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)
  const droppedNodeSeq = useRef(0)

  const handleDragOver: DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = "copy"
    },
    [],
  )

  const handleDrop: DragEventHandler<HTMLDivElement> = useCallback((event) => {
    event.preventDefault()
    const rf = flowRef.current
    if (!rf?.viewportInitialized) return
    const payload = parseCanvasShapeDragJson(
      event.dataTransfer.getData(CANVAS_SHAPE_DRAG_MIME),
    )
    if (!payload) return
    const p = rf.screenToFlowPosition({ x: event.clientX, y: event.clientY })
    const id = `${payload.shape}-${Date.now()}-${++droppedNodeSeq.current}`
    rf.addNodes([
      {
        id,
        type: "canvasNode",
        position: {
          x: p.x - payload.width / 2,
          y: p.y - payload.height / 2,
        },
        data: {
          label: "",
          color: defaultCanvasNodeFill,
          shape: payload.shape,
        },
        width: payload.width,
        height: payload.height,
      },
    ])
  }, [])

  return (
    <ReactFlow<CanvasNode, CanvasEdge>
      nodes={nodes}
      edges={edges}
      nodeTypes={canvasNodeTypes}
      edgeTypes={canvasEdgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onInit={(inst) => {
        flowRef.current = inst
      }}
      connectionMode={ConnectionMode.Loose}
      deleteKeyCode={["Backspace", "Delete"]}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      colorMode="dark"
      defaultEdgeOptions={{ type: "canvasEdge" }}
      className="bg-surface"
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="var(--text-faint)"
        bgColor="var(--bg-surface)"
      />
      <MiniMap
        position="bottom-right"
        className="rounded-2xl! border! border-surface-border! shadow-lg!"
        ariaLabel="Diagram overview map"
        style={
          minimapRightRailInset
            ? { marginRight: minimapRightRailInset }
            : undefined
        }
        bgColor="var(--bg-elevated)"
        nodeColor={() => "var(--text-muted)"}
        maskColor="color-mix(in oklab, var(--bg-base) 45%, transparent)"
        maskStrokeColor="var(--border-subtle)"
        pannable
        zoomable
      />
      <Panel position="bottom-center" className="mb-14">
        <EditorCanvasShapeToolbar />
      </Panel>
      <Cursors />
    </ReactFlow>
  )
}

function CanvasLoadingFallback() {
  return (
    <div
      className="flex size-full flex-col items-center justify-center gap-3 bg-base text-copy-muted"
      role="status"
      aria-busy="true"
      aria-label="Loading collaborative canvas"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-surface-border border-t-brand" />
      <p className="text-sm">Connecting canvas…</p>
    </div>
  )
}

function EditorCollaborativeCanvasInner({
  renderError,
  minimapRightRailInset,
}: {
  renderError: (payload: { title: string; detail: string }) => ReactNode
  minimapRightRailInset?: string | null
}) {
  return (
    <LiveCanvasConnectionErrors>
      {(liveblocksError) =>
        liveblocksError ? (
          renderError(liveblocksError)
        ) : (
          <ClientSideSuspense fallback={<CanvasLoadingFallback />}>
            <EditorFlowSurface
              minimapRightRailInset={minimapRightRailInset}
            />
          </ClientSideSuspense>
        )
      }
    </LiveCanvasConnectionErrors>
  )
}

export interface EditorCollaborativeCanvasProps {
  roomId: string
  /**
   * When floating UI overlaps the viewport’s bottom-right (e.g. AI rail), inset
   * the MiniMap with this CSS distance so it stays visible (stacking-context
   * rules keep it under `z-fixed` overlays otherwise).
   */
  minimapRightRailInset?: string | null
}

export function EditorCollaborativeCanvas({
  roomId,
  minimapRightRailInset,
}: EditorCollaborativeCanvasProps) {
  const renderConnectionError = useCallback(
    (payload: { title: string; detail: string }) => (
      <div
        role="alert"
        className="flex size-full flex-col items-center justify-center gap-4 bg-base px-8 text-center"
      >
        <p className="text-lg font-semibold text-copy-primary">{payload.title}</p>
        <p className="max-w-sm text-sm text-copy-muted">{payload.detail}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl border border-surface-border bg-elevated px-4 py-2 text-sm font-medium text-copy-primary transition hover:border-brand/40 hover:text-brand"
        >
          Reload page
        </button>
      </div>
    ),
    [],
  )

  return (
    <div className="relative size-full min-h-0">
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
          <EditorCollaborativeCanvasInner
            minimapRightRailInset={minimapRightRailInset}
            renderError={renderConnectionError}
          />
        </RoomProvider>
      </LiveblocksProvider>
    </div>
  )
}
