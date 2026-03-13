import { Lang } from "@/lib/types";

const FALLBACK_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(input: string | undefined) {
  if (!input) {
    return FALLBACK_SITE_URL;
  }

  try {
    const url = new URL(input);
    const pathname = url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");
    return `${url.origin}${pathname}`;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
}

export function getSiteUrlObject() {
  return new URL(getSiteUrl());
}

export function buildLocalizedPath(lang: Lang, path = "") {
  if (!path || path === "/") {
    return `/${lang}`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${normalized}`;
}

export function toAbsoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}
