"use client";

import { useState } from "react";
import { LocalizedText } from "@/lib/types";

export const inputClassName =
  "w-full rounded-xl border border-brand-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green";

export function FieldInput({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "url" | "date" | "number";
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold text-brand-ink/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    </label>
  );
}

export function FieldTextArea({
  label,
  value,
  onChange,
  rows = 4
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold text-brand-ink/70">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClassName} resize-y`}
      />
    </label>
  );
}

export function BilingualField({
  label,
  value,
  onChange,
  langLabelBn,
  langLabelEn,
  multiline = false,
  rows = 4
}: {
  label: string;
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  langLabelBn: string;
  langLabelEn: string;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-brand-green">{label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {multiline ? (
          <FieldTextArea
            label={langLabelBn}
            value={value.bn}
            rows={rows}
            onChange={(next) => onChange({ ...value, bn: next })}
          />
        ) : (
          <FieldInput
            label={langLabelBn}
            value={value.bn}
            onChange={(next) => onChange({ ...value, bn: next })}
          />
        )}

        {multiline ? (
          <FieldTextArea
            label={langLabelEn}
            value={value.en}
            rows={rows}
            onChange={(next) => onChange({ ...value, en: next })}
          />
        ) : (
          <FieldInput
            label={langLabelEn}
            value={value.en}
            onChange={(next) => onChange({ ...value, en: next })}
          />
        )}
      </div>
    </div>
  );
}

export function createId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}-${Date.now()}-${random}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function UploadUrlField({
  label,
  value,
  onChange,
  accept,
  uploadKind,
  isBangla
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept: string;
  uploadKind: "image" | "video" | "pdf";
  isBangla: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", uploadKind);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Upload failed");
      }

      onChange(data.url);
      setMessage(isBangla ? "ফাইল আপলোড সম্পন্ন হয়েছে" : "File uploaded successfully");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : isBangla ? "আপলোড ব্যর্থ হয়েছে" : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <FieldInput label={label} value={value} onChange={onChange} type="url" />
      <div className="flex flex-wrap items-center gap-3">
        <label className="rounded-full border border-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green">
          {uploading ? (isBangla ? "আপলোড হচ্ছে..." : "Uploading...") : isBangla ? "ফাইল আপলোড করুন" : "Upload File"}
          <input type="file" accept={accept} onChange={onFileChange} disabled={uploading} className="hidden" />
        </label>
        {message ? <p className="text-xs text-brand-ink/70">{message}</p> : null}
      </div>
    </div>
  );
}
