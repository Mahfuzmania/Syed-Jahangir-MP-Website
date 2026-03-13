"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Lang, NewsItem } from "@/lib/types";
import { toLocaleDate, translate } from "@/lib/i18n";

export function NewsFeed({ lang, news }: { lang: Lang; news: NewsItem[] }) {
  const isBangla = lang === "bn";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const categories = useMemo(() => {
    const all = new Set<string>();
    for (const item of news) {
      for (const categoryValue of item.categories || []) {
        if (categoryValue.trim()) all.add(categoryValue.trim());
      }
    }
    return ["all", ...Array.from(all)];
  }, [news]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return news.filter((item) => {
      const categoryMatch = category === "all" || (item.categories || []).includes(category);
      if (!categoryMatch) return false;

      if (!q) return true;
      const haystack = [
        translate(lang, item.title),
        translate(lang, item.excerpt),
        ...(item.categories || []),
        ...(item.tags || [])
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [category, lang, news, query]);

  return (
    <div className="space-y-5">
      <div className="card-surface p-5">
        <div className="grid gap-3 md:grid-cols-[1fr,260px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={isBangla ? "সংবাদে সার্চ করুন..." : "Search news..."}
            className="w-full rounded-2xl border border-brand-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green"
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-2xl border border-brand-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green"
          >
            {categories.map((entry) => (
              <option key={entry} value={entry}>
                {entry === "all" ? (isBangla ? "সব ক্যাটাগরি" : "All Categories") : entry}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((post) => {
          const detailPath = `/${lang}/news/${post.slug}`;
          const shareUrl = origin ? `${origin}${detailPath}` : detailPath;
          const shareText = translate(lang, post.title);
          const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          const xShare = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
          const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;

          return (
            <article key={post.id} className="card-surface overflow-hidden">
              <Image src={post.image} alt={translate(lang, post.title)} width={900} height={600} className="h-48 w-full object-cover" />
              <div className="p-5">
                <p className="text-xs text-brand-ink/60">{toLocaleDate(post.date, lang)}</p>
                <h3 className="mt-1 text-xl font-semibold text-brand-green">{translate(lang, post.title)}</h3>
                <p className="mt-2 text-sm text-brand-ink/80">{translate(lang, post.excerpt)}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(post.categories || []).map((entry) => (
                    <span key={`c-${post.id}-${entry}`} className="rounded-full bg-brand-green/10 px-2.5 py-1 text-[11px] font-semibold text-brand-green">
                      {entry}
                    </span>
                  ))}
                  {(post.tags || []).map((entry) => (
                    <span key={`t-${post.id}-${entry}`} className="rounded-full bg-brand-red/10 px-2.5 py-1 text-[11px] font-semibold text-brand-red">
                      #{entry}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link href={detailPath} className="inline-flex text-sm font-bold text-brand-red hover:underline">
                    {isBangla ? "বিস্তারিত" : "Read More"}
                  </Link>
                  <a href={facebookShare} target="_blank" rel="noreferrer" className="rounded-full border border-brand-ink/20 px-2.5 py-1 text-xs font-semibold text-brand-ink/75">
                    Facebook
                  </a>
                  <a href={xShare} target="_blank" rel="noreferrer" className="rounded-full border border-brand-ink/20 px-2.5 py-1 text-xs font-semibold text-brand-ink/75">
                    X
                  </a>
                  <a href={whatsappShare} target="_blank" rel="noreferrer" className="rounded-full border border-brand-ink/20 px-2.5 py-1 text-xs font-semibold text-brand-ink/75">
                    WhatsApp
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-brand-ink/70">{isBangla ? "কোনো সংবাদ পাওয়া যায়নি।" : "No news found."}</p>
      ) : null}
    </div>
  );
}
