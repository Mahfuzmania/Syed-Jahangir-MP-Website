import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsShareButtons } from "@/components/NewsShareButtons";
import { isLang, t, toLocaleDate, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export async function generateStaticParams() {
  const content = await getSiteContent();
  return content.news.flatMap((item) => [{ slug: item.slug, lang: "bn" }, { slug: item.slug, lang: "en" }]);
}

export default async function NewsDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const copy = t(lang);
  const content = await getSiteContent();
  const post = content.news.find((entry) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-5">
      <Link href={`/${lang}/news`} className="inline-flex text-sm font-semibold text-brand-red hover:underline">
        ← {copy.news}
      </Link>
      <div className="card-surface overflow-hidden">
        <Image src={post.image} alt={translate(lang, post.title)} width={1600} height={780} className="h-56 w-full object-cover sm:h-72 md:h-[340px]" />
      </div>
      <div className="card-surface p-7 md:p-10">
        <p className="text-sm text-brand-ink/60">{toLocaleDate(post.date, lang)}</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-green">{translate(lang, post.title)}</h1>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(post.categories || []).map((entry) => (
            <span key={`c-${post.id}-${entry}`} className="rounded-full bg-brand-green/10 px-2.5 py-1 text-[11px] font-semibold text-brand-green">
              {entry}
            </span>
          ))}
          {(post.tags || []).map((entry) => (
            <span key={`t-${post.id}-${entry}`} className="rounded-full bg-brand-red/10 px-2.5 py-1 text-[11px] font-semibold text-brand-red">
              #{entry}
            </span>
          ))}
        </div>
        <NewsShareButtons lang={lang} slug={post.slug} title={translate(lang, post.title)} />
        <p className="mt-5 leading-relaxed text-brand-ink/85">{translate(lang, post.content)}</p>
      </div>
    </article>
  );
}
