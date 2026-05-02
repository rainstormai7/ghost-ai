import type { LiveblocksFlow } from "@liveblocks/react-flow"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      isThinking: boolean
    }

    Storage: {
      /** Populated by `useLiveblocksFlow` (default key `flow`). */
      flow?: LiveblocksFlow<CanvasNode, CanvasEdge>
    }

    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        cursorColor: string
      }
    }

    RoomEvent: {}

    ThreadMetadata: {
      // For future comments / threads
    }

    RoomInfo: {
      // For resolveRoomsInfo when needed
    }
  }
}

export {}
