import { NextRequest, NextResponse } from "next/server";
import { addSubmission } from "@/lib/storage";
import { sendSubmissionEmail } from "@/lib/email";
import { normalizeBanglaDigits, toCanonicalBdPhone, validateWriteToMpInput } from "@/lib/contactValidation";
import { verifyCaptchaAnswer } from "@/lib/captcha";
import { applyRateLimit } from "@/lib/rateLimit";

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
      key: `contact-submit:${ip}`,
      limit: 6,
      windowMs: 1000 * 60 * 10
    });

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfterSec)
          }
        }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      category?: string;
      unionWard?: string;
      area?: string;
      subject?: string;
      message?: string;
      attachmentUrl?: string;
      consentGiven?: boolean;
      isPrivate?: boolean;
      captchaId?: string;
      captchaAnswer?: string;
    };

    const isCaptchaValid = verifyCaptchaAnswer({
      captchaId: body.captchaId,
      captchaAnswer: body.captchaAnswer
    });

    if (!isCaptchaValid) {
      return NextResponse.json({ error: "Captcha verification failed. Please try again." }, { status: 400 });
    }

    const errors = validateWriteToMpInput({
      phone: body.phone,
      email: body.email,
      category: body.category,
      unionWard: body.unionWard,
      area: body.area,
      message: body.message,
      consentGiven: body.consentGiven
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], details: errors }, { status: 400 });
    }

    const canonicalPhone = toCanonicalBdPhone(body.phone || "");
    const normalizedEmail = body.email ? normalizeBanglaDigits(body.email).trim() : undefined;
    const normalizedCategory = body.category?.trim() || "";
    const normalizedUnionWard = body.unionWard?.trim() || "";
    const normalizedArea = body.area?.trim() || "";
    const normalizedSubject = body.subject?.trim() || undefined;
    const normalizedMessage = body.message?.trim() || "";
    const normalizedName = body.name?.trim() || undefined;
    const normalizedAttachmentUrl = body.attachmentUrl?.trim() || undefined;
    if (normalizedAttachmentUrl && !normalizedAttachmentUrl.startsWith("/uploads/contact/")) {
      return NextResponse.json({ error: "Invalid attachment URL." }, { status: 400 });
    }

    const submission = await addSubmission({
      name: normalizedName,
      phone: canonicalPhone,
      email: normalizedEmail,
      category: normalizedCategory,
      unionWard: normalizedUnionWard,
      area: normalizedArea,
      subject: normalizedSubject,
      message: normalizedMessage,
      attachmentUrl: normalizedAttachmentUrl,
      consentGiven: Boolean(body.consentGiven),
      isPrivate: Boolean(body.isPrivate)
    });

    await sendSubmissionEmail(submission);

    return NextResponse.json({
      success: true,
      referenceId: submission.id,
      status: submission.status
    });
  } catch {
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
