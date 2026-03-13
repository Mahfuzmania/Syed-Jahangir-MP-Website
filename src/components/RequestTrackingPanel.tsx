"use client";

import { useMemo, useState } from "react";
import { isValidBdPhone, toCanonicalBdPhone } from "@/lib/contactValidation";
import { SubmissionStatus } from "@/lib/types";

type TrackingResponse = {
  id: string;
  status: SubmissionStatus;
  category: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
};

function statusClass(status: SubmissionStatus) {
  if (status === "new") return "border-red-200 bg-red-50 text-red-700";
  if (status === "in_review") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "processing") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "resolved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-100 text-slate-700";
}

export function RequestTrackingPanel({ lang }: { lang: "bn" | "en" }) {
  const isBangla = lang === "bn";
  const [referenceId, setReferenceId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackingResponse | null>(null);

  const copy = useMemo(
    () => ({
      referenceId: isBangla ? "রেফারেন্স আইডি *" : "Reference ID *",
      phone: isBangla ? "মোবাইল নম্বর *" : "Phone Number *",
      hint:
        isBangla
          ? "রেফারেন্স আইডি ও মোবাইল নম্বর দিয়ে অনুরোধের অগ্রগতি দেখুন।"
          : "Track your request progress with reference ID and phone number.",
      submit: isBangla ? "স্ট্যাটাস দেখুন" : "Check Status",
      loading: isBangla ? "খোঁজা হচ্ছে..." : "Checking...",
      invalidInput:
        isBangla
          ? "সঠিক রেফারেন্স আইডি ও বাংলাদেশি মোবাইল নম্বর দিন।"
          : "Please provide a valid reference ID and Bangladeshi phone number.",
      createdAt: isBangla ? "জমা হয়েছে" : "Submitted At",
      updatedAt: isBangla ? "সর্বশেষ আপডেট" : "Last Updated",
      subject: isBangla ? "বিষয়" : "Subject",
      category: isBangla ? "ক্যাটাগরি" : "Category"
    }),
    [isBangla]
  );

  function statusLabel(status: SubmissionStatus) {
    if (status === "new") return isBangla ? "নতুন" : "New";
    if (status === "in_review") return isBangla ? "পর্যালোচনায়" : "In Review";
    if (status === "processing") return isBangla ? "প্রসেসিং" : "Processing";
    if (status === "resolved") return isBangla ? "সমাধান" : "Resolved";
    return isBangla ? "বন্ধ" : "Closed";
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    const normalizedReference = referenceId.trim();
    const canonicalPhone = toCanonicalBdPhone(phone.trim());
    if (!normalizedReference || !isValidBdPhone(canonicalPhone)) {
      setError(copy.invalidInput);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/contact/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceId: normalizedReference,
          phone: canonicalPhone
        })
      });

      const data = (await response.json().catch(() => null)) as { error?: string; submission?: TrackingResponse } | null;
      if (!response.ok || !data?.submission) {
        throw new Error(data?.error || (isBangla ? "তথ্য পাওয়া যায়নি।" : "Tracking data not found."));
      }

      setResult(data.submission);
    } catch (err) {
      setError(err instanceof Error ? err.message : isBangla ? "ট্র্যাকিং ব্যর্থ হয়েছে।" : "Tracking failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-brand-ink/75">{copy.hint}</p>
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[1fr,1fr,auto]" noValidate>
        <input
          value={referenceId}
          onChange={(event) => {
            setReferenceId(event.target.value);
            if (error) setError("");
            if (result) setResult(null);
          }}
          placeholder={copy.referenceId}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-2xl border border-brand-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green"
        />
        <input
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            if (error) setError("");
            if (result) setResult(null);
          }}
          placeholder={copy.phone}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          pattern="^(?:\\+?88)?01[3-9][0-9]{8}$"
          className="w-full rounded-2xl border border-brand-ink/20 bg-white px-4 py-3 text-sm outline-none focus:border-brand-green"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-green px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-ink disabled:opacity-70"
        >
          {loading ? copy.loading : copy.submit}
        </button>
      </form>

      {error ? (
        <p className="text-sm text-brand-red" aria-live="polite">
          {error}
        </p>
      ) : null}

      {result ? (
        <article className="rounded-2xl border border-brand-ink/10 bg-white p-4 shadow-[0_10px_24px_rgba(8,44,32,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-brand-green">
              {isBangla ? "রেফারেন্স" : "Reference"}: {result.id}
            </p>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(result.status)}`}>{statusLabel(result.status)}</span>
          </div>
          <div className="mt-4 grid gap-2 text-xs text-brand-ink/70 sm:grid-cols-2">
            <p>
              <span className="font-semibold">{copy.category}:</span> {result.category}
            </p>
            <p>
              <span className="font-semibold">{copy.subject}:</span> {result.subject || (isBangla ? "উল্লেখ নেই" : "Not provided")}
            </p>
            <p>
              <span className="font-semibold">{copy.createdAt}:</span> {new Date(result.createdAt).toLocaleString(isBangla ? "bn-BD" : "en-US")}
            </p>
            <p>
              <span className="font-semibold">{copy.updatedAt}:</span> {new Date(result.updatedAt).toLocaleString(isBangla ? "bn-BD" : "en-US")}
            </p>
          </div>
        </article>
      ) : null}
    </div>
  );
}
