import { Lang } from "@/lib/types";

export const languages: Lang[] = ["bn", "en"];

export function isLang(value: string): value is Lang {
  return languages.includes(value as Lang);
}

export const staticCopy = {
  bn: {
    home: "হোম",
    profile: "প্রার্থী পরিচিতি",
    commitments: "এই মেয়াদের অঙ্গীকার",
    developmentProjects: "উন্নয়ন প্রকল্পসমূহ",
    governmentProjects: "সরকারি প্রকল্প",
    work: "পূর্বের উল্লেখযোগ্য কাজ",
    gallery: "গ্যালারি",
    videoMediaGallery: "ভিডিও ও মিডিয়া গ্যালারি",
    news: "সংবাদ ও আপডেট",
    contact: "যোগাযোগ",
    writeToMp: "আপনার সাংসদকে লিখুন",
    manifesto: "নির্বাচনী ইশতেহার",
    mediaCoverage: "মিডিয়া কভারেজ",
    trackRequest: "অনুরোধ ট্র্যাকিং",
    goals: "আমাদের লক্ষ্য",
    admin: "অ্যাডমিন",
    search: "সার্চ",
    readMore: "বিস্তারিত দেখুন",
    send: "পাঠান",
    languageSwitch: "English",
    headerConstituencyPortal: "দিনাজপুর-৩ অফিসিয়াল পোর্টাল",
    headerConstituencyName: "দিনাজপুর-৩",
    headerPartyName: "বাংলাদেশ জাতীয়তাবাদী দল",
    writeShort: "লিখুন",
    menu: "মেনু",
    closeMenu: "মেনু বন্ধ করুন",
    citizenPortal: "জনসেবা পোর্টাল",
    socialMedia: "সামাজিক মাধ্যম",
    rightsReserved: "সর্বস্বত্ব সংরক্ষিত",
    contactReach: "ফোন, ইমেইল, অফিস ঠিকানা, ম্যাপ এবং ফেসবুক ইনবক্সের মাধ্যমে যোগাযোগ করুন।",
    officeContact: "অফিস যোগাযোগ",
    phoneLabel: "ফোন",
    officeAddress: "অফিস ঠিকানা",
    officeOnMap: "মানচিত্রে অফিস লোকেশন",
    mpOffice: "এমপি অফিস",
    openPdf: "PDF খুলুন",
    download: "ডাউনলোড",
    pdfPreviewDesktopOnly: "PDF প্রিভিউ মোবাইলে দেখানো হয় না, উপরের বাটন ব্যবহার করুন।",
    sitemap: "সাইটম্যাপ"
  },
  en: {
    home: "Home",
    profile: "Candidate Profile",
    commitments: "Commitments",
    developmentProjects: "Development Projects",
    governmentProjects: "Government Projects",
    work: "Previous Work",
    gallery: "Gallery",
    videoMediaGallery: "Video & Media Gallery",
    news: "News & Updates",
    contact: "Contact",
    writeToMp: "Write to Your MP",
    manifesto: "Election Manifesto",
    mediaCoverage: "Media Coverage",
    trackRequest: "Track Request",
    goals: "Our Goals",
    admin: "Admin",
    search: "Search",
    readMore: "Read Details",
    send: "Send",
    languageSwitch: "বাংলা",
    headerConstituencyPortal: "Dinajpur-3 Official Portal",
    headerConstituencyName: "Dinajpur-3 Constituency",
    headerPartyName: "Bangladesh Nationalist Party",
    writeShort: "Write",
    menu: "Menu",
    closeMenu: "Close menu",
    citizenPortal: "Citizen Service Portal",
    socialMedia: "Social Media",
    rightsReserved: "All rights reserved",
    contactReach: "Reach us by phone, email, office address, map, or Facebook inbox.",
    officeContact: "Office Contact",
    phoneLabel: "Phone",
    officeAddress: "Office Address",
    officeOnMap: "Office Location on Map",
    mpOffice: "MP Office",
    openPdf: "Open PDF",
    download: "Download",
    pdfPreviewDesktopOnly: "PDF preview is hidden on mobile. Use the buttons above.",
    sitemap: "Sitemap"
  }
};

export function t(lang: Lang) {
  return staticCopy[lang];
}

export function toLocaleDate(dateIso: string, lang: Lang) {
  return new Date(dateIso).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function translate(lang: Lang, value: { bn: string; en: string }) {
  return lang === "bn" ? value.bn : value.en;
}
