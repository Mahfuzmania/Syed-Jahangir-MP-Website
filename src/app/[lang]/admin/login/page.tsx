import { notFound } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { isLang } from "@/lib/i18n";

export default async function AdminLoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  return <AdminLoginForm lang={lang} />;
}
