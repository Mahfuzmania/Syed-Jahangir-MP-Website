"use client";

import { useEffect, useMemo, useState } from "react";

export function NewsShareButtons({ lang, slug, title }: { lang: "bn" | "en"; slug: string; title: string }) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const share = useMemo(() => {
    const path = `/${lang}/news/${slug}`;
    const url = origin ? `${origin}${path}` : path;
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      x: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
    };
  }, [lang, origin, slug, title]);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <a href={share.facebook} target="_blank" rel="noreferrer" className="rounded-full border border-brand-ink/20 px-3 py-1 text-xs font-semibold text-brand-ink/80">
        Facebook
      </a>
      <a href={share.x} target="_blank" rel="noreferrer" className="rounded-full border border-brand-ink/20 px-3 py-1 text-xs font-semibold text-brand-ink/80">
        X
      </a>
      <a href={share.whatsapp} target="_blank" rel="noreferrer" className="rounded-full border border-brand-ink/20 px-3 py-1 text-xs font-semibold text-brand-ink/80">
        WhatsApp
      </a>
    </div>
  );
}
