"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type SectionCarouselSlide = {
  id: string;
  image: string;
  title: string;
  description?: string;
  meta?: string;
  href?: string;
  actionLabel?: string;
};

export function SectionCarousel({
  lang,
  slides,
  autoMs = 5200
}: {
  lang: "bn" | "en";
  slides: SectionCarouselSlide[];
  autoMs?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const canSlide = total > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [total]);

  useEffect(() => {
    if (!canSlide || paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, autoMs);
    return () => window.clearInterval(timer);
  }, [autoMs, canSlide, paused, total]);

  const labels = useMemo(
    () => ({
      prev: lang === "bn" ? "পূর্বের স্লাইড" : "Previous slide",
      next: lang === "bn" ? "পরের স্লাইড" : "Next slide",
      open: lang === "bn" ? "বিস্তারিত দেখুন" : "Open details",
      index: lang === "bn" ? "আইটেম" : "Item"
    }),
    [lang]
  );

  function goPrev() {
    if (!canSlide) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }

  function goNext() {
    if (!canSlide) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }

  if (total === 0) {
    return null;
  }

  return (
    <div
      data-carousel="true"
      data-reveal
      className="carousel-shell overflow-hidden rounded-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative">
        {canSlide ? (
          <div className="absolute right-3 top-3 z-10 hidden items-center gap-2 sm:flex">
            <button
              type="button"
              aria-label={labels.prev}
              onClick={goPrev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-green/35 bg-white/90 text-brand-green shadow-sm transition hover:bg-brand-green hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {"<"}
              </span>
            </button>
            <button
              type="button"
              aria-label={labels.next}
              onClick={goNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-green/35 bg-white/90 text-brand-green shadow-sm transition hover:bg-brand-green hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {">"}
              </span>
            </button>
          </div>
        ) : null}

        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {slides.map((slide, index) => {
            const external = slide.href ? /^https?:\/\//i.test(slide.href) : false;
            return (
              <article key={slide.id} data-no-reveal="true" className="w-full min-w-full shrink-0 basis-full">
                <div className="grid min-h-[24rem] lg:grid-cols-[1.08fr,0.92fr]">
                  <div className="photo-card relative m-3 min-h-[220px] sm:min-h-[290px] lg:my-3 lg:ml-3 lg:mr-0 lg:min-h-[calc(100%-1.5rem)]">
                    <Image src={slide.image} alt={slide.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-ink/45 via-brand-ink/8 to-transparent" />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/45 bg-brand-ink/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      <span>{labels.index}</span>
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1.5 text-[11px]">
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between border-t border-brand-ink/10 bg-[#fffdf8] px-5 py-5 sm:px-6 lg:border-l lg:border-t-0 lg:px-7">
                    <div>
                      {slide.meta ? <p className="text-xs font-semibold uppercase tracking-[0.13em] text-brand-ink/55">{slide.meta}</p> : null}
                      <h3 className="mt-2 text-xl font-extrabold leading-tight text-brand-green sm:text-2xl lg:text-[1.9rem]">{slide.title}</h3>
                      {slide.description ? <p className="mt-3 text-sm leading-relaxed text-brand-ink/82 sm:text-base">{slide.description}</p> : null}
                    </div>

                    {slide.href ? (
                      external ? (
                        <a
                          href={slide.href}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-5 inline-flex w-fit rounded-full bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-red"
                        >
                          {slide.actionLabel || labels.open}
                        </a>
                      ) : (
                        <Link
                          href={slide.href}
                          className="mt-5 inline-flex w-fit rounded-full bg-brand-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-red"
                        >
                          {slide.actionLabel || labels.open}
                        </Link>
                      )
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {canSlide ? (
          <div className="border-t border-brand-ink/10 bg-white/95 px-3 py-2 sm:hidden">
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                aria-label={labels.prev}
                onClick={goPrev}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/10 text-brand-green transition hover:bg-brand-green hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {"<"}
                </span>
              </button>
              <button
                type="button"
                aria-label={labels.next}
                onClick={goNext}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-green/10 text-brand-green transition hover:bg-brand-green hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {">"}
                </span>
              </button>
            </div>
          </div>
        ) : null}

        {canSlide ? (
          <div className="border-t border-brand-ink/10 bg-white/95 px-3 py-2.5 sm:px-4">
            <div className="mx-auto flex w-fit items-center gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.id}-dot`}
                  type="button"
                  aria-label={`${labels.open} ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green ${
                    index === activeIndex ? "w-7 bg-brand-green" : "w-2.5 bg-brand-green/30 hover:bg-brand-green/50"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
