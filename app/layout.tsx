// Impor tipe Metadata dari Next.js untuk pendefinisian SEO
import type { Metadata } from "next";
// Impor font Inter dari Google Fonts untuk tipografi aplikasi
import { Inter } from "next/font/google";
// Impor file CSS global untuk styling dasar aplikasi
import "./globals.css";

// Inisialisasi font Inter dengan pengaturan variabel CSS dan subset latin
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

// Definisi objek metadata untuk optimasi SEO dan media sosial (OpenGraph)
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

// Komponen RootLayout yang membungkus seluruh halaman aplikasi
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Mengatur bahasa ke Indonesia (id) dan menerapkan font serta antialiasing
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      {/* Body dengan tinggi minimal satu layar penuh dan layout flexbox */}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
