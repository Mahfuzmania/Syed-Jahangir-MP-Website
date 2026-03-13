"use client";

import { useMemo, useState } from "react";
import { ChatConversation, ChatConversationStatus, ContactSubmission, SiteContent, SubmissionStatus, UserRole } from "@/lib/types";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { inputClassName } from "@/components/admin/FieldParts";

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

type StatusOption = {
  value: SubmissionStatus | "all";
  labelBn: string;
  labelEn: string;
};

type ChatStatusOption = {
  value: ChatConversationStatus | "all";
  labelBn: string;
  labelEn: string;
};

type AdminView = "overview" | "security" | "content" | "inbox" | "chatbot" | "users";

const statusOptions: StatusOption[] = [
  { value: "all", labelBn: "সব", labelEn: "All" },
  { value: "new", labelBn: "নতুন", labelEn: "New" },
  { value: "in_review", labelBn: "পর্যালোচনায়", labelEn: "In Review" },
  { value: "processing", labelBn: "প্রসেসিং", labelEn: "Processing" },
  { value: "resolved", labelBn: "সমাধান", labelEn: "Resolved" },
  { value: "closed", labelBn: "বন্ধ", labelEn: "Closed" }
];

const chatStatusOptions: ChatStatusOption[] = [
  { value: "all", labelBn: "সব", labelEn: "All" },
  { value: "open", labelBn: "খোলা", labelEn: "Open" },
  { value: "in_review", labelBn: "পর্যালোচনায়", labelEn: "In Review" },
  { value: "resolved", labelBn: "সমাধান", labelEn: "Resolved" }
];

function statusBadgeClass(status: SubmissionStatus) {
  if (status === "new") return "bg-red-100 text-red-700 border-red-200";
  if (status === "in_review") return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "processing") return "bg-sky-100 text-sky-700 border-sky-200";
  if (status === "resolved") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function statusLabel(status: SubmissionStatus, isBangla: boolean) {
  const option = statusOptions.find((entry) => entry.value === status);
  if (!option) return status;
  return isBangla ? option.labelBn : option.labelEn;
}

function roleLabel(value: UserRole, isBangla: boolean) {
  if (value === "admin") {
    return isBangla ? "অ্যাডমিন" : "Admin";
  }
  return isBangla ? "এডিটর" : "Editor";
}

function chatStatusBadgeClass(status: ChatConversationStatus) {
  if (status === "open") return "bg-red-100 text-red-700 border-red-200";
  if (status === "in_review") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function chatStatusLabel(status: ChatConversationStatus, isBangla: boolean) {
  const option = chatStatusOptions.find((entry) => entry.value === status);
  if (!option) return status;
  return isBangla ? option.labelBn : option.labelEn;
}

function chatCategoryLabel(category: string, isBangla: boolean) {
  if (category === "citizen_services") return isBangla ? "নাগরিক সেবা" : "Citizen Services";
  if (category === "development_projects") return isBangla ? "উন্নয়ন প্রকল্প" : "Development Projects";
  if (category === "government_projects") return isBangla ? "সরকারি প্রকল্প" : "Government Projects";
  if (category === "office_contact") return isBangla ? "অফিস যোগাযোগ" : "Office Contact";
  return isBangla ? "অন্যান্য" : "Other";
}

export function AdminDashboard({
  lang,
  role,
  name,
  initialContent,
  initialSubmissions,
  initialChatbotConversations,
  initialUsers
}: {
  lang: "bn" | "en";
  role: UserRole;
  name: string;
  initialContent: SiteContent;
  initialSubmissions: ContactSubmission[];
  initialChatbotConversations: ChatConversation[];
  initialUsers: PublicUser[];
}) {
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  const [users, setUsers] = useState<PublicUser[]>(initialUsers);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>(initialSubmissions);
  const [submissionStatusMessage, setSubmissionStatusMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingSubmissionId, setUpdatingSubmissionId] = useState<string | null>(null);

  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(initialChatbotConversations);
  const [chatStatusFilter, setChatStatusFilter] = useState<ChatConversationStatus | "all">("all");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatStatusMessage, setChatStatusMessage] = useState("");
  const [mutatingChatId, setMutatingChatId] = useState<string | null>(null);
  const [chatReplyDraftById, setChatReplyDraftById] = useState<Record<string, string>>({});

  const [userStatus, setUserStatus] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; password: string; role: UserRole }>({
    name: "",
    email: "",
    password: "",
    role: "editor"
  });
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);
  const [roleDraftByUserId, setRoleDraftByUserId] = useState<Record<string, UserRole>>(
    () => Object.fromEntries(initialUsers.map((entry) => [entry.id, entry.role])) as Record<string, UserRole>
  );
  const [resetPasswordByUserId, setResetPasswordByUserId] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const isBangla = lang === "bn";

  const labels = useMemo(
    () => ({
      dashboard: isBangla ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard",
      welcome: isBangla ? "স্বাগতম" : "Welcome",
      logout: isBangla ? "লগআউট" : "Logout",
      menu: isBangla ? "মেনু" : "Menu",
      closeMenu: isBangla ? "বন্ধ" : "Close",
      overview: isBangla ? "সারসংক্ষেপ" : "Overview",
      security: isBangla ? "সিকিউরিটি" : "Security",
      content: isBangla ? "কনটেন্ট" : "Content",
      inbox: isBangla ? "ইনবক্স" : "Inbox",
      users: isBangla ? "ইউজার" : "Users",
      writeToMpInbox: isBangla ? "আপনার সাংসদকে লিখুন: ইনবক্স" : "Write to MP: Inbox",
      addUser: isBangla ? "নতুন ব্যবহারকারী যোগ করুন" : "Add New User",
      userRole: isBangla ? "রোল নির্বাচন" : "Select Role",
      userEmailInvalid: isBangla ? "সঠিক ইমেইল দিন" : "Please provide a valid email address.",
      roleAdmin: isBangla ? "অ্যাডমিন" : "Admin",
      roleEditor: isBangla ? "এডিটর" : "Editor",
      saving: isBangla ? "প্রসেস হচ্ছে..." : "Processing...",
      search: isBangla ? "নাম/মোবাইল/বিষয়/এলাকা দিয়ে খুঁজুন" : "Search by name/phone/subject/area",
      exportCsv: isBangla ? "CSV এক্সপোর্ট" : "Export CSV",
      exportPdf: isBangla ? "PDF এক্সপোর্ট" : "Export PDF",
      noSubmissions: isBangla ? "এখনও কোনো বার্তা নেই" : "No submissions yet.",
      updateFailed: isBangla ? "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে" : "Failed to update status",
      updateSuccess: isBangla ? "স্ট্যাটাস আপডেট হয়েছে" : "Status updated",
      total: isBangla ? "মোট" : "Total",
      passwordPanel: isBangla ? "পাসওয়ার্ড পরিবর্তন" : "Change Password",
      currentPassword: isBangla ? "বর্তমান পাসওয়ার্ড" : "Current Password",
      newPassword: isBangla ? "নতুন পাসওয়ার্ড" : "New Password",
      confirmPassword: isBangla ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password",
      savePassword: isBangla ? "পাসওয়ার্ড আপডেট করুন" : "Update Password",
      passwordMismatch: isBangla ? "নতুন পাসওয়ার্ড মিলছে না" : "New password and confirm password do not match.",
      passwordTooShort: isBangla ? "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে" : "Password must be at least 8 characters.",
      passwordUpdated: isBangla ? "পাসওয়ার্ড সফলভাবে আপডেট হয়েছে" : "Password updated successfully.",
      passwordFailed: isBangla ? "পাসওয়ার্ড আপডেট ব্যর্থ হয়েছে" : "Failed to update password.",
      mailNo: isBangla ? "মেইল নং" : "Mail No",
      from: isBangla ? "প্রেরক" : "From",
      to: isBangla ? "প্রাপক" : "To",
      phone: isBangla ? "মোবাইল" : "Phone",
      category: isBangla ? "ক্যাটাগরি" : "Category",
      location: isBangla ? "ইউনিয়ন/ওয়ার্ড ও এলাকা" : "Union/Ward & Area",
      message: isBangla ? "বার্তা" : "Message",
      mpOffice: isBangla ? "এমপি অফিস" : "MP Office",
      consent: isBangla ? "সম্মতি" : "Consent",
      privacy: isBangla ? "গোপনীয়তা অনুরোধ" : "Privacy Request",
      yes: isBangla ? "হ্যাঁ" : "Yes",
      no: isBangla ? "না" : "No",
      newMessages: isBangla ? "নতুন বার্তা" : "New Messages",
      inReview: isBangla ? "পর্যালোচনায়" : "In Review",
      galleryAlbums: isBangla ? "গ্যালারি অ্যালবাম" : "Gallery Albums",
      newsPosts: isBangla ? "নিউজ পোস্ট" : "News Posts",
      editors: isBangla ? "এডিটর" : "Editors",
      quickAction: isBangla ? "দ্রুত কাজ" : "Quick Action",
      openContent: isBangla ? "কনটেন্ট ম্যানেজ করুন" : "Manage Content",
      openInbox: isBangla ? "বার্তা পর্যালোচনা করুন" : "Review Inbox",
      openSecurity: isBangla ? "সিকিউরিটি সেকশন" : "Open Security",
      openUsers: isBangla ? "ইউজার ম্যানেজ করুন" : "Manage Users",
      contentCoverage: isBangla ? "কনটেন্ট কাভারেজ" : "Content Coverage",
      siteControl: isBangla ? "সাইট কন্ট্রোল" : "Site Control",
      statusActive: isBangla ? "সক্রিয়" : "Active",
      statusInactive: isBangla ? "নিষ্ক্রিয়" : "Inactive",
      activate: isBangla ? "সক্রিয় করুন" : "Activate",
      deactivate: isBangla ? "নিষ্ক্রিয় করুন" : "Deactivate",
      resetPassword: isBangla ? "পাসওয়ার্ড রিসেট" : "Reset Password",
      updateRole: isBangla ? "রোল আপডেট" : "Update Role",
      removeUser: isBangla ? "ইউজার মুছুন" : "Delete User",
      createdAt: isBangla ? "তৈরির তারিখ" : "Created",
      userEmail: isBangla ? "ইমেইল" : "Email",
      userName: isBangla ? "নাম" : "Name",
      role: isBangla ? "রোল" : "Role",
      usersSummary: isBangla ? "ইউজার সারাংশ" : "User Summary",
      totalUsers: isBangla ? "মোট ইউজার" : "Total Users",
      activeUsers: isBangla ? "সক্রিয় ইউজার" : "Active Users",
      admins: isBangla ? "অ্যাডমিন" : "Admins",
      reports: isBangla ? "মাসিক রিপোর্ট" : "Monthly Reports",
      videos: isBangla ? "ভিডিও" : "Videos",
      projects: isBangla ? "সরকারি প্রকল্প" : "Gov Projects",
      profileBooks: isBangla ? "পরিচিতির বই" : "Profile Books",
      footerCta: isBangla ? "ফুটার CTA" : "Footer CTA",
      chatbot: isBangla ? "চ্যাটবট" : "Chatbot",
      chatbotInbox: isBangla ? "চ্যাটবট: ইনবক্স" : "Chatbot Inbox",
      chatbotSearch: isBangla ? "নাম/মোবাইল/ইমেইল/বার্তা দিয়ে খুঁজুন" : "Search by name/phone/email/message",
      chatRequiresManual: isBangla ? "ম্যানুয়াল উত্তর প্রয়োজন" : "Requires Manual Reply",
      chatReply: isBangla ? "অ্যাডমিন উত্তর" : "Admin Reply",
      chatSendReply: isBangla ? "উত্তর পাঠান" : "Send Reply",
      chatNoData: isBangla ? "কোনো চ্যাট পাওয়া যায়নি" : "No chat conversations found.",
      chatStatusUpdated: isBangla ? "চ্যাট স্ট্যাটাস আপডেট হয়েছে" : "Chat status updated",
      chatStatusUpdateFailed: isBangla ? "চ্যাট আপডেট ব্যর্থ হয়েছে" : "Failed to update chat",
      chatFrom: isBangla ? "প্রেরক" : "Sender",
      chatContact: isBangla ? "যোগাযোগ" : "Contact",
      chatCategory: isBangla ? "বিষয়" : "Category",
      chatConversation: isBangla ? "কথোপকথন" : "Conversation",
      openChatbot: isBangla ? "চ্যাটবট ইনবক্স" : "Open Chatbot Inbox"
    }),
    [isBangla]
  );

  const navItems: Array<{ key: AdminView; label: string; show: boolean }> = [
    { key: "overview", label: labels.overview, show: true },
    { key: "security", label: labels.security, show: true },
    { key: "content", label: labels.content, show: true },
    { key: "inbox", label: labels.inbox, show: true },
    { key: "chatbot", label: labels.chatbot, show: true },
    { key: "users", label: labels.users, show: role === "admin" }
  ];

  const filteredSubmissions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return submissions.filter((item) => {
      const statusMatch = statusFilter === "all" || item.status === statusFilter;
      if (!statusMatch) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [item.name, item.phone, item.email, item.category, item.unionWard, item.area, item.subject, item.message].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, statusFilter, submissions]);

  const filteredChatConversations = useMemo(() => {
    const query = chatSearchQuery.trim().toLowerCase();

    return chatConversations.filter((entry) => {
      const statusMatch = chatStatusFilter === "all" || entry.status === chatStatusFilter;
      if (!statusMatch) {
        return false;
      }
      if (!query) {
        return true;
      }

      const haystack = [entry.name, entry.phone, entry.email, entry.category, ...entry.messages.map((item) => item.text)]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [chatConversations, chatSearchQuery, chatStatusFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: submissions.length,
      new: submissions.filter((entry) => entry.status === "new").length,
      in_review: submissions.filter((entry) => entry.status === "in_review").length,
      processing: submissions.filter((entry) => entry.status === "processing").length,
      resolved: submissions.filter((entry) => entry.status === "resolved").length,
      closed: submissions.filter((entry) => entry.status === "closed").length
    };
  }, [submissions]);

  const chatStatusCounts = useMemo(
    () => ({
      all: chatConversations.length,
      open: chatConversations.filter((entry) => entry.status === "open").length,
      in_review: chatConversations.filter((entry) => entry.status === "in_review").length,
      resolved: chatConversations.filter((entry) => entry.status === "resolved").length
    }),
    [chatConversations]
  );

  const adminStats = useMemo(() => {
    const albumSet = new Set(
      initialContent.gallery
        .map((item) => (isBangla ? item.album.bn : item.album.en).trim())
        .filter(Boolean)
    );

    return [
      { label: labels.total, value: statusCounts.all },
      { label: labels.newMessages, value: statusCounts.new },
      { label: labels.inReview, value: statusCounts.in_review },
      { label: labels.galleryAlbums, value: albumSet.size },
      { label: labels.newsPosts, value: initialContent.news.length },
      { label: labels.chatbot, value: chatStatusCounts.open + chatStatusCounts.in_review }
    ];
  }, [
    chatStatusCounts.in_review,
    chatStatusCounts.open,
    initialContent.gallery,
    initialContent.news.length,
    isBangla,
    labels.chatbot,
    labels.galleryAlbums,
    labels.inReview,
    labels.newMessages,
    labels.newsPosts,
    labels.total,
    statusCounts.all,
    statusCounts.in_review,
    statusCounts.new
  ]);

  const contentCoverageStats = useMemo(
    () => [
      { label: labels.newsPosts, value: initialContent.news.length },
      { label: labels.reports, value: initialContent.monthlyReports.length },
      { label: labels.videos, value: initialContent.videos.length },
      { label: labels.projects, value: initialContent.governmentProjects.length },
      { label: labels.profileBooks, value: initialContent.profileSection.books.length },
      { label: labels.footerCta, value: 1 }
    ],
    [
      initialContent.governmentProjects.length,
      initialContent.monthlyReports.length,
      initialContent.news.length,
      initialContent.profileSection.books.length,
      initialContent.videos.length,
      labels.footerCta,
      labels.newsPosts,
      labels.profileBooks,
      labels.projects,
      labels.reports,
      labels.videos
    ]
  );

  const controlStats = useMemo(
    () => [
      { label: labels.totalUsers, value: users.length },
      { label: labels.activeUsers, value: users.filter((entry) => entry.isActive).length },
      { label: labels.admins, value: users.filter((entry) => entry.role === "admin" && entry.isActive).length },
      { label: labels.editors, value: users.filter((entry) => entry.role === "editor" && entry.isActive).length },
      { label: labels.newMessages, value: statusCounts.new },
      { label: labels.chatbot, value: chatStatusCounts.open + chatStatusCounts.in_review }
    ],
    [
      chatStatusCounts.in_review,
      chatStatusCounts.open,
      labels.activeUsers,
      labels.admins,
      labels.chatbot,
      labels.editors,
      labels.newMessages,
      labels.totalUsers,
      statusCounts.new,
      users
    ]
  );

  const sortedUsers = useMemo(
    () =>
      [...users].sort((left, right) => {
        if (left.role !== right.role) {
          return left.role === "admin" ? -1 : 1;
        }
        return left.createdAt < right.createdAt ? 1 : -1;
      }),
    [users]
  );

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = `/${lang}/admin/login`;
  }

  async function createUser() {
    setUserStatus("");
    const name = newUser.name.trim();
    const email = newUser.email.trim();
    const password = newUser.password.trim();

    if (!name || !email || !password) {
      setUserStatus(isBangla ? "সব ঘর পূরণ করুন" : "Please fill all user fields");
      return;
    }

    if (password.length < 8) {
      setUserStatus(isBangla ? "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে" : "Password must be at least 8 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.toLowerCase())) {
      setUserStatus(labels.userEmailInvalid);
      return;
    }
    if (newUser.role !== "admin" && newUser.role !== "editor") {
      setUserStatus(isBangla ? "সঠিক রোল নির্বাচন করুন" : "Please select a valid role.");
      return;
    }

    setCreatingUser(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: newUser.role })
      });

      const data = (await response.json()) as { error?: string; user?: PublicUser };
      if (!response.ok || !data.user) {
        throw new Error(data.error || "Error");
      }
      const createdUser = data.user;

      setUsers((prev) => [createdUser, ...prev]);
      setRoleDraftByUserId((prev) => ({ ...prev, [createdUser.id]: createdUser.role }));
      setNewUser({ name: "", email: "", password: "", role: "editor" });
      setUserStatus(isBangla ? "ইউজার তৈরি হয়েছে" : "User created successfully");
    } catch (error) {
      setUserStatus(error instanceof Error ? error.message : isBangla ? "ব্যর্থ" : "Failed");
    } finally {
      setCreatingUser(false);
    }
  }

  async function updateUser(
    userId: string,
    payload: {
      name?: string;
      role?: UserRole;
      isActive?: boolean;
      newPassword?: string;
    }
  ) {
    setUserStatus("");
    setMutatingUserId(userId);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...payload })
      });

      const data = (await response.json()) as { error?: string; user?: PublicUser };
      if (!response.ok || !data.user) {
        throw new Error(data.error || (isBangla ? "ইউজার আপডেট ব্যর্থ" : "Failed to update user"));
      }
      const updatedUser = data.user;

      setUsers((prev) => prev.map((entry) => (entry.id === updatedUser.id ? updatedUser : entry)));
      setRoleDraftByUserId((prev) => ({ ...prev, [updatedUser.id]: updatedUser.role }));
      setResetPasswordByUserId((prev) => ({ ...prev, [updatedUser.id]: "" }));
      setUserStatus(isBangla ? "ইউজার আপডেট হয়েছে" : "User updated successfully");
    } catch (error) {
      setUserStatus(error instanceof Error ? error.message : isBangla ? "ইউজার আপডেট ব্যর্থ" : "Failed to update user");
    } finally {
      setMutatingUserId(null);
    }
  }

  async function removeUser(userId: string) {
    const ok = window.confirm(isBangla ? "এই ইউজার মুছে ফেলতে চান?" : "Delete this user?");
    if (!ok) {
      return;
    }

    setUserStatus("");
    setMutatingUserId(userId);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      const data = (await response.json()) as { error?: string; success?: boolean };
      if (!response.ok || !data.success) {
        throw new Error(data.error || (isBangla ? "ইউজার মুছতে ব্যর্থ" : "Failed to delete user"));
      }

      setUsers((prev) => prev.filter((entry) => entry.id !== userId));
      setRoleDraftByUserId((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setResetPasswordByUserId((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setUserStatus(isBangla ? "ইউজার মুছে ফেলা হয়েছে" : "User deleted successfully");
    } catch (error) {
      setUserStatus(error instanceof Error ? error.message : isBangla ? "ইউজার মুছতে ব্যর্থ" : "Failed to delete user");
    } finally {
      setMutatingUserId(null);
    }
  }

  async function changePassword() {
    setPasswordStatus("");
    const currentPassword = passwordForm.currentPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmPassword = passwordForm.confirmPassword.trim();

    if (newPassword.length < 8) {
      setPasswordStatus(labels.passwordTooShort);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus(labels.passwordMismatch);
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = (await response.json()) as { error?: string; success?: boolean };
      if (!response.ok || !data.success) {
        throw new Error(data.error || labels.passwordFailed);
      }

      setPasswordStatus(labels.passwordUpdated);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordStatus(error instanceof Error ? error.message : labels.passwordFailed);
    } finally {
      setChangingPassword(false);
    }
  }

  async function onChangeSubmissionStatus(id: string, status: SubmissionStatus) {
    setSubmissionStatusMessage("");
    setUpdatingSubmissionId(id);

    try {
      const response = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const data = (await response.json()) as { error?: string; submission?: ContactSubmission };
      if (!response.ok || !data.submission) {
        throw new Error(data.error || labels.updateFailed);
      }

      setSubmissions((prev) => prev.map((entry) => (entry.id === id ? data.submission! : entry)));
      setSubmissionStatusMessage(labels.updateSuccess);
    } catch (error) {
      setSubmissionStatusMessage(error instanceof Error ? error.message : labels.updateFailed);
    } finally {
      setUpdatingSubmissionId(null);
    }
  }

  async function onChangeChatStatus(id: string, status: ChatConversationStatus) {
    setChatStatusMessage("");
    setMutatingChatId(id);
    try {
      const response = await fetch("/api/admin/chatbot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      const data = (await response.json()) as { error?: string; conversation?: ChatConversation };
      if (!response.ok || !data.conversation) {
        throw new Error(data.error || labels.chatStatusUpdateFailed);
      }
      setChatConversations((prev) => prev.map((entry) => (entry.id === id ? data.conversation! : entry)));
      setChatStatusMessage(labels.chatStatusUpdated);
    } catch (error) {
      setChatStatusMessage(error instanceof Error ? error.message : labels.chatStatusUpdateFailed);
    } finally {
      setMutatingChatId(null);
    }
  }

  async function onSendChatReply(id: string) {
    const reply = (chatReplyDraftById[id] || "").trim();
    if (!reply) {
      return;
    }

    setChatStatusMessage("");
    setMutatingChatId(id);
    try {
      const response = await fetch("/api/admin/chatbot", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminReply: reply, status: "resolved", requiresManualReply: false })
      });
      const data = (await response.json()) as { error?: string; conversation?: ChatConversation };
      if (!response.ok || !data.conversation) {
        throw new Error(data.error || labels.chatStatusUpdateFailed);
      }

      setChatConversations((prev) => prev.map((entry) => (entry.id === id ? data.conversation! : entry)));
      setChatReplyDraftById((prev) => ({ ...prev, [id]: "" }));
      setChatStatusMessage(labels.chatStatusUpdated);
    } catch (error) {
      setChatStatusMessage(error instanceof Error ? error.message : labels.chatStatusUpdateFailed);
    } finally {
      setMutatingChatId(null);
    }
  }

  const exportUrl =
    statusFilter === "all"
      ? "/api/admin/submissions/export"
      : `/api/admin/submissions/export?status=${encodeURIComponent(statusFilter)}`;
  const exportPdfUrl =
    statusFilter === "all"
      ? "/api/admin/submissions/export/pdf"
      : `/api/admin/submissions/export/pdf?status=${encodeURIComponent(statusFilter)}`;

  return (
    <div className="space-y-6">
      <div className="card-surface overflow-hidden p-0">
        <div className="bg-gradient-to-r from-brand-green to-[#0b6c4b] p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/80">{labels.dashboard}</p>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl">{labels.welcome}, {name}</h1>
              <p className="mt-1 text-sm text-white/85">
                {isBangla ? "রোল" : "Role"}: {roleLabel(role, isBangla)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-bold text-white md:hidden"
              >
                {menuOpen ? labels.closeMenu : labels.menu}
              </button>
              <button onClick={logout} className="rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-red hover:border-brand-red">
                {labels.logout}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px,1fr]">
        <aside className="hidden md:block">
          <nav className="card-surface sticky top-24 space-y-1 p-3">
            {navItems.filter((item) => item.show).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveView(item.key)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  activeView === item.key ? "bg-brand-green text-white" : "text-brand-ink hover:bg-brand-green/10 hover:text-brand-green"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {menuOpen ? (
          <div className="card-surface p-3 md:hidden">
            <nav className="space-y-1">
              {navItems.filter((item) => item.show).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveView(item.key);
                    setMenuOpen(false);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                    activeView === item.key ? "bg-brand-green text-white" : "text-brand-ink hover:bg-brand-green/10 hover:text-brand-green"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        ) : null}

        <div className="space-y-6">
          {activeView === "overview" ? (
            <>
              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink/60">{labels.overview}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {adminStats.map((stat) => (
                    <article key={stat.label} className="card-surface rounded-2xl border border-brand-ink/10 bg-white/85 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/55">{stat.label}</p>
                      <p className="mt-2 text-2xl font-bold text-brand-green">{stat.value}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="card-surface p-6">
                <h2 className="text-xl font-bold text-brand-green">{labels.quickAction}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => setActiveView("content")} className="rounded-full bg-brand-green px-4 py-2 text-sm font-bold text-white">
                    {labels.openContent}
                  </button>
                  <button onClick={() => setActiveView("inbox")} className="rounded-full border border-brand-green/30 px-4 py-2 text-sm font-bold text-brand-green">
                    {labels.openInbox}
                  </button>
                  <button onClick={() => setActiveView("chatbot")} className="rounded-full border border-brand-green/30 px-4 py-2 text-sm font-bold text-brand-green">
                    {labels.openChatbot}
                  </button>
                  <button onClick={() => setActiveView("security")} className="rounded-full border border-brand-green/30 px-4 py-2 text-sm font-bold text-brand-green">
                    {labels.openSecurity}
                  </button>
                  {role === "admin" ? (
                    <button onClick={() => setActiveView("users")} className="rounded-full border border-brand-green/30 px-4 py-2 text-sm font-bold text-brand-green">
                      {labels.openUsers}
                    </button>
                  ) : null}
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <article className="card-surface p-5">
                  <h3 className="text-lg font-bold text-brand-green">{labels.contentCoverage}</h3>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {contentCoverageStats.map((item) => (
                      <div key={item.label} className="rounded-xl border border-brand-ink/10 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/60">{item.label}</p>
                        <p className="mt-1 text-xl font-bold text-brand-green">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="card-surface p-5">
                  <h3 className="text-lg font-bold text-brand-green">{labels.siteControl}</h3>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {controlStats.map((item) => (
                      <div key={item.label} className="rounded-xl border border-brand-ink/10 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/60">{item.label}</p>
                        <p className="mt-1 text-xl font-bold text-brand-green">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </>
          ) : null}

          {activeView === "security" ? (
            <section className="card-surface p-6">
              <h2 className="text-xl font-bold text-brand-green">{labels.passwordPanel}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                  type="password"
                  placeholder={labels.currentPassword}
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  className={inputClassName}
                />
                <input
                  type="password"
                  placeholder={labels.newPassword}
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  className={inputClassName}
                />
                <input
                  type="password"
                  placeholder={labels.confirmPassword}
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  className={inputClassName}
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  disabled={changingPassword}
                  onClick={changePassword}
                  className="rounded-full bg-brand-green px-5 py-2 text-sm font-bold text-white disabled:opacity-70"
                >
                  {changingPassword ? labels.saving : labels.savePassword}
                </button>
                {passwordStatus ? <p className="text-sm text-brand-ink/80">{passwordStatus}</p> : null}
              </div>
            </section>
          ) : null}

          {activeView === "content" ? <ContentEditor lang={lang} initialContent={initialContent} /> : null}

          {activeView === "inbox" ? (
            <section className="card-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-brand-green">{labels.writeToMpInbox}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={exportUrl}
                    className="rounded-full border border-brand-green px-4 py-1.5 text-sm font-semibold text-brand-green transition hover:bg-brand-green hover:text-white"
                  >
                    {labels.exportCsv}
                  </a>
                  <a
                    href={exportPdfUrl}
                    className="rounded-full border border-brand-red px-4 py-1.5 text-sm font-semibold text-brand-red transition hover:bg-brand-red hover:text-white"
                  >
                    {labels.exportPdf}
                  </a>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input placeholder={labels.search} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className={inputClassName} />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as SubmissionStatus | "all")} className={inputClassName}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {isBangla ? option.labelBn : option.labelEn}
                    </option>
                  ))}
                </select>
                <div className="rounded-xl border border-brand-ink/15 bg-white px-3 py-2 text-sm text-brand-ink/70">
                  {labels.total}: <span className="font-bold text-brand-green">{filteredSubmissions.length}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <span key={option.value} className="rounded-full border border-brand-ink/15 bg-white px-3 py-1 text-xs">
                    {isBangla ? option.labelBn : option.labelEn}:{" "}
                    <span className="font-semibold text-brand-green">{statusCounts[option.value]}</span>
                  </span>
                ))}
              </div>

              {submissionStatusMessage ? <p className="mt-3 text-sm text-brand-ink/80">{submissionStatusMessage}</p> : null}

              <div className="mt-4 space-y-3">
                {filteredSubmissions.length === 0 ? (
                  <p className="text-sm text-brand-ink/70">{labels.noSubmissions}</p>
                ) : (
                  filteredSubmissions.map((item, index) => (
                    <article key={item.id} className="rounded-2xl border border-brand-ink/10 bg-white p-4 shadow-[0_6px_20px_rgba(16,34,24,0.06)]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-brand-green">
                            {labels.mailNo} #{index + 1} - {item.subject || (isBangla ? "বিষয় উল্লেখ নেই" : "No Subject")}
                          </p>
                          <p className="mt-1 text-xs text-brand-ink/60">{new Date(item.createdAt).toLocaleString(isBangla ? "bn-BD" : "en-US")}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                            {statusLabel(item.status, isBangla)}
                          </span>
                          <select
                            value={item.status}
                            onChange={(event) => void onChangeSubmissionStatus(item.id, event.target.value as SubmissionStatus)}
                            className="rounded-full border border-brand-ink/20 bg-white px-3 py-1 text-xs"
                            disabled={updatingSubmissionId === item.id}
                          >
                            {statusOptions
                              .filter((option) => option.value !== "all")
                              .map((option) => (
                                <option key={option.value} value={option.value}>
                                  {isBangla ? option.labelBn : option.labelEn}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 rounded-xl border border-brand-ink/10 bg-slate-50/80 p-3 text-xs text-brand-ink/80 md:grid-cols-2">
                        <p>
                          <span className="font-semibold">{labels.from}:</span> {item.name || (isBangla ? "অজ্ঞাতনামা" : "Anonymous")}
                          {item.email ? ` <${item.email}>` : ""}
                        </p>
                        <p>
                          <span className="font-semibold">{labels.to}:</span> {labels.mpOffice}
                        </p>
                        <p>
                          <span className="font-semibold">{labels.phone}:</span> {item.phone}
                        </p>
                        <p>
                          <span className="font-semibold">{labels.category}:</span> {item.category}
                        </p>
                        <p className="md:col-span-2">
                          <span className="font-semibold">{labels.location}:</span> {item.unionWard} | {item.area}
                        </p>
                        <p>
                          <span className="font-semibold">{labels.consent}:</span> {item.consentGiven ? labels.yes : labels.no}
                        </p>
                        <p>
                          <span className="font-semibold">{labels.privacy}:</span> {item.isPrivate ? labels.yes : labels.no}
                        </p>
                      </div>

                      {item.attachmentUrl ? (
                        <a href={item.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-brand-green underline-offset-4 hover:underline">
                          {isBangla ? "সংযুক্তি দেখুন" : "View attachment"}
                        </a>
                      ) : null}

                      <div className="mt-3 rounded-xl border border-brand-ink/10 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/55">{labels.message}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-brand-ink/85">{item.message}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          ) : null}

          {activeView === "chatbot" ? (
            <section className="card-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-brand-green">{labels.chatbotInbox}</h2>
                <div className="rounded-full border border-brand-ink/15 bg-white px-3 py-1 text-xs font-semibold text-brand-ink/75">
                  {labels.total}: <span className="text-brand-green">{filteredChatConversations.length}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                  placeholder={labels.chatbotSearch}
                  value={chatSearchQuery}
                  onChange={(event) => setChatSearchQuery(event.target.value)}
                  className={inputClassName}
                />
                <select
                  value={chatStatusFilter}
                  onChange={(event) => setChatStatusFilter(event.target.value as ChatConversationStatus | "all")}
                  className={inputClassName}
                >
                  {chatStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {isBangla ? option.labelBn : option.labelEn}
                    </option>
                  ))}
                </select>
                <div className="rounded-xl border border-brand-ink/15 bg-white px-3 py-2 text-sm text-brand-ink/70">
                  {labels.chatRequiresManual}:{" "}
                  <span className="font-bold text-brand-red">
                    {filteredChatConversations.filter((entry) => entry.requiresManualReply).length}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {chatStatusOptions.map((option) => (
                  <span key={option.value} className="rounded-full border border-brand-ink/15 bg-white px-3 py-1 text-xs">
                    {isBangla ? option.labelBn : option.labelEn}:{" "}
                    <span className="font-semibold text-brand-green">
                      {chatStatusCounts[option.value]}
                    </span>
                  </span>
                ))}
              </div>

              {chatStatusMessage ? <p className="mt-3 text-sm text-brand-ink/80">{chatStatusMessage}</p> : null}

              <div className="mt-4 space-y-4">
                {filteredChatConversations.length === 0 ? (
                  <p className="text-sm text-brand-ink/70">{labels.chatNoData}</p>
                ) : (
                  filteredChatConversations.map((entry) => {
                    const pending = mutatingChatId === entry.id;
                    const recentMessages = entry.messages.slice(-6);
                    return (
                      <article key={entry.id} className="rounded-2xl border border-brand-ink/10 bg-white p-4 shadow-[0_6px_20px_rgba(16,34,24,0.06)]">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-brand-green">{entry.name}</p>
                            <p className="mt-1 text-xs text-brand-ink/60">{new Date(entry.updatedAt).toLocaleString(isBangla ? "bn-BD" : "en-US")}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${chatStatusBadgeClass(entry.status)}`}>
                              {chatStatusLabel(entry.status, isBangla)}
                            </span>
                            <select
                              value={entry.status}
                              onChange={(event) => void onChangeChatStatus(entry.id, event.target.value as ChatConversationStatus)}
                              disabled={pending}
                              className="rounded-full border border-brand-ink/20 bg-white px-3 py-1 text-xs"
                            >
                              {chatStatusOptions
                                .filter((option) => option.value !== "all")
                                .map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {isBangla ? option.labelBn : option.labelEn}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 rounded-xl border border-brand-ink/10 bg-slate-50/80 p-3 text-xs text-brand-ink/80 md:grid-cols-2">
                          <p>
                            <span className="font-semibold">{labels.chatFrom}:</span> {entry.name}
                          </p>
                          <p>
                            <span className="font-semibold">{labels.chatContact}:</span> {entry.phone || entry.email || "-"}
                          </p>
                          <p className="md:col-span-2">
                            <span className="font-semibold">{labels.chatCategory}:</span> {chatCategoryLabel(entry.category, isBangla)}
                          </p>
                          <p className="md:col-span-2">
                            <span className="font-semibold">{labels.chatRequiresManual}:</span> {entry.requiresManualReply ? labels.yes : labels.no}
                          </p>
                        </div>

                        <div className="mt-3 rounded-xl border border-brand-ink/10 bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/55">{labels.chatConversation}</p>
                          <div className="mt-2 space-y-2">
                            {recentMessages.map((message) => (
                              <p
                                key={message.id}
                                className={`max-w-[92%] rounded-xl px-3 py-2 text-sm ${
                                  message.sender === "user"
                                    ? "ml-auto bg-brand-red/12 text-brand-ink"
                                    : message.sender === "admin"
                                      ? "bg-brand-green/10 text-brand-ink"
                                      : "bg-slate-100 text-brand-ink/90"
                                }`}
                              >
                                {message.text}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 lg:grid-cols-[1fr,auto]">
                          <textarea
                            value={chatReplyDraftById[entry.id] || ""}
                            onChange={(event) =>
                              setChatReplyDraftById((prev) => ({
                                ...prev,
                                [entry.id]: event.target.value
                              }))
                            }
                            rows={2}
                            placeholder={labels.chatReply}
                            className={inputClassName}
                          />
                          <button
                            type="button"
                            disabled={pending || !(chatReplyDraftById[entry.id] || "").trim()}
                            onClick={() => void onSendChatReply(entry.id)}
                            className="rounded-full bg-brand-green px-4 py-2 text-sm font-bold text-white disabled:opacity-60 lg:self-center"
                          >
                            {labels.chatSendReply}
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          ) : null}

          {activeView === "users" && role === "admin" ? (
            <section className="card-surface p-6">
              <h2 className="text-xl font-bold text-brand-green">{labels.users}</h2>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <input
                  placeholder={isBangla ? "নাম" : "Name"}
                  value={newUser.name}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))}
                  className={inputClassName}
                />
                <input
                  placeholder={isBangla ? "ইমেইল" : "Email"}
                  value={newUser.email}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))}
                  className={inputClassName}
                />
                <input
                  placeholder={isBangla ? "পাসওয়ার্ড" : "Password"}
                  type="password"
                  value={newUser.password}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))}
                  className={inputClassName}
                />
                <select
                  value={newUser.role}
                  onChange={(event) => setNewUser((prev) => ({ ...prev, role: event.target.value as UserRole }))}
                  className={inputClassName}
                >
                  <option value="editor">{labels.userRole}: {labels.roleEditor}</option>
                  <option value="admin">{labels.userRole}: {labels.roleAdmin}</option>
                </select>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button disabled={creatingUser} onClick={createUser} className="rounded-full bg-brand-green px-5 py-2 text-sm font-bold text-white disabled:opacity-70">
                  {creatingUser ? labels.saving : labels.addUser}
                </button>
                {userStatus ? <p className="text-sm text-brand-ink/80">{userStatus}</p> : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-brand-ink/20 bg-white px-3 py-1 text-xs">
                  {labels.totalUsers}: <span className="font-semibold text-brand-green">{users.length}</span>
                </span>
                <span className="rounded-full border border-brand-ink/20 bg-white px-3 py-1 text-xs">
                  {labels.activeUsers}: <span className="font-semibold text-brand-green">{users.filter((entry) => entry.isActive).length}</span>
                </span>
                <span className="rounded-full border border-brand-ink/20 bg-white px-3 py-1 text-xs">
                  {labels.admins}:{" "}
                  <span className="font-semibold text-brand-green">{users.filter((entry) => entry.role === "admin" && entry.isActive).length}</span>
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {sortedUsers.map((user) => {
                  const resetValue = resetPasswordByUserId[user.id] ?? "";
                  const roleDraft = roleDraftByUserId[user.id] ?? user.role;
                  const pending = mutatingUserId === user.id;
                  return (
                    <article key={user.id} className="rounded-2xl border border-brand-ink/10 bg-white p-4 shadow-[0_6px_20px_rgba(16,34,24,0.06)]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-brand-green">{user.name}</p>
                          <p className="text-sm text-brand-ink/70">{user.email}</p>
                          <p className="mt-1 text-xs text-brand-ink/55">
                            {labels.createdAt}: {new Date(user.createdAt).toLocaleString(isBangla ? "bn-BD" : "en-US")}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-brand-ink/20 bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-ink">
                            {roleLabel(user.role, isBangla)}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              user.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-700"
                            }`}
                          >
                            {user.isActive ? labels.statusActive : labels.statusInactive}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-xl border border-brand-ink/10 bg-brand-surface/70 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/60">{labels.updateRole}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <select
                              value={roleDraft}
                              onChange={(event) =>
                                setRoleDraftByUserId((prev) => ({
                                  ...prev,
                                  [user.id]: event.target.value as UserRole
                                }))
                              }
                              className={`${inputClassName} min-w-[160px]`}
                              disabled={pending}
                            >
                              <option value="editor">{labels.roleEditor}</option>
                              <option value="admin">{labels.roleAdmin}</option>
                            </select>
                            <button
                              type="button"
                              disabled={pending || roleDraft === user.role}
                              onClick={() => void updateUser(user.id, { role: roleDraft })}
                              className="rounded-full border border-brand-green/40 px-4 py-2 text-xs font-bold text-brand-green disabled:opacity-60"
                            >
                              {labels.updateRole}
                            </button>
                          </div>
                        </div>

                        <div className="rounded-xl border border-brand-ink/10 bg-brand-surface/70 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/60">{labels.resetPassword}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <input
                              type="password"
                              minLength={8}
                              value={resetValue}
                              onChange={(event) =>
                                setResetPasswordByUserId((prev) => ({
                                  ...prev,
                                  [user.id]: event.target.value
                                }))
                              }
                              placeholder={labels.newPassword}
                              className={`${inputClassName} min-w-[180px]`}
                              disabled={pending}
                            />
                            <button
                              type="button"
                              disabled={pending || resetValue.trim().length < 8}
                              onClick={() => void updateUser(user.id, { newPassword: resetValue.trim() })}
                              className="rounded-full border border-brand-green/40 px-4 py-2 text-xs font-bold text-brand-green disabled:opacity-60"
                            >
                              {labels.resetPassword}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => void updateUser(user.id, { isActive: !user.isActive })}
                          className="rounded-full border border-brand-ink/25 px-4 py-1.5 text-xs font-semibold text-brand-ink disabled:opacity-60"
                        >
                          {user.isActive ? labels.deactivate : labels.activate}
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => void removeUser(user.id)}
                          className="rounded-full border border-brand-red/35 px-4 py-1.5 text-xs font-semibold text-brand-red disabled:opacity-60"
                        >
                          {labels.removeUser}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}


