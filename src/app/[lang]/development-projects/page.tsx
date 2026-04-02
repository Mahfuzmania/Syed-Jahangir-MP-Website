import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MonthlyReportFeed } from "@/components/MonthlyReportFeed";
import { SectionTitle } from "@/components/SectionTitle";
import { SubsectionNav } from "@/components/SubsectionNav";
import { WorkItemIcon } from "@/components/WorkItemIcon";
import { isLang, t, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

function formatBdt(amount: number, lang: "bn" | "en") {
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(Math.max(0, amount));
}

export default async function DevelopmentProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const copy = t(lang);
  const content = await getSiteContent();
  const pageCopy = content.pageCopy.development;
  const featuredCommitments = content.commitments.slice(0, 3);
  const featuredProjects = content.governmentProjects.slice(0, 3);
  const featuredWork = content.workHistory.slice(0, 4);

  return (
    <div className="space-y-8">
      <SectionTitle title={copy.developmentProjects} description={translate(lang, pageCopy.pageDescription)} />

      <SubsectionNav
        defaultActiveId="priority-plans"
        items={[
          { id: "priority-plans", label: copy.commitments },
          { id: "government-projects", label: copy.governmentProjects },
          { id: "previous-work", label: copy.work },
          { id: "monthly-reports", label: translate(lang, pageCopy.monthlyReportsNavLabel) }
        ]}
      />

      <section id="priority-plans" className="space-y-4 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-brand-ink">{copy.commitments}</h2>
          <Link href={`/${lang}/commitments`} className="text-sm font-bold text-brand-green hover:underline">
            {translate(lang, pageCopy.viewAllLabel)}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredCommitments.map((item) => (
            <article key={item.id} className="card-surface overflow-hidden p-3">
              <Image src={item.image} alt={translate(lang, item.title)} width={900} height={600} className="h-44 w-full rounded-xl object-cover sm:h-48" />
              <div className="p-1 pt-4">
                <h3 className="text-lg font-bold text-brand-green">{translate(lang, item.title)}</h3>
                <p className="mt-2 text-sm text-brand-ink/78">{translate(lang, item.summary)}</p>
                <Link href={`/${lang}/commitments/${item.slug}`} className="mt-3 inline-flex text-sm font-bold text-brand-red hover:underline">
                  {copy.readMore}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="government-projects" className="space-y-4 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-brand-ink">{copy.governmentProjects}</h2>
          <Link href={`/${lang}/government-projects`} className="text-sm font-bold text-brand-green hover:underline">
            {translate(lang, pageCopy.viewAllLabel)}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredProjects.map((project) => (
            <article key={project.id} className="card-surface overflow-hidden p-3">
              <div className="relative h-44 w-full rounded-xl bg-slate-100 sm:h-48">
                <Image src={project.image} alt={translate(lang, project.title)} fill className="rounded-xl object-cover" />
              </div>
              <div className="p-1 pt-4">
                <h3 className="text-lg font-bold text-brand-green">{translate(lang, project.title)}</h3>
                <p className="mt-2 text-sm text-brand-ink/78">{translate(lang, project.summary)}</p>
                <div className="mt-3 rounded-xl border border-brand-ink/10 bg-slate-50 p-2.5 text-xs text-brand-ink/75">
                  <p>{translate(lang, pageCopy.budgetLabel)}: {formatBdt(project.budgetTotal, lang)}</p>
                  <p>{translate(lang, pageCopy.spentLabel)}: {formatBdt(project.spentAmount, lang)}</p>
                  <p>{translate(lang, pageCopy.progressLabel)}: {project.progressPercent}%</p>
                </div>
                <Link href={`/${lang}/government-projects/${project.slug}`} className="mt-3 inline-flex text-sm font-bold text-brand-red hover:underline">
                  {copy.readMore}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="previous-work" className="space-y-4 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-brand-ink">{copy.work}</h2>
          <Link href={`/${lang}/work-history`} className="text-sm font-bold text-brand-green hover:underline">
            {translate(lang, pageCopy.viewAllLabel)}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {featuredWork.map((item) => (
            <article key={item.id} className="card-surface p-4 sm:p-5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                <WorkItemIcon iconKey={item.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-brand-green">{translate(lang, item.title)}</h3>
              <p className="mt-2 text-sm text-brand-ink/78">{translate(lang, item.summary)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="monthly-reports" className="space-y-4 scroll-mt-28">
        <SectionTitle
          title={translate(lang, pageCopy.monthlyReportsTitle)}
          description={translate(lang, pageCopy.monthlyReportsDescription)}
        />
        <MonthlyReportFeed lang={lang} reports={content.monthlyReports} />
      </section>
    </div>
  );
}

