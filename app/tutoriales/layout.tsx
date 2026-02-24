import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { IssueReportFab } from "@/components/feedback/IssueReportFab";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Tutoriales Interactivos de Programación",
  description:
    "Cursos interactivos de Python, Clojure, JavaScript, TypeScript, SQL, Go, Rust y Bash en el navegador.",
  alternates: {
    canonical: "/tutoriales",
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/tutoriales`,
    title: "Tutoriales Interactivos de Programación | Eduardo Rico",
    description:
      "Aprende múltiples lenguajes escribiendo y ejecutando código en tu navegador con retos prácticos.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tutoriales Interactivos de Programación | Eduardo Rico",
    description:
      "Aprende múltiples lenguajes escribiendo y ejecutando código en tu navegador con retos prácticos.",
  },
};

export default async function TutorialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/tutoriales");
  }

  return (
    <>
      {children}
      <IssueReportFab sourceArea="tutorials" />
    </>
  );
}
