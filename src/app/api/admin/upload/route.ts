import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

type UploadKind = "image" | "video" | "pdf";

const limits: Record<UploadKind, number> = {
  image: 10 * 1024 * 1024,
  pdf: 20 * 1024 * 1024,
  video: 200 * 1024 * 1024
};

const folders: Record<UploadKind, string> = {
  image: "images",
  pdf: "pdfs",
  video: "videos"
};

function sanitizeBaseName(fileName: string) {
  const parsed = path.parse(fileName);
  return (parsed.name || "file").toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

function extensionFromFile(file: File) {
  const ext = path.extname(file.name || "").toLowerCase();
  if (ext) return ext;

  if (file.type === "application/pdf") return ".pdf";
  if (file.type.startsWith("image/")) return ".jpg";
  if (file.type.startsWith("video/")) return ".mp4";
  return ".bin";
}

function isAllowed(file: File, kind: UploadKind) {
  if (kind === "image") return file.type.startsWith("image/");
  if (kind === "video") return file.type.startsWith("video/");
  if (kind === "pdf") return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  return false;
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const rawKind = formData.get("kind");
    const kind: UploadKind = rawKind === "video" || rawKind === "pdf" ? rawKind : "image";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    if (!isAllowed(file, kind)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > limits[kind]) {
      return NextResponse.json({ error: `File too large. Max ${Math.floor(limits[kind] / (1024 * 1024))}MB` }, { status: 400 });
    }

    const folder = folders[kind];
    const ext = extensionFromFile(file);
    const base = sanitizeBaseName(file.name);
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const fileName = `${base || "file"}-${unique}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const destination = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(destination, buffer);

    return NextResponse.json({ url: `/uploads/${folder}/${fileName}` });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
