export type Lang = "bn" | "en";

export type LocalizedText = {
  bn: string;
  en: string;
};

export type CandidateProfile = {
  name: LocalizedText;
  shortTitle: LocalizedText;
  intro: LocalizedText;
  heroSlogan: LocalizedText;
  heroImage: string;
  profileImage: string;
};

export type Commitment = {
  id: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  details: LocalizedText;
  image: string;
};

export type WorkItem = {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  icon: string;
};

export type GalleryItem = {
  id: string;
  title: LocalizedText;
  image: string;
  album: LocalizedText;
};

export type NewsItem = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  date: string;
  image: string;
  categories: string[];
  tags: string[];
};

export type MonthlyReportItem = {
  id: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  reportMonth: string; // YYYY-MM
  publishedDate: string; // YYYY-MM-DD
  pdfUrl: string;
};

export type VideoItem = {
  id: string;
  title: LocalizedText;
  youtubeUrl: string;
  videoFileUrl?: string;
  duration: string;
  thumbnail: string;
};

export type Manifesto = {
  title: LocalizedText;
  summary: LocalizedText;
  pdfUrl: string;
};

export type GovernmentProjectStatus = "planned" | "running" | "completed" | "on_hold";

export type GovernmentProject = {
  id: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  details: LocalizedText;
  sector: string;
  location: string;
  implementingAgency: string;
  budgetTotal: number;
  spentAmount: number;
  startDate: string;
  expectedEndDate: string;
  status: GovernmentProjectStatus;
  phase: LocalizedText;
  progressPercent: number;
  beneficiaries: LocalizedText;
  image: string;
};

export type ProfileSectionContent = {
  biographyTitle: LocalizedText;
  biographyText: LocalizedText;
  activitiesTitle: LocalizedText;
  collectionPoints: {
    bn: string[];
    en: string[];
  };
  officeButtonLabel: LocalizedText;
  facebookButtonLabel: LocalizedText;
};

export type PreFooterCtaContent = {
  title: LocalizedText;
  description: LocalizedText;
  volunteerButtonLabel: LocalizedText;
  writeToMpButtonLabel: LocalizedText;
};

export type ContactInfo = {
  phone: string;
  email: string;
  address: LocalizedText;
  mapEmbedUrl: string;
};

export type SocialLinks = {
  facebook: string;
  youtube: string;
  twitter: string;
  instagram: string;
};

export type NoticeDisplayScope = "home" | "all_pages";
export type NoticeScrollDirection = "rtl" | "ltr";

export type NoticeBarItem = {
  id: string;
  text: LocalizedText;
  link: string;
  isUrgent: boolean;
  isActive: boolean;
  startAt: string;
  endAt: string;
  order: number;
};

export type NoticeBarContent = {
  enabled: boolean;
  showOn: NoticeDisplayScope;
  speed: number;
  direction: NoticeScrollDirection;
  prefixLabel: LocalizedText;
  items: NoticeBarItem[];
};

export type GovernmentProjectStatusCopy = {
  planned: LocalizedText;
  running: LocalizedText;
  completed: LocalizedText;
  onHold: LocalizedText;
};

export type HomePageCopy = {
  heroTag: LocalizedText;
  commitmentsLabel: LocalizedText;
  runningProjectsLabel: LocalizedText;
  reportsLabel: LocalizedText;
  directServiceTag: LocalizedText;
  directServiceTitle: LocalizedText;
  directServiceText: LocalizedText;
  statusTag: LocalizedText;
  statusTitle: LocalizedText;
  statusText: LocalizedText;
  transparencyTag: LocalizedText;
  transparencyTitle: LocalizedText;
  transparencyText: LocalizedText;
  projectsDescription: LocalizedText;
  monthlyReportsTitle: LocalizedText;
  publishedLabel: LocalizedText;
  mediaDescription: LocalizedText;
  ctaTitle: LocalizedText;
  ctaText: LocalizedText;
  budgetLabel: LocalizedText;
  spentLabel: LocalizedText;
  manifestoTag: LocalizedText;
  manifestoText: LocalizedText;
};

export type ProfilePageCopy = {
  briefBioLabel: LocalizedText;
  activitiesLabel: LocalizedText;
};

export type DevelopmentPageCopy = {
  pageDescription: LocalizedText;
  monthlyReportsNavLabel: LocalizedText;
  viewAllLabel: LocalizedText;
  budgetLabel: LocalizedText;
  spentLabel: LocalizedText;
  progressLabel: LocalizedText;
  monthlyReportsTitle: LocalizedText;
  monthlyReportsDescription: LocalizedText;
};

export type GovernmentProjectsPageCopy = {
  pageTitle: LocalizedText;
  pageDescription: LocalizedText;
  totalBudgetLabel: LocalizedText;
  spentLabel: LocalizedText;
  progressLabel: LocalizedText;
  fullBreakdownLabel: LocalizedText;
  statusLabels: GovernmentProjectStatusCopy;
};

export type GovernmentProjectDetailsPageCopy = {
  backToListLabel: LocalizedText;
  sectorLabel: LocalizedText;
  locationLabel: LocalizedText;
  implementingAgencyLabel: LocalizedText;
  totalBudgetLabel: LocalizedText;
  spentLabel: LocalizedText;
  progressLabel: LocalizedText;
  phaseLabel: LocalizedText;
  beneficiariesLabel: LocalizedText;
};

export type WorkHistoryPageCopy = {
  pageDescription: LocalizedText;
  ctaTitle: LocalizedText;
  ctaText: LocalizedText;
  heroImageAlt: LocalizedText;
};

export type ContactPageCopy = {
  emailLabel: LocalizedText;
  facebookInboxLabel: LocalizedText;
};

export type PublicPageCopy = {
  home: HomePageCopy;
  profile: ProfilePageCopy;
  development: DevelopmentPageCopy;
  governmentProjects: GovernmentProjectsPageCopy;
  governmentProjectDetails: GovernmentProjectDetailsPageCopy;
  workHistory: WorkHistoryPageCopy;
  contact: ContactPageCopy;
};

export type SiteContent = {
  candidate: CandidateProfile;
  profileSection: ProfileSectionContent;
  preFooterCta: PreFooterCtaContent;
  noticeBar: NoticeBarContent;
  pageCopy: PublicPageCopy;
  commitments: Commitment[];
  workHistory: WorkItem[];
  gallery: GalleryItem[];
  news: NewsItem[];
  monthlyReports: MonthlyReportItem[];
  videos: VideoItem[];
  governmentProjects: GovernmentProject[];
  manifesto: Manifesto;
  contact: ContactInfo;
  socials: SocialLinks;
};

export type SubmissionStatus = "new" | "in_review" | "processing" | "resolved" | "closed";

export type ContactSubmission = {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  category: string;
  unionWard: string;
  area: string;
  subject?: string;
  message: string;
  consentGiven: boolean;
  isPrivate: boolean;
  attachmentUrl?: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
};

export type UserRole = "admin" | "editor";

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

export type ChatIssueCategory = "citizen_services" | "development_projects" | "government_projects" | "office_contact" | "other";
export type ChatConversationStatus = "open" | "in_review" | "resolved";
export type ChatMessageSender = "user" | "bot" | "admin";

export type ChatMessage = {
  id: string;
  sender: ChatMessageSender;
  text: string;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  lang: Lang;
  category: ChatIssueCategory;
  status: ChatConversationStatus;
  requiresManualReply: boolean;
  createdAt: string;
  updatedAt: string;
  lastUserMessageAt: string;
  messages: ChatMessage[];
};
