# UI Context

## Theme

Dark only. No light mode. The visual language is a dark technical workspace — near-black backgrounds, layered surfaces, and vivid accent colors for interactive elements.

All colors are defined as CSS custom properties in `globals.css` and mapped to Tailwind tokens via `@theme inline`. Components must use these tokens — no hardcoded hex values or raw Tailwind color classes like `zinc-*`.

| Role             | CSS Variable           | Hex / Value               |
| ---------------- | ---------------------- | ------------------------- |
| Page background  | `--bg-base`            | `#080809`                 |
| Surface          | `--bg-surface`         | `#111114`                 |
| Elevated surface | `--bg-elevated`        | `#18181c`                 |
| Subtle surface   | `--bg-subtle`          | `#1e1e23`                 |
| Default border   | `--border-default`     | `#2a2a30`                 |
| Subtle border    | `--border-subtle`      | `#3a3a42`                 |
| Primary text     | `--text-primary`       | `#f0f0f4`                 |
| Secondary text   | `--text-secondary`     | `#c0c0cc`                 |
| Muted text       | `--text-muted`         | `#808090`                 |
| Faint text       | `--text-faint`         | `#505060`                 |
| Brand accent     | `--accent-primary`     | `#00c8d4` (cyan)          |
| Brand dim        | `--accent-primary-dim` | `rgba(0, 200, 212, 0.12)` |
| AI accent        | `--accent-ai`          | `#6457f9` (indigo-purple) |
| AI text          | `--accent-ai-text`     | `#8b82ff`                 |
| Error            | `--state-error`        | `#ff4d4f`                 |
| Success          | `--state-success`      | `#34d399`                 |
| Warning          | `--state-warning`      | `#fbbf24`                 |

Tailwind utility names map to these variables. Use `bg-base`, `bg-surface`, `text-copy-primary`, `text-copy-muted`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.

## Typography

| Role      | Font       | CSS Variable        |
| --------- | ---------- | ------------------- |
| UI text   | Geist Sans | `--font-geist-sans` |
| Code/mono | Geist Mono | `--font-geist-mono` |

Both fonts are loaded via `next/font/google` and applied as CSS variables on the `<html>` element. The base `body` uses Geist Sans with `antialiased`.

## Border Radius

Radius increases with surface depth — smaller for inner elements, larger for outer containers.

| Context           | Class         |
| ----------------- | ------------- |
| Inline / small UI | `rounded-xl`  |
| Cards / panels    | `rounded-2xl` |
| Modal / overlay   | `rounded-3xl` |

## Canvas

### Node Color Palette

8 defined color pairs. Each pair specifies a dark node fill and a vivid contrasting text color tuned for readability on the dark canvas. Defined in `types/canvas.ts` as `NODE_COLORS`.

| Node fill | Text color | Character              |
| --------- | ---------- | ---------------------- |
| `#1F1F1F` | `#EDEDED`  | Neutral dark (default) |
| `#10233D` | `#52A8FF`  | Blue                   |
| `#2E1938` | `#BF7AF0`  | Purple                 |
| `#331B00` | `#FF990A`  | Orange                 |
| `#3C1618` | `#FF6166`  | Red                    |
| `#3A1726` | `#F75F8F`  | Pink                   |
| `#0F2E18` | `#62C073`  | Green                  |
| `#062822` | `#0AC7B4`  | Teal                   |

Default node color: `#1F1F1F` with `#EDEDED` text.

### Edge Style

Orthogonal smooth-step routing with rounded corners and a closed arrow at the target. At rest, edges use a dimmed stroke (`opacity` on the path); they brighten when hovered or selected. Hit area uses a wide invisible interaction stroke so edges are easy to pick without thickening the visible line. **Labels:** `CanvasLabeledEdge` — `getSmoothStepPath` supplies `labelX` / `labelY`; `EdgeLabelRenderer` positions a pill (saved text) or faint “Add label” hint when the edge is hovered/selected and empty. Double‑click the edge path opens a growing single-line `input` (`nodrag`, `nopan`, `nowheel`); blur, Enter, or Escape commits via `updateEdgeData` (Liveblocks flow).

### Node Shapes

6 supported shapes, defined in `types/canvas.ts` as `NODE_SHAPES`. Complex shapes (diamond, hexagon, cylinder) are rendered as inline SVGs rather than CSS borders.

- `rectangle` — default general-purpose node
- `diamond` — decision / gateway
- `circle` — event / endpoint
- `pill` — service / process
- `cylinder` — database / storage (**3D cylinder** in `CylinderDbSvg`: base disc, body, and lid drawn to fill the SVG viewBox with `meet` scaling so the silhouette matches the node bounds; **opaque** fills; selection via stroke color)
- `hexagon` — external system / boundary

### Connection Handles

Small white circular handles with a dark border at the four cardinal sides of each node (stacked source + target per side for loose mode). **Visibility:** hidden by default; they fade in on **node hover** (`group-hover` on the node wrapper) and stay fully visible while **any connection drag is in progress** so remote handles remain targets. Interaction uses XYFlow `Handle` components; edges sync through Liveblocks like nodes.

### Node Resize & Inline Label

**Resize:** When a node is selected, XYFlow `NodeResizer` shows subtle corner/edge controls (`--border-subtle` lines, small `--bg-elevated` handles). Minimum size is enforced in flow space (`CANVAS_NODE_MIN_SIZE` in `types/canvas.ts`); width/height changes go through the same node state path as drag placement.

**Label:** Double-click the node body to edit. An absolutely positioned textarea (classes `nodrag`, `nopan`, `nowheel`) sits over the centered label; typing calls `updateNodeData` for realtime sync. Empty display state uses muted “Add label” placeholder text; blur or `Escape` ends editing.

### View & history controls

Bottom-left pill (`EditorCanvasViewToolbar`, XYFlow `Panel`): zoom out, fit view, and zoom in (animated viewport changes via React Flow helpers); a thin vertical rule; undo and redo wired to Liveblocks history (`useUndo` / `useRedo` / `useCanUndo` / `useCanRedo`). Disabled undo/redo stay visually dimmed. Keyboard: `+` / `=` and `-` for zoom; `Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`, and `Cmd/Ctrl+Y` for undo/redo when focus is not in an editable field (`hooks/useKeyboardShortcuts`).

### Canvas Background

React Flow `<Background>` component. Canvas sits on the base background color.

## Component Library

shadcn/ui on top of Tailwind. No custom design system. Components live in `components/ui/`. Use the `shadcn` CLI to add new components rather than writing them from scratch.

## Layout Patterns

- Editor **project workspace** (`/editor/[roomId]`): page background is `bg-base` with **gutters** (`p-3`, `gap-3` between regions). **Three island panels** — Projects list, canvas, and AI Copilot — each use `rounded-2xl`, `border-surface-border`, `bg-surface`, and `shadow-sm`, and do not run edge-to-edge under the header.
- Editor **home** (`/editor`): projects sidebar remains a **slide-over overlay** from the left for quick navigation.
- Modals and dialogs: centered overlay, `rounded-3xl`, dark background with backdrop blur.
- Workspace **navbar**: project title (`font-semibold`); subtitle is **sentence case** “Workspace” (`text-xs`, `text-copy-muted`, `normal-case`, no wide tracking). **Share** is a filled control: `rounded-xl`, `border-surface-border`, `bg-elevated`, icon + “Share” label from `sm` up. **AI** is a teal `bg-brand`, `text-base` (near-black on accent), `Sparkles` + “AI” label; it toggles the AI panel (not a generic panel icon). Pressed state may use a subtle `ring-brand` focus.
- **Projects** tab strip: outer `rounded-xl` track `bg-subtle` + border; active tab uses **`bg-base`** pill with **`text-copy-primary`**; inactive tabs stay muted grey.

## Icons

Lucide React. Stroke-based icons only — no filled variants. Icon sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons, `h-8 w-8` for feature icons in empty states.
