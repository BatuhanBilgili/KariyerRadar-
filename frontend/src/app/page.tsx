"use client";

import Link from "next/link";
import { PLATFORM_INFO, type Platform } from "@/lib/types";

const features = [
  {
    title: "Çoklu Platform Tarama",
    desc: "LinkedIn, Indeed, İTÜ Arı Teknokent ve Boğaziçi Kariyer platformlarından ilanları otomatik olarak çeker.",
  },
  {
    title: "AI ile İlan Özeti",
    desc: "Google Gemini AI ilanları analiz eder ve size kısa, anlaşılır özetler sunar.",
  },
  {
    title: "Telegram & E-posta Bildirimi",
    desc: "İlanları istediğiniz saatte Telegram veya e-posta ile alın. Hiçbir fırsatı kaçırmayın.",
  },
  {
    title: "Tekrar Eden İlan Yok",
    desc: "Akıllı veritabanı ile daha önce gördüğünüz ilanlar tekrar gönderilmez.",
  },
  {
    title: "AI CV & Cover Letter",
    desc: "İlana özel ATS uyumlu CV ve kapak mektubu oluşturun. Yapay zeka İK uzmanı gibi çalışır.",
  },
  {
    title: "%100 Ücretsiz & Açık Kaynak",
    desc: "Tüm araçlar ücretsiz katmanlarda çalışır. Kendi sunucunuzu kurun, verileriniz sizde kalsın.",
  },
];

const platforms: Platform[] = ["linkedin", "indeed", "itu", "bogazici"];

export default function HomePage() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar" id="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <span ></span>
            KariyerRadarı
          </Link>
          <ul className="navbar-links">
            <li>
              <Link href="/setup/">Kurulum</Link>
            </li>
            <li>
              <Link href="/dashboard/">Dashboard</Link>
            </li>
            <li>
              <Link href="/cv-builder/">CV Builder</Link>
            </li>
            <li>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <div className="hero-badge">
            Açık Kaynak & Tamamen Ücretsiz
          </div>
          <h1 className="hero-title">
            İş İlanlarını{" "}
            <span className="gradient-text">Akıllıca Takip Et</span>
            <br />
            AI ile CV Oluştur
          </h1>
          <p className="hero-subtitle">
            LinkedIn, Indeed ve üniversite kariyer portallarından ilanları
            otomatik çek, Telegram ile bildirim al, yapay zeka ile ATS uyumlu CV
            oluştur — hepsi ücretsiz.
          </p>
          <div className="hero-actions">
            <Link href="/setup/" className="btn btn-primary btn-lg">
              Hemen Başla
            </Link>
            <Link href="/dashboard/" className="btn btn-secondary btn-lg">
              Dashboard
            </Link>
          </div>

          {/* Platform badges */}
          <div className="platforms-row">
            {platforms.map((p) => (
              <div key={p} className="platform-badge">
                {PLATFORM_INFO[p].name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 0 var(--space-4xl)" }}>
        <div className="container">
          <div className="stats-row">
            <div className="stat">
              <div className="stat-value">4+</div>
              <div className="stat-label">Platform</div>
            </div>
            <div className="stat">
              <div className="stat-value">AI</div>
              <div className="stat-label">Özet & CV</div>
            </div>
            <div className="stat">
              <div className="stat-value">0₺</div>
              <div className="stat-label">Tamamen Ücretsiz</div>
            </div>
            <div className="stat">
              <div className="stat-value">24/7</div>
              <div className="stat-label">Otomasyon</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="container">
          <h2 className="section-title">Neler Yapabilirsiniz?</h2>
          <p className="section-subtitle">
            KariyerRadarı, iş arama sürecinizi otomatikleştirir ve yapay zeka ile
            güçlendirir.
          </p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="card feature-card">
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "var(--space-4xl) 0" }}>
        <div className="container container-narrow">
          <h2 className="section-title">Nasıl Çalışır?</h2>
          <p className="section-subtitle">
            3 adımda kurulum yapın, gerisini KariyerRadarı halleder.
          </p>
          <div className="setup-steps">
            <div className="setup-step">
              <h3 className="setup-step-title">Fork & API Keyleri Al</h3>
              <div className="setup-step-content">
                <p>
                  GitHub&apos;dan projeyi fork edin. Supabase, Telegram Bot ve Gemini
                  API keylerinizi ücretsiz olarak alın. Adım adım rehberimiz
                  sizi yönlendirir.
                </p>
              </div>
            </div>
            <div className="setup-step">
              <h3 className="setup-step-title">Tercihlerinizi Ayarlayın</h3>
              <div className="setup-step-content">
                <p>
                  Hangi platformları takip etmek istediğinizi, arama
                  kelimelerinizi, çalışma tipinizi (Remote/Hybrid/Onsite) ve
                  bildirim saatinizi seçin.
                </p>
              </div>
            </div>
            <div className="setup-step">
              <h3 className="setup-step-title">İlanlar Kapınıza Gelsin</h3>
              <div className="setup-step-content">
                <p>
                  GitHub Actions her gün belirlediğiniz saatlerde çalışır,
                  ilanları çeker, filtreler ve size Telegram veya e-posta ile
                  gönderir. AI ile CV oluşturma da dahil!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "var(--space-4xl) 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="card-glass" style={{ padding: "var(--space-3xl)", maxWidth: "700px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "var(--space-md)" }}>
              Hayalinizdeki İşi Bulmaya Hazır mısınız?
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-xl)", maxWidth: "500px", margin: "0 auto var(--space-xl)" }}>
              Kurulum 10 dakikadan az sürer. Tüm araçlar ücretsiz katmanlarda
              çalışır.
            </p>
            <Link href="/setup/" className="btn btn-primary btn-lg">
              Kuruluma Başla
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>
            KariyerRadarı — Açık Kaynak İş İlanı Takip Platformu ·{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
