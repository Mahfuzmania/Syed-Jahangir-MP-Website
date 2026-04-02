import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/SectionTitle";
import { WorkItemIcon } from "@/components/WorkItemIcon";
import { isLang, t, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export default async function WorkHistoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const content = await getSiteContent();
  const copy = t(lang);
  const pageCopy = content.pageCopy.workHistory;

  return (
    <div className="space-y-6">
      <SectionTitle title={copy.work} description={translate(lang, pageCopy.pageDescription)} />

      <div className="grid gap-4 md:grid-cols-2">
        {content.workHistory.map((item) => (
          <article key={item.id} className="card-surface p-5 sm:p-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <WorkItemIcon iconKey={item.icon} className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-xl font-bold text-brand-green">{translate(lang, item.title)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink/80">{translate(lang, item.summary)}</p>
          </article>
        ))}
      </div>

      <div className="card-surface flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-brand-green">{translate(lang, pageCopy.ctaTitle)}</h3>
          <p className="text-sm text-brand-ink/75">{translate(lang, pageCopy.ctaText)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${lang}/write-to-mp`} className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green">
            {copy.writeToMp}
          </Link>
          <Link
            href={`/${lang}/track-request`}
            className="rounded-full border border-brand-green/35 px-5 py-2.5 text-sm font-bold text-brand-green transition hover:bg-brand-green hover:text-white"
          >
            {copy.trackRequest}
          </Link>
        </div>
      </div>

      <div className="card-surface overflow-hidden p-3">
        <Image src={content.candidate.heroImage} alt={translate(lang, pageCopy.heroImageAlt)} width={1800} height={700} className="h-64 w-full rounded-2xl object-cover" />
      </div>
    </div>
  );
}

