import { notFound } from "next/navigation";
import { ChatAssistant } from "@/components/ChatAssistant";
import { DynamicMotionShell } from "@/components/DynamicMotionShell";
import { NoticeBarSlot } from "@/components/NoticeBarSlot";
import { PreFooterCta } from "@/components/PreFooterCta";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isLang, languages } from "@/lib/i18n";
import { getSiteContent } from "@/lib/storage";

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const content = await getSiteContent();

  return (
    <div className="site-grid min-h-screen w-full overflow-x-clip">
      <SiteHeader lang={lang} content={content} />
      <NoticeBarSlot lang={lang} noticeBar={content.noticeBar} />
      <main id="main-content" className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 sm:pb-28 sm:pt-5 md:px-8 md:pb-10 md:pt-6">
        <DynamicMotionShell>{children}</DynamicMotionShell>
      </main>
      <PreFooterCta lang={lang} content={content} />
      <ChatAssistant facebookUrl={content.socials.facebook} />
      <SiteFooter lang={lang} content={content} />
    </div>
  );
}
