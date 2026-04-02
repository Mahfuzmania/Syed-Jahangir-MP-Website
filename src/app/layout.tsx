import type { Metadata } from "next";
import { Noto_Serif_Bengali, Plus_Jakarta_Sans } from "next/font/google";
import { getSiteUrlObject } from "@/lib/seo";
import "./globals.css";

const bangla = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla"
});

const latin = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-latin"
});

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: {
    default: "Syed Jahangir Alam, MP | Dinajpur-3",
    template: "%s | Syed Jahangir Alam, MP"
  },
  description: "Official public service portal for Syed Jahangir Alam, MP, Dinajpur-3 constituency.",
  alternates: {
    canonical: "/bn",
    languages: {
      bn: "/bn",
      en: "/en"
    }
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    url: "/bn",
    siteName: "Syed Jahangir Alam, MP",
    title: "Syed Jahangir Alam, MP | Dinajpur-3",
    description: "Official public service portal for Syed Jahangir Alam, MP, Dinajpur-3 constituency.",
    images: [
      {
        url: "/media/cover-bnp-rally.png",
        width: 1200,
        height: 630,
        alt: "Syed Jahangir Alam official portal"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Syed Jahangir Alam, MP | Dinajpur-3",
    description: "Official public service portal for Syed Jahangir Alam, MP, Dinajpur-3 constituency.",
    images: ["/media/cover-bnp-rally.png"]
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: ["/branding/site-logo-favicon.png", "/branding/site-logo.png"],
    shortcut: "/branding/site-logo-favicon.png",
    apple: "/branding/site-logo-favicon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = localStorage.getItem("theme-preference");
                  var theme = saved === "dark" ? "dark" : "light";
                  document.documentElement.setAttribute("data-theme", theme);
                } catch (e) {
                  document.documentElement.setAttribute("data-theme", "light");
                }
              })();
            `
          }}
        />
      </head>
      <body className={`${bangla.variable} ${latin.variable} font-[var(--font-bangla)]`}>
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-md bg-brand-green px-3 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
