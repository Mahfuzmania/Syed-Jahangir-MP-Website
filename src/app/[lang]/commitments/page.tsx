import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang, t, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export default async function CommitmentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const text = t(lang);
  const content = await getSiteContent();

  return (
    <div className="space-y-6">
      <SectionTitle title={text.commitments} description={lang === "bn" ? "দিনাজপুর-৩ এর জন্য বাস্তবায়নযোগ্য ছয়টি প্রধান অগ্রাধিকার" : "Six practical priorities for Dinajpur-3."} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {content.commitments.map((item) => (
          <article key={item.id} className="card-surface overflow-hidden">
            <Image src={item.image} alt={translate(lang, item.title)} width={900} height={600} className="h-48 w-full object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-brand-green">{translate(lang, item.title)}</h3>
              <p className="mt-2 text-sm text-brand-ink/80">{translate(lang, item.summary)}</p>
              <Link href={`/${lang}/commitments/${item.slug}`} className="mt-4 inline-flex text-sm font-bold text-brand-red underline-offset-4 hover:underline">
                {text.readMore}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
