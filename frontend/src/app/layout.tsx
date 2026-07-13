import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KariyerRadarı — Akıllı İş İlanı Takip & AI CV Oluşturucu",
  description:
    "LinkedIn, Indeed, İTÜ Arı Teknokent ve Boğaziçi Kariyer platformlarından iş ilanlarını otomatik takip edin. Telegram ve e-posta ile günlük bildirim alın. Yapay zeka ile ATS uyumlu CV oluşturun.",
  keywords: [
    "iş ilanı takip",
    "job tracker",
    "AI CV builder",
    "LinkedIn scraper",
    "KariyerRadarı",
    "kariyer",
    "ATS CV",
  ],
  openGraph: {
    title: "KariyerRadarı — Akıllı İş İlanı Takip",
    description:
      "İş ilanlarını otomatik takip edin, AI ile CV oluşturun.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
