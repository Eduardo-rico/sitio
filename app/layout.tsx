import "./globals.css";
import type { Metadata } from "next";

import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "./components/Footer";
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import { AnnouncementModals, AnnouncementToasts } from "@/components/announcement-banner";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();
const siteTitle = "Eduardo Rico | Aprende Python y Ciencia de Datos";
const siteDescription =
  "Plataforma educativa gratuita para aprender Python, ciencia de datos e inteligencia artificial con ejercicios interactivos y consola en tiempo real.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Eduardo Rico",
  },
  description: siteDescription,
  keywords: [
    "curso de python",
    "python interactivo",
    "aprender python desde cero",
    "tutoriales python",
    "data science en español",
    "inteligencia artificial",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Eduardo Rico",
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Eduardo Rico",
        url: siteUrl,
        description: siteDescription,
        inLanguage: "es-MX",
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/tutoriales`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Person",
        name: "Eduardo Rico Sotomayor",
        url: `${siteUrl}/cv`,
        sameAs: [
          "https://github.com/Eduardo-rico",
          "https://www.linkedin.com/in/eduardo-rico-sotomayor/",
        ],
        jobTitle: "Data Scientist & Python Developer",
      },
    ],
  };

  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
        <Providers>
          <AnnouncementModals />
          <AnnouncementToasts />
          <Navbar />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
