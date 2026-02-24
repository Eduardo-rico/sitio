import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Tutoriales Interactivos de Python",
  description:
    "Cursos de Python básico e intermedio con lecciones prácticas, consola en vivo y validación automática de retos.",
  alternates: {
    canonical: "/tutoriales",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tutoriales`,
    title: "Tutoriales Interactivos de Python | Eduardo Rico",
    description:
      "Aprende Python escribiendo y ejecutando código en tu navegador con retos prácticos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tutoriales Interactivos de Python | Eduardo Rico",
    description:
      "Aprende Python escribiendo y ejecutando código en tu navegador con retos prácticos.",
  },
};

export default function TutorialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
