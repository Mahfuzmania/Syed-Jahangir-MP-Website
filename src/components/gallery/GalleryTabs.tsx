"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export type GalleryTabItem = {
  id: string;
  title: string;
  album: string;
  image: string;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function GalleryTabs({ lang, items }: { lang: "bn" | "en"; items: GalleryTabItem[] }) {
  const tabs = useMemo(() => {
    const unique = Array.from(new Set(items.map((item) => item.album))).filter(Boolean);
    const allLabel = lang === "bn" ? "সব ছবি" : "All Photos";
    return [{ key: "all", label: allLabel }, ...unique.map((entry) => ({ key: toSlug(entry), label: entry }))];
  }, [items, lang]);

  const [activeTab, setActiveTab] = useState("all");

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter((item) => toSlug(item.album) === activeTab);
  }, [activeTab, items]);

  return (
    <section className="space-y-5">
      <div className="flex snap-x gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "border-brand-red bg-brand-red text-white shadow-sm"
                : "border-brand-green/25 bg-white text-brand-green hover:border-brand-green/45 hover:bg-brand-green/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <figure key={item.id} className="group relative overflow-hidden rounded-2xl border border-brand-ink/10 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
            <div className="relative h-56 w-full sm:h-60">
              <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-brand-ink/15 to-transparent opacity-70 transition group-hover:opacity-85" />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="inline-flex rounded-full border border-white/30 bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                {item.album}
              </p>
              <p className="mt-2 line-clamp-2 text-sm font-semibold">{item.title}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
