import { notFound } from "next/navigation";
import { ManifestoShowcase } from "@/components/manifesto/ManifestoShowcase";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang, t, translate } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export default async function ManifestoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const content = await getSiteContent();
  const copy = t(lang);

  return (
    <div className="space-y-6">
      <SectionTitle title={copy.manifesto} description={translate(lang, content.manifesto.summary)} />
      <ManifestoShowcase
        lang={lang}
        title={translate(lang, content.manifesto.title)}
        summary={translate(lang, content.manifesto.summary)}
        pdfUrl={content.manifesto.pdfUrl}
        viewerHeightClass="h-[560px] md:h-[760px]"
        showWriteToMp
      />
    </div>
  );
}
