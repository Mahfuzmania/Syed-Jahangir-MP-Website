"use client";

import { useMemo, useState } from "react";
import { GovernmentProjectStatus, NoticeDisplayScope, NoticeScrollDirection, SiteContent } from "@/lib/types";
import { BilingualField, createId, FieldInput, FieldTextArea, slugify, UploadUrlField } from "@/components/admin/FieldParts";

type Labels = {
  contentManager: string;
  helper: string;
  quickNav: string;
  navProfile: string;
  navNotice: string;
  navPages: string;
  navContact: string;
  navCommitments: string;
  navNews: string;
  navWork: string;
  navGallery: string;
  navVideos: string;
  navProjects: string;
  navProfileDetails: string;
  navCta: string;
  galleryHint: string;
  galleryCountLabel: string;
  galleryAlbumLabel: string;
  save: string;
  saving: string;
  saved: string;
  failed: string;
  addItem: string;
  removeItem: string;
  bn: string;
  en: string;
};

type EditorSection =
  | "profile"
  | "notice"
  | "pages"
  | "profileDetails"
  | "cta"
  | "contact"
  | "commitments"
  | "news"
  | "work"
  | "gallery"
  | "videos"
  | "projects";

function parseCsvList(value: string) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of value.split(",")) {
    const cleaned = entry.trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(cleaned);
  }

  return result;
}

function parseLineList(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function toSafeNumber(value: unknown, fallback = 0) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.max(0, Math.round(numberValue));
}

function toSafeProgress(value: unknown, fallback = 0) {
  return Math.min(100, Math.max(0, toSafeNumber(value, fallback)));
}

function normalizeProjectStatus(value: unknown): GovernmentProjectStatus {
  if (value === "planned" || value === "running" || value === "completed" || value === "on_hold") {
    return value;
  }
  return "planned";
}

function normalize(content: SiteContent): SiteContent {
  const clean = <T extends { bn: string; en: string }>(value: T) => ({
    bn: value.bn.trim(),
    en: value.en.trim()
  });
  const cleanStatusCopy = (value: SiteContent["pageCopy"]["governmentProjects"]["statusLabels"]) => ({
    planned: clean(value.planned),
    running: clean(value.running),
    completed: clean(value.completed),
    onHold: clean(value.onHold)
  });
  const cleanList = (value: { bn: string[]; en: string[] }) => ({
    bn: value.bn.map((item) => item.trim()).filter(Boolean),
    en: value.en.map((item) => item.trim()).filter(Boolean)
  });

  return {
    ...content,
    candidate: {
      ...content.candidate,
      name: clean(content.candidate.name),
      shortTitle: clean(content.candidate.shortTitle),
      intro: clean(content.candidate.intro),
      heroSlogan: clean(content.candidate.heroSlogan),
      heroImage: content.candidate.heroImage.trim(),
      profileImage: content.candidate.profileImage.trim()
    },
    profileSection: {
      biographyTitle: clean(content.profileSection.biographyTitle),
      biographyText: clean(content.profileSection.biographyText),
      activitiesTitle: clean(content.profileSection.activitiesTitle),
      collectionPoints: cleanList(content.profileSection.collectionPoints),
      officeButtonLabel: clean(content.profileSection.officeButtonLabel),
      facebookButtonLabel: clean(content.profileSection.facebookButtonLabel)
    },
    preFooterCta: {
      title: clean(content.preFooterCta.title),
      description: clean(content.preFooterCta.description),
      volunteerButtonLabel: clean(content.preFooterCta.volunteerButtonLabel),
      writeToMpButtonLabel: clean(content.preFooterCta.writeToMpButtonLabel)
    },
    noticeBar: {
      enabled: Boolean(content.noticeBar.enabled),
      showOn: content.noticeBar.showOn === "all_pages" ? "all_pages" : "home",
      speed: Math.min(120, Math.max(18, toSafeNumber(content.noticeBar.speed, 42))),
      direction: content.noticeBar.direction === "ltr" ? "ltr" : "rtl",
      prefixLabel: clean(content.noticeBar.prefixLabel),
      items: content.noticeBar.items
        .map((item, index) => ({
          id: item.id || createId("notice"),
          text: clean(item.text),
          link: (item.link || "").trim(),
          isUrgent: Boolean(item.isUrgent),
          isActive: typeof item.isActive === "boolean" ? item.isActive : true,
          startAt: (item.startAt || "").trim(),
          endAt: (item.endAt || "").trim(),
          order: toSafeNumber(item.order, index + 1)
        }))
        .filter((item) => item.text.bn || item.text.en)
        .sort((left, right) => left.order - right.order)
    },
    pageCopy: {
      home: {
        heroTag: clean(content.pageCopy.home.heroTag),
        commitmentsLabel: clean(content.pageCopy.home.commitmentsLabel),
        runningProjectsLabel: clean(content.pageCopy.home.runningProjectsLabel),
        reportsLabel: clean(content.pageCopy.home.reportsLabel),
        directServiceTag: clean(content.pageCopy.home.directServiceTag),
        directServiceTitle: clean(content.pageCopy.home.directServiceTitle),
        directServiceText: clean(content.pageCopy.home.directServiceText),
        statusTag: clean(content.pageCopy.home.statusTag),
        statusTitle: clean(content.pageCopy.home.statusTitle),
        statusText: clean(content.pageCopy.home.statusText),
        transparencyTag: clean(content.pageCopy.home.transparencyTag),
        transparencyTitle: clean(content.pageCopy.home.transparencyTitle),
        transparencyText: clean(content.pageCopy.home.transparencyText),
        projectsDescription: clean(content.pageCopy.home.projectsDescription),
        monthlyReportsTitle: clean(content.pageCopy.home.monthlyReportsTitle),
        publishedLabel: clean(content.pageCopy.home.publishedLabel),
        mediaDescription: clean(content.pageCopy.home.mediaDescription),
        ctaTitle: clean(content.pageCopy.home.ctaTitle),
        ctaText: clean(content.pageCopy.home.ctaText),
        budgetLabel: clean(content.pageCopy.home.budgetLabel),
        spentLabel: clean(content.pageCopy.home.spentLabel),
        manifestoTag: clean(content.pageCopy.home.manifestoTag),
        manifestoText: clean(content.pageCopy.home.manifestoText)
      },
      profile: {
        briefBioLabel: clean(content.pageCopy.profile.briefBioLabel),
        activitiesLabel: clean(content.pageCopy.profile.activitiesLabel)
      },
      development: {
        pageDescription: clean(content.pageCopy.development.pageDescription),
        monthlyReportsNavLabel: clean(content.pageCopy.development.monthlyReportsNavLabel),
        viewAllLabel: clean(content.pageCopy.development.viewAllLabel),
        budgetLabel: clean(content.pageCopy.development.budgetLabel),
        spentLabel: clean(content.pageCopy.development.spentLabel),
        progressLabel: clean(content.pageCopy.development.progressLabel),
        monthlyReportsTitle: clean(content.pageCopy.development.monthlyReportsTitle),
        monthlyReportsDescription: clean(content.pageCopy.development.monthlyReportsDescription)
      },
      governmentProjects: {
        pageTitle: clean(content.pageCopy.governmentProjects.pageTitle),
        pageDescription: clean(content.pageCopy.governmentProjects.pageDescription),
        totalBudgetLabel: clean(content.pageCopy.governmentProjects.totalBudgetLabel),
        spentLabel: clean(content.pageCopy.governmentProjects.spentLabel),
        progressLabel: clean(content.pageCopy.governmentProjects.progressLabel),
        fullBreakdownLabel: clean(content.pageCopy.governmentProjects.fullBreakdownLabel),
        statusLabels: cleanStatusCopy(content.pageCopy.governmentProjects.statusLabels)
      },
      governmentProjectDetails: {
        backToListLabel: clean(content.pageCopy.governmentProjectDetails.backToListLabel),
        sectorLabel: clean(content.pageCopy.governmentProjectDetails.sectorLabel),
        locationLabel: clean(content.pageCopy.governmentProjectDetails.locationLabel),
        implementingAgencyLabel: clean(content.pageCopy.governmentProjectDetails.implementingAgencyLabel),
        totalBudgetLabel: clean(content.pageCopy.governmentProjectDetails.totalBudgetLabel),
        spentLabel: clean(content.pageCopy.governmentProjectDetails.spentLabel),
        progressLabel: clean(content.pageCopy.governmentProjectDetails.progressLabel),
        phaseLabel: clean(content.pageCopy.governmentProjectDetails.phaseLabel),
        beneficiariesLabel: clean(content.pageCopy.governmentProjectDetails.beneficiariesLabel)
      },
      workHistory: {
        pageDescription: clean(content.pageCopy.workHistory.pageDescription),
        ctaTitle: clean(content.pageCopy.workHistory.ctaTitle),
        ctaText: clean(content.pageCopy.workHistory.ctaText),
        heroImageAlt: clean(content.pageCopy.workHistory.heroImageAlt)
      },
      contact: {
        emailLabel: clean(content.pageCopy.contact.emailLabel),
        facebookInboxLabel: clean(content.pageCopy.contact.facebookInboxLabel)
      }
    },
    commitments: content.commitments.map((item, index) => ({
      ...item,
      id: item.id || createId("c"),
      slug: item.slug.trim() || slugify(item.title.en) || `commitment-${index + 1}`,
      title: clean(item.title),
      summary: clean(item.summary),
      details: clean(item.details),
      image: item.image.trim()
    })),
    workHistory: content.workHistory.map((item) => ({
      ...item,
      id: item.id || createId("w"),
      title: clean(item.title),
      summary: clean(item.summary),
      icon: item.icon.trim()
    })),
    gallery: content.gallery.map((item) => ({
      ...item,
      id: item.id || createId("g"),
      title: clean(item.title),
      album: clean(item.album),
      image: item.image.trim()
    })),
    news: content.news.map((item, index) => ({
      ...item,
      id: item.id || createId("n"),
      slug: item.slug.trim() || slugify(item.title.en) || `news-${index + 1}`,
      title: clean(item.title),
      excerpt: clean(item.excerpt),
      content: clean(item.content),
      date: item.date.trim(),
      image: item.image.trim(),
      categories: parseCsvList((item.categories || []).join(", ")),
      tags: parseCsvList((item.tags || []).join(", "))
    })),
    monthlyReports: content.monthlyReports.map((item, index) => ({
      ...item,
      id: item.id || createId("mr"),
      slug: item.slug.trim() || slugify(item.title.en) || `monthly-report-${index + 1}`,
      title: clean(item.title),
      summary: clean(item.summary),
      reportMonth: item.reportMonth.trim(),
      publishedDate: item.publishedDate.trim(),
      pdfUrl: item.pdfUrl.trim()
    })),
    videos: content.videos.map((item) => ({
      ...item,
      id: item.id || createId("v"),
      title: clean(item.title),
      youtubeUrl: item.youtubeUrl.trim(),
      videoFileUrl: (item.videoFileUrl || "").trim(),
      duration: item.duration.trim(),
      thumbnail: item.thumbnail.trim()
    })),
    governmentProjects: content.governmentProjects.map((project, index) => {
      const budgetTotal = toSafeNumber(project.budgetTotal);
      const spentAmount = Math.min(toSafeNumber(project.spentAmount), budgetTotal);

      return {
        ...project,
        id: project.id || createId("gp"),
        slug: project.slug.trim() || slugify(project.title.en) || `gov-project-${index + 1}`,
        title: clean(project.title),
        summary: clean(project.summary),
        details: clean(project.details),
        sector: project.sector.trim(),
        location: project.location.trim(),
        implementingAgency: project.implementingAgency.trim(),
        budgetTotal,
        spentAmount,
        startDate: project.startDate.trim(),
        expectedEndDate: project.expectedEndDate.trim(),
        status: normalizeProjectStatus(project.status),
        phase: clean(project.phase),
        progressPercent: toSafeProgress(project.progressPercent),
        beneficiaries: clean(project.beneficiaries),
        image: project.image.trim()
      };
    }),
    manifesto: {
      ...content.manifesto,
      title: clean(content.manifesto.title),
      summary: clean(content.manifesto.summary),
      pdfUrl: content.manifesto.pdfUrl.trim()
    },
    contact: {
      ...content.contact,
      phone: content.contact.phone.trim(),
      email: content.contact.email.trim(),
      address: clean(content.contact.address),
      mapEmbedUrl: content.contact.mapEmbedUrl.trim()
    },
    socials: {
      facebook: content.socials.facebook.trim(),
      youtube: content.socials.youtube.trim(),
      twitter: content.socials.twitter.trim(),
      instagram: content.socials.instagram.trim()
    }
  };
}

export function ContentEditor({ lang, initialContent }: { lang: "bn" | "en"; initialContent: SiteContent }) {
  const isBangla = lang === "bn";
  const labels = useMemo<Labels>(
    () => ({
      contentManager: isBangla ? "ওয়েবসাইট কনটেন্ট ম্যানেজার" : "Website Content Manager",
      helper: isBangla
        ? "ফর্ম পূরণ করে তথ্য আপডেট করুন। JSON কোড লেখার দরকার নেই।"
        : "Update information with forms. No JSON code is needed.",
      quickNav: isBangla ? "দ্রুত সেকশন নেভিগেশন" : "Quick Section Navigation",
      navProfile: isBangla ? "পরিচিতি" : "Profile",
      navNotice: isBangla ? "নোটিশ বার" : "Notice Bar",
      navPages: isBangla ? "পেজ কপি" : "Page Copy",
      navProfileDetails: isBangla ? "পরিচিতির লেখা" : "Profile Text",
      navCta: isBangla ? "ফুটার সিটিএ" : "Footer CTA",
      navContact: isBangla ? "যোগাযোগ" : "Contact",
      navCommitments: isBangla ? "অঙ্গীকার" : "Commitments",
      navNews: isBangla ? "সংবাদ" : "News",
      navWork: isBangla ? "পূর্বের কাজ" : "Work History",
      navGallery: isBangla ? "গ্যালারি" : "Gallery",
      navVideos: isBangla ? "ভিডিও" : "Videos",
      navProjects: isBangla ? "সরকারি প্রকল্প" : "Government Projects",
      galleryHint: isBangla
        ? "গ্যালারির অ্যালবাম নামগুলোই পাবলিক সাইটে ট্যাব/ক্যাটাগরি হিসেবে দেখাবে।"
        : "Gallery album names are used as public category tabs.",
      galleryCountLabel: isBangla ? "ছবির সংখ্যা" : "Photos",
      galleryAlbumLabel: isBangla ? "অ্যালবাম সংখ্যা" : "Albums",
      save: isBangla ? "সব পরিবর্তন সংরক্ষণ করুন" : "Save All Changes",
      saving: isBangla ? "সংরক্ষণ করা হচ্ছে..." : "Saving...",
      saved: isBangla ? "সফলভাবে সংরক্ষণ হয়েছে" : "Saved successfully",
      failed: isBangla ? "সংরক্ষণ ব্যর্থ হয়েছে" : "Save failed",
      addItem: isBangla ? "নতুন আইটেম" : "Add Item",
      removeItem: isBangla ? "মুছে ফেলুন" : "Remove",
      bn: isBangla ? "বাংলা" : "Bangla",
      en: isBangla ? "ইংরেজি" : "English"
    }),
    [isBangla]
  );

  const [draft, setDraft] = useState<SiteContent>(initialContent);
  const [activeSection, setActiveSection] = useState<EditorSection>("profile");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const hasChanges = useMemo(() => JSON.stringify(draft) !== JSON.stringify(initialContent), [draft, initialContent]);

  const galleryStats = useMemo(() => {
    const albums = new Set(
      draft.gallery
        .map((item) => (isBangla ? item.album.bn : item.album.en).trim())
        .filter(Boolean)
    );

    return {
      photos: draft.gallery.length,
      albums: albums.size
    };
  }, [draft.gallery, isBangla]);

  const projectStatusOptions = useMemo(
    () => [
      { value: "planned" as GovernmentProjectStatus, label: isBangla ? "পরিকল্পিত" : "Planned" },
      { value: "running" as GovernmentProjectStatus, label: isBangla ? "চলমান" : "Running" },
      { value: "completed" as GovernmentProjectStatus, label: isBangla ? "সমাপ্ত" : "Completed" },
      { value: "on_hold" as GovernmentProjectStatus, label: isBangla ? "স্থগিত" : "On Hold" }
    ],
    [isBangla]
  );

  const noticeScopeOptions = useMemo(
    () =>
      [
        { value: "home" as NoticeDisplayScope, label: isBangla ? "শুধু হোমপেজ" : "Home page only" },
        { value: "all_pages" as NoticeDisplayScope, label: isBangla ? "সব পেজ" : "All pages" }
      ],
    [isBangla]
  );

  const noticeDirectionOptions = useMemo(
    () =>
      [
        { value: "rtl" as NoticeScrollDirection, label: isBangla ? "ডান থেকে বাম" : "Right to left" },
        { value: "ltr" as NoticeScrollDirection, label: isBangla ? "বাম থেকে ডান" : "Left to right" }
      ],
    [isBangla]
  );

  function mutate(updater: (next: SiteContent) => void) {
    setStatus("");
    setDraft((prev) => {
      const next = structuredClone(prev);
      updater(next);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setStatus("");
    try {
      const cleaned = normalize(draft);
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: cleaned })
      });
      if (!response.ok) {
        throw new Error("Save failed");
      }
      setDraft(cleaned);
      setStatus(labels.saved);
    } catch {
      setStatus(labels.failed);
    } finally {
      setSaving(false);
    }
  }

  function resetDraft() {
    setStatus("");
    setDraft(initialContent);
  }

  return (
    <section className="card-surface p-6">
      <h2 className="text-xl font-bold text-brand-green">{labels.contentManager}</h2>
      <p className="mt-1 text-sm text-brand-ink/70">{labels.helper}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            hasChanges
              ? "border-amber-300 bg-amber-50 text-amber-700"
              : "border-emerald-300 bg-emerald-50 text-emerald-700"
          }`}
        >
          {hasChanges ? (isBangla ? "সংরক্ষণ না করা পরিবর্তন আছে" : "Unsaved changes") : isBangla ? "সবকিছু সংরক্ষিত" : "All changes saved"}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink/60">{labels.quickNav}</p>
        <div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setActiveSection("profile")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "profile" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navProfile}
          </button>
          <button type="button" onClick={() => setActiveSection("notice")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "notice" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navNotice}
          </button>
          <button type="button" onClick={() => setActiveSection("pages")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "pages" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navPages}
          </button>
          <button type="button" onClick={() => setActiveSection("profileDetails")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "profileDetails" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navProfileDetails}
          </button>
          <button type="button" onClick={() => setActiveSection("cta")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "cta" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navCta}
          </button>
          <button type="button" onClick={() => setActiveSection("contact")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "contact" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navContact}
          </button>
          <button type="button" onClick={() => setActiveSection("commitments")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "commitments" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navCommitments}
          </button>
          <button type="button" onClick={() => setActiveSection("news")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "news" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navNews}
          </button>
          <button type="button" onClick={() => setActiveSection("work")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "work" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navWork}
          </button>
          <button type="button" onClick={() => setActiveSection("gallery")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "gallery" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navGallery}
          </button>
          <button type="button" onClick={() => setActiveSection("videos")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "videos" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navVideos}
          </button>
          <button type="button" onClick={() => setActiveSection("projects")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === "projects" ? "border-brand-green bg-brand-green text-white" : "border-brand-ink/15 bg-white text-brand-ink hover:border-brand-green/35 hover:text-brand-green"}`}>
            {labels.navProjects}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-6">
        <div className={`${activeSection === "profile" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5 space-y-4`}>
          <h3 className="text-lg font-semibold text-brand-green">{isBangla ? "পরিচিতি" : "Profile"}</h3>
          <BilingualField label={isBangla ? "নাম" : "Name"} value={draft.candidate.name} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.candidate.name = value))} />
          <BilingualField label={isBangla ? "সংক্ষিপ্ত পরিচয়" : "Short Title"} value={draft.candidate.shortTitle} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.candidate.shortTitle = value))} />
          <BilingualField label={isBangla ? "স্লোগান" : "Hero Slogan"} value={draft.candidate.heroSlogan} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.candidate.heroSlogan = value))} />
          <BilingualField label={isBangla ? "ভূমিকা" : "Intro"} value={draft.candidate.intro} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={5} onChange={(value) => mutate((n) => (n.candidate.intro = value))} />
          <div className="grid gap-3 md:grid-cols-2">
            <UploadUrlField
              label={isBangla ? "হিরো ছবি URL" : "Hero Image URL"}
              value={draft.candidate.heroImage}
              onChange={(value) => mutate((n) => (n.candidate.heroImage = value))}
              accept="image/*"
              uploadKind="image"
              isBangla={isBangla}
            />
            <UploadUrlField
              label={isBangla ? "পরিচিতি ছবি URL" : "Profile Image URL"}
              value={draft.candidate.profileImage}
              onChange={(value) => mutate((n) => (n.candidate.profileImage = value))}
              accept="image/*"
              uploadKind="image"
              isBangla={isBangla}
            />
          </div>
        </div>

        <div className={`${activeSection === "notice" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5 space-y-4`}>
          <h3 className="text-lg font-semibold text-brand-green">{isBangla ? "চলমান নোটিশ বার" : "Scrolling Notice Bar"}</h3>
          <p className="text-sm text-brand-ink/72">
            {isBangla
              ? "হেডারের নিচে টিভি নিউজের মতো অনুভূমিকভাবে চলমান নোটিশ এখানে নিয়ন্ত্রণ করুন।"
              : "Control the horizontal moving ticker shown below the header (TV news style)."}
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 rounded-xl border border-brand-ink/15 bg-brand-surface/50 px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={draft.noticeBar.enabled}
                onChange={(event) => mutate((n) => (n.noticeBar.enabled = event.target.checked))}
              />
              <span>{isBangla ? "নোটিশ বার চালু" : "Enable notice bar"}</span>
            </label>
            <FieldInput
              label={isBangla ? "স্ক্রল স্পিড (18-120)" : "Scroll Speed (18-120)"}
              type="number"
              value={String(draft.noticeBar.speed)}
              onChange={(value) => mutate((n) => (n.noticeBar.speed = toSafeNumber(value, 42)))}
            />
            <label className="space-y-1">
              <span className="text-xs font-semibold text-brand-ink/70">{isBangla ? "কোথায় দেখাবে" : "Show on"}</span>
              <select
                value={draft.noticeBar.showOn}
                onChange={(event) => mutate((n) => (n.noticeBar.showOn = event.target.value as NoticeDisplayScope))}
                className="w-full rounded-xl border border-brand-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green"
              >
                {noticeScopeOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-brand-ink/70">{isBangla ? "মুভমেন্ট দিক" : "Movement Direction"}</span>
              <select
                value={draft.noticeBar.direction}
                onChange={(event) => mutate((n) => (n.noticeBar.direction = event.target.value as NoticeScrollDirection))}
                className="w-full rounded-xl border border-brand-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green"
              >
                {noticeDirectionOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <BilingualField
            label={isBangla ? "লেবেল (যেমন: নোটিশ)" : "Badge Label (e.g., Notice)"}
            value={draft.noticeBar.prefixLabel}
            langLabelBn={labels.bn}
            langLabelEn={labels.en}
            onChange={(value) => mutate((n) => (n.noticeBar.prefixLabel = value))}
          />

          <div className="space-y-4">
            {draft.noticeBar.items.map((item, index) => (
              <article key={item.id} className="rounded-2xl border border-brand-ink/10 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {isBangla ? `নোটিশ #${index + 1}` : `Notice #${index + 1}`}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-brand-ink/20 px-3 py-1 text-xs"
                      disabled={index === 0}
                      onClick={() =>
                        mutate((n) => {
                          const list = n.noticeBar.items;
                          [list[index - 1], list[index]] = [list[index], list[index - 1]];
                          n.noticeBar.items = list.map((entry, entryIndex) => ({ ...entry, order: entryIndex + 1 }));
                        })
                      }
                    >
                      {isBangla ? "উপরে" : "Up"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-brand-ink/20 px-3 py-1 text-xs"
                      disabled={index >= draft.noticeBar.items.length - 1}
                      onClick={() =>
                        mutate((n) => {
                          const list = n.noticeBar.items;
                          [list[index], list[index + 1]] = [list[index + 1], list[index]];
                          n.noticeBar.items = list.map((entry, entryIndex) => ({ ...entry, order: entryIndex + 1 }));
                        })
                      }
                    >
                      {isBangla ? "নিচে" : "Down"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-brand-red px-3 py-1 text-xs text-brand-red"
                      onClick={() =>
                        mutate((n) => {
                          n.noticeBar.items.splice(index, 1);
                          n.noticeBar.items = n.noticeBar.items.map((entry, entryIndex) => ({ ...entry, order: entryIndex + 1 }));
                        })
                      }
                    >
                      {labels.removeItem}
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <FieldInput
                    label={isBangla ? "লিংক (ঐচ্ছিক)" : "Link (optional)"}
                    value={item.link}
                    onChange={(value) => mutate((n) => (n.noticeBar.items[index].link = value))}
                  />
                  <FieldInput
                    label={isBangla ? "অর্ডার" : "Order"}
                    type="number"
                    value={String(item.order)}
                    onChange={(value) => mutate((n) => (n.noticeBar.items[index].order = toSafeNumber(value, index + 1)))}
                  />
                  <FieldInput
                    label={isBangla ? "শুরুর সময় (ঐচ্ছিক)" : "Start At (optional)"}
                    type="datetime-local"
                    value={item.startAt}
                    onChange={(value) => mutate((n) => (n.noticeBar.items[index].startAt = value))}
                  />
                  <FieldInput
                    label={isBangla ? "শেষ সময় (ঐচ্ছিক)" : "End At (optional)"}
                    type="datetime-local"
                    value={item.endAt}
                    onChange={(value) => mutate((n) => (n.noticeBar.items[index].endAt = value))}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-xl border border-brand-ink/15 bg-brand-surface/50 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(event) => mutate((n) => (n.noticeBar.items[index].isActive = event.target.checked))}
                    />
                    <span>{isBangla ? "সক্রিয় নোটিশ" : "Active notice"}</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-brand-ink/15 bg-brand-surface/50 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={item.isUrgent}
                      onChange={(event) => mutate((n) => (n.noticeBar.items[index].isUrgent = event.target.checked))}
                    />
                    <span>{isBangla ? "জরুরি নোটিশ" : "Urgent notice"}</span>
                  </label>
                </div>

                <BilingualField
                  label={isBangla ? "নোটিশ টেক্সট" : "Notice Text"}
                  value={item.text}
                  langLabelBn={labels.bn}
                  langLabelEn={labels.en}
                  onChange={(value) => mutate((n) => (n.noticeBar.items[index].text = value))}
                />
              </article>
            ))}
          </div>

          <button
            className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white"
            onClick={() =>
              mutate((n) =>
                n.noticeBar.items.push({
                  id: createId("notice"),
                  text: { bn: "", en: "" },
                  link: "",
                  isUrgent: false,
                  isActive: true,
                  startAt: "",
                  endAt: "",
                  order: n.noticeBar.items.length + 1
                })
              )
            }
          >
            {labels.addItem}
          </button>
        </div>

        <div className={`${activeSection === "pages" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5 space-y-5`}>
          <h3 className="text-lg font-semibold text-brand-green">{isBangla ? "পাবলিক পেজ কপি" : "Public Page Copy"}</h3>
          <p className="text-sm text-brand-ink/72">
            {isBangla
              ? "ওয়েবসাইটের পেজভিত্তিক টেক্সট এখানে নিয়ন্ত্রণ করুন।"
              : "Manage page-specific public text from here."}
          </p>

          <details className="rounded-xl border border-brand-ink/10 p-3" open>
            <summary className="cursor-pointer text-sm font-semibold text-brand-green">
              {isBangla ? "হোমপেজ কপি" : "Home Page Copy"}
            </summary>
            <div className="mt-4 space-y-4">
              <BilingualField label="Hero Tag" value={draft.pageCopy.home.heroTag} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.heroTag = value))} />
              <div className="grid gap-4 md:grid-cols-2">
                <BilingualField label={isBangla ? "অঙ্গীকার কাউন্টার" : "Commitments Counter"} value={draft.pageCopy.home.commitmentsLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.commitmentsLabel = value))} />
                <BilingualField label={isBangla ? "চলমান প্রকল্প কাউন্টার" : "Running Projects Counter"} value={draft.pageCopy.home.runningProjectsLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.runningProjectsLabel = value))} />
                <BilingualField label={isBangla ? "রিপোর্ট কাউন্টার" : "Reports Counter"} value={draft.pageCopy.home.reportsLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.reportsLabel = value))} />
                <BilingualField label={isBangla ? "মাসিক প্রতিবেদন শিরোনাম" : "Monthly Reports Title"} value={draft.pageCopy.home.monthlyReportsTitle} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.monthlyReportsTitle = value))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <BilingualField label={isBangla ? "সরাসরি সেবা ট্যাগ" : "Direct Service Tag"} value={draft.pageCopy.home.directServiceTag} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.directServiceTag = value))} />
                <BilingualField label={isBangla ? "স্ট্যাটাস ট্যাগ" : "Status Tag"} value={draft.pageCopy.home.statusTag} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.statusTag = value))} />
                <BilingualField label={isBangla ? "স্বচ্ছতা ট্যাগ" : "Transparency Tag"} value={draft.pageCopy.home.transparencyTag} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.transparencyTag = value))} />
                <BilingualField label={isBangla ? "প্রকাশিত লেবেল" : "Published Label"} value={draft.pageCopy.home.publishedLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.publishedLabel = value))} />
              </div>
              <BilingualField label={isBangla ? "সরাসরি সেবা শিরোনাম" : "Direct Service Title"} value={draft.pageCopy.home.directServiceTitle} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.directServiceTitle = value))} />
              <BilingualField label={isBangla ? "সরাসরি সেবা লেখা" : "Direct Service Text"} value={draft.pageCopy.home.directServiceText} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.home.directServiceText = value))} />
              <BilingualField label={isBangla ? "স্ট্যাটাস শিরোনাম" : "Status Title"} value={draft.pageCopy.home.statusTitle} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.statusTitle = value))} />
              <BilingualField label={isBangla ? "স্ট্যাটাস লেখা" : "Status Text"} value={draft.pageCopy.home.statusText} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.home.statusText = value))} />
              <BilingualField label={isBangla ? "স্বচ্ছতা শিরোনাম" : "Transparency Title"} value={draft.pageCopy.home.transparencyTitle} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.transparencyTitle = value))} />
              <BilingualField label={isBangla ? "স্বচ্ছতা লেখা" : "Transparency Text"} value={draft.pageCopy.home.transparencyText} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.home.transparencyText = value))} />
              <BilingualField label={isBangla ? "প্রকল্প বর্ণনা" : "Projects Description"} value={draft.pageCopy.home.projectsDescription} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.home.projectsDescription = value))} />
              <BilingualField label={isBangla ? "মিডিয়া বর্ণনা" : "Media Description"} value={draft.pageCopy.home.mediaDescription} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.home.mediaDescription = value))} />
              <BilingualField label={isBangla ? "কল টু অ্যাকশন শিরোনাম" : "CTA Title"} value={draft.pageCopy.home.ctaTitle} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.ctaTitle = value))} />
              <BilingualField label={isBangla ? "কল টু অ্যাকশন লেখা" : "CTA Text"} value={draft.pageCopy.home.ctaText} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.home.ctaText = value))} />
              <div className="grid gap-4 md:grid-cols-2">
                <BilingualField label={isBangla ? "বাজেট লেবেল" : "Budget Label"} value={draft.pageCopy.home.budgetLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.budgetLabel = value))} />
                <BilingualField label={isBangla ? "ব্যয় লেবেল" : "Spent Label"} value={draft.pageCopy.home.spentLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.spentLabel = value))} />
              </div>
              <BilingualField label={isBangla ? "ইশতেহার ট্যাগ" : "Manifesto Tag"} value={draft.pageCopy.home.manifestoTag} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.home.manifestoTag = value))} />
              <BilingualField label={isBangla ? "ইশতেহার লেখা" : "Manifesto Text"} value={draft.pageCopy.home.manifestoText} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={4} onChange={(value) => mutate((n) => (n.pageCopy.home.manifestoText = value))} />
            </div>
          </details>

          <details className="rounded-xl border border-brand-ink/10 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-brand-green">
              {isBangla ? "প্রোফাইল / কাজ / যোগাযোগ পেজ" : "Profile / Work / Contact Pages"}
            </summary>
            <div className="mt-4 space-y-4">
              <BilingualField label={isBangla ? "প্রোফাইল: জীবনী লেবেল" : "Profile: Brief Bio Label"} value={draft.pageCopy.profile.briefBioLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.profile.briefBioLabel = value))} />
              <BilingualField label={isBangla ? "প্রোফাইল: কার্যক্রম লেবেল" : "Profile: Activities Label"} value={draft.pageCopy.profile.activitiesLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.profile.activitiesLabel = value))} />
              <BilingualField label={isBangla ? "কাজের পেজ: বিবরণ" : "Work Page: Description"} value={draft.pageCopy.workHistory.pageDescription} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.workHistory.pageDescription = value))} />
              <BilingualField label={isBangla ? "কাজের পেজ: CTA শিরোনাম" : "Work Page: CTA Title"} value={draft.pageCopy.workHistory.ctaTitle} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.workHistory.ctaTitle = value))} />
              <BilingualField label={isBangla ? "কাজের পেজ: CTA লেখা" : "Work Page: CTA Text"} value={draft.pageCopy.workHistory.ctaText} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.workHistory.ctaText = value))} />
              <BilingualField label={isBangla ? "কাজের পেজ: ব্যাকগ্রাউন্ড ছবির Alt" : "Work Page: Hero Image Alt"} value={draft.pageCopy.workHistory.heroImageAlt} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.workHistory.heroImageAlt = value))} />
              <div className="grid gap-4 md:grid-cols-2">
                <BilingualField label={isBangla ? "যোগাযোগ: ইমেইল লেবেল" : "Contact: Email Label"} value={draft.pageCopy.contact.emailLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.contact.emailLabel = value))} />
                <BilingualField label={isBangla ? "যোগাযোগ: ফেসবুক ইনবক্স" : "Contact: Facebook Inbox Label"} value={draft.pageCopy.contact.facebookInboxLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.contact.facebookInboxLabel = value))} />
              </div>
            </div>
          </details>

          <details className="rounded-xl border border-brand-ink/10 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-brand-green">
              {isBangla ? "উন্নয়ন + সরকারি প্রকল্প পেজ" : "Development + Government Project Pages"}
            </summary>
            <div className="mt-4 space-y-4">
              <BilingualField label={isBangla ? "উন্নয়ন পেজ: মূল বিবরণ" : "Development Page: Description"} value={draft.pageCopy.development.pageDescription} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.development.pageDescription = value))} />
              <div className="grid gap-4 md:grid-cols-2">
                <BilingualField label={isBangla ? "উন্নয়ন: মাসিক প্রতিবেদন নেভিগেশন" : "Development: Monthly Reports Nav"} value={draft.pageCopy.development.monthlyReportsNavLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.development.monthlyReportsNavLabel = value))} />
                <BilingualField label={isBangla ? "উন্নয়ন: View All লেবেল" : "Development: View All Label"} value={draft.pageCopy.development.viewAllLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.development.viewAllLabel = value))} />
                <BilingualField label={isBangla ? "উন্নয়ন: বাজেট লেবেল" : "Development: Budget Label"} value={draft.pageCopy.development.budgetLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.development.budgetLabel = value))} />
                <BilingualField label={isBangla ? "উন্নয়ন: ব্যয় লেবেল" : "Development: Spent Label"} value={draft.pageCopy.development.spentLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.development.spentLabel = value))} />
                <BilingualField label={isBangla ? "উন্নয়ন: অগ্রগতি লেবেল" : "Development: Progress Label"} value={draft.pageCopy.development.progressLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.development.progressLabel = value))} />
                <BilingualField label={isBangla ? "উন্নয়ন: মাসিক প্রতিবেদন শিরোনাম" : "Development: Monthly Reports Title"} value={draft.pageCopy.development.monthlyReportsTitle} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.development.monthlyReportsTitle = value))} />
              </div>
              <BilingualField label={isBangla ? "উন্নয়ন: মাসিক প্রতিবেদন বিবরণ" : "Development: Monthly Reports Description"} value={draft.pageCopy.development.monthlyReportsDescription} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.development.monthlyReportsDescription = value))} />

              <BilingualField label={isBangla ? "সরকারি প্রকল্প: পেজ শিরোনাম" : "Gov Projects: Page Title"} value={draft.pageCopy.governmentProjects.pageTitle} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.pageTitle = value))} />
              <BilingualField label={isBangla ? "সরকারি প্রকল্প: পেজ বিবরণ" : "Gov Projects: Page Description"} value={draft.pageCopy.governmentProjects.pageDescription} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.pageDescription = value))} />
              <div className="grid gap-4 md:grid-cols-2">
                <BilingualField label={isBangla ? "সরকারি প্রকল্প: বাজেট লেবেল" : "Gov Projects: Budget Label"} value={draft.pageCopy.governmentProjects.totalBudgetLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.totalBudgetLabel = value))} />
                <BilingualField label={isBangla ? "সরকারি প্রকল্প: ব্যয় লেবেল" : "Gov Projects: Spent Label"} value={draft.pageCopy.governmentProjects.spentLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.spentLabel = value))} />
                <BilingualField label={isBangla ? "সরকারি প্রকল্প: অগ্রগতি লেবেল" : "Gov Projects: Progress Label"} value={draft.pageCopy.governmentProjects.progressLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.progressLabel = value))} />
                <BilingualField label={isBangla ? "সরকারি প্রকল্প: বিস্তারিত বাটন" : "Gov Projects: Full Breakdown Label"} value={draft.pageCopy.governmentProjects.fullBreakdownLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.fullBreakdownLabel = value))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <BilingualField label={isBangla ? "স্ট্যাটাস: পরিকল্পিত" : "Status: Planned"} value={draft.pageCopy.governmentProjects.statusLabels.planned} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.statusLabels.planned = value))} />
                <BilingualField label={isBangla ? "স্ট্যাটাস: চলমান" : "Status: Running"} value={draft.pageCopy.governmentProjects.statusLabels.running} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.statusLabels.running = value))} />
                <BilingualField label={isBangla ? "স্ট্যাটাস: সমাপ্ত" : "Status: Completed"} value={draft.pageCopy.governmentProjects.statusLabels.completed} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.statusLabels.completed = value))} />
                <BilingualField label={isBangla ? "স্ট্যাটাস: স্থগিত" : "Status: On Hold"} value={draft.pageCopy.governmentProjects.statusLabels.onHold} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjects.statusLabels.onHold = value))} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <BilingualField label={isBangla ? "ডিটেইল পেজ: ব্যাক লেবেল" : "Detail Page: Back Label"} value={draft.pageCopy.governmentProjectDetails.backToListLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjectDetails.backToListLabel = value))} />
                <BilingualField label={isBangla ? "ডিটেইল পেজ: সেক্টর" : "Detail Page: Sector"} value={draft.pageCopy.governmentProjectDetails.sectorLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjectDetails.sectorLabel = value))} />
                <BilingualField label={isBangla ? "ডিটেইল পেজ: অবস্থান" : "Detail Page: Location"} value={draft.pageCopy.governmentProjectDetails.locationLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjectDetails.locationLabel = value))} />
                <BilingualField label={isBangla ? "ডিটেইল পেজ: বাস্তবায়নকারী" : "Detail Page: Implementing Agency"} value={draft.pageCopy.governmentProjectDetails.implementingAgencyLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjectDetails.implementingAgencyLabel = value))} />
                <BilingualField label={isBangla ? "ডিটেইল পেজ: বাজেট" : "Detail Page: Budget"} value={draft.pageCopy.governmentProjectDetails.totalBudgetLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjectDetails.totalBudgetLabel = value))} />
                <BilingualField label={isBangla ? "ডিটেইল পেজ: ব্যয়" : "Detail Page: Spent"} value={draft.pageCopy.governmentProjectDetails.spentLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjectDetails.spentLabel = value))} />
                <BilingualField label={isBangla ? "ডিটেইল পেজ: অগ্রগতি" : "Detail Page: Progress"} value={draft.pageCopy.governmentProjectDetails.progressLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjectDetails.progressLabel = value))} />
                <BilingualField label={isBangla ? "ডিটেইল পেজ: ধাপ" : "Detail Page: Phase"} value={draft.pageCopy.governmentProjectDetails.phaseLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjectDetails.phaseLabel = value))} />
                <BilingualField label={isBangla ? "ডিটেইল পেজ: উপকারভোগী" : "Detail Page: Beneficiaries"} value={draft.pageCopy.governmentProjectDetails.beneficiariesLabel} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.pageCopy.governmentProjectDetails.beneficiariesLabel = value))} />
              </div>
            </div>
          </details>
        </div>

        <div className={`${activeSection === "profileDetails" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5 space-y-4`}>
          <h3 className="text-lg font-semibold text-brand-green">{isBangla ? "পরিচিতি সেকশনের লেখা" : "Profile Section Text"}</h3>
          <BilingualField
            label={isBangla ? "জীবনী শিরোনাম" : "Biography Title"}
            value={draft.profileSection.biographyTitle}
            langLabelBn={labels.bn}
            langLabelEn={labels.en}
            onChange={(value) => mutate((n) => (n.profileSection.biographyTitle = value))}
          />
          <BilingualField
            label={isBangla ? "জীবনী লেখা" : "Biography Text"}
            value={draft.profileSection.biographyText}
            langLabelBn={labels.bn}
            langLabelEn={labels.en}
            multiline
            rows={5}
            onChange={(value) => mutate((n) => (n.profileSection.biographyText = value))}
          />
          <BilingualField
            label={isBangla ? "কার্যক্রম শিরোনাম" : "Activities Title"}
            value={draft.profileSection.activitiesTitle}
            langLabelBn={labels.bn}
            langLabelEn={labels.en}
            onChange={(value) => mutate((n) => (n.profileSection.activitiesTitle = value))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <FieldTextArea
              label={isBangla ? "জনসম্পৃক্ততার হাইলাইট (বাংলা, প্রতিটি লাইন আলাদা)" : "Public Engagement Highlights (Bangla, one line each)"}
              value={draft.profileSection.collectionPoints.bn.join("\n")}
              rows={4}
              onChange={(value) => mutate((n) => (n.profileSection.collectionPoints.bn = parseLineList(value)))}
            />
            <FieldTextArea
              label={isBangla ? "জনসম্পৃক্ততার হাইলাইট (English, one line each)" : "Public Engagement Highlights (English, one line each)"}
              value={draft.profileSection.collectionPoints.en.join("\n")}
              rows={4}
              onChange={(value) => mutate((n) => (n.profileSection.collectionPoints.en = parseLineList(value)))}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <BilingualField
              label={isBangla ? "অফিস বাটন লেবেল" : "Office Button Label"}
              value={draft.profileSection.officeButtonLabel}
              langLabelBn={labels.bn}
              langLabelEn={labels.en}
              onChange={(value) => mutate((n) => (n.profileSection.officeButtonLabel = value))}
            />
            <BilingualField
              label={isBangla ? "ফেসবুক বাটন লেবেল" : "Facebook Button Label"}
              value={draft.profileSection.facebookButtonLabel}
              langLabelBn={labels.bn}
              langLabelEn={labels.en}
              onChange={(value) => mutate((n) => (n.profileSection.facebookButtonLabel = value))}
            />
          </div>
        </div>

        <div className={`${activeSection === "cta" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5 space-y-4`}>
          <h3 className="text-lg font-semibold text-brand-green">{isBangla ? "ফুটার CTA সেকশন" : "Pre-Footer CTA Section"}</h3>
          <BilingualField
            label={isBangla ? "শিরোনাম" : "Title"}
            value={draft.preFooterCta.title}
            langLabelBn={labels.bn}
            langLabelEn={labels.en}
            onChange={(value) => mutate((n) => (n.preFooterCta.title = value))}
          />
          <BilingualField
            label={isBangla ? "বর্ণনা" : "Description"}
            value={draft.preFooterCta.description}
            langLabelBn={labels.bn}
            langLabelEn={labels.en}
            multiline
            rows={4}
            onChange={(value) => mutate((n) => (n.preFooterCta.description = value))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <BilingualField
              label={isBangla ? "স্বেচ্ছাসেবক বাটন" : "Volunteer Button"}
              value={draft.preFooterCta.volunteerButtonLabel}
              langLabelBn={labels.bn}
              langLabelEn={labels.en}
              onChange={(value) => mutate((n) => (n.preFooterCta.volunteerButtonLabel = value))}
            />
            <BilingualField
              label={isBangla ? "আপনার সাংসদকে লিখুন বাটন" : "Write to MP Button"}
              value={draft.preFooterCta.writeToMpButtonLabel}
              langLabelBn={labels.bn}
              langLabelEn={labels.en}
              onChange={(value) => mutate((n) => (n.preFooterCta.writeToMpButtonLabel = value))}
            />
          </div>
        </div>

        <div className={`${activeSection === "contact" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5 space-y-4`}>
          <h3 className="text-lg font-semibold text-brand-green">{isBangla ? "যোগাযোগ, সোশ্যাল ও ইশতেহার" : "Contact, Social and Manifesto"}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <FieldInput label={isBangla ? "ফোন" : "Phone"} value={draft.contact.phone} onChange={(value) => mutate((n) => (n.contact.phone = value))} />
            <FieldInput label="Email" type="email" value={draft.contact.email} onChange={(value) => mutate((n) => (n.contact.email = value))} />
            <FieldInput label="Facebook URL" type="url" value={draft.socials.facebook} onChange={(value) => mutate((n) => (n.socials.facebook = value))} />
            <FieldInput label="YouTube URL" type="url" value={draft.socials.youtube} onChange={(value) => mutate((n) => (n.socials.youtube = value))} />
            <FieldInput label="X / Twitter URL" type="url" value={draft.socials.twitter} onChange={(value) => mutate((n) => (n.socials.twitter = value))} />
            <FieldInput label="Instagram URL" type="url" value={draft.socials.instagram} onChange={(value) => mutate((n) => (n.socials.instagram = value))} />
          </div>
          <BilingualField label={isBangla ? "ঠিকানা" : "Address"} value={draft.contact.address} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.contact.address = value))} />
          <FieldInput label={isBangla ? "গুগল ম্যাপ Embed URL" : "Google Map Embed URL"} type="url" value={draft.contact.mapEmbedUrl} onChange={(value) => mutate((n) => (n.contact.mapEmbedUrl = value))} />
          <BilingualField label={isBangla ? "ইশতেহারের শিরোনাম" : "Manifesto Title"} value={draft.manifesto.title} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.manifesto.title = value))} />
          <BilingualField label={isBangla ? "ইশতেহারের সারাংশ" : "Manifesto Summary"} value={draft.manifesto.summary} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={4} onChange={(value) => mutate((n) => (n.manifesto.summary = value))} />
          <UploadUrlField
            label="Manifesto PDF URL"
            value={draft.manifesto.pdfUrl}
            onChange={(value) => mutate((n) => (n.manifesto.pdfUrl = value))}
            accept=".pdf,application/pdf"
            uploadKind="pdf"
            isBangla={isBangla}
          />
        </div>

        <details className={`${activeSection === "commitments" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5`} open>
          <summary className="cursor-pointer text-lg font-semibold text-brand-green">{isBangla ? "অঙ্গীকার" : "Commitments"}</summary>
          <div className="mt-4 space-y-4">
            {draft.commitments.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-brand-ink/10 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{isBangla ? `অঙ্গীকার #${index + 1}` : `Commitment #${index + 1}`}</p>
                  <button className="rounded-full border border-brand-red px-3 py-1 text-xs text-brand-red" onClick={() => mutate((n) => void n.commitments.splice(index, 1))}>{labels.removeItem}</button>
                </div>
                <FieldInput label="Slug" value={item.slug} onChange={(value) => mutate((n) => (n.commitments[index].slug = value))} />
                <UploadUrlField
                  label={isBangla ? "ছবির URL" : "Image URL"}
                  value={item.image}
                  onChange={(value) => mutate((n) => (n.commitments[index].image = value))}
                  accept="image/*"
                  uploadKind="image"
                  isBangla={isBangla}
                />
                <BilingualField label={isBangla ? "শিরোনাম" : "Title"} value={item.title} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.commitments[index].title = value))} />
                <BilingualField label={isBangla ? "সংক্ষিপ্ত বিবরণ" : "Summary"} value={item.summary} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.commitments[index].summary = value))} />
                <BilingualField label={isBangla ? "বিস্তারিত" : "Details"} value={item.details} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={5} onChange={(value) => mutate((n) => (n.commitments[index].details = value))} />
              </div>
            ))}
            <button className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white" onClick={() => mutate((n) => n.commitments.push({ id: createId("c"), slug: "", title: { bn: "", en: "" }, summary: { bn: "", en: "" }, details: { bn: "", en: "" }, image: "" }))}>{labels.addItem}</button>
          </div>
        </details>

        <details className={`${activeSection === "news" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5`} open>
          <summary className="cursor-pointer text-lg font-semibold text-brand-green">{isBangla ? "সংবাদ" : "News"}</summary>
          <div className="mt-4 space-y-4">
            {draft.news.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-brand-ink/10 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{isBangla ? `সংবাদ #${index + 1}` : `News #${index + 1}`}</p>
                  <button className="rounded-full border border-brand-red px-3 py-1 text-xs text-brand-red" onClick={() => mutate((n) => void n.news.splice(index, 1))}>{labels.removeItem}</button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FieldInput label="Slug" value={item.slug} onChange={(value) => mutate((n) => (n.news[index].slug = value))} />
                  <FieldInput label={isBangla ? "তারিখ" : "Date"} type="date" value={item.date} onChange={(value) => mutate((n) => (n.news[index].date = value))} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FieldInput
                    label={isBangla ? "ক্যাটাগরি (কমা দিয়ে)" : "Categories (comma separated)"}
                    value={(item.categories || []).join(", ")}
                    onChange={(value) => mutate((n) => (n.news[index].categories = parseCsvList(value)))}
                  />
                  <FieldInput
                    label={isBangla ? "ট্যাগ (কমা দিয়ে)" : "Tags (comma separated)"}
                    value={(item.tags || []).join(", ")}
                    onChange={(value) => mutate((n) => (n.news[index].tags = parseCsvList(value)))}
                  />
                </div>
                <UploadUrlField
                  label={isBangla ? "ছবির URL" : "Image URL"}
                  value={item.image}
                  onChange={(value) => mutate((n) => (n.news[index].image = value))}
                  accept="image/*"
                  uploadKind="image"
                  isBangla={isBangla}
                />
                <BilingualField label={isBangla ? "শিরোনাম" : "Title"} value={item.title} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.news[index].title = value))} />
                <BilingualField label={isBangla ? "সংক্ষিপ্ত অংশ" : "Excerpt"} value={item.excerpt} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.news[index].excerpt = value))} />
                <BilingualField label={isBangla ? "পূর্ণ বিবরণ" : "Content"} value={item.content} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={5} onChange={(value) => mutate((n) => (n.news[index].content = value))} />
              </div>
            ))}
            <button className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white" onClick={() => mutate((n) => n.news.push({ id: createId("n"), slug: "", title: { bn: "", en: "" }, excerpt: { bn: "", en: "" }, content: { bn: "", en: "" }, date: "", image: "", categories: [], tags: [] }))}>{labels.addItem}</button>

            <div className="mt-6 rounded-xl border border-brand-ink/10 bg-slate-50 px-3 py-2 text-sm font-semibold text-brand-green">
              {isBangla ? "মাসিক প্রতিবেদন" : "Monthly Reports"}
            </div>
            {draft.monthlyReports.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-brand-ink/10 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{isBangla ? `মাসিক প্রতিবেদন #${index + 1}` : `Monthly Report #${index + 1}`}</p>
                  <button
                    type="button"
                    className="rounded-full border border-brand-red px-3 py-1 text-xs text-brand-red"
                    onClick={() => mutate((n) => void n.monthlyReports.splice(index, 1))}
                  >
                    {labels.removeItem}
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FieldInput label="Slug" value={item.slug} onChange={(value) => mutate((n) => (n.monthlyReports[index].slug = value))} />
                  <FieldInput
                    label={isBangla ? "রিপোর্ট মাস (YYYY-MM)" : "Report Month (YYYY-MM)"}
                    value={item.reportMonth}
                    onChange={(value) => mutate((n) => (n.monthlyReports[index].reportMonth = value))}
                  />
                  <FieldInput
                    label={isBangla ? "প্রকাশের তারিখ" : "Publish Date"}
                    type="date"
                    value={item.publishedDate}
                    onChange={(value) => mutate((n) => (n.monthlyReports[index].publishedDate = value))}
                  />
                </div>
                <UploadUrlField
                  label={isBangla ? "PDF URL" : "PDF URL"}
                  value={item.pdfUrl}
                  onChange={(value) => mutate((n) => (n.monthlyReports[index].pdfUrl = value))}
                  accept=".pdf,application/pdf"
                  uploadKind="pdf"
                  isBangla={isBangla}
                />
                <BilingualField
                  label={isBangla ? "শিরোনাম" : "Title"}
                  value={item.title}
                  langLabelBn={labels.bn}
                  langLabelEn={labels.en}
                  onChange={(value) => mutate((n) => (n.monthlyReports[index].title = value))}
                />
                <BilingualField
                  label={isBangla ? "সংক্ষিপ্ত বিবরণ" : "Summary"}
                  value={item.summary}
                  langLabelBn={labels.bn}
                  langLabelEn={labels.en}
                  multiline
                  rows={4}
                  onChange={(value) => mutate((n) => (n.monthlyReports[index].summary = value))}
                />
              </div>
            ))}
            <button
              className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white"
              onClick={() =>
                mutate((n) =>
                  n.monthlyReports.push({
                    id: createId("mr"),
                    slug: "",
                    title: { bn: "", en: "" },
                    summary: { bn: "", en: "" },
                    reportMonth: "",
                    publishedDate: "",
                    pdfUrl: ""
                  })
                )
              }
            >
              {labels.addItem}
            </button>
          </div>
        </details>

        <details className={`${activeSection === "work" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5`} open>
          <summary className="cursor-pointer text-lg font-semibold text-brand-green">{isBangla ? "পূর্বের কাজ" : "Work History"}</summary>
          <div className="mt-4 space-y-4">
            {draft.workHistory.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-brand-ink/10 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{isBangla ? `কাজ #${index + 1}` : `Work #${index + 1}`}</p>
                  <button className="rounded-full border border-brand-red px-3 py-1 text-xs text-brand-red" onClick={() => mutate((n) => void n.workHistory.splice(index, 1))}>{labels.removeItem}</button>
                </div>
                <FieldInput label={isBangla ? "আইকন কোড" : "Icon Key"} value={item.icon} onChange={(value) => mutate((n) => (n.workHistory[index].icon = value))} />
                <BilingualField label={isBangla ? "শিরোনাম" : "Title"} value={item.title} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.workHistory[index].title = value))} />
                <BilingualField label={isBangla ? "সারাংশ" : "Summary"} value={item.summary} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={4} onChange={(value) => mutate((n) => (n.workHistory[index].summary = value))} />
              </div>
            ))}
            <button className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white" onClick={() => mutate((n) => n.workHistory.push({ id: createId("w"), title: { bn: "", en: "" }, summary: { bn: "", en: "" }, icon: "" }))}>{labels.addItem}</button>
          </div>
        </details>

        <details className={`${activeSection === "gallery" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5`} open>
          <summary className="cursor-pointer text-lg font-semibold text-brand-green">{isBangla ? "গ্যালারি" : "Gallery"}</summary>
          <div className="mt-4 rounded-xl border border-brand-green/20 bg-brand-green/5 p-3">
            <p className="text-xs text-brand-ink/75">{labels.galleryHint}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-brand-ink/15 bg-white px-3 py-1 text-xs">
                {labels.galleryCountLabel}: <span className="font-semibold text-brand-green">{galleryStats.photos}</span>
              </span>
              <span className="rounded-full border border-brand-ink/15 bg-white px-3 py-1 text-xs">
                {labels.galleryAlbumLabel}: <span className="font-semibold text-brand-green">{galleryStats.albums}</span>
              </span>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {draft.gallery.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-brand-ink/10 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{isBangla ? `গ্যালারি #${index + 1}` : `Gallery #${index + 1}`}</p>
                  <button className="rounded-full border border-brand-red px-3 py-1 text-xs text-brand-red" onClick={() => mutate((n) => void n.gallery.splice(index, 1))}>{labels.removeItem}</button>
                </div>
                <UploadUrlField
                  label={isBangla ? "ছবির URL" : "Image URL"}
                  value={item.image}
                  onChange={(value) => mutate((n) => (n.gallery[index].image = value))}
                  accept="image/*"
                  uploadKind="image"
                  isBangla={isBangla}
                />
                <BilingualField label={isBangla ? "ছবির শিরোনাম" : "Photo Title"} value={item.title} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.gallery[index].title = value))} />
                <BilingualField label={isBangla ? "অ্যালবাম" : "Album"} value={item.album} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.gallery[index].album = value))} />
              </div>
            ))}
            <button className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white" onClick={() => mutate((n) => n.gallery.push({ id: createId("g"), title: { bn: "", en: "" }, album: { bn: "", en: "" }, image: "" }))}>{labels.addItem}</button>
          </div>
        </details>

        <details className={`${activeSection === "videos" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5`} open>
          <summary className="cursor-pointer text-lg font-semibold text-brand-green">{isBangla ? "ভিডিও" : "Videos"}</summary>
          <div className="mt-4 space-y-4">
            {draft.videos.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-brand-ink/10 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">{isBangla ? `ভিডিও #${index + 1}` : `Video #${index + 1}`}</p>
                  <button className="rounded-full border border-brand-red px-3 py-1 text-xs text-brand-red" onClick={() => mutate((n) => void n.videos.splice(index, 1))}>{labels.removeItem}</button>
                </div>
                <FieldInput label={isBangla ? "YouTube লিংক" : "YouTube URL"} type="url" value={item.youtubeUrl} onChange={(value) => mutate((n) => (n.videos[index].youtubeUrl = value))} />
                <UploadUrlField
                  label={isBangla ? "ভিডিও ফাইল URL" : "Video File URL"}
                  value={item.videoFileUrl || ""}
                  onChange={(value) => mutate((n) => (n.videos[index].videoFileUrl = value))}
                  accept="video/*"
                  uploadKind="video"
                  isBangla={isBangla}
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <FieldInput label={isBangla ? "সময়কাল" : "Duration"} value={item.duration} onChange={(value) => mutate((n) => (n.videos[index].duration = value))} />
                  <UploadUrlField
                    label={isBangla ? "থাম্বনেইল URL" : "Thumbnail URL"}
                    value={item.thumbnail}
                    onChange={(value) => mutate((n) => (n.videos[index].thumbnail = value))}
                    accept="image/*"
                    uploadKind="image"
                    isBangla={isBangla}
                  />
                </div>
                <BilingualField label={isBangla ? "ভিডিও শিরোনাম" : "Video Title"} value={item.title} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.videos[index].title = value))} />
              </div>
            ))}
            <button className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white" onClick={() => mutate((n) => n.videos.push({ id: createId("v"), title: { bn: "", en: "" }, youtubeUrl: "", videoFileUrl: "", duration: "", thumbnail: "" }))}>{labels.addItem}</button>
          </div>
        </details>

        <details className={`${activeSection === "projects" ? "block" : "hidden"} rounded-2xl border border-brand-ink/10 bg-white p-4 md:p-5`} open>
          <summary className="cursor-pointer text-lg font-semibold text-brand-green">{isBangla ? "সরকারি প্রকল্পসমূহ" : "Government Projects"}</summary>
          <div className="mt-4 space-y-4">
            {draft.governmentProjects.map((project, index) => (
              <div key={project.id} className="rounded-2xl border border-brand-ink/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{isBangla ? `প্রকল্প #${index + 1}` : `Project #${index + 1}`}</p>
                  <button type="button" className="rounded-full border border-brand-red px-3 py-1 text-xs text-brand-red" onClick={() => mutate((n) => void n.governmentProjects.splice(index, 1))}>
                    {labels.removeItem}
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <FieldInput label="Slug" value={project.slug} onChange={(value) => mutate((n) => (n.governmentProjects[index].slug = value))} />
                  <FieldInput label={isBangla ? "সেক্টর" : "Sector"} value={project.sector} onChange={(value) => mutate((n) => (n.governmentProjects[index].sector = value))} />
                  <FieldInput label={isBangla ? "অবস্থান" : "Location"} value={project.location} onChange={(value) => mutate((n) => (n.governmentProjects[index].location = value))} />
                  <FieldInput label={isBangla ? "বাস্তবায়নকারী সংস্থা" : "Implementing Agency"} value={project.implementingAgency} onChange={(value) => mutate((n) => (n.governmentProjects[index].implementingAgency = value))} />
                  <FieldInput
                    label={isBangla ? "মোট বাজেট" : "Total Budget"}
                    type="number"
                    value={String(project.budgetTotal)}
                    onChange={(value) => mutate((n) => (n.governmentProjects[index].budgetTotal = toSafeNumber(value)))}
                  />
                  <FieldInput
                    label={isBangla ? "এ পর্যন্ত ব্যয়" : "Spent Amount"}
                    type="number"
                    value={String(project.spentAmount)}
                    onChange={(value) => mutate((n) => (n.governmentProjects[index].spentAmount = toSafeNumber(value)))}
                  />
                  <FieldInput
                    label={isBangla ? "অগ্রগতি %" : "Progress %"}
                    type="number"
                    value={String(project.progressPercent)}
                    onChange={(value) => mutate((n) => (n.governmentProjects[index].progressPercent = toSafeProgress(value)))}
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-brand-ink/70">{isBangla ? "স্ট্যাটাস" : "Status"}</span>
                    <select
                      value={project.status}
                      onChange={(event) => mutate((n) => (n.governmentProjects[index].status = normalizeProjectStatus(event.target.value)))}
                      className="w-full rounded-xl border border-brand-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green"
                    >
                      {projectStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FieldInput label={isBangla ? "শুরুর তারিখ" : "Start Date"} type="date" value={project.startDate} onChange={(value) => mutate((n) => (n.governmentProjects[index].startDate = value))} />
                  <FieldInput label={isBangla ? "সম্ভাব্য শেষ তারিখ" : "Expected End Date"} type="date" value={project.expectedEndDate} onChange={(value) => mutate((n) => (n.governmentProjects[index].expectedEndDate = value))} />
                </div>
                <UploadUrlField
                  label={isBangla ? "ছবির URL" : "Image URL"}
                  value={project.image}
                  onChange={(value) => mutate((n) => (n.governmentProjects[index].image = value))}
                  accept="image/*"
                  uploadKind="image"
                  isBangla={isBangla}
                />
                <BilingualField label={isBangla ? "শিরোনাম" : "Title"} value={project.title} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.governmentProjects[index].title = value))} />
                <BilingualField label={isBangla ? "সারাংশ" : "Summary"} value={project.summary} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={3} onChange={(value) => mutate((n) => (n.governmentProjects[index].summary = value))} />
                <BilingualField label={isBangla ? "প্রকল্পের ধাপ" : "Project Phase"} value={project.phase} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.governmentProjects[index].phase = value))} />
                <BilingualField label={isBangla ? "উপকারভোগী" : "Beneficiaries"} value={project.beneficiaries} langLabelBn={labels.bn} langLabelEn={labels.en} onChange={(value) => mutate((n) => (n.governmentProjects[index].beneficiaries = value))} />
                <BilingualField label={isBangla ? "বিস্তারিত" : "Details"} value={project.details} langLabelBn={labels.bn} langLabelEn={labels.en} multiline rows={5} onChange={(value) => mutate((n) => (n.governmentProjects[index].details = value))} />
              </div>
            ))}
            <button
              type="button"
              className="rounded-full bg-brand-green px-4 py-2 text-xs font-semibold text-white"
              onClick={() =>
                mutate((n) =>
                  n.governmentProjects.push({
                    id: createId("gp"),
                    slug: "",
                    title: { bn: "", en: "" },
                    summary: { bn: "", en: "" },
                    details: { bn: "", en: "" },
                    sector: "",
                    location: "",
                    implementingAgency: "",
                    budgetTotal: 0,
                    spentAmount: 0,
                    startDate: "",
                    expectedEndDate: "",
                    status: "planned",
                    phase: { bn: "", en: "" },
                    progressPercent: 0,
                    beneficiaries: { bn: "", en: "" },
                    image: ""
                  })
                )
              }
            >
              {labels.addItem}
            </button>
          </div>
        </details>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button disabled={saving || !hasChanges} onClick={save} className="rounded-full bg-brand-green px-5 py-2 text-sm font-bold text-white disabled:opacity-70">{saving ? labels.saving : labels.save}</button>
        <button
          type="button"
          disabled={saving || !hasChanges}
          onClick={resetDraft}
          className="rounded-full border border-brand-ink/30 px-5 py-2 text-sm font-bold text-brand-ink disabled:opacity-60"
        >
          {isBangla ? "রিসেট" : "Reset"}
        </button>
        {status ? <p className="text-sm text-brand-ink/80">{status}</p> : null}
      </div>
    </section>
  );
}
