import type { MetadataRoute } from "next";
import { languages } from "@/lib/i18n";
import { buildLocalizedPath, toAbsoluteUrl } from "@/lib/seo";
import { getSiteContent } from "@/lib/storage";
import { Lang } from "@/lib/types";

const staticPublicPaths = [
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
] as const;

function localizedAlternates(path: string) {
  return Object.fromEntries(languages.map((lang) => [lang, toAbsoluteUrl(buildLocalizedPath(lang, path))]));
}

function localizedEntries(
  path: string,
  options: Pick<MetadataRoute.Sitemap[number], "priority" | "changeFrequency" | "lastModified">
) {
  const alternates = localizedAlternates(path);

  return languages.map((lang) => ({
    url: toAbsoluteUrl(buildLocalizedPath(lang, path)),
    priority: options.priority,
    changeFrequency: options.changeFrequency,
    lastModified: options.lastModified,
    alternates: { languages: alternates }
  }));
}

function entryForEachLang(
  pathByLang: Record<Lang, string>,
  options: Pick<MetadataRoute.Sitemap[number], "priority" | "changeFrequency" | "lastModified">
) {
  const alternates = Object.fromEntries(
    languages.map((lang) => [lang, toAbsoluteUrl(buildLocalizedPath(lang, pathByLang[lang]))])
  );

  return languages.map((lang) => ({
    url: toAbsoluteUrl(buildLocalizedPath(lang, pathByLang[lang])),
    priority: options.priority,
    changeFrequency: options.changeFrequency,
    lastModified: options.lastModified,
    alternates: { languages: alternates }
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSiteContent();
  const now = new Date();

  const staticEntries = staticPublicPaths.flatMap((path) =>
    localizedEntries(path, {
      priority: path === "" ? 1 : 0.7,
      changeFrequency: path === "" ? "daily" : "weekly",
      lastModified: now
    })
  );

  const commitmentEntries = content.commitments.flatMap((item) =>
    localizedEntries(`/commitments/${item.slug}`, {
      priority: 0.65,
      changeFrequency: "monthly",
      lastModified: now
    })
  );

  const governmentProjectEntries = content.governmentProjects.flatMap((item) =>
    localizedEntries(`/government-projects/${item.slug}`, {
      priority: 0.65,
      changeFrequency: "weekly",
      lastModified: now
    })
  );

  const newsEntries = content.news.flatMap((item) =>
    entryForEachLang(
      {
        bn: `/news/${item.slug}`,
        en: `/news/${item.slug}`
      },
      {
        priority: 0.8,
        changeFrequency: "weekly",
        lastModified: item.date || now
      }
    )
  );

  return [...staticEntries, ...commitmentEntries, ...governmentProjectEntries, ...newsEntries];
}
