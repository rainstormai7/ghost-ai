"use client"

import "@/liveblocks.config"
import "@liveblocks/react-flow/styles.css"
import "@xyflow/react/dist/style.css"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEventHandler,
  type MutableRefObject,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
  type OnConnectEnd,
  type ReactFlowInstance,
} from "@xyflow/react"
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useCanRedo,
  useCanUndo,
  useErrorListener,
  useRedo,
  useUndo,
} from "@liveblocks/react/suspense"
import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow"

import { CanvasLabeledEdge } from "@/components/editor/canvas-labeled-edge"
import { CanvasNodeShapeVisual } from "@/components/editor/canvas-node-shape-visual"
import { CanvasFlowNode } from "@/components/editor/canvas-flow-node"
import { EditorCanvasShapeToolbar } from "@/components/editor/editor-canvas-shape-toolbar"
import { EditorCanvasViewToolbar } from "@/components/editor/editor-canvas-view-toolbar"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { trySnapConnectionOnPointerUp } from "@/lib/canvas-connection-snap"
import { addCanvasShapeNodeAtScreenPoint } from "@/lib/canvas-shape-placement"
import { buildTemplateImportGraphMergedBelow } from "@/lib/canvas-template-merge"
import {
  CANVAS_SHAPE_DRAG_MIME,
  NODE_COLORS,
  canvasLabelColorForFill,
  type CanvasEdge,
  type CanvasNode,
  type CanvasShapeDragPayload,
  parseCanvasShapeDragJson,
} from "@/types/canvas"

const canvasEdgeTypes: EdgeTypes = {
  canvasEdge: CanvasLabeledEdge,
}

const canvasNodeTypes = {
  canvasNode: CanvasFlowNode,
} satisfies NodeTypes

const defaultCanvasNodeFill = NODE_COLORS[0].fill
const TEMPLATE_FIT_MS = 250

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
  importFlowRef,
}: {
  minimapRightRailInset?: string | null
  importFlowRef?: MutableRefObject<
    ((template: CanvasTemplate) => Promise<boolean>) | null
  >
}) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect: liveblocksOnConnect,
    onDelete,
  } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
    nodes: { initial: [] },
    edges: { initial: [] },
  })

  /** Liveblocks stores edges via `addEdge(connection, [])`; merge RF defaults so `type` / markers apply. */
  const handleConnect = useCallback(
    (connection: Connection) => {
      liveblocksOnConnect({
        ...connection,
        type: "canvasEdge",
        data: { label: "" },
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
      } as Connection)
    },
    [liveblocksOnConnect],
  )

  const handleConnectEnd = useCallback<OnConnectEnd>(
    (event, connectionState) => {
      const rf = flowRef.current
      if (!rf?.viewportInitialized) return
      const snapped = trySnapConnectionOnPointerUp(
        rf,
        event,
        connectionState,
        ConnectionMode.Loose,
      )
      if (snapped) handleConnect(snapped)
    },
    [handleConnect],
  )

  const flowRef = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)

  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  useKeyboardShortcuts(flowRef, {
    onUndo: undo,
    onRedo: redo,
    canUndo,
    canRedo,
  })

  const [paletteDragPreview, setPaletteDragPreview] = useState<{
    payload: CanvasShapeDragPayload
    screenX: number
    screenY: number
    zoom: number
  } | null>(null)

  const paletteDragPreviewActive = paletteDragPreview !== null

  useEffect(() => {
    if (!paletteDragPreviewActive) return
    const onDocDragOver = (event: DragEvent) => {
      event.preventDefault()
      const zoom = flowRef.current?.getViewport().zoom ?? 1
      setPaletteDragPreview((prev) =>
        prev
          ? {
              ...prev,
              screenX: event.clientX,
              screenY: event.clientY,
              zoom,
            }
          : null,
      )
    }
    document.addEventListener("dragover", onDocDragOver)
    return () => document.removeEventListener("dragover", onDocDragOver)
  }, [paletteDragPreviewActive])

  const handlePaletteDragStart = useCallback(
    (payload: CanvasShapeDragPayload, clientX: number, clientY: number) => {
      const zoom = flowRef.current?.getViewport().zoom ?? 1
      setPaletteDragPreview({
        payload,
        screenX: clientX,
        screenY: clientY,
        zoom,
      })
    },
    [],
  )

  const handlePaletteDragEnd = useCallback(() => {
    setPaletteDragPreview(null)
  }, [])

  const instantiateShapeAtViewportCenter = useCallback(
    (payload: CanvasShapeDragPayload) => {
      const rf = flowRef.current
      if (!rf) return
      addCanvasShapeNodeAtScreenPoint(
        rf,
        { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        payload,
        defaultCanvasNodeFill,
      )
    },
    [],
  )

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
    addCanvasShapeNodeAtScreenPoint(
      rf,
      { x: event.clientX, y: event.clientY },
      payload,
      defaultCanvasNodeFill,
    )
  }, [])

  const importTemplate = useCallback(
    async (template: CanvasTemplate): Promise<boolean> => {
      if (template.nodes.length === 0) return false

      const { nodes: importedNodes, edges: importedEdges } =
        buildTemplateImportGraphMergedBelow(template, nodes)

      onNodesChange([
        ...nodes
          .filter((n) => n.selected)
          .map((n) => ({
            type: "select" as const,
            id: n.id,
            selected: false as const,
          })),
        ...importedNodes.map((item) => ({
          type: "add" as const,
          item,
        })),
      ])

      onEdgesChange([
        ...edges
          .filter((e) => e.selected)
          .map((e) => ({
            type: "select" as const,
            id: e.id,
            selected: false as const,
          })),
        ...importedEdges.map((item) => ({
          type: "add" as const,
          item,
        })),
      ])

      return new Promise<boolean>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const rf = flowRef.current
            if (rf?.viewportInitialized && importedNodes.length > 0) {
              void rf.fitView({
                nodes: importedNodes.map((n) => ({ id: n.id })),
                padding: 0.2,
                duration: TEMPLATE_FIT_MS,
              })
            }
            resolve(true)
          })
        })
      })
    },
    [nodes, edges, onNodesChange, onEdgesChange],
  )

  useEffect(() => {
    if (!importFlowRef) return
    importFlowRef.current = importTemplate
    return () => {
      importFlowRef.current = null
    }
  }, [importFlowRef, importTemplate])

  const paletteGhost =
    paletteDragPreview &&
    createPortal(
      <div
        className="pointer-events-none fixed z-10050"
        style={{
          left: paletteDragPreview.screenX,
          top: paletteDragPreview.screenY,
          width: paletteDragPreview.payload.width * paletteDragPreview.zoom,
          height: paletteDragPreview.payload.height * paletteDragPreview.zoom,
          transform: "translate(-50%, -50%)",
        }}
      >
        <CanvasNodeShapeVisual
          shape={paletteDragPreview.payload.shape}
          fill={defaultCanvasNodeFill}
          label=""
          labelColor={canvasLabelColorForFill(defaultCanvasNodeFill)}
          variant="ghost"
        />
      </div>,
      document.body,
    )

  return (
    <>
      {paletteGhost}
      <ReactFlow<CanvasNode, CanvasEdge>
      nodes={nodes}
      edges={edges}
      nodeTypes={canvasNodeTypes}
      edgeTypes={canvasEdgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      onConnectEnd={handleConnectEnd}
      onDelete={onDelete}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onInit={(inst) => {
        flowRef.current = inst
      }}
      connectionMode={ConnectionMode.Loose}
      connectionRadius={48}
      deleteKeyCode={["Backspace", "Delete"]}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      colorMode="dark"
      defaultEdgeOptions={{
        type: "canvasEdge",
        data: { label: "" },
      }}
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
      <Panel position="bottom-left" className="mb-14 ml-4">
        <EditorCanvasViewToolbar
          flowRef={flowRef}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
        />
      </Panel>
      <Panel position="bottom-center" className="mb-14">
        <EditorCanvasShapeToolbar
          onInstantiateShape={instantiateShapeAtViewportCenter}
          onPaletteDragStart={handlePaletteDragStart}
          onPaletteDragEnd={handlePaletteDragEnd}
        />
      </Panel>
      <Cursors />
      </ReactFlow>
    </>
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
  importFlowRef,
}: {
  renderError: (payload: { title: string; detail: string }) => ReactNode
  minimapRightRailInset?: string | null
  importFlowRef?: MutableRefObject<
    ((template: CanvasTemplate) => Promise<boolean>) | null
  >
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
              importFlowRef={importFlowRef}
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
  /**
   * Set by the parent; collaborative flow assigns an import handler that
   * replaces the room canvas with a starter template (clears nodes/edges first).
   */
  importFlowRef?: MutableRefObject<
    ((template: CanvasTemplate) => Promise<boolean>) | null
  >
}

export function EditorCollaborativeCanvas({
  roomId,
  minimapRightRailInset,
  importFlowRef,
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
            importFlowRef={importFlowRef}
            renderError={renderConnectionError}
          />
        </RoomProvider>
      </LiveblocksProvider>
    </div>
  )
}
