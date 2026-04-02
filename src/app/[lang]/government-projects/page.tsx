import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang, translate } from "@/lib/i18n";
import { GovernmentProjectStatus, SiteContent } from "@/lib/types";
import { getSiteContent } from "@/lib/storage";

function statusLabel(
  status: GovernmentProjectStatus,
  labels: SiteContent["pageCopy"]["governmentProjects"]["statusLabels"],
  lang: "bn" | "en"
) {
  if (status === "planned") return translate(lang, labels.planned);
  if (status === "running") return translate(lang, labels.running);
  if (status === "completed") return translate(lang, labels.completed);
  return translate(lang, labels.onHold);
}

function statusClass(status: GovernmentProjectStatus) {
  if (status === "planned") return "border-slate-200 bg-slate-100 text-slate-700";
  if (status === "running") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "completed") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatBdt(amount: number, lang: "bn" | "en") {
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(Math.max(0, amount));
}

export default async function GovernmentProjectsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const content = await getSiteContent();
  const pageCopy = content.pageCopy.governmentProjects;
  const statusCopy = pageCopy.statusLabels;

  return (
    <div className="space-y-6">
      <SectionTitle title={translate(lang, pageCopy.pageTitle)} description={translate(lang, pageCopy.pageDescription)} />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {content.governmentProjects.map((project) => (
          <article key={project.id} className="card-surface overflow-hidden p-3">
            <div className="relative h-48 w-full rounded-xl bg-slate-100">
              <Image src={project.image} alt={translate(lang, project.title)} fill className="rounded-xl object-cover" />
            </div>
            <div className="p-1 pt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-brand-ink/65">{project.sector}</p>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass(project.status)}`}>
                  {statusLabel(project.status, statusCopy, lang)}
                </span>
              </div>
              <h2 className="mt-2 text-lg font-bold text-brand-green">{translate(lang, project.title)}</h2>
              <p className="mt-2 text-sm text-brand-ink/80">{translate(lang, project.summary)}</p>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-green/12">
                <div className="h-full rounded-full bg-brand-green" style={{ width: `${Math.max(0, Math.min(100, project.progressPercent))}%` }} />
              </div>

              <div className="mt-3 rounded-xl border border-brand-ink/10 bg-slate-50 p-3 text-xs text-brand-ink/75">
                <p>{translate(lang, pageCopy.totalBudgetLabel)}: {formatBdt(project.budgetTotal, lang)}</p>
                <p>{translate(lang, pageCopy.spentLabel)}: {formatBdt(project.spentAmount, lang)}</p>
                <p>{translate(lang, pageCopy.progressLabel)}: {project.progressPercent}%</p>
              </div>
              <Link href={`/${lang}/government-projects/${project.slug}`} className="mt-4 inline-flex text-sm font-bold text-brand-red hover:underline">
                {translate(lang, pageCopy.fullBreakdownLabel)}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
