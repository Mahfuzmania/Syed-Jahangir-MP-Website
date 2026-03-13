import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { appendChatMessage, getChatConversations, updateChatConversation } from "@/lib/storage";
import { ChatConversationStatus } from "@/lib/types";

const validStatuses: ChatConversationStatus[] = ["open", "in_review", "resolved"];

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusFilter = request.nextUrl.searchParams.get("status");
  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const conversations = await getChatConversations();

  const filtered = conversations.filter((entry) => {
    const statusMatch = !statusFilter || statusFilter === "all" || entry.status === statusFilter;
    if (!statusMatch) {
      return false;
    }
    if (!q) {
      return true;
    }

    const haystack = [
      entry.name,
      entry.phone,
      entry.email,
      entry.category,
      entry.messages.map((message) => message.text).join(" ")
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return NextResponse.json({ conversations: filtered });
}

export async function PATCH(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      status?: ChatConversationStatus;
      adminReply?: string;
      requiresManualReply?: boolean;
    };

    const id = body.id?.trim() || "";
    if (!id) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    let updated = null;
    const safeStatus = body.status && validStatuses.includes(body.status) ? body.status : undefined;
    const adminReply = body.adminReply?.trim() || "";

    if (adminReply) {
      updated = await appendChatMessage(id, {
        sender: "admin",
        text: adminReply,
        requiresManualReply: false,
        status: safeStatus || "resolved"
      });
      if (!updated) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
    }

    if (safeStatus || typeof body.requiresManualReply === "boolean") {
      updated = await updateChatConversation(id, {
        status: safeStatus,
        requiresManualReply: typeof body.requiresManualReply === "boolean" ? body.requiresManualReply : undefined
      });
      if (!updated) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }
    }

    if (!updated) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    return NextResponse.json({ conversation: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
  }
}
