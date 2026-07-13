"use client";

import Link from "next/link";

export default function SetupPage() {
  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            KariyerRadarı
          </Link>
          <ul className="navbar-links">
            <li><Link href="/setup/">Kurulum</Link></li>
            <li><Link href="/dashboard/">Dashboard</Link></li>
            <li><Link href="/cv-builder/">CV Builder</Link></li>
          </ul>
        </div>
      </nav>

      <div className="page-header">
        <div className="container container-narrow">
          <h1 className="page-title">Kurulum Rehberi</h1>
          <p className="page-subtitle">
            Adım adım KariyerRadarı&apos;nı kurun. Toplam süre: ~10 dakika. Tüm
            araçlar tamamen ücretsizdir.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="container container-narrow">
          <div className="setup-steps">
            {/* Adım 1: GitHub Fork */}
            <div className="setup-step">
              <h3 className="setup-step-title">GitHub&apos;dan Fork Edin</h3>
              <div className="setup-step-content">
                <ol>
                  <li>
                    <a
                      href="https://github.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      KariyerRadarı GitHub sayfasına
                    </a>{" "}
                    gidin
                  </li>
                  <li>
                    Sağ üstteki <strong>&quot;Fork&quot;</strong> butonuna tıklayın
                  </li>
                  <li>Kendi hesabınıza fork oluşturun</li>
                  <li>
                    Fork&apos;unuzu bilgisayarınıza klonlayın:{" "}
                    <code>git clone https://github.com/KULLANICI/KariyerRadarı.git</code>
                  </li>
                </ol>
              </div>
            </div>

            {/* Adım 2: Supabase */}
            <div className="setup-step">
              <h3 className="setup-step-title">Supabase Veritabanı Kurulumu</h3>
              <div className="setup-step-content">
                <ol>
                  <li>
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      supabase.com
                    </a>{" "}
                    adresine gidin ve ücretsiz hesap açın
                  </li>
                  <li>
                    <strong>&quot;New Project&quot;</strong> butonuna tıklayın
                  </li>
                  <li>
                    Proje adı: <code>KariyerRadarı</code>, şifre belirleyin,
                    bölge: <strong>EU (Frankfurt)</strong> seçin
                  </li>
                  <li>
                    Sol menüden <strong>SQL Editor</strong>&apos;e gidin
                  </li>
                  <li>
                    Projedeki{" "}
                    <code>supabase/migrations/001_initial_schema.sql</code>{" "}
                    dosyasının içeriğini kopyalayıp çalıştırın
                  </li>
                  <li>
                    Sol menüden <strong>Settings → API</strong> bölümüne gidin
                  </li>
                  <li>
                    <strong>Project URL</strong> ve <strong>anon (public) key</strong>{" "}
                    değerlerini not edin
                  </li>
                  <li>
                    Ayrıca <strong>service_role key</strong>&apos;i de not edin
                    (bu key GitHub Actions secrets&apos;e eklenecek)
                  </li>
                </ol>
                <div
                  className="card"
                  style={{
                    marginTop: "var(--space-md)",
                    padding: "var(--space-md)",
                    borderColor: "rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <p style={{ fontSize: "0.85rem", color: "var(--accent-warning)" }}>
                    service_role key çok güçlü bir anahtardır.
                    Asla frontend kodunda kullanmayın! Sadece GitHub Actions
                    secrets&apos;e ekleyin.
                  </p>
                </div>
              </div>
            </div>

            {/* Adım 3: Telegram */}
            <div className="setup-step">
              <h3 className="setup-step-title">Telegram Bot Kurulumu</h3>
              <div className="setup-step-content">
                <ol>
                  <li>
                    Telegram uygulamasını açın ve arama çubuğuna{" "}
                    <code>@BotFather</code> yazın
                  </li>
                  <li>
                    BotFather&apos;ı açıp <strong>&quot;Start&quot;</strong> butonuna
                    tıklayın
                  </li>
                  <li>
                    <code>/newbot</code> komutunu gönderin
                  </li>
                  <li>
                    Bot için bir ad girin (örn:{" "}
                    <code>KariyerRadarı İş İlanları</code>)
                  </li>
                  <li>
                    Bot için benzersiz bir kullanıcı adı girin (örn:{" "}
                    <code>my_kariyerradari_bot</code>) — sonu <code>_bot</code>{" "}
                    ile bitmeli
                  </li>
                  <li>
                    BotFather size bir <strong>HTTP API Token</strong> verecek.
                    Bu token&apos;ı kopyalayın
                  </li>
                </ol>

                <h4 style={{ marginTop: "var(--space-lg)", marginBottom: "var(--space-sm)", fontSize: "1rem" }}>
                  Chat ID&apos;nizi Öğrenin
                </h4>
                <ol>
                  <li>
                    Telegram&apos;da <code>@userinfobot</code> adlı botu arayın
                  </li>
                  <li>
                    <code>/start</code> komutunu gönderin
                  </li>
                  <li>
                    Bot size <strong>Chat ID</strong>&apos;nizi söyleyecek (örn:{" "}
                    <code>123456789</code>)
                  </li>
                  <li>
                    Son olarak, az önce oluşturduğunuz kendi botunuza gidin ve{" "}
                    <code>/start</code> yazın (botu aktifleştirmek için gerekli)
                  </li>
                </ol>
              </div>
            </div>

            {/* Adım 4: Gemini */}
            <div className="setup-step">
              <h3 className="setup-step-title">Gemini API Key (AI Özellikleri)</h3>
              <div className="setup-step-content">
                <ol>
                  <li>
                    <a
                      href="https://aistudio.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google AI Studio
                    </a>{" "}
                    adresine gidin
                  </li>
                  <li>Google hesabınızla giriş yapın</li>
                  <li>
                    <strong>&quot;Get API Key&quot;</strong> butonuna tıklayın
                  </li>
                  <li>
                    <strong>&quot;Create API Key&quot;</strong> → mevcut bir Google Cloud
                    projesi seçin veya yeni oluşturun
                  </li>
                  <li>Oluşturulan API key&apos;i kopyalayın</li>
                </ol>
                <div
                  className="card"
                  style={{
                    marginTop: "var(--space-md)",
                    padding: "var(--space-md)",
                    borderColor: "rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <p style={{ fontSize: "0.85rem", color: "var(--accent-success)" }}>
                    Gemini API ücretsiz katmanda günde ~1500 istek ve 250K
                    token/dakika kullanım hakkı sunar. İş ilanı özetleme ve CV
                    oluşturma için fazlasıyla yeterli!
                  </p>
                </div>
              </div>
            </div>

            {/* Adım 5: Resend */}
            <div className="setup-step">
              <h3 className="setup-step-title">
                Resend E-posta API (Opsiyonel)
              </h3>
              <div className="setup-step-content">
                <p style={{ marginBottom: "var(--space-sm)" }}>
                  E-posta bildirimi almak istiyorsanız:
                </p>
                <ol>
                  <li>
                    <a
                      href="https://resend.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      resend.com
                    </a>{" "}
                    gidin ve ücretsiz hesap açın
                  </li>
                  <li>
                    Dashboard&apos;tan <strong>API Key</strong> oluşturun
                  </li>
                  <li>
                    Test aşamasında{" "}
                    <code>onboarding@resend.dev</code> adresinden
                    gönderebilirsiniz
                  </li>
                  <li>
                    Kendi domain&apos;inizi doğrulamak isterseniz{" "}
                    <strong>Domains</strong> bölümünden DNS ayarlarını yapın
                  </li>
                </ol>
                <div
                  className="card"
                  style={{
                    marginTop: "var(--space-md)",
                    padding: "var(--space-md)",
                    borderColor: "rgba(6, 182, 212, 0.3)",
                  }}
                >
                  <p style={{ fontSize: "0.85rem", color: "var(--accent-secondary)" }}>
                    Resend ücretsiz katman: Günde 100, ayda 3000 e-posta.
                    Sadece Telegram kullanacaksanız bu adımı atlayabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Adım 6: GitHub Actions Secrets */}
            <div className="setup-step">
              <h3 className="setup-step-title">
                GitHub Actions Secrets Ayarlayın
              </h3>
              <div className="setup-step-content">
                <ol>
                  <li>
                    Fork&apos;ladığınız GitHub repo&apos;suna gidin
                  </li>
                  <li>
                    <strong>Settings → Secrets and variables → Actions</strong>{" "}
                    bölümüne gidin
                  </li>
                  <li>
                    <strong>&quot;New repository secret&quot;</strong> butonuyla aşağıdaki
                    key&apos;leri ekleyin:
                  </li>
                </ol>
                <div
                  style={{
                    marginTop: "var(--space-md)",
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.85rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: "1px solid var(--border-light)",
                        }}
                      >
                        <th
                          style={{
                            textAlign: "left",
                            padding: "var(--space-sm)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Secret Adı
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "var(--space-sm)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Değer
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["SUPABASE_URL", "Supabase Project URL"],
                        ["SUPABASE_SERVICE_ROLE_KEY", "Supabase service_role key"],
                        ["TELEGRAM_BOT_TOKEN", "BotFather'dan aldığınız token"],
                        ["GEMINI_API_KEY", "Google AI Studio API key"],
                        ["RESEND_API_KEY", "Resend API key (opsiyonel)"],
                      ].map(([name, desc], i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: "1px solid var(--border-subtle)",
                          }}
                        >
                          <td
                            style={{
                              padding: "var(--space-sm)",
                              fontFamily: "var(--font-mono)",
                              color: "var(--accent-primary-light)",
                            }}
                          >
                            {name}
                          </td>
                          <td
                            style={{
                              padding: "var(--space-sm)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Adım 7: Netlify Deploy */}
            <div className="setup-step">
              <h3 className="setup-step-title">Netlify&apos;a Deploy Edin</h3>
              <div className="setup-step-content">
                <ol>
                  <li>
                    <a
                      href="https://app.netlify.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Netlify
                    </a>{" "}
                    hesabı açın (GitHub ile giriş yapabilirsiniz)
                  </li>
                  <li>
                    <strong>&quot;Add new site&quot; → &quot;Import an existing project&quot;</strong>
                  </li>
                  <li>GitHub&apos;dan fork&apos;unuzu seçin</li>
                  <li>
                    Build ayarları:
                    <ul>
                      <li>
                        Base directory: <code>frontend</code>
                      </li>
                      <li>
                        Build command: <code>npm run build</code>
                      </li>
                      <li>
                        Publish directory: <code>frontend/out</code>
                      </li>
                    </ul>
                  </li>
                  <li>
                    Environment variables bölümüne Supabase URL ve anon key
                    ekleyin (opsiyonel)
                  </li>
                  <li>
                    <strong>&quot;Deploy site&quot;</strong> butonuna tıklayın
                  </li>
                </ol>
              </div>
            </div>

            {/* Adım 8: Test */}
            <div className="setup-step">
              <h3 className="setup-step-title">Test Edin</h3>
              <div className="setup-step-content">
                <ol>
                  <li>
                    GitHub repo&apos;nuzda{" "}
                    <strong>Actions</strong> sekmesine gidin
                  </li>
                  <li>
                    <strong>&quot;Scrape Jobs & Send Notifications&quot;</strong>{" "}
                    workflow&apos;unu bulun
                  </li>
                  <li>
                    <strong>&quot;Run workflow&quot;</strong> butonuyla manuel olarak
                    tetikleyin
                  </li>
                  <li>Telegram&apos;dan ilk ilanlarınızı kontrol edin!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Dashboard'a yönlendirme */}
          <div style={{ textAlign: "center", marginTop: "var(--space-3xl)" }}>
            <Link href="/dashboard/" className="btn btn-primary btn-lg">
              Dashboard&apos;a Git
            </Link>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <p>KariyerRadarı — Açık Kaynak İş İlanı Takip Platformu</p>
        </div>
      </footer>
    </>
  );
}
