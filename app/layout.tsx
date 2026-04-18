import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Freetrack — Platform Freelance Terpercaya",
  description:
    "Freetrack menghubungkan freelancer profesional dan client dengan sistem manajemen proyek transparan: milestone, commitment fee, review, dan lebih banyak lagi.",
  keywords: "freelance, platform freelance, client, proyek, milestone, review",
  openGraph: {
    title: "Freetrack — Platform Freelance Terpercaya",
    description:
      "Hubungkan freelancer dan client dengan sistem manajemen proyek transparan, aman, dan profesional.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
