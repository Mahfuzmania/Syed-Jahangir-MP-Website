import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSubmissions } from "@/lib/storage";
import { SubmissionStatus } from "@/lib/types";

const validStatuses: SubmissionStatus[] = ["new", "in_review", "resolved", "closed"];

function escapeCsvCell(value: string) {
  const safe = value.replace(/"/g, "\"\"");
  return `"${safe}"`;
}

function statusLabel(status: SubmissionStatus) {
  if (status === "new") return "New";
  if (status === "in_review") return "In Review";
  if (status === "resolved") return "Resolved";
  return "Closed";
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

  const header = [
    "Serial",
    "Reference ID",
    "Status",
    "Created At",
    "Updated At",
    "Name",
    "Phone",
    "Email",
    "Category",
    "Union/Ward",
    "Area",
    "Subject",
    "Message",
    "Attachment",
    "Consent Given",
    "Private Request"
  ];

  const rows = filtered.map((item, index) => [
    index + 1,
    item.id,
    statusLabel(item.status),
    item.createdAt,
    item.updatedAt,
    item.name || "",
    item.phone,
    item.email || "",
    item.category,
    item.unionWard,
    item.area,
    item.subject || "",
    item.message,
    item.attachmentUrl || "",
    item.consentGiven ? "Yes" : "No",
    item.isPrivate ? "Yes" : "No"
  ]);

  const csv = [header, ...rows].map((row) => row.map((cell) => escapeCsvCell(String(cell))).join(",")).join("\n");
  const filenameDate = new Date().toISOString().slice(0, 10);
  const filename = `write-to-mp-submissions-${filenameDate}.csv`;

  return new NextResponse(`\uFEFF${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
}
