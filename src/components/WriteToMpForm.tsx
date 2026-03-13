"use client";

import { useEffect, useMemo, useState } from "react";
import { Lang } from "@/lib/types";
import { isValidBdPhone, isValidEmailFormat, normalizeBanglaDigits, toCanonicalBdPhone } from "@/lib/contactValidation";

type FormState = {
  name: string;
  phone: string;
  email: string;
  category: string;
  unionWard: string;
  area: string;
  subject: string;
  message: string;
  captchaAnswer: string;
  attachmentUrl: string;
  consentGiven: boolean;
  isPrivate: boolean;
};

type CaptchaState = {
  captchaId: string;
  question: string;
};

type FieldErrors = {
  phone?: string;
  email?: string;
  category?: string;
  unionWard?: string;
  area?: string;
  message?: string;
  captcha?: string;
  consent?: string;
};

const initialState: FormState = {
  name: "",
  phone: "",
  email: "",
  category: "",
  unionWard: "",
  area: "",
  subject: "",
  message: "",
  captchaAnswer: "",
  attachmentUrl: "",
  consentGiven: false,
  isPrivate: false
};

export function WriteToMpForm({ lang }: { lang: Lang }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [captcha, setCaptcha] = useState<CaptchaState | null>(null);
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submittedReference, setSubmittedReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const copy = useMemo(
    () => ({
      name: lang === "bn" ? "নাম (ঐচ্ছিক)" : "Name (optional)",
      phone: lang === "bn" ? "মোবাইল নম্বর *" : "Phone *",
      phoneHint:
        lang === "bn"
          ? "বাংলাদেশি নম্বর দিন: 01712345678 বা +8801712345678"
          : "Use Bangladeshi number: 01712345678 or +8801712345678",
      email: lang === "bn" ? "ইমেইল (ঐচ্ছিক)" : "Email (optional)",
      category: lang === "bn" ? "বিভাগ/ক্যাটাগরি *" : "Category *",
      unionWard: lang === "bn" ? "ইউনিয়ন / ওয়ার্ড *" : "Union / Ward *",
      area: lang === "bn" ? "ঠিকানা / এলাকা *" : "Address / Area *",
      subject: lang === "bn" ? "অভিযোগ/মতামতের বিষয়" : "Subject",
      message: lang === "bn" ? "বিস্তারিত অভিযোগ/মতামত *" : "Detailed Message *",
      attachment: lang === "bn" ? "সংযুক্তি (ঐচ্ছিক)" : "Attachment (optional)",
      attachmentHint:
        lang === "bn"
          ? "PDF, ছবি, ভিডিও বা ডকুমেন্ট আপলোড করুন (সর্বোচ্চ 50MB)"
          : "Upload PDF, image, video, or document (max 50MB)",
      upload: lang === "bn" ? "ফাইল আপলোড" : "Upload File",
      uploading: lang === "bn" ? "আপলোড হচ্ছে..." : "Uploading...",
      removeFile: lang === "bn" ? "ফাইল মুছুন" : "Remove file",
      privacy:
        lang === "bn"
          ? "আমার নাম ও যোগাযোগের তথ্য জনসম্মুখে প্রকাশ না করার অনুরোধ করছি"
          : "Please do not publicly disclose my personal information",
      consent:
        lang === "bn"
          ? "আমি সম্মতি দিচ্ছি যে আমার প্রদানকৃত তথ্য এমপি অফিস নাগরিক সেবা প্রদানের জন্য ব্যবহার করতে পারবে *"
          : "I consent that the MP office may use this information for citizen service processing *",
      captcha: lang === "bn" ? "নিরাপত্তা যাচাই *" : "Security Check *",
      captchaHint: lang === "bn" ? "উপরের অঙ্কের উত্তর লিখুন" : "Enter the answer to the math question",
      refreshCaptcha: lang === "bn" ? "নতুন প্রশ্ন" : "New Question",
      loadingCaptcha: lang === "bn" ? "লোড হচ্ছে..." : "Loading...",
      submit: lang === "bn" ? "বার্তা পাঠান" : "Send Message",
      sending: lang === "bn" ? "পাঠানো হচ্ছে..." : "Sending...",
      success: lang === "bn" ? "আপনার বার্তা সফলভাবে জমা হয়েছে।" : "Your message has been submitted successfully.",
      fail: lang === "bn" ? "দুঃখিত, বার্তা পাঠানো যায়নি। পরে আবার চেষ্টা করুন।" : "Submission failed. Please try again.",
      invalidPhone:
        lang === "bn"
          ? "সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678 বা +8801712345678)।"
          : "Please provide a valid Bangladeshi mobile number.",
      invalidEmail: lang === "bn" ? "সঠিক ইমেইল ঠিকানা দিন।" : "Please provide a valid email address.",
      invalidCategory: lang === "bn" ? "একটি ক্যাটাগরি নির্বাচন করুন।" : "Please select a category.",
      invalidUnionWard: lang === "bn" ? "ইউনিয়ন/ওয়ার্ড সঠিকভাবে লিখুন।" : "Please enter a valid union/ward.",
      invalidArea: lang === "bn" ? "ঠিকানা/এলাকা কমপক্ষে 3 অক্ষরের হতে হবে।" : "Address/area must be at least 3 characters.",
      shortMessage:
        lang === "bn"
          ? "বিস্তারিত অভিযোগ/মতামত কমপক্ষে 10 অক্ষরের হতে হবে।"
          : "Message should be at least 10 characters.",
      invalidCaptcha: lang === "bn" ? "সিকিউরিটি প্রশ্নের সঠিক উত্তর দিন।" : "Please provide the correct security answer.",
      consentRequired: lang === "bn" ? "সম্মতি প্রদান করা বাধ্যতামূলক।" : "Consent is required.",
      uploadFailed: lang === "bn" ? "ফাইল আপলোড ব্যর্থ হয়েছে।" : "File upload failed.",
      uploadSuccess: lang === "bn" ? "ফাইল সফলভাবে আপলোড হয়েছে।" : "File uploaded successfully.",
      referenceId: lang === "bn" ? "রেফারেন্স আইডি" : "Reference ID",
      trackNow: lang === "bn" ? "এখনই ট্র্যাক করুন" : "Track now"
    }),
    [lang]
  );

  const categoryOptions = useMemo(
    () => [
      {
        value: "complaint",
        label: lang === "bn" ? "অভিযোগ" : "Complaint"
      },
      {
        value: "suggestion",
        label: lang === "bn" ? "পরামর্শ" : "Suggestion"
      },
      {
        value: "appointment",
        label: lang === "bn" ? "সাক্ষাৎ অনুরোধ" : "Appointment Request"
      },
      {
        value: "help",
        label: lang === "bn" ? "সহায়তার অনুরোধ" : "Help Request"
      },
      {
        value: "other",
        label: lang === "bn" ? "অন্যান্য" : "Other"
      }
    ],
    [lang]
  );

  const controlClass =
    "rounded-2xl border border-brand-ink/20 bg-white/90 px-4 py-3 text-sm shadow-[0_4px_16px_rgba(0,0,0,0.03)] outline-none transition focus:border-brand-green focus:shadow-[0_0_0_3px_rgba(0,82,46,0.1)]";
  const errorControlClass =
    "rounded-2xl border border-brand-red/45 bg-white/90 px-4 py-3 text-sm shadow-[0_4px_16px_rgba(0,0,0,0.03)] outline-none transition focus:border-brand-red focus:shadow-[0_0_0_3px_rgba(210,19,53,0.12)]";

  async function loadCaptcha() {
    setLoadingCaptcha(true);
    try {
      const response = await fetch("/api/contact/captcha", { cache: "no-store" });
      const data = (await response.json()) as CaptchaState;
      if (response.ok && data.captchaId && data.question) {
        setCaptcha(data);
      } else {
        setCaptcha(null);
      }
    } catch {
      setCaptcha(null);
    } finally {
      setLoadingCaptcha(false);
    }
  }

  useEffect(() => {
    void loadCaptcha();
  }, []);

  function validateCurrentForm(current: FormState) {
    const nextErrors: FieldErrors = {};
    const normalizedPhone = toCanonicalBdPhone(current.phone);
    const normalizedEmail = normalizeBanglaDigits(current.email).trim();
    const normalizedUnionWard = current.unionWard.trim();
    const trimmedArea = current.area.trim();
    const trimmedMessage = current.message.trim();
    const trimmedCaptchaAnswer = normalizeBanglaDigits(current.captchaAnswer).trim();

    if (!isValidBdPhone(normalizedPhone)) {
      nextErrors.phone = copy.invalidPhone;
    }

    if (normalizedEmail && !isValidEmailFormat(normalizedEmail)) {
      nextErrors.email = copy.invalidEmail;
    }

    if (!current.category.trim()) {
      nextErrors.category = copy.invalidCategory;
    }

    if (normalizedUnionWard.length < 2) {
      nextErrors.unionWard = copy.invalidUnionWard;
    }

    if (trimmedArea.length < 3) {
      nextErrors.area = copy.invalidArea;
    }

    if (trimmedMessage.length < 10) {
      nextErrors.message = copy.shortMessage;
    }

    if (!trimmedCaptchaAnswer || !captcha?.captchaId) {
      nextErrors.captcha = copy.invalidCaptcha;
    }

    if (!current.consentGiven) {
      nextErrors.consent = copy.consentRequired;
    }

    return {
      errors: nextErrors,
      normalizedPhone,
      normalizedEmail,
      normalizedUnionWard,
      trimmedArea,
      trimmedMessage,
      trimmedCaptchaAnswer
    };
  }

  async function handleAttachmentUpload(file: File) {
    setUploadingAttachment(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/contact/upload", {
        method: "POST",
        body: formData
      });

      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || copy.uploadFailed);
      }

      setForm((prev) => ({ ...prev, attachmentUrl: data.url ?? "" }));
      setStatus({ type: "success", message: copy.uploadSuccess });
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.uploadFailed;
      setStatus({ type: "error", message });
    } finally {
      setUploadingAttachment(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    setSubmittedReference("");

    const {
      errors: nextErrors,
      normalizedPhone,
      normalizedEmail,
      normalizedUnionWard,
      trimmedArea,
      trimmedMessage,
      trimmedCaptchaAnswer
    } = validateCurrentForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitting(false);
      return;
    }

    const payload = {
      name: form.name.trim() || undefined,
      phone: normalizedPhone,
      email: normalizedEmail || undefined,
      category: form.category,
      unionWard: normalizedUnionWard,
      area: trimmedArea,
      subject: form.subject.trim() || undefined,
      message: trimmedMessage,
      attachmentUrl: form.attachmentUrl || undefined,
      consentGiven: form.consentGiven,
      captchaId: captcha?.captchaId,
      captchaAnswer: trimmedCaptchaAnswer,
      isPrivate: form.isPrivate
    };

    try {
      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = (await response.json().catch(() => null)) as { error?: string; referenceId?: string } | null;
      if (!response.ok) {
        const errorMessage = data?.error || copy.fail;
        if (errorMessage.toLowerCase().includes("captcha")) {
          setErrors((prev) => ({ ...prev, captcha: copy.invalidCaptcha }));
          void loadCaptcha();
        }
        throw new Error(errorMessage);
      }

      setStatus({ type: "success", message: copy.success });
      setSubmittedReference(data?.referenceId || "");
      setForm(initialState);
      setErrors({});
      void loadCaptcha();
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.fail;
      setStatus({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder={copy.name}
          className={controlClass}
        />
        <div className="space-y-1">
          <input
            required
            inputMode="numeric"
            pattern="^(?:\\+?88)?01[3-9][0-9]{8}$"
            value={form.phone}
            onBlur={() => {
              const { errors: nextErrors } = validateCurrentForm(form);
              setErrors((prev) => ({ ...prev, phone: nextErrors.phone }));
            }}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, phone: event.target.value }));
              if (errors.phone) {
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }
            }}
            placeholder={copy.phone}
            className={errors.phone ? errorControlClass : controlClass}
          />
          <p className="text-xs text-brand-ink/60">{copy.phoneHint}</p>
          {errors.phone ? <p className="text-xs font-medium text-brand-red">{errors.phone}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <input
            type="email"
            value={form.email}
            onBlur={() => {
              const { errors: nextErrors } = validateCurrentForm(form);
              setErrors((prev) => ({ ...prev, email: nextErrors.email }));
            }}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, email: event.target.value }));
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder={copy.email}
            className={errors.email ? errorControlClass : controlClass}
          />
          {errors.email ? <p className="text-xs font-medium text-brand-red">{errors.email}</p> : null}
        </div>

        <div className="space-y-1">
          <select
            required
            value={form.category}
            onBlur={() => {
              const { errors: nextErrors } = validateCurrentForm(form);
              setErrors((prev) => ({ ...prev, category: nextErrors.category }));
            }}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, category: event.target.value }));
              if (errors.category) {
                setErrors((prev) => ({ ...prev, category: undefined }));
              }
            }}
            className={errors.category ? errorControlClass : controlClass}
          >
            <option value="">{copy.category}</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.category ? <p className="text-xs font-medium text-brand-red">{errors.category}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <input
            required
            value={form.unionWard}
            onBlur={() => {
              const { errors: nextErrors } = validateCurrentForm(form);
              setErrors((prev) => ({ ...prev, unionWard: nextErrors.unionWard }));
            }}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, unionWard: event.target.value }));
              if (errors.unionWard) {
                setErrors((prev) => ({ ...prev, unionWard: undefined }));
              }
            }}
            placeholder={copy.unionWard}
            className={errors.unionWard ? errorControlClass : controlClass}
          />
          {errors.unionWard ? <p className="text-xs font-medium text-brand-red">{errors.unionWard}</p> : null}
        </div>

        <div className="space-y-1">
          <input
            required
            value={form.area}
            onBlur={() => {
              const { errors: nextErrors } = validateCurrentForm(form);
              setErrors((prev) => ({ ...prev, area: nextErrors.area }));
            }}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, area: event.target.value }));
              if (errors.area) {
                setErrors((prev) => ({ ...prev, area: undefined }));
              }
            }}
            placeholder={copy.area}
            className={errors.area ? errorControlClass : controlClass}
          />
          {errors.area ? <p className="text-xs font-medium text-brand-red">{errors.area}</p> : null}
        </div>
      </div>

      <input
        value={form.subject}
        onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
        placeholder={copy.subject}
        className={`${controlClass} w-full`}
      />

      <div className="space-y-1">
        <textarea
          required
          rows={6}
          value={form.message}
          onBlur={() => {
            const { errors: nextErrors } = validateCurrentForm(form);
            setErrors((prev) => ({ ...prev, message: nextErrors.message }));
          }}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, message: event.target.value }));
            if (errors.message) {
              setErrors((prev) => ({ ...prev, message: undefined }));
            }
          }}
          placeholder={copy.message}
          className={`${errors.message ? errorControlClass : controlClass} w-full resize-y`}
        />
        {errors.message ? <p className="text-xs font-medium text-brand-red">{errors.message}</p> : null}
      </div>

      <div className="rounded-2xl border border-brand-ink/10 bg-white/80 p-3">
        <p className="text-sm font-semibold text-brand-ink/80">{copy.attachment}</p>
        <p className="mt-1 text-xs text-brand-ink/60">{copy.attachmentHint}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="rounded-full border border-brand-green/30 px-3 py-1 text-xs font-semibold text-brand-green transition hover:bg-brand-green hover:text-white">
            {uploadingAttachment ? copy.uploading : copy.upload}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
              disabled={uploadingAttachment}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleAttachmentUpload(file);
                }
                event.currentTarget.value = "";
              }}
            />
          </label>
          {form.attachmentUrl ? (
            <>
              <a href={form.attachmentUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-green underline">
                {form.attachmentUrl.split("/").pop()}
              </a>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, attachmentUrl: "" }))}
                className="rounded-full border border-brand-red/30 px-3 py-1 text-xs font-semibold text-brand-red"
              >
                {copy.removeFile}
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-brand-ink/10 bg-white/80 p-3">
        <div className="mb-1 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-brand-ink/80">{copy.captcha}</p>
          <button
            type="button"
            onClick={() => void loadCaptcha()}
            className="rounded-full border border-brand-green/30 px-3 py-1 text-xs font-semibold text-brand-green transition hover:bg-brand-green hover:text-white"
          >
            {loadingCaptcha ? copy.loadingCaptcha : copy.refreshCaptcha}
          </button>
        </div>
        <div className="mb-2 rounded-xl border border-dashed border-brand-green/30 bg-brand-green/5 px-3 py-2 text-sm font-semibold text-brand-green">
          {loadingCaptcha ? copy.loadingCaptcha : captcha?.question || copy.loadingCaptcha}
        </div>
        <input
          required
          value={form.captchaAnswer}
          onBlur={() => {
            const { errors: nextErrors } = validateCurrentForm(form);
            setErrors((prev) => ({ ...prev, captcha: nextErrors.captcha }));
          }}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, captchaAnswer: event.target.value }));
            if (errors.captcha) {
              setErrors((prev) => ({ ...prev, captcha: undefined }));
            }
          }}
          placeholder={copy.captchaHint}
          className={errors.captcha ? errorControlClass : controlClass}
        />
        {errors.captcha ? <p className="mt-1 text-xs font-medium text-brand-red">{errors.captcha}</p> : null}
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-brand-ink/10 bg-white/75 px-3 py-2 text-sm text-brand-ink/80">
        <input
          type="checkbox"
          checked={form.isPrivate}
          onChange={(event) => setForm((prev) => ({ ...prev, isPrivate: event.target.checked }))}
        />
        {copy.privacy}
      </label>

      <div className="rounded-2xl border border-brand-ink/10 bg-white/75 px-3 py-3">
        <label className="flex items-start gap-3 text-sm text-brand-ink/85">
          <input
            type="checkbox"
            checked={form.consentGiven}
            onChange={(event) => {
              setForm((prev) => ({ ...prev, consentGiven: event.target.checked }));
              if (errors.consent) {
                setErrors((prev) => ({ ...prev, consent: undefined }));
              }
            }}
            className="mt-0.5"
          />
          <span>{copy.consent}</span>
        </label>
        {errors.consent ? <p className="mt-1 text-xs font-medium text-brand-red">{errors.consent}</p> : null}
      </div>

      <button
        disabled={submitting || uploadingAttachment}
        type="submit"
        className="rounded-full bg-brand-red px-7 py-2.5 text-sm font-bold text-white transition hover:bg-brand-green disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? copy.sending : copy.submit}
      </button>

      {status ? (
        <div className={`space-y-1 text-sm ${status.type === "success" ? "text-brand-green" : "text-brand-red"}`}>
          <p>{status.message}</p>
          {status.type === "success" && submittedReference ? (
            <p>
              {copy.referenceId}: <span className="font-bold">{submittedReference}</span>{" "}
              <a href={`/${lang}/track-request`} className="font-semibold underline underline-offset-2">
                {copy.trackNow}
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
