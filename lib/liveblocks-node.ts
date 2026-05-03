import { Liveblocks } from "@liveblocks/node";

/** Cursor colors for remote presence; picked deterministically per user id. */
const CURSOR_COLOR_PALETTE = [
  "#E57373",
  "#F06292",
  "#BA68C8",
  "#9575CD",
  "#7986CB",
  "#64B5F6",
  "#4FC3F7",
  "#4DD0E1",
  "#4DB6AC",
  "#81C784",
  "#AED581",
  "#DCE775",
  "#FFD54F",
  "#FFB74D",
  "#FF8A65",
] as const;

function createLiveblocksClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  }
  return new Liveblocks({ secret });
}

const globalForLiveblocks = globalThis as typeof globalThis & {
  liveblocksNode?: Liveblocks;
};

function getLiveblocksNodeInstance(): Liveblocks {
  return (
    globalForLiveblocks.liveblocksNode ?? createLiveblocksClient()
  );
}

/**
 * Cached singleton for the Liveblocks server client (access tokens, rooms API).
 * In development the instance is reused via `globalThis` like Prisma.
 */
export function getLiveblocksNode(): Liveblocks {
  const client = getLiveblocksNodeInstance();
  if (process.env.NODE_ENV !== "production") {
    globalForLiveblocks.liveblocksNode = client;
  }
  return client;
}

/** Maps a stable user id to a consistent hex color from {@link CURSOR_COLOR_PALETTE}. */
export function cursorColorFromUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = Math.imul(31, hash) + userId.charCodeAt(i);
  }
  const idx = Math.abs(hash) % CURSOR_COLOR_PALETTE.length;
  return CURSOR_COLOR_PALETTE[idx]!;
}