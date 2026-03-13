"use client";

import { useEffect, useState } from "react";
import { Lang } from "@/lib/types";

type Theme = "light" | "dark";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const raw = window.localStorage.getItem("theme-preference");
  return raw === "dark" ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem("theme-preference", theme);
}

export function ThemeToggle({ className = "", lang = "en" }: { className?: string; lang?: Lang }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const current = getStoredTheme();
    setTheme(current);
    applyTheme(current);
  }, []);

  const isDark = theme === "dark";
  const next = isDark ? "light" : "dark";
  const lightLabel = lang === "bn" ? "লাইট" : "Light";
  const darkLabel = lang === "bn" ? "ডার্ক" : "Dark";
  const ariaToLight = lang === "bn" ? "লাইট মোডে পরিবর্তন করুন" : "Switch to light mode";
  const ariaToDark = lang === "bn" ? "ডার্ক মোডে পরিবর্তন করুন" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(next);
        applyTheme(next);
      }}
      aria-label={isDark ? ariaToLight : ariaToDark}
      title={isDark ? lightLabel : darkLabel}
      className={`nav-link-motion inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-green/35 px-3 text-xs font-semibold text-brand-green transition hover:bg-brand-green hover:text-white ${className}`}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <circle cx="12" cy="12" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.2 5.8l-1.7 1.7M7.5 16.5l-1.7 1.7M18.2 18.2l-1.7-1.7M7.5 7.5 5.8 5.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path d="M19.4 14.9A8 8 0 1 1 9.1 4.6a7 7 0 0 0 10.3 10.3Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {isDark ? lightLabel : darkLabel}
    </button>
  );
}
