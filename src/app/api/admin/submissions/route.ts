import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getSubmissions, updateSubmissionStatus } from "@/lib/storage";
import { SubmissionStatus } from "@/lib/types";

const validStatuses: SubmissionStatus[] = ["new", "in_review", "processing", "resolved", "closed"];

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const statusFilter = request.nextUrl.searchParams.get("status");
  const q = (request.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
  const submissions = await getSubmissions();

  const filtered = submissions.filter((item) => {
    const statusMatch = !statusFilter || statusFilter === "all" || item.status === statusFilter;
    if (!statusMatch) {
      return false;
    }

    if (!q) {
      return true;
    }

    const haystack = [
      item.name,
      item.phone,
      item.email,
      item.category,
      item.unionWard,
      item.area,
      item.subject,
      item.message
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return NextResponse.json({ submissions: filtered });
}

export async function PATCH(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string; status?: SubmissionStatus };
  if (!body.id || !body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid submission id or status" }, { status: 400 });
  }

  const updated = await updateSubmissionStatus(body.id, body.status);
  if (!updated) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  return NextResponse.json({ submission: updated });
}
