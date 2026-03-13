"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function DynamicMotionShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.includes("/admin");
  const isHomeRoute = /^\/(?:bn|en)\/?$/.test(pathname);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const [routeKey, setRouteKey] = useState(pathname);
  const [routeVisible, setRouteVisible] = useState(true);

  useEffect(() => {
    if (isAdminRoute) {
      setRouteKey(pathname);
      setRouteVisible(true);
      return;
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      setRouteKey(pathname);
      setRouteVisible(true);
      return;
    }

    setRouteKey(pathname);
    setRouteVisible(false);
    const raf = window.requestAnimationFrame(() => setRouteVisible(true));
    return () => window.cancelAnimationFrame(raf);
  }, [isAdminRoute, pathname]);

  useEffect(() => {
    if (isAdminRoute) return;

    const root = containerRef.current;
    if (!root) return;

    const candidates = Array.from(
      new Set(
        Array.from(
          root.querySelectorAll<HTMLElement>("section, article, .card-surface, [data-reveal]")
        )
      )
    );

    const revealTargets = candidates.filter((target) => {
      if (target.dataset.noReveal === "true") {
        return false;
      }

      const carouselRoot = target.closest<HTMLElement>('[data-carousel="true"]');
      if (carouselRoot && carouselRoot !== target) {
        return false;
      }

      return true;
    });

    if (revealTargets.length === 0) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    revealTargets.forEach((target, index) => {
      const slideLeft = index % 2 === 0;
      target.classList.remove(
        "is-visible",
        "motion-reveal",
        "motion-reveal--left",
        "motion-reveal--right",
        "screen-reveal",
        "screen-reveal--left",
        "screen-reveal--right"
      );

      if (isHomeRoute) {
        target.classList.add("screen-reveal");
        target.classList.add(slideLeft ? "screen-reveal--left" : "screen-reveal--right");
        target.style.setProperty("--screen-reveal-shift-x", slideLeft ? "-96px" : "96px");
      } else {
        target.classList.add("motion-reveal");
        target.classList.add(slideLeft ? "motion-reveal--left" : "motion-reveal--right");
        target.style.setProperty("--reveal-shift-x", slideLeft ? "-44px" : "44px");
      }

      target.style.setProperty("--reveal-delay", `${Math.min(index, 8) * 65}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add("is-visible");
            observer.unobserve(target);
          }
        }
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    revealTargets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [isAdminRoute, isHomeRoute, routeKey]);

  if (isAdminRoute) {
    return <div ref={containerRef}>{children}</div>;
  }

  return (
    <div ref={containerRef}>
      <div key={routeKey} className={`route-stage ${routeVisible ? "route-stage--in" : ""}`}>
        {children}
      </div>
    </div>
  );
}
