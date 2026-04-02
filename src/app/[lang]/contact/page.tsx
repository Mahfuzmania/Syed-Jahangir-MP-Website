import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang, t, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

function buildOfficeMapUrl(address: string) {
  const query = encodeURIComponent(`${address} MP office`);
  return `https://maps.google.com/maps?q=${query}&t=&z=16&ie=UTF8&iwloc=B&output=embed`;
}

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const content = await getSiteContent();
  const copy = t(lang);
  const pageCopy = content.pageCopy.contact;
  const localizedAddress = translate(lang, content.contact.address);
  const mapEmbedUrl = content.contact.mapEmbedUrl?.trim() || buildOfficeMapUrl(localizedAddress);
  const displayPhone =
    content.contact.phone?.trim() ||
    (lang === "bn" ? "অফিসিয়াল ফোন নম্বর শীঘ্রই প্রকাশ করা হবে" : "Official office phone will be published soon");
  const displayEmail =
    content.contact.email?.trim() ||
    (lang === "bn" ? "অফিসিয়াল ইমেইল শীঘ্রই প্রকাশ করা হবে" : "Official email will be published soon");
  const facebookUrl = content.socials.facebook?.trim();

  return (
    <div className="space-y-6">
      <SectionTitle title={copy.contact} description={copy.contactReach} />

      <section className="relative overflow-hidden rounded-3xl border border-brand-green/15 bg-gradient-to-br from-white via-[#f7f2ea] to-[#eef5ef] p-5 shadow-soft md:p-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-brand-red/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-brand-green/12 blur-3xl" />

        <div className="relative grid gap-5 md:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-2xl border border-brand-green/15 bg-white/90 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-red/85">{copy.officeContact}</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/55">{copy.phoneLabel}</p>
                <p className="mt-1 text-lg font-bold text-brand-green">{displayPhone}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/55">{translate(lang, pageCopy.emailLabel)}</p>
                <p className="mt-1 text-lg font-semibold text-brand-green">{displayEmail}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/55">{copy.officeAddress}</p>
                <p className="mt-1 text-base leading-relaxed text-brand-ink/85">{localizedAddress}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href={`/${lang}/write-to-mp`}
                className="inline-flex rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green"
              >
                {copy.writeToMp}
              </Link>
              {facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-brand-green/35 bg-white px-5 py-2.5 text-sm font-bold text-brand-green transition hover:bg-brand-green hover:text-white"
                >
                  {translate(lang, pageCopy.facebookInboxLabel)}
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-green/15 bg-white/85 p-3">
            <div className="mb-2 flex items-center justify-between px-1 text-xs text-brand-ink/65">
              <span>{copy.officeOnMap}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2 py-0.5 font-semibold text-brand-green">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 2a7 7 0 0 0-7 7c0 4.34 6.17 11.95 6.43 12.27a.75.75 0 0 0 1.14 0C12.83 20.95 19 13.34 19 9a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
                  />
                </svg>
                {copy.mpOffice}
              </span>
            </div>
            <iframe src={mapEmbedUrl} className="h-72 w-full rounded-2xl md:h-[390px]" loading="lazy" title="Dinajpur MP office map" />
          </div>
        </div>
      </section>
    </div>
  );
}

