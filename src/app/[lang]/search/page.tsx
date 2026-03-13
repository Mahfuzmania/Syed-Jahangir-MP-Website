import { notFound } from "next/navigation";
import { PublicSearchPanel } from "@/components/PublicSearchPanel";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export default async function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const content = await getSiteContent();

  return (
    <div className="space-y-6">
      <SectionTitle
        title={lang === "bn" ? "পাবলিক সার্চ" : "Public Search"}
        description={
          lang === "bn"
            ? "সংবাদ, অঙ্গীকার এবং পূর্বের কাজের তথ্য দ্রুত খুঁজে নিন।"
            : "Quickly search news, commitments, and previous work."
        }
      />
      <PublicSearchPanel lang={lang} content={content} />
    </div>
  );
}
