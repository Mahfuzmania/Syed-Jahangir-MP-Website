import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/SectionTitle";
import { WorkItemIcon } from "@/components/WorkItemIcon";
import { isLang, t, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export default async function ProfilePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const text = t(lang);
  const content = await getSiteContent();
  const isBangla = lang === "bn";
  const honorific = isBangla ? "এমপি" : "MP";
  const pageCopy = content.pageCopy.profile;

  return (
    <div className="space-y-7">
      <SectionTitle
        eyebrow={text.profile}
        title={`${translate(lang, content.candidate.name)}, ${honorific}`}
        description={translate(lang, content.candidate.shortTitle)}
      />

      <section className="grid gap-6 lg:grid-cols-[0.82fr,1.18fr]">
        <div className="card-surface overflow-hidden p-3">
          <div className="photo-card">
            <Image
              src={content.candidate.profileImage}
              alt={translate(lang, content.candidate.name)}
              width={1100}
              height={1300}
              className="h-full min-h-[360px] w-full object-cover object-center"
            />
          </div>
        </div>

        <article className="card-surface p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-green/80">{translate(lang, pageCopy.briefBioLabel)}</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-green">{translate(lang, content.profileSection.biographyTitle)}</h2>
          <p className="mt-4 leading-relaxed text-brand-ink/85">{translate(lang, content.profileSection.biographyText)}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/${lang}/contact`} className="rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-red">
              {translate(lang, content.profileSection.officeButtonLabel)}
            </Link>
            <a
              href={content.socials.facebook}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-brand-green/35 px-5 py-2.5 text-sm font-bold text-brand-green transition hover:bg-brand-green hover:text-white"
            >
              {translate(lang, content.profileSection.facebookButtonLabel)}
            </a>
          </div>
        </article>
      </section>

      <section className="card-surface p-5 sm:p-6 md:p-7">
        <h3 className="text-lg font-bold text-brand-green">{translate(lang, pageCopy.activitiesLabel)}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {content.workHistory.map((item) => (
            <article key={item.id} className="rounded-2xl border border-brand-green/15 bg-white/70 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-brand-green/20 bg-brand-green/10 text-brand-green">
                  <WorkItemIcon iconKey={item.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-base font-bold text-brand-green">{translate(lang, item.title)}</h4>
                  <p className="mt-1 text-sm text-brand-ink/78">{translate(lang, item.summary)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

