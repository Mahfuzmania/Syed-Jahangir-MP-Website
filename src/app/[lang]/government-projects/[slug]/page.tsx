import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

function formatBdt(amount: number, lang: "bn" | "en") {
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(Math.max(0, amount));
}

export async function generateStaticParams() {
  const content = await getSiteContent();
  return content.governmentProjects.flatMap((item) => [{ slug: item.slug, lang: "bn" }, { slug: item.slug, lang: "en" }]);
}

export default async function GovernmentProjectDetailPage({
  params
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const content = await getSiteContent();
  const project = content.governmentProjects.find((entry) => entry.slug === slug);
  if (!project) {
    notFound();
  }
  const pageCopy = content.pageCopy.governmentProjectDetails;

  return (
    <div className="space-y-6">
      <Link href={`/${lang}/government-projects`} className="inline-flex text-sm font-semibold text-brand-red hover:underline">
        {translate(lang, pageCopy.backToListLabel)}
      </Link>

      <div className="card-surface overflow-hidden p-3">
        <Image src={project.image} alt={translate(lang, project.title)} width={1600} height={720} className="h-56 w-full rounded-2xl object-cover sm:h-72 md:h-[340px]" />
      </div>

      <article className="card-surface p-5 sm:p-7 md:p-10">
        <SectionTitle title={translate(lang, project.title)} description={translate(lang, project.summary)} />
        <p className="mt-5 leading-relaxed text-brand-ink/85">{translate(lang, project.details)}</p>

        <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-brand-green/12">
          <div className="h-full rounded-full bg-brand-green" style={{ width: `${Math.max(0, Math.min(100, project.progressPercent))}%` }} />
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl border border-brand-ink/10 bg-slate-50 p-4 text-sm text-brand-ink/80 md:grid-cols-2">
          <p>
            <span className="font-semibold">{translate(lang, pageCopy.sectorLabel)}:</span> {project.sector}
          </p>
          <p>
            <span className="font-semibold">{translate(lang, pageCopy.locationLabel)}:</span> {project.location}
          </p>
          <p>
            <span className="font-semibold">{translate(lang, pageCopy.implementingAgencyLabel)}:</span> {project.implementingAgency}
          </p>
          <p>
            <span className="font-semibold">{translate(lang, pageCopy.totalBudgetLabel)}:</span> {formatBdt(project.budgetTotal, lang)}
          </p>
          <p>
            <span className="font-semibold">{translate(lang, pageCopy.spentLabel)}:</span> {formatBdt(project.spentAmount, lang)}
          </p>
          <p>
            <span className="font-semibold">{translate(lang, pageCopy.progressLabel)}:</span> {project.progressPercent}%
          </p>
          <p>
            <span className="font-semibold">{translate(lang, pageCopy.phaseLabel)}:</span> {translate(lang, project.phase)}
          </p>
          <p>
            <span className="font-semibold">{translate(lang, pageCopy.beneficiariesLabel)}:</span> {translate(lang, project.beneficiaries)}
          </p>
        </div>
      </article>
    </div>
  );
}

