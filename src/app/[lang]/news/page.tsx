import { notFound } from "next/navigation";
import { NewsFeed } from "@/components/NewsFeed";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang, t } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export default async function NewsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const copy = t(lang);
  const content = await getSiteContent();

  return (
    <div className="space-y-6">
      <SectionTitle
        title={copy.news}
        description={lang === "bn" ? "ক্যাটাগরি, ট্যাগ ও শেয়ার অপশনসহ আপডেট সংবাদ।" : "News updates with categories, tags, and share options."}
      />
      <NewsFeed lang={lang} news={content.news} />
    </div>
  );
}
