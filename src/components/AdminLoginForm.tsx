"use client";

import { useState } from "react";

export function AdminLoginForm({ lang }: { lang: "bn" | "en" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const isBangla = lang === "bn";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error || (isBangla ? "ভুল ইমেইল বা পাসওয়ার্ড" : "Invalid email or password"));
      }

      window.location.href = `/${lang}/admin`;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : isBangla ? "লগইন ব্যর্থ হয়েছে" : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="card-surface p-7">
        <h1 className="text-2xl font-bold text-brand-green">{isBangla ? "অ্যাডমিন লগইন" : "Admin Login"}</h1>
        <p className="mt-1 text-sm text-brand-ink/70">
          {isBangla ? "রেজিস্টার করা ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন" : "Login with registered email and password"}
        </p>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input
            required
            type="email"
            placeholder={isBangla ? "ইমেইল" : "Email"}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-brand-ink/20 bg-white px-4 py-3 text-sm"
          />
          <input
            required
            type="password"
            minLength={8}
            placeholder={isBangla ? "পাসওয়ার্ড" : "Password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-brand-ink/20 bg-white px-4 py-3 text-sm"
          />
          <button disabled={loading} className="w-full rounded-full bg-brand-green px-4 py-2.5 text-sm font-bold text-white disabled:opacity-70">
            {loading ? (isBangla ? "অপেক্ষা করুন..." : "Please wait...") : isBangla ? "লগইন" : "Login"}
          </button>
          {status ? <p className="text-sm text-brand-red">{status}</p> : null}
        </form>
      </div>
    </div>
  );
}
