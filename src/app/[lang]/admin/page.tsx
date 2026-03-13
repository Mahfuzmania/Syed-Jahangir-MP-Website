import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { isLang } from "@/lib/i18n";
import { getUserFromCookieStore } from "@/lib/auth";
import { getChatConversations, getSiteContent, getSubmissions, getUsers } from "@/lib/storage";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isBangla = lang === "bn";

  return {
    title: { absolute: isBangla ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard" },
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function AdminPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  const user = await getUserFromCookieStore();
  if (!user) {
    redirect(`/${lang}/admin/login`);
  }

  const [content, submissions, users, chatbotConversations] = await Promise.all([
    getSiteContent(),
    getSubmissions(),
    getUsers(),
    getChatConversations()
  ]);

  return (
    <AdminDashboard
      lang={lang}
      role={user.role}
      name={user.name}
      initialContent={content}
      initialSubmissions={submissions}
      initialChatbotConversations={chatbotConversations}
      initialUsers={users.map((entry) => ({
        id: entry.id,
        name: entry.name,
        email: entry.email,
        role: entry.role,
        isActive: entry.isActive,
        createdAt: entry.createdAt
      }))}
    />
  );
}
