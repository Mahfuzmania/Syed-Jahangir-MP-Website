"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Lang, SiteContent } from "@/lib/types";
import { toLocaleDate, translate } from "@/lib/i18n";

type SearchResult = {
  id: string;
  type: "news" | "commitment" | "work";
  title: string;
  summary: string;
  href: string;
  date?: string;
};

export function PublicSearchPanel({ lang, content }: { lang: Lang; content: SiteContent }) {
  const isBangla = lang === "bn";
  const [query, setQuery] = useState("");

  const allResults = useMemo<SearchResult[]>(() => {
    const news = content.news.map((item) => ({
      id: item.id,
      type: "news" as const,
      title: translate(lang, item.title),
      summary: translate(lang, item.excerpt),
      href: `/${lang}/news/${item.slug}`,
      date: item.date
    }));

    const commitments = content.commitments.map((item) => ({
      id: item.id,
      type: "commitment" as const,
      title: translate(lang, item.title),
      summary: translate(lang, item.summary),
      href: `/${lang}/commitments/${item.slug}`
    }));

    const works = content.workHistory.map((item) => ({
      id: item.id,
      type: "work" as const,
      title: translate(lang, item.title),
      summary: translate(lang, item.summary),
      href: `/${lang}/work-history`
    }));

    return [...news, ...commitments, ...works];
  }, [content, lang]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allResults.slice(0, 18);

    return allResults.filter((item) => `${item.title} ${item.summary}`.toLowerCase().includes(q));
  }, [allResults, query]);

  function typeLabel(type: SearchResult["type"]) {
    if (type === "news") return isBangla ? "সংবাদ" : "News";
    if (type === "commitment") return isBangla ? "অঙ্গীকার" : "Commitment";
    return isBangla ? "পূর্বের কাজ" : "Work";
  }

  return (
    <div className="space-y-5">
      <div className="card-surface p-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isBangla ? "শব্দ লিখে সার্চ করুন..." : "Type to search..."}
          className="w-full rounded-2xl border border-brand-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {results.length > 0 ? (
          results.map((item) => (
            <article key={`${item.type}-${item.id}`} className="card-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-red">{typeLabel(item.type)}</p>
              <h3 className="mt-2 text-lg font-bold text-brand-green">{item.title}</h3>
              <p className="mt-2 text-sm text-brand-ink/80">{item.summary}</p>
              {item.date ? <p className="mt-2 text-xs text-brand-ink/60">{toLocaleDate(item.date, lang)}</p> : null}
              <Link href={item.href} className="mt-3 inline-flex text-sm font-bold text-brand-red underline-offset-4 hover:underline">
                {isBangla ? "বিস্তারিত" : "Open"}
              </Link>
            </article>
          ))
        ) : (
          <p className="text-sm text-brand-ink/75">{isBangla ? "কোনো ফলাফল পাওয়া যায়নি।" : "No results found."}</p>
        )}
      </div>
    </div>
  );
}
