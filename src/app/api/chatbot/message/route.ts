import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rateLimit";
import { appendChatMessage, getChatConversations } from "@/lib/storage";
import { ChatIssueCategory, ChatMessage, Lang } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 1200;

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function detectLanguageFromConversation(messages: ChatMessage[], fallback: Lang) {
  const sample = [...messages]
    .reverse()
    .map((entry) => entry.text)
    .join(" ");
  if (/[\u0980-\u09FF]/.test(sample)) {
    return "bn";
  }
  return fallback;
}

function replyText(
  lang: Lang,
  bn: string,
  en: string
) {
  return lang === "bn" ? bn : en;
}

function categoryReply(category: ChatIssueCategory, message: string, lang: Lang) {
  const normalized = message.toLowerCase();
  const needsHuman =
    category === "other" ||
    normalized.includes("human") ||
    normalized.includes("agent") ||
    normalized.includes("urgent") ||
    normalized.includes("manual");

  if (needsHuman) {
    return {
      text: replyText(
        lang,
        "Ei issue ti office team e escalate kora holo. Tara manual follow-up debe.",
        "I could not fully resolve this automatically. Your message has been escalated to the office team for manual follow-up."
      ),
      handled: false
    };
  }

  if (category === "citizen_services") {
    const matched = /application|certificate|allowance|complaint|tracking|form|attest/.test(normalized);
    if (matched) {
      return {
        text: replyText(
          lang,
          "Nam, area, reference number (thakle) ebong issue timeline din. Proyojon hole office e escalate kora hobe.",
          "For citizen service requests, share your name, area, any reference number, and timeline of the issue. It can be escalated to the office if needed."
        ),
        handled: true
      };
    }
  }

  if (category === "development_projects") {
    const matched = /project|road|bridge|drain|school|hospital/.test(normalized);
    if (matched) {
      return {
        text: replyText(
          lang,
          "Project name, location, issue details, and photo/evidence (if any) share korun for quick verification.",
          "For development projects, please share project name, location, current issue, and any photo/evidence so the team can verify faster."
        ),
        handled: true
      };
    }
  }

  if (category === "government_projects") {
    const matched = /government|budget|progress|agency|implementation/.test(normalized);
    if (matched) {
      return {
        text: replyText(
          lang,
          "Government project er name, location, current progress and specific query share korun.",
          "For government project queries, share project name, location, present progress, and your specific question."
        ),
        handled: true
      };
    }
  }

  if (category === "office_contact") {
    const matched = /office|meeting|appointment|contact|phone|email/.test(normalized);
    if (matched) {
      return {
        text: replyText(
          lang,
          "Purpose, preferred time and urgency level din. Office team priority onujayi follow-up korbe.",
          "For office contact or appointments, include your purpose, preferred time, and urgency level. The office team will follow up accordingly."
        ),
        handled: true
      };
    }
  }

  return {
    text: replyText(
      lang,
      "Issue note kora holo. Aro specific information dile faster guidance deya jabe, na hole office team e forward kora hobe.",
      "Thanks. Your issue is noted. Share more specifics for faster guidance, otherwise this will be forwarded to the office team."
    ),
    handled: false
  };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = applyRateLimit({
      key: `chatbot-message:${ip}`,
      limit: 80,
      windowMs: 1000 * 60 * 10
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many chatbot messages. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const body = (await request.json()) as { conversationId?: string; message?: string };
    const conversationId = body.conversationId?.trim() || "";
    const message = body.message?.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() || "";

    if (!conversationId || !message) {
      return NextResponse.json({ error: "Conversation ID and message are required" }, { status: 400 });
    }
    if (!/^[0-9a-fA-F-]{32,40}$/.test(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const conversations = await getChatConversations();
    const conversation = conversations.find((entry) => entry.id === conversationId);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (conversation.messages.length >= 250) {
      return NextResponse.json({ error: "Conversation limit reached. Please start a new chat." }, { status: 400 });
    }

    await appendChatMessage(conversation.id, {
      sender: "user",
      text: message
    });

    const lang = detectLanguageFromConversation(conversation.messages, conversation.lang);
    const response = categoryReply(conversation.category, message, lang);
    const updated = await appendChatMessage(conversation.id, {
      sender: "bot",
      text: response.text,
      requiresManualReply: !response.handled,
      status: response.handled ? "in_review" : "open"
    });

    return NextResponse.json({
      reply: response.text,
      escalated: !response.handled,
      conversation: updated
    });
  } catch {
    return NextResponse.json({ error: "Failed to process chatbot message" }, { status: 500 });
  }
}
