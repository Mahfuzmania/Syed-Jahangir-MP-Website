"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export type MediaCoverageItem = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  youtubeUrl?: string;
  videoFileUrl?: string;
};

function toYoutubeEmbedUrl(input: string) {
  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "").trim();
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      if (url.pathname.startsWith("/embed/")) {
        return input;
      }
    }
  } catch {}
  return "";
}

export function MediaCoveragePanel({
  lang,
  items
}: {
  lang: "bn" | "en";
  items: MediaCoverageItem[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? items[0];
  const labels = useMemo(
    () => ({
      playlist: lang === "bn" ? "ভিডিও তালিকা" : "Playlist",
      related: lang === "bn" ? "সম্পর্কিত ভিডিও" : "Related videos",
      open: lang === "bn" ? "ভিডিও খুলুন" : "Open video",
      watch: lang === "bn" ? "এখন দেখুন" : "Watch now"
    }),
    [lang]
  );

  if (!activeItem) {
    return null;
  }

  const sourceUrl = activeItem.youtubeUrl || activeItem.videoFileUrl || "";
  const embedUrl = activeItem.youtubeUrl ? toYoutubeEmbedUrl(activeItem.youtubeUrl) : "";
  const hasPlayableVideo = Boolean(embedUrl || activeItem.videoFileUrl);

  return (
    <section className="card-surface overflow-hidden p-4 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="photo-card overflow-hidden bg-brand-ink">
          {embedUrl ? (
            <iframe
              key={activeItem.id}
              title={activeItem.title}
              src={embedUrl}
              className="h-[240px] w-full sm:h-[360px] md:h-[440px]"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : activeItem.videoFileUrl ? (
            <video key={activeItem.id} src={activeItem.videoFileUrl} controls className="h-[240px] w-full bg-black sm:h-[360px] md:h-[440px]" />
          ) : (
            <div className="relative h-[240px] w-full sm:h-[360px] md:h-[440px]">
              <Image src={activeItem.thumbnail} alt={activeItem.title} fill className="object-cover opacity-75" />
            </div>
          )}

          <div className="border-t border-white/15 bg-brand-ink/95 px-4 py-3 text-white">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="line-clamp-2 text-sm font-semibold md:text-base">{activeItem.title}</p>
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">{activeItem.duration}</span>
            </div>
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex rounded-full bg-brand-red px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-green"
              >
                {labels.open}
              </a>
            ) : null}
          </div>
        </div>

        <aside className="rounded-2xl border border-brand-ink/10 bg-white/75 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-green">{labels.playlist}</h3>
            <span className="text-xs text-brand-ink/60">{items.length}</span>
          </div>
          <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-2 rounded-xl border p-2 text-left transition ${
                  index === activeIndex
                    ? "border-brand-green/45 bg-brand-green/8 shadow-sm"
                    : "border-brand-ink/10 bg-white hover:border-brand-red/35 hover:bg-brand-red/5"
                }`}
              >
                <div className="photo-card relative h-14 w-20 shrink-0 rounded-lg">
                  <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs font-semibold text-brand-ink/90">{item.title}</p>
                  <p className="mt-1 text-[11px] text-brand-ink/60">
                    {item.duration} • {labels.related}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {hasPlayableVideo ? (
            <p className="mt-3 text-xs text-brand-ink/55">{labels.watch}</p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
