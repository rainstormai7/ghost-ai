import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { cursorColorFromUserId, getLiveblocksNode } from "@/lib/liveblocks-node";
import {
  findAccessibleProjectForUser,
  getClerkProjectIdentity,
} from "@/lib/project-access";

function displayNameFromClerkUser(
  user: Awaited<ReturnType<typeof currentUser>>,
  fallbackUserId: string,
): string {
  if (!user) return fallbackUserId;
  const first = user.firstName?.trim() ?? "";
  const last = user.lastName?.trim() ?? "";
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) return combined;
  return fallbackUserId;
}

function avatarFromClerkUser(
  user: Awaited<ReturnType<typeof currentUser>>,
): string {
  return user?.imageUrl ?? "";
}

export async function POST(request: Request) {
  const identity = await getClerkProjectIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = identity;

  let roomId: string;
  try {
    const body = (await request.json()) as { room?: unknown };
    roomId = typeof body.room === "string" ? body.room : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!roomId) {
    return NextResponse.json({ error: "Missing room id" }, { status: 400 });
  }

  const project = await findAccessibleProjectForUser(roomId, identity);
  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let liveblocks;
  try {
    liveblocks = getLiveblocksNode();
  } catch {
    return NextResponse.json(
      { error: "Liveblocks is not configured" },
      { status: 500 },
    );
  }

  await liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: [],
  });

  const user = await currentUser();
  const name = displayNameFromClerkUser(user, userId);
  const avatar = avatarFromClerkUser(user);
  const cursorColor = cursorColorFromUserId(userId);

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name,
      avatar,
      cursorColor,
    },
  });

  session.allow(roomId, session.FULL_ACCESS);

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
