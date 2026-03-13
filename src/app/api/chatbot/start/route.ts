import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rateLimit";
import { createChatConversation } from "@/lib/storage";
import { ChatIssueCategory, Lang } from "@/lib/types";

const validCategories: ChatIssueCategory[] = ["citizen_services", "development_projects", "government_projects", "office_contact", "other"];
const MAX_NAME_LENGTH = 80;
const MAX_PHONE_LENGTH = 32;
const MAX_EMAIL_LENGTH = 120;

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function sanitizeSingleLine(value: string, maxLength: number) {
  return value
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function categoryPrompt(category: ChatIssueCategory, lang: Lang) {
  if (lang === "bn") {
    if (category === "citizen_services") {
      return "Syed Jahangir Alam office e apnake swagotom. Citizen service issue details likhun.";
    }
    if (category === "development_projects") {
      return "Syed Jahangir Alam office e apnake swagotom. Development project, location ebong issue share korun.";
    }
    if (category === "government_projects") {
      return "Syed Jahangir Alam office e apnake swagotom. Government project name, location and progress query share korun.";
    }
    if (category === "office_contact") {
      return "Syed Jahangir Alam office e apnake swagotom. Appointment or office contact request likhun.";
    }
    return "Syed Jahangir Alam office e apnake swagotom. Apnar prosno details e likhun; proyojone office team e forward kora hobe.";
  }

  if (category === "citizen_services") {
    return "Welcome to Syed Jahangir Alam's office. Please describe your citizen service issue in detail for first-step guidance.";
  }
  if (category === "development_projects") {
    return "Welcome to Syed Jahangir Alam's office. Please share the development project, location, and issue details.";
  }
  if (category === "government_projects") {
    return "Welcome to Syed Jahangir Alam's office. Please share project name, location, and your government-project query.";
  }
  if (category === "office_contact") {
    return "Welcome to Syed Jahangir Alam's office. Please share your appointment request or office-contact question.";
  }
  return "Welcome to Syed Jahangir Alam's office. Please share your question in detail. If needed, this will be forwarded to the office team.";
}

function isLang(value: unknown): value is Lang {
  return value === "bn" || value === "en";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = applyRateLimit({
      key: `chatbot-start:${ip}`,
      limit: 12,
      windowMs: 1000 * 60 * 10
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many chatbot start requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      lang?: string;
      category?: ChatIssueCategory;
    };

    const name = sanitizeSingleLine(body.name || "", MAX_NAME_LENGTH);
    const phone = sanitizeSingleLine(body.phone || "", MAX_PHONE_LENGTH);
    const email = sanitizeSingleLine(body.email || "", MAX_EMAIL_LENGTH).toLowerCase();
    const lang: Lang = isLang(body.lang) ? body.lang : "en";
    const category = validCategories.includes(body.category as ChatIssueCategory) ? (body.category as ChatIssueCategory) : "other";

    if (!name) {
      return NextResponse.json({ error: lang === "bn" ? "Name is required" : "Name is required" }, { status: 400 });
    }
    if (!phone && !email) {
      return NextResponse.json(
        { error: lang === "bn" ? "Phone or email is required" : "Phone or email is required" },
        { status: 400 }
      );
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }
    if (phone && !/^[+\d()[\]\s-]{6,24}$/.test(phone)) {
      return NextResponse.json({ error: "Please provide a valid phone number." }, { status: 400 });
    }

    const conversation = await createChatConversation({
      name,
      phone: phone || undefined,
      email: email || undefined,
      lang,
      category,
      initialBotMessage: categoryPrompt(category, lang)
    });

    return NextResponse.json({
      conversationId: conversation.id,
      conversation
    });
  } catch {
    return NextResponse.json({ error: "Failed to start chatbot session" }, { status: 500 });
  }
}
