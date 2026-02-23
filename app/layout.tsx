import "./globals.css";
import type { Metadata } from "next";

import { Navbar } from "@/components/navbar/Navbar";
import MyProfilePic from "./components/MyProfilePic";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "El blog de Eduardo Rico",
  description: "Eduardo Rico es un desarrollador web y data scientist",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="dark:bg-slate-800">
        <Providers>
          <Navbar />
          <MyProfilePic />
          {children}
        </Providers>
      </body>
    </html>
  );
}
