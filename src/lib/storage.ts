import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  ChatConversation,
  ChatConversationStatus,
  ChatIssueCategory,
  ChatMessage,
  ChatMessageSender,
  ContactSubmission,
  DashboardUser,
  GovernmentProjectStatus,
  Lang,
  SiteContent,
  SubmissionStatus,
  UserRole
} from "@/lib/types";
import { repairSiteContentEncoding } from "@/lib/contentEncoding";

const dataDir = path.join(process.cwd(), "data");
const contentFile = path.join(dataDir, "site-content.json");
const usersFile = path.join(dataDir, "users.json");
const submissionsFile = path.join(dataDir, "submissions.json");
const sessionsFile = path.join(dataDir, "sessions.json");
const chatbotFile = path.join(dataDir, "chatbot-conversations.json");

type SessionStore = Record<string, { userId: string; expiresAt: string }>;
const validSubmissionStatuses: SubmissionStatus[] = ["new", "in_review", "processing", "resolved", "closed"];
const validGovernmentProjectStatuses: GovernmentProjectStatus[] = ["planned", "running", "completed", "on_hold"];
const validChatStatuses: ChatConversationStatus[] = ["open", "in_review", "resolved"];
const validChatCategories: ChatIssueCategory[] = ["citizen_services", "development_projects", "government_projects", "office_contact", "other"];
const bcryptRounds = 12;

const defaultContent: SiteContent = {
  candidate: {
    name: {
      bn: "সৈয়দ জাহাঙ্গীর আলম",
      en: "Syed Jahangir Alam"
    },
    shortTitle: {
      bn: "দিনাজপুর-৩ আসনের সংসদ সদস্য",
      en: "Member of Parliament, Dinajpur-3"
    },
    intro: {
      bn: "সৈয়দ জাহাঙ্গীর আলম দিনাজপুর-৩ আসনের মানুষের জন্য শিক্ষা, কৃষি, কর্মসংস্থান ও জনসেবায় আধুনিক ও জবাবদিহিমূলক উন্নয়নের অঙ্গীকার নিয়ে কাজ করছেন।",
      en: "Syed Jahangir Alam is committed to accountable development in education, agriculture, jobs, and public services for the people of Dinajpur-3."
    },
    heroSlogan: {
      bn: "মানুষের আস্থা, উন্নয়নের প্রতিশ্রুতি",
      en: "Public Trust, Development Delivered"
    },
    heroImage: "/uploads/images/chatgpt-image-feb-21-2026-12_19_15-am-1771611587507-0bf69a4b.png",
    profileImage: "/uploads/images/chatgpt-image-feb-21-2026-12_19_15-am-1771611587507-0bf69a4b.png"
  },
  profileSection: {
    biographyTitle: {
      bn: "জীবনী (সংক্ষিপ্ত)",
      en: "Short Biography"
    },
    biographyText: {
      bn: "সৈয়দ জাহাঙ্গীর আলম দিনাজপুর-৩ এলাকার শিক্ষা, কৃষি, স্বাস্থ্য, কর্মসংস্থান এবং নাগরিক সেবাকে অগ্রাধিকার দিয়ে ধারাবাহিকভাবে মাঠপর্যায়ে কাজ করছেন। নিয়মিত জনসংযোগ, সমস্যা শুনানি এবং দ্রুত সমাধান ব্যবস্থাকে তিনি জনসেবার মূল পদ্ধতি হিসেবে অনুসরণ করেন।",
      en: "Syed Jahangir Alam continues grassroots work in Dinajpur-3 with priority on education, agriculture, healthcare, employment, and citizen services. He follows a service model built on regular public engagement, issue hearings, and faster resolution."
    },
    activitiesTitle: {
      bn: "প্রধান কার্যক্রম",
      en: "Key Activities"
    },
    booksTitle: {
      bn: "প্রকাশনা ও রেফারেন্স",
      en: "Publications and References"
    },
    books: [
      {
        id: "pb1",
        cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
        title: {
          bn: "স্থানীয় উন্নয়ন পরিকল্পনা",
          en: "Local Development Planning"
        },
        summary: {
          bn: "এলাকাভিত্তিক উন্নয়ন অগ্রাধিকার ও বাস্তবায়ন কাঠামো",
          en: "Area-based development priorities and implementation framework"
        }
      },
      {
        id: "pb2",
        cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=800&q=80",
        title: {
          bn: "জনসেবা ও জবাবদিহি",
          en: "Public Service and Accountability"
        },
        summary: {
          bn: "সেবা মানোন্নয়ন ও নাগরিক সম্পৃক্ততার নীতিমালা",
          en: "Policy notes on service quality and citizen participation"
        }
      }
    ],
    collectionTitle: {
      bn: "সংগ্রহ/রেফারেন্স তথ্য",
      en: "Collection/Reference Information"
    },
    collectionPoints: {
      bn: [
        "১) দিনাজপুর-৩ এমপি অফিস থেকে রেফারেন্স কপি সংগ্রহ করা যাবে।",
        "২) অফিসিয়াল সামাজিক মাধ্যম ইনবক্সে যোগাযোগ করে তথ্য পাওয়া যাবে।"
      ],
      en: [
        "1) Reference copies are available from the Dinajpur-3 MP office.",
        "2) Details can also be requested via official social media inbox."
      ]
    },
    officeButtonLabel: {
      bn: "অফিস যোগাযোগ",
      en: "Office Contact"
    },
    facebookButtonLabel: {
      bn: "ফেসবুকে যোগাযোগ",
      en: "Contact on Facebook"
    }
  },
  preFooterCta: {
    title: {
      bn: "আপনি কি উন্নয়নের অংশ হতে চান?",
      en: "Do you want to be part of this development?"
    },
    description: {
      bn: "আপনার এলাকার সমস্যা, পরামর্শ এবং জনসেবার অগ্রাধিকার জানালে দ্রুত পরিকল্পনা ও বাস্তবায়ন সম্ভব হবে।",
      en: "Share your local issues, suggestions, and service priorities to accelerate planning and implementation."
    },
    volunteerButtonLabel: {
      bn: "স্বেচ্ছাসেবক ফর্ম",
      en: "Volunteer Form"
    },
    writeToMpButtonLabel: {
      bn: "আপনার সাংসদকে লিখুন",
      en: "Write to Your MP"
    }
  },
  commitments: [
    {
      id: "c1",
      slug: "modern-health-services",
      title: {
        bn: "স্থানীয় স্বাস্থ্যসেবার আধুনিকায়ন",
        en: "Modern Local Healthcare"
      },
      summary: {
        bn: "উপজেলা ও ইউনিয়ন পর্যায়ে ডাক্তার, টেস্ট সুবিধা ও জরুরি সেবার সম্প্রসারণ।",
        en: "Expand doctors, diagnostics, and emergency care at upazila and union levels."
      },
      details: {
        bn: "দিনাজপুর-৩ এ উপজেলা স্বাস্থ্য কমপ্লেক্সে বিশেষজ্ঞ চিকিৎসক উপস্থিতি, ডায়াগনস্টিক সুবিধা, মাতৃসেবা ও অ্যাম্বুলেন্স নেটওয়ার্ক উন্নয়নে অগ্রাধিকার দেওয়া হবে।",
        en: "Priority will be given to specialist availability, diagnostics, maternal care, and ambulance network upgrades across Dinajpur-3."
      },
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "c2",
      slug: "smart-agri-and-irrigation",
      title: {
        bn: "স্মার্ট কৃষি ও সেচব্যবস্থা",
        en: "Smart Agriculture and Irrigation"
      },
      summary: {
        bn: "কৃষকের উৎপাদন খরচ কমাতে সেচ, সংরক্ষণ ও বাজার সংযোগে প্রযুক্তি সহায়তা।",
        en: "Technology support for irrigation, storage, and market linkage to reduce farmer costs."
      },
      details: {
        bn: "ফসলভিত্তিক পরামর্শ, সেচ চ্যানেল উন্নয়ন, খাল পুনঃখনন, এবং সরাসরি কৃষক-ক্রেতা সংযোগ প্ল্যাটফর্ম চালু করা হবে।",
        en: "Crop advisories, irrigation upgrades, canal restoration, and direct farmer-to-buyer platforms will be introduced."
      },
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "c3",
      slug: "jobs-and-skills",
      title: {
        bn: "যুব দক্ষতা ও কর্মসংস্থান",
        en: "Youth Skills and Employment"
      },
      summary: {
        bn: "প্রশিক্ষণ, আইটি স্কিল ও উদ্যোক্তা সহায়তার মাধ্যমে স্থানীয় চাকরির সুযোগ তৈরি।",
        en: "Create local jobs through training, IT skills, and entrepreneurship support."
      },
      details: {
        bn: "প্রতিটি ইউনিয়নে স্কিল সাপোর্ট ডেস্ক, নারীদের জন্য বিশেষ উদ্যোক্তা সহায়তা, এবং ই-কমার্সভিত্তিক বাজার সম্প্রসারণ করা হবে।",
        en: "Union-level skill desks, women-focused enterprise support, and e-commerce market expansion will be implemented."
      },
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "c4",
      slug: "safe-roads-and-drainage",
      title: {
        bn: "নিরাপদ সড়ক ও জলাবদ্ধতা নিয়ন্ত্রণ",
        en: "Safe Roads and Drainage"
      },
      summary: {
        bn: "গ্রামীণ সড়ক সংস্কার, ব্রিজ-কালভার্ট ও ড্রেনেজ ব্যবস্থার সমন্বিত উন্নয়ন।",
        en: "Integrated rural road repair, bridges/culverts, and drainage improvements."
      },
      details: {
        bn: "বর্ষায় জলাবদ্ধতা কমাতে ড্রেনেজ মাস্টারপ্ল্যান, এবং স্কুল-হাসপাতালগামী সড়কগুলোকে অগ্রাধিকার দিয়ে উন্নয়ন করা হবে।",
        en: "A drainage masterplan and priority upgrades for school/hospital-access roads will reduce monsoon waterlogging."
      },
      image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "c5",
      slug: "digital-public-service",
      title: {
        bn: "ডিজিটাল জনসেবা কেন্দ্র",
        en: "Digital Public Service Hubs"
      },
      summary: {
        bn: "এলাকাভিত্তিক ডিজিটাল সেবায় জন্মনিবন্ধন, ভূমি, ভাতা ও অভিযোগ সেবা এক জায়গায়।",
        en: "Birth registration, land, allowance, and complaint services through local digital hubs."
      },
      details: {
        bn: "দালালমুক্ত সেবা নিশ্চিত করতে ইউনিয়নভিত্তিক ডিজিটাল সহায়তা ডেস্ক ও সেবা ট্র্যাকিং ব্যবস্থা চালু করা হবে।",
        en: "Union-based support desks and service tracking will ensure transparent, broker-free access."
      },
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "c6",
      slug: "women-safety-and-education",
      title: {
        bn: "নারী নিরাপত্তা ও শিক্ষা উন্নয়ন",
        en: "Women Safety and Education"
      },
      summary: {
        bn: "স্কুল-কলেজে নিরাপদ পরিবেশ, স্কলারশিপ ও নারীর অর্থনৈতিক সক্ষমতা বৃদ্ধির উদ্যোগ।",
        en: "Safer campuses, scholarships, and stronger economic participation for women."
      },
      details: {
        bn: "মেয়েদের শিক্ষায় ঝরে পড়া রোধ, স্বনির্ভরতা প্রশিক্ষণ এবং স্থানীয় নিরাপত্তা পর্যবেক্ষণ জোরদার করা হবে।",
        en: "Dropout prevention, self-reliance training, and local safety monitoring will be strengthened."
      },
      image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80"
    }
  ],
  workHistory: [
    {
      id: "w1",
      title: {
        bn: "রাস্তা ও কালভার্ট উন্নয়ন",
        en: "Road and Culvert Improvements"
      },
      summary: {
        bn: "গ্রাম থেকে উপজেলা সংযোগে চলাচল সহজ হয়েছে।",
        en: "Travel connectivity from villages to upazila centers improved significantly."
      },
      icon: "road"
    },
    {
      id: "w2",
      title: {
        bn: "শিক্ষা সহায়তা কর্মসূচি",
        en: "Education Support Programs"
      },
      summary: {
        bn: "অসহায় শিক্ষার্থীদের সহায়তা এবং অবকাঠামো উন্নয়ন।",
        en: "Support for disadvantaged students and institutional improvements."
      },
      icon: "school"
    },
    {
      id: "w3",
      title: {
        bn: "কৃষক সহায়তা ও সেচ",
        en: "Farmer Support and Irrigation"
      },
      summary: {
        bn: "উৎপাদন ব্যয় কমাতে সেচ এবং পরামর্শ সহায়তা।",
        en: "Irrigation and advisory support reducing production costs."
      },
      icon: "leaf"
    },
    {
      id: "w4",
      title: {
        bn: "স্বাস্থ্য সহায়তা ক্যাম্প",
        en: "Health Service Camps"
      },
      summary: {
        bn: "গ্রামীণ এলাকায় নিয়মিত স্বাস্থ্যসেবা কার্যক্রম।",
        en: "Regular healthcare outreach in rural communities."
      },
      icon: "health"
    }
  ],
  gallery: [
    {
      id: "g1",
      title: {
        bn: "জনসভায় জনগণের সাথে মতবিনিময়",
        en: "Public Meeting and Citizen Dialogue"
      },
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
      album: {
        bn: "গণসংযোগ",
        en: "Campaign Outreach"
      }
    },
    {
      id: "g2",
      title: {
        bn: "শিক্ষা প্রতিষ্ঠান পরিদর্শন",
        en: "School and College Visit"
      },
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
      album: {
        bn: "শিক্ষা",
        en: "Education"
      }
    },
    {
      id: "g3",
      title: {
        bn: "কৃষকদের সাথে মাঠ পর্যায়ের বৈঠক",
        en: "Field Meeting With Farmers"
      },
      image: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=1200&q=80",
      album: {
        bn: "কৃষি",
        en: "Agriculture"
      }
    },
    {
      id: "g4",
      title: {
        bn: "সামাজিক সহায়তা কর্মসূচি",
        en: "Community Support Program"
      },
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
      album: {
        bn: "সামাজিক কার্যক্রম",
        en: "Social Services"
      }
    },
    {
      id: "g5",
      title: {
        bn: "স্বাস্থ্যসেবা ক্যাম্প",
        en: "Healthcare Camp"
      },
      image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
      album: {
        bn: "স্বাস্থ্য",
        en: "Health"
      }
    },
    {
      id: "g6",
      title: {
        bn: "নারী উদ্যোক্তা সভা",
        en: "Women Entrepreneur Meetup"
      },
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
      album: {
        bn: "নারী উন্নয়ন",
        en: "Women Development"
      }
    }
  ],
  news: [
    {
      id: "n1",
      slug: "community-dialogue-in-dinajpur",
      title: {
        bn: "দিনাজপুরে জনসংলাপ: নাগরিক সেবা সহজ করার রোডম্যাপ",
        en: "Dinajpur Public Dialogue: Roadmap for Easier Citizen Services"
      },
      excerpt: {
        bn: "জনগণের প্রত্যাশা ও স্থানীয় সমস্যার বাস্তব সমাধান নিয়ে মতবিনিময় অনুষ্ঠিত হয়।",
        en: "A focused dialogue was held on local challenges and practical service delivery solutions."
      },
      content: {
        bn: "দিনাজপুর-৩ আসনের নাগরিক সেবা, শিক্ষার পরিবেশ, রাস্তা ও স্বাস্থ্যসেবার উন্নয়ন পরিকল্পনা নিয়ে স্থানীয় প্রতিনিধিদের সাথে বিস্তারিত আলোচনা হয়।",
        en: "Local representatives discussed detailed plans for citizen services, education quality, roads, and healthcare delivery in Dinajpur-3."
      },
      date: "2026-02-10",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
      categories: ["Citizen Services", "Community"],
      tags: ["dialogue", "dinajpur-3", "public-service"]
    },
    {
      id: "n2",
      slug: "skills-initiative-launch",
      title: {
        bn: "তরুণদের জন্য স্কিল ইনিশিয়েটিভ চালু",
        en: "Skills Initiative Launched for Youth"
      },
      excerpt: {
        bn: "স্থানীয় কর্মসংস্থান বাড়াতে প্রশিক্ষণ ও ডিজিটাল দক্ষতা কর্মসূচির ঘোষণা।",
        en: "Training and digital skills program announced to expand local employment."
      },
      content: {
        bn: "দিনাজপুর-৩ এর তরুণদের জন্য আইটি, কারিগরি, ও ক্ষুদ্র উদ্যোক্তা উন্নয়নভিত্তিক প্রশিক্ষণ কেন্দ্র চালুর পরিকল্পনা প্রকাশ করা হয়েছে।",
        en: "A plan was announced for IT, technical, and entrepreneurship training centers for youth in Dinajpur-3."
      },
      date: "2026-01-28",
      image: "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1200&q=80",
      categories: ["Youth", "Employment"],
      tags: ["skills", "training", "jobs"]
    },
    {
      id: "n3",
      slug: "health-support-camp",
      title: {
        bn: "গ্রামীণ স্বাস্থ্য সহায়তা ক্যাম্পে ব্যাপক সাড়া",
        en: "Strong Response to Rural Health Support Camp"
      },
      excerpt: {
        bn: "বিনামূল্যে চিকিৎসা পরামর্শ ও স্বাস্থ্য সচেতনতা কার্যক্রম পরিচালিত হয়।",
        en: "Free medical consultations and awareness activities were delivered in rural areas."
      },
      content: {
        bn: "নারী ও প্রবীণদের জন্য বিশেষ স্বাস্থ্যসেবা, রক্তচাপ ও ডায়াবেটিস স্ক্রিনিংসহ একদিনের ক্যাম্পে বিপুল অংশগ্রহণ দেখা যায়।",
        en: "A one-day camp offered special care for women and seniors, including blood pressure and diabetes screening."
      },
      date: "2026-01-15",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
      categories: ["Health"],
      tags: ["camp", "rural-health", "screening"]
    }
  ],
  monthlyReports: [
    {
      id: "mr1",
      slug: "monthly-progress-january-2026",
      title: {
        bn: "মাসিক অগ্রগতি প্রতিবেদন: জানুয়ারি ২০২৬",
        en: "Monthly Progress Report: January 2026"
      },
      summary: {
        bn: "জনসেবা আবেদন, স্থানীয় সমস্যা শুনানি এবং প্রকল্প মনিটরিংয়ের সারসংক্ষেপ।",
        en: "Summary of citizen service submissions, local hearings, and project monitoring."
      },
      reportMonth: "2026-01",
      publishedDate: "2026-02-05",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    {
      id: "mr2",
      slug: "monthly-progress-february-2026",
      title: {
        bn: "মাসিক অগ্রগতি প্রতিবেদন: ফেব্রুয়ারি ২০২৬",
        en: "Monthly Progress Report: February 2026"
      },
      summary: {
        bn: "স্বাস্থ্য ক্যাম্প, শিক্ষা সহায়তা এবং অবকাঠামো তদারকির অবস্থা।",
        en: "Updates on health camps, education support, and infrastructure supervision."
      },
      reportMonth: "2026-02",
      publishedDate: "2026-03-06",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    }
  ],
  videos: [
    {
      id: "v1",
      title: {
        bn: "দিনাজপুর-৩ উন্নয়নের ভিশন বক্তৃতা",
        en: "Dinajpur-3 Development Vision Speech"
      },
      youtubeUrl: "https://www.youtube.com/watch?v=khFo6VXggxM",
      duration: "06:49",
      thumbnail: "https://img.youtube.com/vi/khFo6VXggxM/maxresdefault.jpg"
    },
    {
      id: "v2",
      title: {
        bn: "তৃণমূল নেতাকর্মীদের সাথে পরিকল্পনা সভা",
        en: "Planning Session With Grassroots Leaders"
      },
      youtubeUrl: "https://www.youtube.com/watch?v=__F06mEAItI",
      duration: "03:48",
      thumbnail: "https://img.youtube.com/vi/__F06mEAItI/maxresdefault.jpg"
    },
    {
      id: "v3",
      title: {
        bn: "স্বাস্থ্য ও শিক্ষা উন্নয়ন পরিকল্পনা",
        en: "Healthcare and Education Improvement Plan"
      },
      youtubeUrl: "https://www.youtube.com/watch?v=mZEZLMpKeH8",
      duration: "02:46",
      thumbnail: "https://img.youtube.com/vi/mZEZLMpKeH8/maxresdefault.jpg"
    }
  ],
  governmentProjects: [
    {
      id: "gp1",
      slug: "rural-road-upgrade-phase-1",
      title: {
        bn: "গ্রামীণ সড়ক উন্নয়ন (ফেজ-১)",
        en: "Rural Road Upgrade (Phase-1)"
      },
      summary: {
        bn: "ইউনিয়ন সংযোগ সড়ক সংস্কার, ড্রেনেজ ও কালভার্ট উন্নয়ন।",
        en: "Union-link road rehabilitation with drainage and culvert improvements."
      },
      details: {
        bn: "দিনাজপুর-৩ অঞ্চলে যোগাযোগ সহজ করতে সড়কের মানোন্নয়ন, ড্রেনেজ পুনর্বিন্যাস এবং ঝুঁকিপূর্ণ অংশে কালভার্ট উন্নয়ন করা হচ্ছে।",
        en: "Road quality upgrades, drainage redesign, and culvert reinforcement are underway to improve mobility across Dinajpur-3."
      },
      sector: "Infrastructure",
      location: "Dinajpur-3",
      implementingAgency: "LGED",
      budgetTotal: 180000000,
      spentAmount: 62000000,
      startDate: "2025-11-01",
      expectedEndDate: "2026-10-31",
      status: "running",
      phase: {
        bn: "বাস্তবায়ন পর্যায়",
        en: "Implementation Stage"
      },
      progressPercent: 34,
      beneficiaries: {
        bn: "৭০,০০০+ নাগরিক",
        en: "70,000+ citizens"
      },
      image: "https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: "gp2",
      slug: "community-health-center-support",
      title: {
        bn: "কমিউনিটি স্বাস্থ্যকেন্দ্র সক্ষমতা উন্নয়ন",
        en: "Community Health Center Capacity Upgrade"
      },
      summary: {
        bn: "প্রাথমিক স্বাস্থ্যসেবা, ডায়াগনস্টিক সাপোর্ট এবং রেফারেল সক্ষমতা বৃদ্ধি।",
        en: "Improved primary care delivery, diagnostics support, and referral readiness."
      },
      details: {
        bn: "ইউনিয়ন ও উপজেলা পর্যায়ে মৌলিক স্বাস্থ্যসেবা সম্প্রসারণের জন্য মানবসম্পদ সমন্বয়, সরঞ্জাম সহায়তা এবং সেবা পর্যবেক্ষণ চালু করা হয়েছে।",
        en: "Resource alignment, equipment support, and service monitoring are being deployed for stronger union and upazila-level healthcare delivery."
      },
      sector: "Healthcare",
      location: "Dinajpur-3",
      implementingAgency: "DGHS",
      budgetTotal: 95000000,
      spentAmount: 22000000,
      startDate: "2026-01-10",
      expectedEndDate: "2026-12-20",
      status: "running",
      phase: {
        bn: "প্রাথমিক বাস্তবায়ন",
        en: "Initial Implementation"
      },
      progressPercent: 23,
      beneficiaries: {
        bn: "১,২০,০০০+ নাগরিক",
        en: "120,000+ citizens"
      },
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
    }
  ],
  manifesto: {
    title: {
      bn: "দিনাজপুর-৩ উন্নয়ন ইশতেহার",
      en: "Dinajpur-3 Development Manifesto"
    },
    summary: {
      bn: "এই ইশতেহারে স্বাস্থ্য, শিক্ষা, কৃষি, কর্মসংস্থান ও ডিজিটাল জনসেবার বাস্তবায়ন রোডম্যাপ দেওয়া হয়েছে।",
      en: "This manifesto outlines an implementation roadmap for healthcare, education, agriculture, jobs, and digital citizen services."
    },
    pdfUrl:
      "https://abulkhairbhuiyan.com/wp-content/uploads/2026/02/%E0%A6%A8%E0%A6%BF%E0%A6%B0%E0%A7%8D%E0%A6%AC%E0%A6%BE%E0%A6%9A%E0%A6%A8%E0%A7%80-%E0%A6%87%E0%A6%B6%E0%A6%A4%E0%A7%87%E0%A6%B9%E0%A6%BE%E0%A6%B0-.pdf"
  },
  contact: {
    phone: "+880 1712 345678",
    email: "office@syeedjahangiralam.org",
    address: {
      bn: "দিনাজপুর-৩, দিনাজপুর, বাংলাদেশ",
      en: "Dinajpur-3, Dinajpur, Bangladesh"
    },
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Dinajpur-3%20MP%20Office%2C%20Dinajpur%2C%20Bangladesh&t=&z=16&ie=UTF8&iwloc=B&output=embed"
  },
  socials: {
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    twitter: "https://x.com",
    instagram: "https://instagram.com"
  }
};

const banglaCharPattern = /[\u0980-\u09FF]/;
const knownMojibakePattern = /(?:à¦|à§|Ã|Â)/;

function isCorruptedBangla(value: string) {
  return value.includes("\uFFFD") || knownMojibakePattern.test(value);
}

function healBanglaContentFromDefaults(current: unknown, fallback: unknown): unknown {
  if (typeof current === "string" && typeof fallback === "string") {
    if (banglaCharPattern.test(fallback) && isCorruptedBangla(current)) {
      return fallback;
    }
    return current;
  }

  if (Array.isArray(current) && Array.isArray(fallback)) {
    return current.map((item, index) => healBanglaContentFromDefaults(item, fallback[index]));
  }

  if (!current || typeof current !== "object" || !fallback || typeof fallback !== "object") {
    return current;
  }

  const output: Record<string, unknown> = {};
  const currentRecord = current as Record<string, unknown>;
  const fallbackRecord = fallback as Record<string, unknown>;

  for (const [key, value] of Object.entries(currentRecord)) {
    output[key] = healBanglaContentFromDefaults(value, fallbackRecord[key]);
  }

  return output;
}

const defaultUsers: DashboardUser[] = [
  {
    id: crypto.randomUUID(),
    name: "Administrator",
    email: "admin@dinajpur3.local",
    passwordHash: hashPassword("ChangeMe123!"),
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

async function ensureDataFiles() {
  await fs.mkdir(dataDir, { recursive: true });

  await ensureFile(contentFile, defaultContent);
  await ensureFile(usersFile, defaultUsers);
  await ensureFile(submissionsFile, [] as ContactSubmission[]);
  await ensureFile(sessionsFile, {} as SessionStore);
  await ensureFile(chatbotFile, [] as ChatConversation[]);
}

async function ensureFile<T>(filePath: string, data: T) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  }
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  await ensureDataFiles();
  const raw = await fs.readFile(filePath, "utf8");
  const normalized = raw.replace(/^\uFEFF/, "");
  return JSON.parse(normalized) as T;
}

async function writeJsonFile<T>(filePath: string, data: T) {
  await ensureDataFiles();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function normalizeSubmissionStatus(value: unknown): SubmissionStatus {
  if (typeof value === "string" && validSubmissionStatuses.includes(value as SubmissionStatus)) {
    return value as SubmissionStatus;
  }
  return "new";
}

function normalizeKeywordList(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const cleaned = item.trim();
    if (!cleaned) continue;
    const dedupeKey = cleaned.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    normalized.push(cleaned);
  }
  return normalized;
}

function normalizeAmount(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.max(0, Math.round(numberValue));
}

function normalizeProgress(value: unknown, fallback: number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(100, Math.max(0, Math.round(numberValue)));
}

function normalizeLocalizedTextShape(value: unknown, fallback: { bn: string; en: string }) {
  const candidate = (value || {}) as { bn?: unknown; en?: unknown };
  return {
    bn: typeof candidate.bn === "string" ? candidate.bn : fallback.bn,
    en: typeof candidate.en === "string" ? candidate.en : fallback.en
  };
}

function normalizeLocalizedStringList(
  value: unknown,
  fallback: { bn: string[]; en: string[] }
): { bn: string[]; en: string[] } {
  const candidate = (value || {}) as { bn?: unknown; en?: unknown };
  const normalizeSide = (side: unknown, sideFallback: string[]) => {
    if (!Array.isArray(side)) return sideFallback;
    const cleaned = side
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned : sideFallback;
  };

  return {
    bn: normalizeSide(candidate.bn, fallback.bn),
    en: normalizeSide(candidate.en, fallback.en)
  };
}

function normalizeSiteContentShape(content: SiteContent): SiteContent {
  const safeProfileSection =
    (content as unknown as { profileSection?: SiteContent["profileSection"] }).profileSection ||
    defaultContent.profileSection;
  const safePreFooterCta =
    (content as unknown as { preFooterCta?: SiteContent["preFooterCta"] }).preFooterCta ||
    defaultContent.preFooterCta;
  const safeMonthlyReports =
    (content as unknown as { monthlyReports?: SiteContent["monthlyReports"] }).monthlyReports || defaultContent.monthlyReports;
  const safeProjects =
    (content as unknown as { governmentProjects?: SiteContent["governmentProjects"] }).governmentProjects ||
    defaultContent.governmentProjects;

  return {
    ...content,
    profileSection: {
      biographyTitle: normalizeLocalizedTextShape(safeProfileSection.biographyTitle, defaultContent.profileSection.biographyTitle),
      biographyText: normalizeLocalizedTextShape(safeProfileSection.biographyText, defaultContent.profileSection.biographyText),
      activitiesTitle: normalizeLocalizedTextShape(safeProfileSection.activitiesTitle, defaultContent.profileSection.activitiesTitle),
      booksTitle: normalizeLocalizedTextShape(safeProfileSection.booksTitle, defaultContent.profileSection.booksTitle),
      books:
        Array.isArray(safeProfileSection.books) && safeProfileSection.books.length > 0
          ? safeProfileSection.books.map((item, index) => {
              const fallback = defaultContent.profileSection.books[index] || defaultContent.profileSection.books[0];
              return {
                id: typeof item.id === "string" && item.id.trim() ? item.id : fallback.id,
                cover: typeof item.cover === "string" ? item.cover.trim() : fallback.cover,
                title: normalizeLocalizedTextShape(item.title, fallback.title),
                summary: normalizeLocalizedTextShape(item.summary, fallback.summary)
              };
            })
          : defaultContent.profileSection.books,
      collectionTitle: normalizeLocalizedTextShape(safeProfileSection.collectionTitle, defaultContent.profileSection.collectionTitle),
      collectionPoints: normalizeLocalizedStringList(safeProfileSection.collectionPoints, defaultContent.profileSection.collectionPoints),
      officeButtonLabel: normalizeLocalizedTextShape(safeProfileSection.officeButtonLabel, defaultContent.profileSection.officeButtonLabel),
      facebookButtonLabel: normalizeLocalizedTextShape(safeProfileSection.facebookButtonLabel, defaultContent.profileSection.facebookButtonLabel)
    },
    preFooterCta: {
      title: normalizeLocalizedTextShape(safePreFooterCta.title, defaultContent.preFooterCta.title),
      description: normalizeLocalizedTextShape(safePreFooterCta.description, defaultContent.preFooterCta.description),
      volunteerButtonLabel: normalizeLocalizedTextShape(
        safePreFooterCta.volunteerButtonLabel,
        defaultContent.preFooterCta.volunteerButtonLabel
      ),
      writeToMpButtonLabel: normalizeLocalizedTextShape(
        safePreFooterCta.writeToMpButtonLabel,
        defaultContent.preFooterCta.writeToMpButtonLabel
      )
    },
    news: (Array.isArray(content.news) && content.news.length > 0 ? content.news : defaultContent.news).map((item) => ({
      ...item,
      categories: normalizeKeywordList((item as unknown as { categories?: unknown }).categories),
      tags: normalizeKeywordList((item as unknown as { tags?: unknown }).tags)
    })),
    monthlyReports: (Array.isArray(safeMonthlyReports) && safeMonthlyReports.length > 0
      ? safeMonthlyReports
      : defaultContent.monthlyReports
    ).map((item, index) => {
      const fallback = defaultContent.monthlyReports[index] || defaultContent.monthlyReports[0];
      return {
        ...item,
        id: typeof item.id === "string" ? item.id : fallback.id,
        slug: typeof item.slug === "string" && item.slug.trim() ? item.slug.trim() : fallback.slug,
        title: normalizeLocalizedTextShape(item.title, fallback.title),
        summary: normalizeLocalizedTextShape(item.summary, fallback.summary),
        reportMonth: typeof item.reportMonth === "string" && item.reportMonth.trim() ? item.reportMonth.trim() : fallback.reportMonth,
        publishedDate: typeof item.publishedDate === "string" && item.publishedDate.trim() ? item.publishedDate.trim() : fallback.publishedDate,
        pdfUrl: typeof item.pdfUrl === "string" && item.pdfUrl.trim() ? item.pdfUrl.trim() : fallback.pdfUrl
      };
    }),
    governmentProjects: (Array.isArray(safeProjects) && safeProjects.length > 0 ? safeProjects : defaultContent.governmentProjects).map((item, index) => {
      const fallback = defaultContent.governmentProjects[index] || defaultContent.governmentProjects[0];
      const budgetTotal = normalizeAmount(item.budgetTotal, fallback.budgetTotal);
      const spentAmount = Math.min(normalizeAmount(item.spentAmount, fallback.spentAmount), budgetTotal);
      const status = validGovernmentProjectStatuses.includes(item.status) ? item.status : fallback.status;

      return {
        ...item,
        id: typeof item.id === "string" ? item.id : fallback.id,
        slug: typeof item.slug === "string" && item.slug.trim() ? item.slug.trim() : fallback.slug,
        title: normalizeLocalizedTextShape(item.title, fallback.title),
        summary: normalizeLocalizedTextShape(item.summary, fallback.summary),
        details: normalizeLocalizedTextShape(item.details, fallback.details),
        phase: normalizeLocalizedTextShape(item.phase, fallback.phase),
        beneficiaries: normalizeLocalizedTextShape(item.beneficiaries, fallback.beneficiaries),
        sector: typeof item.sector === "string" && item.sector.trim() ? item.sector.trim() : fallback.sector,
        location: typeof item.location === "string" && item.location.trim() ? item.location.trim() : fallback.location,
        implementingAgency:
          typeof item.implementingAgency === "string" && item.implementingAgency.trim()
            ? item.implementingAgency.trim()
            : fallback.implementingAgency,
        budgetTotal,
        spentAmount,
        startDate: typeof item.startDate === "string" && item.startDate.trim() ? item.startDate.trim() : fallback.startDate,
        expectedEndDate:
          typeof item.expectedEndDate === "string" && item.expectedEndDate.trim() ? item.expectedEndDate.trim() : fallback.expectedEndDate,
        status,
        progressPercent: normalizeProgress(item.progressPercent, fallback.progressPercent),
        image: typeof item.image === "string" && item.image.trim() ? item.image.trim() : fallback.image
      };
    })
  };
}

function normalizeSubmission(input: Partial<ContactSubmission>): ContactSubmission {
  const now = new Date().toISOString();
  const normalizedCreatedAt = input.createdAt || now;
  const normalizedArea = input.area?.trim() || "";
  const normalizedUnionWard = input.unionWard?.trim() || normalizedArea;
  return {
    id: input.id || crypto.randomUUID(),
    name: input.name?.trim() || undefined,
    phone: input.phone?.trim() || "",
    email: input.email?.trim() || undefined,
    category: input.category?.trim() || "general",
    unionWard: normalizedUnionWard,
    area: normalizedArea,
    subject: input.subject?.trim() || undefined,
    message: input.message?.trim() || "",
    consentGiven: input.consentGiven ?? true,
    isPrivate: Boolean(input.isPrivate),
    attachmentUrl: input.attachmentUrl?.trim() || undefined,
    status: normalizeSubmissionStatus(input.status),
    createdAt: normalizedCreatedAt,
    updatedAt: input.updatedAt || normalizedCreatedAt
  };
}

function normalizeChatStatus(value: unknown): ChatConversationStatus {
  if (typeof value === "string" && validChatStatuses.includes(value as ChatConversationStatus)) {
    return value as ChatConversationStatus;
  }
  return "open";
}

function normalizeChatCategory(value: unknown): ChatIssueCategory {
  if (typeof value === "string" && validChatCategories.includes(value as ChatIssueCategory)) {
    return value as ChatIssueCategory;
  }
  return "other";
}

function normalizeChatSender(value: unknown): ChatMessageSender {
  if (value === "user" || value === "bot" || value === "admin") {
    return value;
  }
  return "bot";
}

function normalizeChatMessage(input: Partial<ChatMessage>): ChatMessage {
  return {
    id: input.id || crypto.randomUUID(),
    sender: normalizeChatSender(input.sender),
    text: input.text?.trim() || "",
    createdAt: input.createdAt || new Date().toISOString()
  };
}

function normalizeChatConversation(input: Partial<ChatConversation>): ChatConversation {
  const now = new Date().toISOString();
  const createdAt = input.createdAt || now;
  const rawMessages = Array.isArray(input.messages) ? input.messages : [];
  const messages = rawMessages.map((entry) => normalizeChatMessage(entry)).filter((entry) => entry.text.length > 0);
  const updatedAt = input.updatedAt || messages[messages.length - 1]?.createdAt || createdAt;
  const lastUserMessageAt =
    input.lastUserMessageAt ||
    [...messages].reverse().find((entry) => entry.sender === "user")?.createdAt ||
    updatedAt;

  return {
    id: input.id || crypto.randomUUID(),
    name: input.name?.trim() || "Anonymous",
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    lang: input.lang === "bn" ? "bn" : "en",
    category: normalizeChatCategory(input.category),
    status: normalizeChatStatus(input.status),
    requiresManualReply: Boolean(input.requiresManualReply),
    createdAt,
    updatedAt,
    lastUserMessageAt,
    messages
  };
}

export async function getSiteContent() {
  const content = await readJsonFile<SiteContent>(contentFile);
  const { repaired, changed } = repairSiteContentEncoding(content);
  const healed = healBanglaContentFromDefaults(repaired, defaultContent) as SiteContent;
  const normalized = normalizeSiteContentShape(healed);
  const healedChanged = JSON.stringify(normalized) !== JSON.stringify(repaired);

  if (changed || healedChanged) {
    await writeJsonFile(contentFile, normalized);
  }
  return normalized;
}

export async function saveSiteContent(nextContent: SiteContent) {
  const { repaired } = repairSiteContentEncoding(nextContent);
  const healed = healBanglaContentFromDefaults(repaired, defaultContent) as SiteContent;
  const normalized = normalizeSiteContentShape(healed);
  await writeJsonFile(contentFile, normalized);
}

export async function getUsers() {
  const rawUsers = await readJsonFile<Array<DashboardUser & { username?: string }>>(usersFile);
  let changed = false;

  const normalized = rawUsers.map((user, index) => {
    const fallbackEmailBase =
      (user.username && user.username.includes("@") ? user.username : "") ||
      (index === 0 ? "admin@dinajpur3.local" : `user-${index + 1}@local.admin`);

    const nextEmail = (user.email || fallbackEmailBase).trim().toLowerCase();
    if (nextEmail !== user.email) {
      changed = true;
    }
    const nextIsActive = typeof user.isActive === "boolean" ? user.isActive : true;
    if (user.isActive !== nextIsActive) {
      changed = true;
    }

    return {
      ...user,
      email: nextEmail,
      isActive: nextIsActive
    };
  });

  if (changed) {
    await writeJsonFile(usersFile, normalized);
  }

  return normalized;
}

export async function saveUsers(users: DashboardUser[]) {
  await writeJsonFile(usersFile, users);
}

export async function addUser(input: { name: string; email: string; password: string; role: UserRole }) {
  const users = await getUsers();
  const exists = users.some((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (exists) {
    throw new Error("Email already exists");
  }

  const user: DashboardUser = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: hashPassword(input.password),
    role: input.role,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  await saveUsers(users);
  return user;
}

export async function getSubmissions() {
  const raw = await readJsonFile<ContactSubmission[]>(submissionsFile);
  const normalized = raw.map((entry) => normalizeSubmission(entry));
  if (JSON.stringify(raw) !== JSON.stringify(normalized)) {
    await writeJsonFile(submissionsFile, normalized);
  }
  return normalized;
}

export async function addSubmission(submission: Omit<ContactSubmission, "id" | "status" | "createdAt" | "updatedAt">) {
  const all = await getSubmissions();
  const now = new Date().toISOString();
  const next: ContactSubmission = {
    ...submission,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: now,
    updatedAt: now
  };
  all.unshift(next);
  await writeJsonFile(submissionsFile, all);
  return next;
}

export async function updateSubmissionStatus(submissionId: string, status: SubmissionStatus) {
  const all = await getSubmissions();
  const index = all.findIndex((entry) => entry.id === submissionId);
  if (index < 0) {
    return null;
  }

  const next: ContactSubmission = {
    ...all[index],
    status: normalizeSubmissionStatus(status),
    updatedAt: new Date().toISOString()
  };
  all[index] = next;
  await writeJsonFile(submissionsFile, all);
  return next;
}

export async function getSessions() {
  return readJsonFile<SessionStore>(sessionsFile);
}

export async function saveSessions(sessions: SessionStore) {
  await writeJsonFile(sessionsFile, sessions);
}

export async function getChatConversations() {
  const raw = await readJsonFile<ChatConversation[]>(chatbotFile);
  const normalized = raw.map((entry) => normalizeChatConversation(entry));
  if (JSON.stringify(raw) !== JSON.stringify(normalized)) {
    await writeJsonFile(chatbotFile, normalized);
  }
  return [...normalized].sort((left, right) => {
    if (left.updatedAt === right.updatedAt) {
      return left.createdAt < right.createdAt ? 1 : -1;
    }
    return left.updatedAt < right.updatedAt ? 1 : -1;
  });
}

export async function saveChatConversations(conversations: ChatConversation[]) {
  await writeJsonFile(
    chatbotFile,
    conversations.map((entry) => normalizeChatConversation(entry))
  );
}

export async function createChatConversation(input: {
  name: string;
  phone?: string;
  email?: string;
  lang: Lang;
  category: ChatIssueCategory;
  initialBotMessage: string;
}) {
  const all = await getChatConversations();
  const now = new Date().toISOString();
  const conversation = normalizeChatConversation({
    id: crypto.randomUUID(),
    name: input.name.trim(),
    phone: input.phone?.trim() || undefined,
    email: input.email?.trim() || undefined,
    lang: input.lang,
    category: input.category,
    status: "open",
    requiresManualReply: false,
    createdAt: now,
    updatedAt: now,
    lastUserMessageAt: now,
    messages: [
      {
        id: crypto.randomUUID(),
        sender: "bot",
        text: input.initialBotMessage.trim(),
        createdAt: now
      }
    ]
  });

  all.unshift(conversation);
  await saveChatConversations(all);
  return conversation;
}

export async function appendChatMessage(
  conversationId: string,
  input: { sender: ChatMessageSender; text: string; requiresManualReply?: boolean; status?: ChatConversationStatus }
) {
  const all = await getChatConversations();
  const index = all.findIndex((entry) => entry.id === conversationId);
  if (index < 0) {
    return null;
  }

  const nextMessage = normalizeChatMessage({
    sender: input.sender,
    text: input.text,
    createdAt: new Date().toISOString()
  });
  if (!nextMessage.text) {
    return all[index];
  }

  const current = all[index];
  const updated = normalizeChatConversation({
    ...current,
    status: input.status ? normalizeChatStatus(input.status) : current.status,
    requiresManualReply:
      typeof input.requiresManualReply === "boolean" ? input.requiresManualReply : current.requiresManualReply,
    updatedAt: nextMessage.createdAt,
    lastUserMessageAt: input.sender === "user" ? nextMessage.createdAt : current.lastUserMessageAt,
    messages: [...current.messages, nextMessage]
  });

  all[index] = updated;
  await saveChatConversations(all);
  return updated;
}

export async function updateChatConversation(
  conversationId: string,
  input: { status?: ChatConversationStatus; requiresManualReply?: boolean }
) {
  const all = await getChatConversations();
  const index = all.findIndex((entry) => entry.id === conversationId);
  if (index < 0) {
    return null;
  }

  const current = all[index];
  const updated = normalizeChatConversation({
    ...current,
    status: input.status ? normalizeChatStatus(input.status) : current.status,
    requiresManualReply:
      typeof input.requiresManualReply === "boolean" ? input.requiresManualReply : current.requiresManualReply,
    updatedAt: new Date().toISOString()
  });

  all[index] = updated;
  await saveChatConversations(all);
  return updated;
}

export function hashPassword(input: string) {
  return bcrypt.hashSync(input, bcryptRounds);
}

function hashPasswordLegacySha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function isBcryptHash(hash: string) {
  return /^\$2[aby]\$\d{2}\$/.test(hash);
}

export function needsPasswordRehash(hash: string) {
  return !isBcryptHash(hash);
}

export function verifyPassword(input: string, hash: string) {
  if (isBcryptHash(hash)) {
    return bcrypt.compareSync(input, hash);
  }
  return hashPasswordLegacySha256(input) === hash;
}

