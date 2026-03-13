"use client";

import { useMemo, useState } from "react";
import { Lang, MonthlyReportItem } from "@/lib/types";
import { toLocaleDate, translate } from "@/lib/i18n";

function parseMonthToken(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return { year, month };
}

function formatMonthToken(value: string, lang: Lang) {
  const parsed = parseMonthToken(value);
  if (!parsed) return value;
  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, 1));
  return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { month: "long", year: "numeric" });
}

export function MonthlyReportFeed({ lang, reports }: { lang: Lang; reports: MonthlyReportItem[] }) {
  const isBangla = lang === "bn";
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = [...reports].sort((a, b) => {
      const aDate = new Date(a.publishedDate || `${a.reportMonth}-01`).getTime();
      const bDate = new Date(b.publishedDate || `${b.reportMonth}-01`).getTime();
      return bDate - aDate;
    });

    if (!q) {
      return base;
    }

    return base.filter((item) => {
      const haystack = [translate(lang, item.title), translate(lang, item.summary), item.reportMonth, item.publishedDate]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [lang, query, reports]);

  return (
    <div className="space-y-5">
      <div className="card-surface p-4 sm:p-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isBangla ? "মাসিক প্রতিবেদন খুঁজুন..." : "Search monthly reports..."}
          className="w-full rounded-2xl border border-brand-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((report) => (
          <article key={report.id} className="card-surface p-4 sm:p-5">
            <p className="inline-flex rounded-full border border-brand-green/25 bg-brand-green/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-green">
              {formatMonthToken(report.reportMonth, lang)}
            </p>
            <h3 className="mt-2 text-lg font-bold text-brand-green">{translate(lang, report.title)}</h3>
            <p className="mt-2 text-sm text-brand-ink/80">{translate(lang, report.summary)}</p>
            <p className="mt-3 text-xs text-brand-ink/65">
              {isBangla ? "প্রকাশের তারিখ" : "Published"}: {toLocaleDate(report.publishedDate, lang)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={report.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand-green px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-ink"
              >
                {isBangla ? "PDF দেখুন" : "Open PDF"}
              </a>
              <a
                href={report.pdfUrl}
                download
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-brand-green/35 px-4 py-2 text-xs font-bold text-brand-green transition hover:bg-brand-green hover:text-white"
              >
                {isBangla ? "ডাউনলোড" : "Download"}
              </a>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-brand-ink/70">{isBangla ? "কোনো মাসিক প্রতিবেদন পাওয়া যায়নি।" : "No monthly reports found."}</p>
      ) : null}
    </div>
  );
}
