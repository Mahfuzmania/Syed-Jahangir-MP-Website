import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaCoveragePanel } from "@/components/home/MediaCoveragePanel";
import { SectionCarousel } from "@/components/home/SectionCarousel";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang, t, toLocaleDate, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

function formatBdt(amount: number, lang: "bn" | "en") {
  return new Intl.NumberFormat(lang === "bn" ? "bn-BD" : "en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(Math.max(0, amount));
}

function formatMonthToken(value: string, lang: "bn" | "en") {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { month: "long", year: "numeric" });
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const copy = t(lang);
  const content = await getSiteContent();
  const isBangla = lang === "bn";
  const candidateName = translate(lang, content.candidate.name);
  const candidateHonorific = isBangla ? "এমপি" : "MP";
  const homeCopy = content.pageCopy.home;

  const commitmentSlides = content.commitments.map((item) => ({
    id: item.id,
    image: item.image,
    title: translate(lang, item.title),
    description: translate(lang, item.summary),
    href: `/${lang}/commitments/${item.slug}`,
    actionLabel: copy.readMore
  }));

  const mediaItems = content.videos.map((video) => ({
    id: video.id,
    title: translate(lang, video.title),
    duration: video.duration,
    thumbnail: video.thumbnail,
    youtubeUrl: video.youtubeUrl,
    videoFileUrl: video.videoFileUrl
  }));

  const newsSlides = content.news.map((post) => ({
    id: post.id,
    image: post.image,
    title: translate(lang, post.title),
    description: translate(lang, post.excerpt),
    meta: toLocaleDate(post.date, lang),
    href: `/${lang}/news/${post.slug}`,
    actionLabel: copy.readMore
  }));

  const featuredProjects = content.governmentProjects.slice(0, 2);
  const profilePoints =
    lang === "bn" ? content.profileSection.collectionPoints.bn : content.profileSection.collectionPoints.en;
  const featuredReports = [...content.monthlyReports]
    .sort((a, b) => {
      const aDate = new Date(a.publishedDate || `${a.reportMonth}-01`).getTime();
      const bDate = new Date(b.publishedDate || `${b.reportMonth}-01`).getTime();
      return bDate - aDate;
    })
    .slice(0, 2);

  const runningProjects = content.governmentProjects.filter((entry) => entry.status === "running").length;

  return (
    <div className="space-y-12 pb-8 sm:space-y-14">
      <section className="relative -mx-4 md:-mx-8">
        <div className="hero-orbit relative overflow-hidden border md:rounded-[2rem]">
          <div className="hero-gridline pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-green/12 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-brand-red/12 blur-3xl" />

          <div className="relative grid gap-6 p-5 sm:p-7 md:p-9 lg:grid-cols-[1.08fr,0.92fr] lg:items-center lg:gap-8 lg:p-12">
            <div className="order-2 lg:order-1">
              <p className="inline-flex rounded-full border border-brand-green/25 bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green/90">
                {translate(lang, homeCopy.heroTag)}
              </p>
              <h1 className="mt-3 text-balance text-3xl font-extrabold leading-[1.05] text-brand-ink sm:text-[2.3rem] md:text-[2.9rem]">
                {candidateName}
                <span className="ml-1 align-top text-[0.58em] font-semibold tracking-wide text-brand-green/90">{candidateHonorific}</span>
              </h1>
              <p className="mt-2 text-sm font-semibold text-brand-ink/75 sm:text-base">{translate(lang, content.candidate.shortTitle)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-green/82">{copy.headerPartyName}</p>

              <div className="mt-5 rounded-2xl border border-brand-red/30 bg-white/82 px-4 py-3">
                <p className="text-lg font-bold text-brand-red sm:text-xl">{translate(lang, content.candidate.heroSlogan)}</p>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-brand-ink/85 sm:text-base">{translate(lang, content.candidate.intro)}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/${lang}/write-to-mp`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green"
                >
                  {copy.writeToMp}
                </Link>
                <Link
                  href={`/${lang}/track-request`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-green/35 bg-white/90 px-5 py-2.5 text-sm font-bold text-brand-green transition hover:bg-brand-green hover:text-white"
                >
                  {copy.trackRequest}
                </Link>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <article className="rounded-xl border border-brand-green/20 bg-white/78 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/60">
                    {translate(lang, homeCopy.commitmentsLabel)}
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-brand-green">{content.commitments.length}</p>
                </article>
                <article className="rounded-xl border border-brand-green/20 bg-white/78 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/60">
                    {translate(lang, homeCopy.runningProjectsLabel)}
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-brand-green">{runningProjects}</p>
                </article>
                <article className="rounded-xl border border-brand-green/20 bg-white/78 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/60">
                    {translate(lang, homeCopy.reportsLabel)}
                  </p>
                  <p className="mt-1 text-lg font-extrabold text-brand-green">{content.monthlyReports.length}</p>
                </article>
                <article className="rounded-xl border border-brand-green/20 bg-white/78 p-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-ink/60">{copy.news}</p>
                  <p className="mt-1 text-lg font-extrabold text-brand-green">{content.news.length}</p>
                </article>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="photo-card hero-image-fade relative min-h-[340px] sm:min-h-[440px] lg:min-h-[620px]">
                <Image src={content.candidate.heroImage} alt={candidateName} fill priority className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/28 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3.5 md:grid-cols-3">
        <article className="card-surface p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green/80">{translate(lang, homeCopy.directServiceTag)}</p>
          <h2 className="mt-2 text-lg font-bold text-brand-ink sm:text-xl">{translate(lang, homeCopy.directServiceTitle)}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-brand-ink/75">{translate(lang, homeCopy.directServiceText)}</p>
          <Link href={`/${lang}/write-to-mp`} className="mt-3 inline-flex text-sm font-bold text-brand-green hover:underline">
            {copy.writeToMp}
          </Link>
        </article>

        <article className="card-surface p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green/80">{translate(lang, homeCopy.statusTag)}</p>
          <h2 className="mt-2 text-lg font-bold text-brand-ink sm:text-xl">{translate(lang, homeCopy.statusTitle)}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-brand-ink/75">{translate(lang, homeCopy.statusText)}</p>
          <Link href={`/${lang}/track-request`} className="mt-3 inline-flex text-sm font-bold text-brand-green hover:underline">
            {copy.trackRequest}
          </Link>
        </article>

        <article className="card-surface p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-green/80">{translate(lang, homeCopy.transparencyTag)}</p>
          <h2 className="mt-2 text-lg font-bold text-brand-ink sm:text-xl">{translate(lang, homeCopy.transparencyTitle)}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-brand-ink/75">{translate(lang, homeCopy.transparencyText)}</p>
          <Link href={`/${lang}/development-projects`} className="mt-3 inline-flex text-sm font-bold text-brand-green hover:underline">
            {copy.developmentProjects}
          </Link>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-[0.94fr,1.06fr]">
        <div className="card-surface overflow-hidden p-3">
          <div className="photo-card">
            <Image
              src={content.candidate.profileImage}
              alt={candidateName}
              width={1400}
              height={900}
              className="h-full min-h-[220px] w-full object-cover object-center sm:min-h-[280px] md:min-h-[370px]"
            />
          </div>
        </div>
        <div className="card-surface p-5 sm:p-7 md:p-9">
          <SectionTitle
            eyebrow={copy.profile}
            title={translate(lang, content.profileSection.biographyTitle)}
            description={translate(lang, content.candidate.shortTitle)}
          />
          <p className="mt-4 leading-relaxed text-brand-ink/85">{translate(lang, content.profileSection.biographyText)}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {profilePoints.slice(0, 2).map((item, index) => (
              <article key={index} className="rounded-2xl border border-brand-green/15 bg-brand-green/5 px-3 py-2 text-sm text-brand-ink/82">
                {item}
              </article>
            ))}
          </div>
          <Link href={`/${lang}/profile`} className="mt-5 inline-flex rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-red">
            {copy.readMore}
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle title={copy.commitments} />
        <SectionCarousel lang={lang} slides={commitmentSlides} autoMs={4200} />
      </section>

      <section id="manifesto" className="space-y-5 scroll-mt-32">
        <SectionTitle title={copy.manifesto} description={translate(lang, content.manifesto.summary)} />
        <article className="card-surface grid gap-5 p-5 md:grid-cols-[1.02fr,0.98fr] md:p-7">
          <div>
            <p className="inline-flex rounded-full border border-brand-red/30 bg-brand-red/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-red/90">
              {translate(lang, homeCopy.manifestoTag)}
            </p>
            <h3 className="mt-3 text-2xl font-bold text-brand-green">{translate(lang, content.manifesto.title)}</h3>
            <p className="mt-3 text-sm leading-relaxed text-brand-ink/80 md:text-base">{translate(lang, homeCopy.manifestoText)}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={`/${lang}/manifesto`} className="inline-flex rounded-full bg-brand-green px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-red">
                {copy.readMore}
              </Link>
              <a
                href={content.manifesto.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-brand-green/35 px-4 py-2 text-sm font-bold text-brand-green transition hover:bg-brand-green hover:text-white"
              >
                {copy.openPdf}
              </a>
            </div>
          </div>
          <div className="photo-card relative min-h-[250px]">
            <Image
              src={content.candidate.profileImage}
              alt={translate(lang, content.manifesto.title)}
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/25 via-transparent to-transparent" />
          </div>
        </article>
      </section>

      <section className="space-y-5">
        <SectionTitle title={copy.governmentProjects} description={translate(lang, homeCopy.projectsDescription)} />
        <div className="grid gap-4 md:grid-cols-2">
          {featuredProjects.map((project) => (
            <article key={project.id} className="card-surface overflow-hidden p-3 sm:p-4">
              <div className="photo-card">
                <Image src={project.image} alt={translate(lang, project.title)} width={960} height={640} className="h-52 w-full object-cover" />
              </div>
              <h3 className="mt-3 text-base font-bold text-brand-green sm:text-lg">{translate(lang, project.title)}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-brand-ink/80">{translate(lang, project.summary)}</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-green/12">
                <div className="h-full rounded-full bg-brand-green" style={{ width: `${Math.max(0, Math.min(100, project.progressPercent))}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-brand-ink/75">
                <span>{translate(lang, homeCopy.budgetLabel)}: {formatBdt(project.budgetTotal, lang)}</span>
                <span>{translate(lang, homeCopy.spentLabel)}: {formatBdt(project.spentAmount, lang)}</span>
              </div>
              <Link href={`/${lang}/government-projects/${project.slug}`} className="mt-3 inline-flex text-sm font-bold text-brand-red hover:underline">
                {copy.readMore}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle title={translate(lang, homeCopy.monthlyReportsTitle)} />
        <div className="grid gap-4 md:grid-cols-2">
          {featuredReports.map((report) => (
            <article key={report.id} className="card-surface p-4 sm:p-5">
              <p className="inline-flex rounded-full border border-brand-green/25 bg-brand-green/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-green">
                {formatMonthToken(report.reportMonth, lang)}
              </p>
              <h3 className="mt-2 text-lg font-bold text-brand-green">{translate(lang, report.title)}</h3>
              <p className="mt-2 text-sm text-brand-ink/80">{translate(lang, report.summary)}</p>
              <p className="mt-3 text-xs text-brand-ink/65">
                {translate(lang, homeCopy.publishedLabel)}: {toLocaleDate(report.publishedDate, lang)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={report.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand-green px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-ink"
                >
                  {copy.openPdf}
                </a>
                <a
                  href={report.pdfUrl}
                  download
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-brand-green/35 px-4 py-2 text-xs font-bold text-brand-green transition hover:bg-brand-green hover:text-white"
                >
                  {copy.download}
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionTitle title={copy.mediaCoverage} description={translate(lang, homeCopy.mediaDescription)} />
        <MediaCoveragePanel lang={lang} items={mediaItems} />
      </section>

      <section className="space-y-5">
        <SectionTitle title={copy.news} />
        <SectionCarousel lang={lang} slides={newsSlides} autoMs={4500} />
      </section>

      <section className="card-surface flex flex-col items-start justify-between gap-4 p-6 sm:p-7 md:flex-row md:items-center md:p-9">
        <div>
          <h2 className="text-2xl font-bold text-brand-green">{translate(lang, homeCopy.ctaTitle)}</h2>
          <p className="mt-2 text-sm text-brand-ink/75">{translate(lang, homeCopy.ctaText)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${lang}/write-to-mp`} className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green">
            {copy.writeToMp}
          </Link>
          <Link href={`/${lang}/track-request`} className="rounded-full border border-brand-green/35 px-5 py-2.5 text-sm font-bold text-brand-green transition hover:bg-brand-green hover:text-white">
            {copy.trackRequest}
          </Link>
        </div>
      </section>
    </div>
  );
}

