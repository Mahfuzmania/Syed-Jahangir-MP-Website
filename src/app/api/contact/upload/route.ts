import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit } from "@/lib/rateLimit";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/webm",
  "video/quicktime"
]);

const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx", ".mp4", ".webm", ".mov"]);

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}

function sanitizeBaseName(fileName: string) {
  const parsed = path.parse(fileName);
  return (parsed.name || "file")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveExtension(file: File) {
  const ext = path.extname(file.name || "").toLowerCase();
  if (ext) return ext;

  if (file.type === "application/pdf") return ".pdf";
  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "application/msword") return ".doc";
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return ".docx";
  if (file.type === "video/mp4") return ".mp4";
  if (file.type === "video/webm") return ".webm";
  if (file.type === "video/quicktime") return ".mov";

  return ".bin";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = applyRateLimit({
    key: `contact-upload:${ip}`,
    limit: 12,
    windowMs: 1000 * 60 * 10
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many upload requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) }
      }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const ext = resolveExtension(file);
    const mimeAllowed = allowedMimeTypes.has(file.type);
    const extAllowed = allowedExtensions.has(ext);
    if (!mimeAllowed && !extAllowed) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 50MB limit." }, { status: 400 });
    }

    const base = sanitizeBaseName(file.name);
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const fileName = `${base || "attachment"}-${unique}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "contact");
    await fs.mkdir(uploadDir, { recursive: true });

    const destination = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(destination, buffer);

    return NextResponse.json({ url: `/uploads/contact/${fileName}` });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
