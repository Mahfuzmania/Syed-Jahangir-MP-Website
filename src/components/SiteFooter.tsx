import Image from "next/image";
import Link from "next/link";
import { Lang, SiteContent } from "@/lib/types";
import { t, translate } from "@/lib/i18n";

function SocialIcon({
  type,
  className
}: {
  type: "facebook" | "youtube" | "twitter" | "instagram";
  className?: string;
}) {
  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="currentColor"
          d="M13.5 21v-7h2.4l.36-2.8H13.5V9.4c0-.8.22-1.36 1.39-1.36h1.49V5.56a13.05 13.05 0 0 0-2.16-.13c-2.13 0-3.59 1.3-3.59 3.7v2.07H8.2V14h2.43v7h2.87Z"
        />
      </svg>
    );
  }

  if (type === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="currentColor"
          d="M23.5 7.2a3.1 3.1 0 0 0-2.2-2.2C19.3 4.5 12 4.5 12 4.5s-7.3 0-9.3.5A3.1 3.1 0 0 0 .5 7.2 32.5 32.5 0 0 0 0 12a32.5 32.5 0 0 0 .5 4.8 3.1 3.1 0 0 0 2.2 2.2c2 .5 9.3.5 9.3.5s7.3 0 9.3-.5a3.1 3.1 0 0 0 2.2-2.2A32.5 32.5 0 0 0 24 12a32.5 32.5 0 0 0-.5-4.8ZM9.6 15.5V8.5l6.1 3.5-6.1 3.5Z"
        />
      </svg>
    );
  }

  if (type === "twitter") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path
          fill="currentColor"
          d="M18.24 2H21l-6.03 6.9L22 22h-5.5l-4.3-5.86L7.06 22H4.3l6.45-7.38L2 2h5.64l3.9 5.35L18.24 2Zm-.97 18h1.53L6.82 3.9H5.2L17.27 20Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 2.16c3.2 0 3.58.01 4.85.07 1.18.05 1.99.24 2.45.42.63.25 1.08.54 1.56 1.02.48.48.77.93 1.02 1.56.18.46.37 1.27.42 2.45.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.18-.24 1.99-.42 2.45a4.2 4.2 0 0 1-1.02 1.56 4.2 4.2 0 0 1-1.56 1.02c-.46.18-1.27.37-2.45.42-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.18-.05-1.99-.24-2.45-.42a4.2 4.2 0 0 1-1.56-1.02 4.2 4.2 0 0 1-1.02-1.56c-.18-.46-.37-1.27-.42-2.45C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.18.24-1.99.42-2.45.25-.63.54-1.08 1.02-1.56.48-.48.93-.77 1.56-1.02.46-.18 1.27-.37 2.45-.42C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.16 0-3.53.01-4.77.07-1.05.05-1.62.22-2 .36-.5.19-.86.43-1.24.8-.37.38-.61.74-.8 1.24-.14.38-.31.95-.36 2-.06 1.24-.07 1.61-.07 4.77 0 3.16.01 3.53.07 4.77.05 1.05.22 1.62.36 2 .19.5.43.86.8 1.24.38.37.74.61 1.24.8.38.14.95.31 2 .36 1.24.06 1.61.07 4.77.07 3.16 0 3.53-.01 4.77-.07 1.05-.05 1.62-.22 2-.36.5-.19.86-.43 1.24-.8.37-.38.61-.74.8-1.24.14-.38.31-.95.36-2 .06-1.24.07-1.61.07-4.77 0-3.16-.01-3.53-.07-4.77-.05-1.05-.22-1.62-.36-2a2.58 2.58 0 0 0-.8-1.24 2.58 2.58 0 0 0-1.24-.8c-.38-.14-.95-.31-2-.36-1.24-.06-1.61-.07-4.77-.07Zm0 4.38A3.84 3.84 0 1 1 12 15.84 3.84 3.84 0 0 1 12 8.16Zm0 6.34A2.5 2.5 0 1 0 12 9.5a2.5 2.5 0 0 0 0 5Zm4.9-7.4a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z"
      />
    </svg>
  );
}

function ContactIcon({
  kind,
  className
}: {
  kind: "phone" | "email" | "location";
  className?: string;
}) {
  if (kind === "phone") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M6.6 3.8h3.3l1 4.2-2 1.2a14 14 0 0 0 5 5l1.2-2 4.2 1v3.3a2 2 0 0 1-2 2A14.4 14.4 0 0 1 3.8 6a2 2 0 0 1 2-2.2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "email") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <path d="M4 6h16v12H4zM4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 21s6-6 6-10a6 6 0 1 0-12 0c0 4 6 10 6 10Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function SiteFooter({ lang, content }: { lang: Lang; content: SiteContent }) {
  const text = t(lang);
  const year = new Date().getFullYear();
  const candidateName = translate(lang, content.candidate.name);
  const honorific = lang === "bn" ? "এমপি" : "MP";
  const displayPhone =
    content.contact.phone?.trim() ||
    (lang === "bn" ? "অফিসিয়াল ফোন শীঘ্রই প্রকাশ করা হবে" : "Official phone will be published soon");
  const displayEmail =
    content.contact.email?.trim() ||
    (lang === "bn" ? "অফিসিয়াল ইমেইল শীঘ্রই প্রকাশ করা হবে" : "Official email will be published soon");
  const socialItems = [
    { key: "facebook", href: content.socials.facebook, label: "Facebook" },
    { key: "youtube", href: content.socials.youtube, label: "YouTube" },
    { key: "twitter", href: content.socials.twitter, label: "X" },
    { key: "instagram", href: content.socials.instagram, label: "Instagram" }
  ] as const;
  const quickLinks = [
    { href: `/${lang}`, label: text.home },
    { href: `/${lang}/profile`, label: text.profile },
    { href: `/${lang}/commitments`, label: text.commitments },
    { href: `/${lang}/manifesto`, label: text.manifesto },
    { href: `/${lang}/development-projects`, label: text.developmentProjects },
    { href: `/${lang}/news`, label: text.news },
    { href: `/${lang}/contact`, label: text.contact },
    { href: `/${lang}/write-to-mp`, label: text.writeToMp }
  ];

  return (
    <footer className="relative mt-16 overflow-hidden border-t border-brand-green/35 bg-[#063f2a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(210,19,53,0.22),transparent_36%),radial-gradient(circle_at_86%_20%,rgba(255,255,255,0.1),transparent_32%),linear-gradient(145deg,rgba(4,58,36,0.95),rgba(1,33,20,0.98))]" />
      <div className="relative mx-auto w-full max-w-[92rem] px-4 py-12 md:px-8 md:py-14">
        <div className="grid gap-7 md:grid-cols-[1.24fr,0.92fr,0.84fr]">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <Image
                src="/branding/site-logo.png"
                alt={`${candidateName} logo`}
                width={72}
                height={72}
                className="h-14 w-14 shrink-0 object-contain"
              />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">{text.citizenPortal}</p>
                <p className="mt-1 text-xl font-bold">
                  {candidateName}
                  <span className="ml-1 align-top text-[0.62em] font-semibold tracking-wide text-white/90">{honorific}</span>
                </p>
                <p className="mt-1 text-xs text-white/85">{text.headerConstituencyName}</p>
                <p className="text-xs text-white/75">{text.headerPartyName}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/90">{translate(lang, content.candidate.intro)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/${lang}/write-to-mp`}
                className="inline-flex rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-brand-green"
              >
                {text.writeToMp}
              </Link>
              <Link
                href={`/${lang}/track-request`}
                className="inline-flex rounded-full border border-white/60 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-brand-green"
              >
                {text.trackRequest}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/6 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">{text.contact}</p>
            <div className="mt-4 space-y-3 text-sm text-white/92">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="inline-flex items-center gap-2 whitespace-nowrap">
                  <ContactIcon kind="phone" className="h-4 w-4" />
                  {displayPhone}
                </p>
                <p className="inline-flex items-center gap-2 whitespace-nowrap">
                  <ContactIcon kind="email" className="h-4 w-4" />
                  {displayEmail}
                </p>
              </div>
              <p className="inline-flex items-start gap-2 leading-relaxed text-white/82">
                <ContactIcon kind="location" className="mt-0.5 h-4 w-4 shrink-0" />
                {translate(lang, content.contact.address)}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/6 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">{text.socialMedia}</p>
            <div className="mt-4 space-y-2">
              {socialItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-2 text-sm text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <SocialIcon type={item.key} className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/15 bg-white/6 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">{text.sitemap}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center justify-between rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white hover:text-brand-green"
              >
                <span>{item.label}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/25 bg-black/18 px-4 py-3 text-xs text-white/85">
        <div className="mx-auto flex w-full max-w-[92rem] flex-col items-center justify-between gap-2 pr-20 sm:flex-row sm:pr-0">
          <p>
            &copy; {year} {candidateName}. {text.rightsReserved}.
          </p>
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1.5">
            <Image
              src="/branding/azm-labs-logo.png"
              alt="AZM Labs logo"
              width={76}
              height={24}
              className="h-5 w-auto object-contain"
            />
            <span>Developed by AZM Labs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
