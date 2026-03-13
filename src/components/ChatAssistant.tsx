"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatIssueCategory, ChatMessage, Lang } from "@/lib/types";

type CategoryOption = {
  id: ChatIssueCategory;
  bn: string;
  en: string;
};

type StarterOption = {
  id: "welcome" | "appointment" | "project" | "service";
  category: ChatIssueCategory;
  labelBn: string;
  labelEn: string;
  seedMessageBn?: string;
  seedMessageEn?: string;
};

const categories: CategoryOption[] = [
  { id: "citizen_services", bn: "নাগরিক সেবা", en: "Citizen Services" },
  { id: "development_projects", bn: "উন্নয়ন প্রকল্প", en: "Development Projects" },
  { id: "government_projects", bn: "সরকারি প্রকল্প", en: "Government Projects" },
  { id: "office_contact", bn: "অফিস যোগাযোগ", en: "Office Contact" },
  { id: "other", bn: "অন্যান্য", en: "Other" }
];

const starterOptions: StarterOption[] = [
  {
    id: "welcome",
    category: "other",
    labelBn: "অফিস থেকে শুভেচ্ছা",
    labelEn: "Welcome from Office"
  },
  {
    id: "appointment",
    category: "office_contact",
    labelBn: "সাক্ষাতের অনুরোধ",
    labelEn: "Appointment Request",
    seedMessageBn: "আমি একটি সাক্ষাতের সময় জানতে চাই।",
    seedMessageEn: "I would like to request an appointment."
  },
  {
    id: "project",
    category: "government_projects",
    labelBn: "সরকারি প্রকল্পের আপডেট জানতে চাই",
    labelEn: "Ask about government projects",
    seedMessageBn: "আমার এলাকায় চলমান সরকারি প্রকল্পের অগ্রগতি জানতে চাই।",
    seedMessageEn: "I want an update on a government project in my area."
  },
  {
    id: "service",
    category: "citizen_services",
    labelBn: "স্থানীয় সমস্যায় সহায়তা চাই",
    labelEn: "Get help for local issues",
    seedMessageBn: "আমি স্থানীয় নাগরিক সেবা সংক্রান্ত সমস্যার সমাধান চাই।",
    seedMessageEn: "I need guidance to resolve a local citizen service issue."
  }
];

const MESSENGER_FALLBACK = "https://m.me/";

function looksBangla(pathname: string) {
  return pathname.startsWith("/bn");
}

function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 5.5a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 5.5v7A2.5 2.5 0 0 1 17.5 15H10l-4.6 4.2c-.65.6-1.7.14-1.7-.74V15.1A2.5 2.5 0 0 1 4 12.7v-7.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function toMessengerUrl(facebookUrl?: string) {
  if (!facebookUrl) return MESSENGER_FALLBACK;

  try {
    const parsed = new URL(facebookUrl);
    if (!parsed.hostname.includes("facebook.com")) {
      return MESSENGER_FALLBACK;
    }
    const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
    if (!path) return MESSENGER_FALLBACK;
    if (path.startsWith("profile.php")) return facebookUrl;
    return `https://m.me/${path}`;
  } catch {
    return MESSENGER_FALLBACK;
  }
}

export function ChatAssistant({ facebookUrl }: { facebookUrl?: string }) {
  const pathname = usePathname() || "";
  const isBangla = looksBangla(pathname);
  const lang: Lang = isBangla ? "bn" : "en";
  const hidden = pathname.includes("/admin");
  const messengerUrl = toMessengerUrl(facebookUrl);

  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<ChatIssueCategory>("citizen_services");
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [escalated, setEscalated] = useState(false);
  const [selectedStarter, setSelectedStarter] = useState<StarterOption["id"]>("welcome");
  const [seedMessage, setSeedMessage] = useState("");
  const [liftForFooter, setLiftForFooter] = useState(false);

  const labels = useMemo(
    () => ({
      title: isBangla ? "এআই সহকারী" : "AI Assistant",
      subtitle: isBangla ? "অফিস সহায়তা" : "Office Support",
      open: isBangla ? "সহকারী" : "Assistant",
      close: isBangla ? "বন্ধ করুন" : "Close chat",
      name: isBangla ? "আপনার নাম" : "Your name",
      phone: isBangla ? "মোবাইল নম্বর" : "Phone number",
      email: isBangla ? "ইমেইল (ঐচ্ছিক)" : "Email (optional)",
      category: isBangla ? "সমস্যার ধরন" : "Issue category",
      start: isBangla ? "চ্যাট শুরু করুন" : "Start chat",
      message: isBangla ? "আপনার বার্তা লিখুন..." : "Type your message...",
      send: isBangla ? "পাঠান" : "Send",
      contactRequired: isBangla ? "মোবাইল নম্বর বা ইমেইল দিন" : "Please provide phone or email",
      nameRequired: isBangla ? "নাম লিখুন" : "Please provide your name",
      escalated: isBangla ? "এই প্রশ্নটি অফিস টিমে পাঠানো হয়েছে।" : "This query has been escalated to the office team.",
      failed: isBangla ? "সার্ভার সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।" : "Server error. Please try again.",
      intro:
        lang === "bn"
          ? "বার্তা পাঠানোর আগে আপনার নাম ও মোবাইল/ইমেইল দিন।"
          : "Before sending a message, please provide your name and phone/email.",
      clientWelcome:
        lang === "bn"
          ? "সৈয়দ জাহাঙ্গীর আলমের অফিসে স্বাগতম। নিচ থেকে একটি অপশন বেছে নিন।"
          : "Welcome to Syed Jahangir Alam's office. Choose a starter option below.",
      starterLabel: isBangla ? "শুরুর অপশন" : "Starter Options",
      messenger: isBangla ? "Facebook Messenger-এ যোগাযোগ" : "Contact on Facebook Messenger",
      processing: isBangla ? "প্রক্রিয়া চলছে..." : "Processing..."
    }),
    [isBangla, lang]
  );

  useEffect(() => {
    function updateDockOffset() {
      const bottomViewport = window.scrollY + window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      setLiftForFooter(bottomViewport >= fullHeight - 260);
    }

    updateDockOffset();
    window.addEventListener("scroll", updateDockOffset, { passive: true });
    window.addEventListener("resize", updateDockOffset);
    return () => {
      window.removeEventListener("scroll", updateDockOffset);
      window.removeEventListener("resize", updateDockOffset);
    };
  }, []);

  if (hidden) {
    return null;
  }

  function onSelectStarter(option: StarterOption) {
    setSelectedStarter(option.id);
    setCategory(option.category);
    setSeedMessage(isBangla ? option.seedMessageBn || "" : option.seedMessageEn || "");
    setNotice("");
  }

  async function startConversation() {
    setNotice("");
    const safeName = name.trim();
    const safePhone = phone.trim();
    const safeEmail = email.trim();
    if (!safeName) {
      setNotice(labels.nameRequired);
      return;
    }
    if (!safePhone && !safeEmail) {
      setNotice(labels.contactRequired);
      return;
    }

    setStarting(true);
    try {
      const response = await fetch("/api/chatbot/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: safeName,
          phone: safePhone,
          email: safeEmail,
          category,
          lang
        })
      });
      const data = (await response.json()) as {
        error?: string;
        conversationId?: string;
        conversation?: { id: string; messages: ChatMessage[] };
      };
      if (!response.ok || !data.conversationId || !data.conversation) {
        throw new Error(data.error || labels.failed);
      }

      let nextMessages = data.conversation.messages || [];
      let nextEscalated = false;

      if (seedMessage.trim()) {
        const followUp = await fetch("/api/chatbot/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: data.conversationId,
            message: seedMessage.trim()
          })
        });

        const followUpData = (await followUp.json().catch(() => null)) as {
          conversation?: { messages: ChatMessage[] };
          escalated?: boolean;
        } | null;

        if (followUp.ok && followUpData?.conversation) {
          nextMessages = followUpData.conversation.messages || nextMessages;
          nextEscalated = Boolean(followUpData.escalated);
        }
      }

      setConversationId(data.conversationId);
      setMessages(nextMessages);
      setEscalated(nextEscalated);
      setDraft("");
      setSeedMessage("");
      setSelectedStarter("welcome");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : labels.failed);
    } finally {
      setStarting(false);
    }
  }

  async function sendMessage() {
    if (!conversationId || sending) {
      return;
    }
    const value = draft.trim();
    if (!value) {
      return;
    }

    setNotice("");
    setSending(true);
    setDraft("");

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      text: value,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const response = await fetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: value
        })
      });
      const data = (await response.json()) as {
        error?: string;
        escalated?: boolean;
        conversation?: { messages: ChatMessage[] };
      };
      if (!response.ok || !data.conversation) {
        throw new Error(data.error || labels.failed);
      }
      setMessages(data.conversation.messages || []);
      setEscalated(Boolean(data.escalated));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : labels.failed);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={`fixed right-3 z-50 transition-[bottom] duration-300 sm:right-6 ${
        liftForFooter ? "bottom-[max(6.2rem,env(safe-area-inset-bottom))] sm:bottom-20" : "bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6"
      }`}
    >
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={labels.open}
          className="inline-flex h-12 max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-white/70 bg-brand-green px-4 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(0,82,46,0.35)] transition hover:translate-y-[-1px] sm:h-14 sm:px-5 sm:text-base"
        >
          <span className="hidden sm:inline">{labels.open}</span>
          <span className="sm:hidden">{isBangla ? "সহকারী" : "Assistant"}</span>
          <ChatBubbleIcon />
        </button>
      ) : (
        <section className="flex h-[74vh] max-h-[80svh] w-[min(93vw,25rem)] flex-col overflow-hidden rounded-3xl border border-brand-green/20 bg-[#f7f3ea] shadow-[0_24px_54px_rgba(16,34,24,0.35)]">
          <header className="flex items-center justify-between bg-gradient-to-r from-brand-green to-[#0d6c40] px-4 py-3 text-white">
            <div>
              <p className="text-lg font-bold leading-tight">{labels.title}</p>
              <p className="text-xs text-white/90">{labels.subtitle}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-white/95 hover:bg-white/15" aria-label={labels.close}>
              <CloseIcon />
            </button>
          </header>

          {!conversationId ? (
            <div className="space-y-3 overflow-y-auto p-4">
              <p className="rounded-2xl border border-brand-green/25 bg-brand-green/10 px-3 py-2 text-sm text-brand-ink/90">{labels.clientWelcome}</p>
              <p className="rounded-2xl border border-brand-ink/10 bg-white px-3 py-2 text-sm text-brand-ink/80">{labels.intro}</p>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink/60">{labels.starterLabel}</p>
                <div className="grid gap-2">
                  {starterOptions.map((option) => {
                    const selected = selectedStarter === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelectStarter(option)}
                        className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition ${
                          selected
                            ? "border-brand-green bg-brand-green text-white"
                            : "border-brand-ink/20 bg-white text-brand-ink/85 hover:border-brand-green/40 hover:text-brand-green"
                        }`}
                      >
                        {isBangla ? option.labelBn : option.labelEn}
                      </button>
                    );
                  })}

                  <a
                    href={messengerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-brand-ink/25 px-3 py-2 text-xs font-semibold text-brand-ink/85 transition hover:border-brand-green/40 hover:text-brand-green"
                  >
                    {labels.messenger}
                  </a>
                </div>
              </div>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={labels.name}
                autoComplete="name"
                className="w-full rounded-xl border border-brand-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green"
              />
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder={labels.phone}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                className="w-full rounded-xl border border-brand-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green"
              />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={labels.email}
                type="email"
                inputMode="email"
                autoComplete="email"
                className="w-full rounded-xl border border-brand-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green"
              />

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink/60">{labels.category}</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCategory(item.id)}
                      className={`rounded-xl border px-2.5 py-2 text-xs font-semibold transition ${
                        category === item.id
                          ? "border-brand-green bg-brand-green text-white"
                          : "border-brand-ink/20 bg-white text-brand-green hover:border-brand-green/40"
                      }`}
                    >
                      {isBangla ? item.bn : item.en}
                    </button>
                  ))}
                </div>
              </div>

              {notice ? <p className="text-xs text-brand-red" aria-live="polite">{notice}</p> : null}

              <button
                type="button"
                onClick={() => void startConversation()}
                disabled={starting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-brand-red px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
              >
                {starting ? labels.processing : labels.start}
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto bg-white/70 p-4">
                {messages.map((item) => (
                  <div key={item.id} className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${item.sender === "user" ? "ml-auto bg-brand-green text-white" : "border border-brand-ink/10 bg-white text-brand-ink"}`}>
                    {item.text}
                  </div>
                ))}
                {escalated ? <p className="text-xs font-semibold text-brand-red" aria-live="polite">{labels.escalated}</p> : null}
                {notice ? <p className="text-xs text-brand-red" aria-live="polite">{notice}</p> : null}
              </div>

              <div className="border-t border-brand-ink/10 bg-[#f7f3ea] p-3">
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void sendMessage();
                      }
                    }}
                    placeholder={labels.message}
                    className="h-11 w-full rounded-full border border-brand-ink/20 bg-white px-4 text-sm outline-none focus:border-brand-green"
                  />
                  <button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={sending}
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-brand-red px-3 text-sm font-bold text-white disabled:opacity-70"
                  >
                    {labels.send}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
