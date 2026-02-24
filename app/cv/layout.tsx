import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "CV Profesional",
  description:
    "Perfil profesional de Eduardo Rico Sotomayor: Data Scientist, Python Developer y creador de cursos interactivos.",
  alternates: {
    canonical: "/cv",
  },
  openGraph: {
    type: "profile",
    url: `${siteUrl}/cv`,
    title: "CV Profesional | Eduardo Rico",
    description:
      "Experiencia, proyectos y habilidades de Eduardo Rico en Python, data science e IA.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CV Profesional | Eduardo Rico",
    description:
      "Experiencia, proyectos y habilidades de Eduardo Rico en Python, data science e IA.",
  },
};

export default function CvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
