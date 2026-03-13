"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Lang, SiteContent } from "@/lib/types";
import { t, translate } from "@/lib/i18n";

const navItems = [
  { key: "home", href: "" },
  { key: "profile", href: "/profile" },
  { key: "commitments", href: "/commitments" },
  { key: "manifesto", href: "/manifesto" },
  { key: "developmentProjects", href: "/development-projects" },
  { key: "videoMediaGallery", href: "/media-gallery" },
  { key: "news", href: "/news" },
  { key: "contact", href: "/contact" }
] as const;

function HeaderActionIcon({ kind, className = "h-4 w-4" }: { kind: "write" | "track" | "language" | "admin"; className?: string }) {
  if (kind === "write") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M3.5 20.5h5.2l10.4-10.4a2.2 2.2 0 0 0-3.1-3.1L5.6 17.4v3.1Z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m13.2 8 2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "track") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="3.1" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8.2 9.6h7.6M8.2 13h4.6M8.2 16.4h5.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="16.4" cy="16.2" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }

  if (kind === "language") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M4 6.3h9.8M8.9 6.3c0 6.4-3.4 10.2-5.4 12M8.9 6.3c1.2 3.2 3.2 5.7 6 7.4M13.3 18.3h7.1M16.8 6.4l3 11.9M18.3 12.7h-3.2" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 3.2 4.4 6.8v5.1c0 4.8 3.2 7.9 7.6 9.1 4.4-1.2 7.6-4.3 7.6-9.1V6.8L12 3.2Z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9.3 12.4 2 2 3.5-3.6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SiteHeader({ lang, content }: { lang: Lang; content: SiteContent }) {
  const text = t(lang);
  const nextLang = lang === "bn" ? "en" : "bn";
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const candidateName = translate(lang, content.candidate.name);
  const honorific = lang === "bn" ? "এমপি" : "MP";
  const shortTitle = translate(lang, content.candidate.shortTitle);
  const languageSwitchHref = useMemo(() => {
    if (!pathname || pathname === "/") {
      return `/${nextLang}`;
    }

    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) {
      return `/${nextLang}`;
    }

    if (parts[0] === "bn" || parts[0] === "en") {
      parts[0] = nextLang;
      return `/${parts.join("/")}`;
    }

    return `/${nextLang}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  }, [nextLang, pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname, lang]);

  useEffect(() => {
    function updateHeaderState() {
      setHasScrolled(window.scrollY > 26);
    }

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    return () => window.removeEventListener("scroll", updateHeaderState);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          hasScrolled
            ? "border-b border-brand-green/18 bg-white/88 shadow-[0_14px_35px_rgba(7,52,30,0.18)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="relative mx-auto w-full max-w-[92rem] px-4 py-3 md:px-8">
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-[3px] transition-opacity duration-300 ${
              hasScrolled ? "opacity-100" : "opacity-0"
            } bg-gradient-to-r from-brand-red via-brand-green to-brand-red`}
          />
          <div className="flex items-start justify-between gap-3">
            <Link href={`/${lang}`} className="min-w-0 shrink-0 lg:max-w-[24rem]">
              <div className="flex items-start gap-3">
                <Image
                  src="/branding/site-logo.png"
                  alt={`${candidateName} logo`}
                  width={64}
                  height={64}
                  className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14"
                />
                <div className="min-w-0">
                  <p className="truncate text-[1rem] font-extrabold leading-tight text-brand-green sm:text-[1.2rem]">
                    {candidateName}
                    <span className="ml-1 align-top text-[0.62em] font-semibold tracking-wide text-brand-green/90">{honorific}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-brand-ink/72 sm:text-xs">{shortTitle}</p>
                  <p className="mt-1 text-[11px] text-brand-ink/65 sm:text-xs">{text.headerPartyName}</p>
                </div>
              </div>
            </Link>

            <div className="hidden min-w-0 flex-1 lg:block">
              <nav className="flex items-center justify-end gap-1 text-[13px] font-semibold text-brand-ink">
                {navItems.map((item) => {
                  const href = `/${lang}${item.href}`;
                  const isActive = pathname === href || (item.href === "" && pathname === `/${lang}`);
                  return (
                    <Link
                      key={item.key}
                      href={href}
                      className={`nav-link-motion whitespace-nowrap rounded-full px-2.5 py-1.5 transition ${
                        isActive ? "bg-brand-green/14 text-brand-green" : "hover:bg-brand-green/10 hover:text-brand-green"
                      }`}
                    >
                      {text[item.key as keyof typeof text]}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-2 flex items-center justify-end gap-2">
                <Link
                  href={`/${lang}/search`}
                  aria-label={text.search}
                  className="nav-link-motion inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-green/35 bg-white/82 text-brand-green transition hover:bg-brand-green hover:text-white"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path
                      d="M15.5 15.5L20 20M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </Link>
                <ThemeToggle lang={lang} />
                <Link
                  href={`/${lang}/write-to-mp`}
                  className="nav-link-motion inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-red px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-brand-green"
                >
                  <HeaderActionIcon kind="write" />
                  {text.writeToMp}
                </Link>
                <Link
                  href={`/${lang}/track-request`}
                  className="nav-link-motion inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-brand-green/35 bg-white/82 px-3.5 py-1.5 text-[12px] font-semibold text-brand-green transition hover:bg-brand-green hover:text-white"
                >
                  <HeaderActionIcon kind="track" />
                  {text.trackRequest}
                </Link>
                <Link
                  href={languageSwitchHref}
                  className="nav-link-motion inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-brand-green/30 bg-white/82 px-3.5 py-1.5 text-[12px] font-semibold text-brand-green transition hover:bg-brand-green hover:text-white"
                >
                  <HeaderActionIcon kind="language" />
                  {text.languageSwitch}
                </Link>
                <Link
                  href={`/${lang}/admin/login`}
                  className="nav-link-motion inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-brand-red/42 bg-brand-red/5 px-3.5 py-1.5 text-[12px] font-semibold text-brand-red transition hover:bg-brand-red hover:text-white"
                >
                  <HeaderActionIcon kind="admin" />
                  {text.admin}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle lang={lang} className="h-10 px-2.5" />
              <button
                type="button"
                aria-label={isMenuOpen ? text.closeMenu : text.menu}
                aria-controls="mobile-nav-drawer"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-brand-green/35 bg-white px-3 text-xs font-bold text-brand-green shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
              >
                <span className="flex w-4 flex-col gap-1">
                  <span className="block h-0.5 w-4 bg-current" />
                  <span className="block h-0.5 w-4 bg-current" />
                  <span className="block h-0.5 w-4 bg-current" />
                </span>
                {text.menu}
              </button>
            </div>
          </div>
          <p className="mt-2 block text-[11px] font-semibold text-brand-green/85 lg:hidden">{text.headerConstituencyName}</p>
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" id="mobile-nav-drawer">
          <button
            type="button"
            aria-label={text.closeMenu}
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-brand-ink/40"
          />
          <div className="absolute right-0 top-0 h-full w-[84%] max-w-sm overflow-y-auto border-l border-brand-green/15 bg-white px-5 py-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-brand-green">{text.menu}</p>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full border border-brand-green/30 px-3 py-1.5 text-xs font-semibold text-brand-green"
              >
                {text.closeMenu}
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={`/${lang}${item.href}`}
                  className="block rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-brand-ink transition hover:border-brand-green/20 hover:bg-brand-green/5"
                >
                  {text[item.key as keyof typeof text]}
                </Link>
              ))}
            </nav>

            <div className="mt-6 grid grid-cols-1 gap-2">
              <Link
                href={`/${lang}/search`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-green/35 px-4 py-2.5 text-center text-sm font-bold text-brand-green"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                  <path
                    d="M15.5 15.5L20 20M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                {text.search}
              </Link>
              <Link href={`/${lang}/write-to-mp`} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-red px-4 py-2.5 text-center text-sm font-bold text-white">
                <HeaderActionIcon kind="write" />
                {text.writeToMp}
              </Link>
              <Link
                href={`/${lang}/track-request`}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-brand-green/30 px-4 py-2.5 text-center text-sm font-bold text-brand-green"
              >
                <HeaderActionIcon kind="track" />
                {text.trackRequest}
              </Link>
              <Link
                href={languageSwitchHref}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-brand-green/30 px-4 py-2.5 text-center text-sm font-bold text-brand-green"
              >
                <HeaderActionIcon kind="language" />
                {text.languageSwitch}
              </Link>
              <Link
                href={`/${lang}/admin/login`}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-brand-red/42 px-4 py-2.5 text-center text-sm font-bold text-brand-red"
              >
                <HeaderActionIcon kind="admin" />
                {text.admin}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
