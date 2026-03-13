import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getUserFromRequest } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/storage";
import { SiteContent } from "@/lib/types";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getSiteContent();
  return NextResponse.json({ content });
}

export async function PUT(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { content?: SiteContent };
  if (!body.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await saveSiteContent(body.content);
  revalidatePublicPages(body.content);

  return NextResponse.json({ success: true });
}

function revalidatePublicPages(content: SiteContent) {
  const langs: Array<"bn" | "en"> = ["bn", "en"];
  const staticRoutes = [
    "",
    "/profile",
    "/commitments",
    "/development-projects",
    "/government-projects",
    "/work-history",
    "/gallery",
    "/media-gallery",
    "/news",
    "/manifesto",
    "/contact",
    "/write-to-mp",
    "/track-request"
  ];

  for (const lang of langs) {
    for (const route of staticRoutes) {
      revalidatePath(`/${lang}${route}`);
    }

    for (const item of content.commitments) {
      if (item.slug) {
        revalidatePath(`/${lang}/commitments/${item.slug}`);
      }
    }

    for (const item of content.news) {
      if (item.slug) {
        revalidatePath(`/${lang}/news/${item.slug}`);
      }
    }

    for (const item of content.governmentProjects) {
      if (item.slug) {
        revalidatePath(`/${lang}/government-projects/${item.slug}`);
      }
    }
  }
}
