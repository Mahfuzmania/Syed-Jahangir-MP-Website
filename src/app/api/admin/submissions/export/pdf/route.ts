import { promises as fs } from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSubmissions } from "@/lib/storage";
import { SubmissionStatus } from "@/lib/types";

const validStatuses: SubmissionStatus[] = ["new", "in_review", "resolved", "closed"];

function statusLabel(status: SubmissionStatus) {
  if (status === "new") return "New";
  if (status === "in_review") return "In Review";
  if (status === "resolved") return "Resolved";
  return "Closed";
}

function sanitizeText(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

const mojibakePattern = /(?:\u00E0\u00A6|\u00E0\u00A7|\u00C3|\u00C2)/;
const banglaPattern = /[\u0980-\u09FF]/;

function repairPossibleMojibake(value: string) {
  const clean = sanitizeText(value);
  if (!mojibakePattern.test(clean)) {
    return clean;
  }

  const decoded = Buffer.from(clean, "latin1").toString("utf8");
  if (banglaPattern.test(decoded)) {
    return decoded;
  }
  return clean;
}

function wrapText(text: string, maxWidth: number, fontSize: number, widthOf: (value: string) => number) {
  const lines: string[] = [];
  const paragraphs = sanitizeText(text).split("\n");

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (widthOf(next) <= maxWidth) {
        line = next;
        continue;
      }

      if (line) {
        lines.push(line);
      }

      if (widthOf(word) <= maxWidth) {
        line = word;
        continue;
      }

      let chunk = "";
      for (const char of word) {
        const candidate = chunk + char;
        if (widthOf(candidate) <= maxWidth) {
          chunk = candidate;
          continue;
        }
        if (chunk) lines.push(chunk);
        chunk = char;
      }
      line = chunk;
    }

    if (line) {
      lines.push(line);
    }
  }

  return lines.length > 0 ? lines : [""];
}

function isBanglaChar(char: string) {
  if (!char) return false;
  const code = char.codePointAt(0);
  return code !== undefined && code >= 0x0980 && code <= 0x09ff;
}

function createMixedFontRenderer({
  latinRegular,
  latinBold,
  banglaRegular
}: {
  latinRegular: PDFFont;
  latinBold: PDFFont;
  banglaRegular: PDFFont | null;
}) {
  function canEncode(font: PDFFont, value: string) {
    try {
      font.encodeText(value);
      return true;
    } catch {
      return false;
    }
  }

  function resolveGlyph(char: string, bold: boolean) {
    if (banglaRegular && isBanglaChar(char) && canEncode(banglaRegular, char)) {
      return { font: banglaRegular, char };
    }

    const preferred = bold ? latinBold : latinRegular;
    if (canEncode(preferred, char)) {
      return { font: preferred, char };
    }

    if (canEncode(latinRegular, char)) {
      return { font: latinRegular, char };
    }

    if (banglaRegular && canEncode(banglaRegular, char)) {
      return { font: banglaRegular, char };
    }

    return { font: latinRegular, char: "?" };
  }

  function measureText(value: string, size: number, bold = false) {
    let width = 0;
    for (const char of value) {
      const glyph = resolveGlyph(char, bold);
      width += glyph.font.widthOfTextAtSize(glyph.char, size);
    }
    return width;
  }

  function drawLineMixed({
    page,
    value,
    x,
    y,
    size,
    bold = false
  }: {
    page: PDFPage;
    value: string;
    x: number;
    y: number;
    size: number;
    bold?: boolean;
  }) {
    let cursorX = x;
    let runFont: PDFFont | null = null;
    let runText = "";

    const flush = () => {
      if (!runFont || !runText) return;
      page.drawText(runText, {
        x: cursorX,
        y,
        size,
        font: runFont,
        color: rgb(0.08, 0.14, 0.1)
      });
      cursorX += runFont.widthOfTextAtSize(runText, size);
      runText = "";
    };

    for (const char of value) {
      const glyph = resolveGlyph(char, bold);
      if (!runFont) {
        runFont = glyph.font;
        runText = glyph.char;
        continue;
      }

      if (glyph.font === runFont) {
        runText += glyph.char;
      } else {
        flush();
        runFont = glyph.font;
        runText = glyph.char;
      }
    }

    flush();
  }

  return { measureText, drawLineMixed };
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusFilterRaw = request.nextUrl.searchParams.get("status");
  const statusFilter =
    statusFilterRaw && statusFilterRaw !== "all" && validStatuses.includes(statusFilterRaw as SubmissionStatus)
      ? (statusFilterRaw as SubmissionStatus)
      : null;

  const submissions = await getSubmissions();
  const filtered = submissions.filter((item) => !statusFilter || item.status === statusFilter);

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const banglaFontPath = path.join(process.cwd(), "public", "fonts", "NotoSansBengali-Regular.ttf");
  const latinRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const latinBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let banglaRegular: PDFFont | null = null;

  try {
    const banglaFont = await fs.readFile(banglaFontPath);
    banglaRegular = await pdf.embedFont(banglaFont, { subset: false });
  } catch {}

  const mixedRenderer = createMixedFontRenderer({
    latinRegular,
    latinBold,
    banglaRegular
  });
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 42;
  const lineHeight = 14;
  const textSize = 10;
  const titleSize = 14;

  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  const widthOf = (value: string) => mixedRenderer.measureText(value, textSize);

  function ensureRoom(lines = 1) {
    if (y - lines * lineHeight >= margin) return;
    page = pdf.addPage(pageSize);
    y = pageSize[1] - margin;
  }

  function drawLine(text: string, options?: { bold?: boolean; size?: number }) {
    const size = options?.size ?? textSize;
    ensureRoom(1);
    mixedRenderer.drawLineMixed({
      page,
      value: text,
      x: margin,
      y,
      size,
      bold: options?.bold
    });
    y -= lineHeight;
  }

  function drawWrapped(label: string, value: string) {
    const repairedValue = repairPossibleMojibake(value || "-");
    const content = `${label}: ${repairedValue || "-"}`;
    const maxWidth = pageSize[0] - margin * 2;
    const lines = wrapText(content, maxWidth, textSize, widthOf);
    for (const line of lines) {
      drawLine(line);
    }
  }

  drawLine("Write to MP Submissions Report", { bold: true, size: titleSize });
  drawLine(`Generated: ${new Date().toLocaleString("en-US")}`);
  drawLine(`Total: ${filtered.length}`);
  y -= 6;

  filtered.forEach((item, index) => {
    drawLine(`#${index + 1}  ${item.id}`, { bold: true });
    drawWrapped("Status", statusLabel(item.status));
    drawWrapped("Created", item.createdAt);
    drawWrapped("Updated", item.updatedAt);
    drawWrapped("Name", item.name || "Anonymous");
    drawWrapped("Phone", item.phone);
    drawWrapped("Email", item.email || "-");
    drawWrapped("Category", item.category);
    drawWrapped("Union/Ward", item.unionWard);
    drawWrapped("Area", item.area);
    drawWrapped("Subject", item.subject || "-");
    drawWrapped("Attachment", item.attachmentUrl || "-");
    drawWrapped("Consent Given", item.consentGiven ? "Yes" : "No");
    drawWrapped("Message", item.message);
    drawWrapped("Private Request", item.isPrivate ? "Yes" : "No");
    y -= 8;
  });

  const bytes = await pdf.save();
  const body = Buffer.from(bytes);
  const filenameDate = new Date().toISOString().slice(0, 10);
  const filename = `write-to-mp-submissions-${filenameDate}.pdf`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
