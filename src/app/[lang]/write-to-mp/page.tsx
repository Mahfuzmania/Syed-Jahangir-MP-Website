import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/SectionTitle";
import { WriteToMpForm } from "@/components/WriteToMpForm";
import { isLang } from "@/lib/i18n";

export default async function WriteToMpPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  if (!isLang(lang)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title={lang === "bn" ? "আপনার সাংসদকে লিখুন" : "Write to Your MP"}
        description={
          lang === "bn"
            ? "আপনার এলাকার সমস্যা, অভিযোগ, বা পরামর্শ সরাসরি টিমের কাছে পাঠাতে নিচের ফর্মটি ব্যবহার করুন।"
            : "Use the form below to send local issues, complaints, and recommendations directly to the team."
        }
      />

      <div className="relative overflow-hidden rounded-3xl border border-brand-green/15 bg-gradient-to-br from-[#fffefe] via-[#f6f2ea] to-[#eef5ee] p-7 shadow-soft md:p-9">
        <div className="pointer-events-none absolute -top-20 left-16 h-52 w-52 rounded-full bg-brand-red/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-16 h-52 w-52 rounded-full bg-brand-green/12 blur-3xl" />
        <div className="relative">
          <WriteToMpForm lang={lang} />
        </div>
      </div>
    </div>
  );
}
