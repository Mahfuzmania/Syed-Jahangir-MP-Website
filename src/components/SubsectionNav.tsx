"use client";

import { useEffect, useState } from "react";

type SubsectionItem = {
  id: string;
  label: string;
};

export function SubsectionNav({
  title,
  items,
  defaultActiveId
}: {
  title?: string;
  items: SubsectionItem[];
  defaultActiveId?: string;
}) {
  const [activeId, setActiveId] = useState(defaultActiveId || items[0]?.id || "");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const exists = items.some((item) => item.id === hash);
    if (exists) {
      setActiveId(hash);
    }
  }, [items]);

  return (
    <section className="card-surface border border-brand-green/12 px-4 py-4 sm:px-6 sm:py-5">
      {title ? (
        <p className="inline-flex items-center rounded-full border border-brand-green/25 bg-brand-green/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-green/85">
          {title}
        </p>
      ) : null}
      <div className={`${title ? "mt-3" : ""} flex gap-2 overflow-x-auto pb-1`}>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => setActiveId(item.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeId === item.id
                ? "border-brand-green bg-brand-green text-white shadow-[0_10px_22px_rgba(0,82,46,0.25)]"
                : "border-brand-ink/20 bg-white/85 text-brand-green hover:border-brand-green/45 hover:bg-brand-green/8"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </section>
  );
}
