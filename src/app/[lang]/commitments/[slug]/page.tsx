import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang, t, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export async function generateStaticParams() {
  const content = await getSiteContent();
  return content.commitments.flatMap((item) => [{ slug: item.slug, lang: "bn" }, { slug: item.slug, lang: "en" }]);
}

export default async function CommitmentDetailPage({
  params
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const content = await getSiteContent();
  const item = content.commitments.find((entry) => entry.slug === slug);
  if (!item) {
    notFound();
  }

  const copy = t(lang);

  return (
    <div className="space-y-6">
      <Link href={`/${lang}/commitments`} className="inline-flex text-sm font-semibold text-brand-red hover:underline">
        ← {copy.commitments}
      </Link>

      <div className="card-surface overflow-hidden">
        <Image src={item.image} alt={translate(lang, item.title)} width={1600} height={700} className="h-56 w-full object-cover sm:h-72 md:h-[320px]" />
      </div>

      <article className="card-surface p-7 md:p-10">
        <SectionTitle title={translate(lang, item.title)} description={translate(lang, item.summary)} />
        <p className="mt-5 leading-relaxed text-brand-ink/85">{translate(lang, item.details)}</p>
        <Link href={`/${lang}/write-to-mp`} className="mt-6 inline-flex rounded-full bg-brand-green px-5 py-2.5 text-sm font-bold text-white">
          {copy.writeToMp}
        </Link>
      </article>
    </div>
  );
}
