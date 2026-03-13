import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryTabs } from "@/components/gallery/GalleryTabs";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang, t, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export default async function GalleryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const copy = t(lang);
  const content = await getSiteContent();
  const items = content.gallery.map((item) => ({
    id: item.id,
    title: translate(lang, item.title),
    album: translate(lang, item.album),
    image: item.image
  }));

  const albumCount = new Set(items.map((item) => item.album).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <SectionTitle
        title={copy.gallery}
        description={
          lang === "bn"
            ? "বিষয়ভিত্তিক অ্যালবামে ছবি দেখুন। ট্যাব বদলে দ্রুত কাঙ্ক্ষিত গ্যালারি খুঁজে নিন।"
            : "Browse photos by category tabs and switch albums quickly."
        }
      />

      <section className="card-surface border border-brand-green/10 p-5 md:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-brand-ink/70">
            {lang === "bn" ? `মোট ${items.length}টি ছবি, ${albumCount}টি অ্যালবাম` : `${items.length} photos across ${albumCount} albums`}
          </p>
          <Link
            href={`/${lang}/news`}
            className="rounded-full border border-brand-green/30 px-4 py-2 text-xs font-semibold text-brand-green transition hover:bg-brand-green hover:text-white"
          >
            {lang === "bn" ? "সংবাদ দেখুন" : "View News"}
          </Link>
        </div>
        <GalleryTabs lang={lang} items={items} />
      </section>

      <section className="card-surface flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between md:p-7">
        <div>
          <h2 className="text-xl font-bold text-brand-green">{lang === "bn" ? "আপনার এলাকার ছবি/ভিডিও পাঠান" : "Share photos and videos from your area"}</h2>
          <p className="mt-1 text-sm text-brand-ink/75">
            {lang === "bn"
              ? "গুরুত্বপূর্ণ স্থানীয় কার্যক্রম, সমস্যা বা সাফল্যের ছবি/ভিডিও লিখিত বার্তার সাথে পাঠাতে পারেন।"
              : "You can send local activity, issue, or success photos/videos with your message."}
          </p>
        </div>
        <Link href={`/${lang}/write-to-mp`} className="rounded-full bg-brand-red px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green">
          {copy.writeToMp}
        </Link>
      </section>
    </div>
  );
}
