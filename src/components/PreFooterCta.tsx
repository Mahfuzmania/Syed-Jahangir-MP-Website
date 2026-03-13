"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lang, SiteContent } from "@/lib/types";
import { translate } from "@/lib/i18n";

export function PreFooterCta({ lang, content }: { lang: Lang; content: SiteContent }) {
  const pathname = usePathname();

  if (pathname?.includes("/admin")) {
    return null;
  }

  return (
    <section className="mx-auto mt-12 w-full max-w-7xl px-4 md:px-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-brand-green/20 bg-gradient-to-br from-[#00522e] via-[#0b663c] to-[#01351e] px-5 py-10 text-white shadow-[0_24px_52px_rgba(0,82,46,0.34)] sm:px-8 sm:py-12">
        <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-brand-red/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            {lang === "bn" ? "জনসম্পৃক্ততা" : "Civic Participation"}
          </p>
          <h2 className="mt-2 text-balance text-2xl font-extrabold leading-tight sm:text-4xl">
            {translate(lang, content.preFooterCta.title)}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/90 sm:text-lg">
            {translate(lang, content.preFooterCta.description)}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={`/${lang}/track-request`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/70 bg-white px-6 py-2.5 text-sm font-bold text-brand-green transition hover:bg-brand-red hover:text-white hover:border-brand-red"
            >
              {translate(lang, content.preFooterCta.volunteerButtonLabel)}
            </Link>
            <Link
              href={`/${lang}/write-to-mp`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/60 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-white hover:text-brand-green"
            >
              {translate(lang, content.preFooterCta.writeToMpButtonLabel)}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
