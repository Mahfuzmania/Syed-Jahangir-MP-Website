"use client";

import Link from "next/link";
import { Lang, NoticeBarContent } from "@/lib/types";
import { translate } from "@/lib/i18n";

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^mailto:/i.test(value) || /^tel:/i.test(value);
}

function resolveNoticeHref(link: string, lang: Lang) {
  const cleaned = link.trim();
  if (!cleaned) return "";
  if (isExternalUrl(cleaned)) return cleaned;

  if (cleaned.startsWith("/bn") || cleaned.startsWith("/en")) {
    return cleaned;
  }
  if (cleaned.startsWith("/")) {
    return `/${lang}${cleaned}`;
  }
  return cleaned;
}

function isWithinSchedule(nowTs: number, startAt: string, endAt: string) {
  const startTs = Date.parse(startAt);
  const endTs = Date.parse(endAt);
  if (Number.isFinite(startTs) && nowTs < startTs) return false;
  if (Number.isFinite(endTs) && nowTs > endTs) return false;
  return true;
}

export function NoticeTicker({ lang, noticeBar }: { lang: Lang; noticeBar: NoticeBarContent }) {
  if (!noticeBar.enabled) {
    return null;
  }

  const nowTs = Date.now();
  const visibleItems = noticeBar.items
    .filter((item) => item.isActive && (item.text.bn.trim() || item.text.en.trim()))
    .filter((item) => isWithinSchedule(nowTs, item.startAt, item.endAt))
    .sort((left, right) => left.order - right.order);

  if (visibleItems.length === 0) {
    return null;
  }

  const speed = Math.max(18, Math.min(120, Number(noticeBar.speed) || 42));
  const durationSec = Math.max(14, Math.min(48, Number((680 / speed).toFixed(2))));
  const repeatedItems = [...visibleItems, ...visibleItems];
  const badgeLabel = translate(lang, noticeBar.prefixLabel).trim() || (lang === "bn" ? "নোটিশ" : "Notice");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-2 md:px-8 md:pt-3">
      <div className="notice-shell group relative flex items-center overflow-hidden rounded-2xl border border-brand-green/20 bg-white/90 shadow-[0_8px_24px_rgba(16,34,24,0.12)]">
        <div className="notice-badge z-[1] shrink-0 bg-brand-red px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white sm:px-4">
          {badgeLabel}
        </div>
        <div className="notice-track-mask relative min-w-0 flex-1 overflow-hidden">
          <div
            className={`notice-track flex min-w-max items-center py-2 ${
              noticeBar.direction === "ltr" ? "notice-track-ltr" : "notice-track-rtl"
            }`}
            style={{ "--notice-duration": `${durationSec}s` } as React.CSSProperties}
          >
            {repeatedItems.map((item, index) => {
              const text = translate(lang, item.text).trim();
              const href = resolveNoticeHref(item.link, lang);
              const isExternal = isExternalUrl(href);
              const itemClassName = item.isUrgent
                ? "notice-item notice-item-urgent"
                : "notice-item";

              return (
                <span key={`${item.id}-${index}`} className="inline-flex items-center">
                  {href ? (
                    isExternal ? (
                      <a href={href} target="_blank" rel="noreferrer" className={itemClassName}>
                        {text}
                      </a>
                    ) : (
                      <Link href={href} className={itemClassName}>
                        {text}
                      </Link>
                    )
                  ) : (
                    <span className={itemClassName}>{text}</span>
                  )}
                  <span className="notice-separator" aria-hidden="true">
                    •
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

