import "./globals.css";
import type { Metadata } from "next";

import { Navbar } from "@/components/navbar/Navbar";
import { Footer } from "./components/Footer";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Eduardo Rico | Aprende a Programar",
  description: "Plataforma educativa gratuita para aprender Python, ciencia de datos e inteligencia artificial con ejercicios interactivos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
        <Providers>
          <Navbar />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
