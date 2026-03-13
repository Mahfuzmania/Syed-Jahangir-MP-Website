import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="card-surface mx-auto mt-10 max-w-xl p-8 text-center">
      <h1 className="text-2xl font-bold text-brand-green">Page Not Found</h1>
      <p className="mt-2 text-sm text-brand-ink/70">The requested page could not be found.</p>
      <Link href="/bn" className="mt-4 inline-flex rounded-full bg-brand-green px-5 py-2 text-sm font-bold text-white">
        Back to Home
      </Link>
    </div>
  );
}
