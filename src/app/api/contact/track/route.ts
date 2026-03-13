import { NextRequest, NextResponse } from "next/server";
import { getSubmissions } from "@/lib/storage";
import { applyRateLimit } from "@/lib/rateLimit";
import { isValidBdPhone, toCanonicalBdPhone } from "@/lib/contactValidation";

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = applyRateLimit({
      key: `contact-track:${ip}`,
      limit: 30,
      windowMs: 1000 * 60 * 10
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many tracking requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfterSec)
          }
        }
      );
    }

    const body = (await request.json()) as { referenceId?: string; phone?: string };
    const referenceId = body.referenceId?.trim() || "";
    const canonicalPhone = toCanonicalBdPhone(body.phone || "");

    if (!referenceId) {
      return NextResponse.json({ error: "Reference ID is required." }, { status: 400 });
    }

    if (!isValidBdPhone(canonicalPhone)) {
      return NextResponse.json({ error: "A valid Bangladeshi phone number is required." }, { status: 400 });
    }

    const submissions = await getSubmissions();
    const submission = submissions.find((entry) => entry.id === referenceId && entry.phone === canonicalPhone);
    if (!submission) {
      return NextResponse.json({ error: "No matching request found." }, { status: 404 });
    }

    return NextResponse.json({
      submission: {
        id: submission.id,
        status: submission.status,
        category: submission.category,
        subject: submission.subject,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt
      }
    });
  } catch {
    return NextResponse.json({ error: "Failed to track request." }, { status: 500 });
  }
}
