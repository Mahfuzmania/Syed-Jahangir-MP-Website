"use client";

import { usePathname } from "next/navigation";
import { NoticeTicker } from "@/components/NoticeTicker";
import { Lang, NoticeBarContent } from "@/lib/types";

export function NoticeBarSlot({ lang, noticeBar }: { lang: Lang; noticeBar: NoticeBarContent }) {
  const pathname = usePathname();
  const cleanPath = pathname?.replace(/\/+$/, "") || "";
  const homePath = `/${lang}`;
  const isHome = cleanPath === homePath;
  const canRender = noticeBar.showOn === "all_pages" || isHome;

  if (!canRender) {
    return null;
  }

  return <NoticeTicker lang={lang} noticeBar={noticeBar} />;
}

