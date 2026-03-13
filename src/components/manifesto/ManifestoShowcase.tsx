import Link from "next/link";
import { t } from "@/lib/i18n";
import { Lang } from "@/lib/types";

export function ManifestoShowcase({
  lang,
  title,
  summary,
  pdfUrl,
  viewerHeightClass = "h-[560px]",
  showWriteToMp = true
}: {
  lang: Lang;
  title: string;
  summary: string;
  pdfUrl: string;
  viewerHeightClass?: string;
  showWriteToMp?: boolean;
}) {
  const copy = t(lang);
  const highlights =
    lang === "bn"
      ? ["স্বাস্থ্য, শিক্ষা, কৃষি ও কর্মসংস্থানে বাস্তব কর্মপরিকল্পনা", "ডিজিটাল নাগরিক সেবা ও জবাবদিহি কাঠামো", "ইউনিয়নভিত্তিক অগ্রাধিকার প্রকল্প"]
      : [
          "Practical implementation plan across health, education, agriculture, and jobs",
          "Digital public services with transparent accountability",
          "Union-level priority project roadmap"
        ];

  return (
    <section className="card-surface overflow-hidden border border-brand-green/10 p-4 md:p-6">
      <div className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-2xl border border-brand-ink/10 bg-white/80 p-5 md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-red/85">
            {lang === "bn" ? "নির্বাচনী নথি" : "Election Dossier"}
          </p>
          <h3 className="mt-3 text-2xl font-bold leading-tight text-brand-green md:text-3xl">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-brand-ink/80 md:text-base">{summary}</p>

          <div className="mt-4 space-y-2">
            {highlights.map((item, index) => (
              <p key={`${item}-${index}`} className="rounded-xl border border-brand-ink/10 bg-slate-50 px-3 py-2 text-xs text-brand-ink/75 md:text-sm">
                {item}
              </p>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="rounded-full bg-brand-green px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red">
              {copy.openPdf}
            </a>
            <a href={pdfUrl} download className="rounded-full border border-brand-green px-4 py-2 text-sm font-bold text-brand-green transition hover:bg-brand-green hover:text-white">
              {copy.download}
            </a>
            {showWriteToMp ? (
              <Link
                href={`/${lang}/write-to-mp`}
                className="rounded-full border border-brand-red px-4 py-2 text-sm font-bold text-brand-red transition hover:bg-brand-red hover:text-white"
              >
                {copy.writeToMp}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-ink/10 bg-gradient-to-br from-white via-white to-emerald-50/50 p-3 md:p-4">
          <div className={`relative overflow-hidden rounded-xl border border-brand-ink/15 bg-white ${viewerHeightClass}`}>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-brand-ink/12 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-brand-ink/10 to-transparent" />
            <iframe src={`${pdfUrl}#view=FitH`} title={title} className="hidden h-full w-full md:block" />
            <div className="flex h-full items-center justify-center px-5 text-center md:hidden">
              <div>
                <p className="text-sm font-semibold text-brand-green">{lang === "bn" ? "মোবাইলে প্রিভিউ সীমিত" : "Limited preview on mobile"}</p>
                <p className="mt-1 text-xs text-brand-ink/65">{copy.pdfPreviewDesktopOnly}</p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-full bg-brand-green px-4 py-2 text-xs font-bold text-white"
                >
                  {copy.openPdf}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
