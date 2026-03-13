import { notFound } from "next/navigation";
import { RequestTrackingPanel } from "@/components/RequestTrackingPanel";
import { SectionTitle } from "@/components/SectionTitle";
import { isLang } from "@/lib/i18n";

export default async function TrackRequestPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title={lang === "bn" ? "অনুরোধ ট্র্যাকিং" : "Request Tracking"}
        description={
          lang === "bn"
            ? "রেফারেন্স আইডি এবং মোবাইল নম্বর দিয়ে আপনার বার্তার বর্তমান অবস্থা জানুন।"
            : "Track the current progress of your submission using your reference ID and phone number."
        }
      />

      <section className="relative overflow-hidden rounded-3xl border border-brand-green/15 bg-gradient-to-br from-[#fffefe] via-[#f6f2ea] to-[#eef5ef] p-4 sm:p-6 md:p-9">
        <div className="pointer-events-none absolute -top-20 left-16 h-52 w-52 rounded-full bg-brand-red/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-16 h-52 w-52 rounded-full bg-brand-green/12 blur-3xl" />
        <div className="relative">
          <RequestTrackingPanel lang={lang} />
        </div>
      </section>
    </div>
  );
}
