"use client";

import Link from "next/link";
import { useState, useEffect, type ChangeEvent } from "react";
import { generateWithGemini, buildCVPrompt } from "@/lib/gemini";
import { type JobListing } from "@/lib/types";

// ---- Örnek ilanlar (demo data) ----
const DEMO_JOBS: JobListing[] = [
  {
    id: "1",
    platform: "linkedin",
    title: "Senior Software Engineer — Backend",
    company: "Trendyol",
    location: "Istanbul, Turkey",
    work_type: "hybrid",
    url: "https://linkedin.com/jobs/1",
    description: "Backend development with Go and Kubernetes...",
    ai_summary: "Trendyol, İstanbul merkezli backend pozisyonu. Go, Kubernetes ve mikroservis deneyimi arıyor. Minimum 5 yıl deneyim gerekli. Hybrid çalışma modeli.",
    external_id: "linkedin_1",
    posted_at: "2026-07-13T09:00:00Z",
    scraped_at: "2026-07-13T10:00:00Z",
  },
  {
    id: "2",
    platform: "indeed",
    title: "Data Scientist — ML Platform",
    company: "Getir",
    location: "Istanbul, Turkey",
    work_type: "remote",
    url: "https://indeed.com/jobs/2",
    description: "Machine learning platform development...",
    ai_summary: "Getir ML Platform ekibine katılacak Data Scientist arıyor. Python, TensorFlow, MLOps deneyimi isteniyor. Full remote çalışma imkanı. Rekabetçi maaş.",
    external_id: "indeed_1",
    posted_at: "2026-07-13T08:00:00Z",
    scraped_at: "2026-07-13T10:00:00Z",
  },
  {
    id: "3",
    platform: "itu",
    title: "Yazılım Geliştirici — Startup",
    company: "TechX Yazılım A.Ş.",
    location: "İTÜ Arı Teknokent",
    work_type: "onsite",
    url: "https://kariyer.ariteknokent.com.tr/ilan/3",
    description: "Full stack web development...",
    ai_summary: "İTÜ Arı Teknokent bünyesindeki startup, React ve Node.js bilen full stack geliştirici arıyor. Mezun veya son sınıf öğrencileri de başvurabilir.",
    external_id: "itu_3",
    posted_at: "2026-07-12T14:00:00Z",
    scraped_at: "2026-07-13T10:00:00Z",
  },
];

export default function CVBuilderPage() {
  // Form state
  const [geminiKey, setGeminiKey] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [kaggleUrl, setKaggleUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [oldCvText, setOldCvText] = useState("");

  // Options state
  const [createCV, setCreateCV] = useState(true);
  const [createCoverLetter, setCreateCoverLetter] = useState(true);

  // Output state
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load profile settings & URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load saved profile data
      setGeminiKey(localStorage.getItem("tr_gemini_api_key") || "");
      setGithubUrl(localStorage.getItem("tr_github_url") || "");
      setKaggleUrl(localStorage.getItem("tr_kaggle_url") || "");
      setLinkedinUrl(localStorage.getItem("tr_linkedin_url") || "");
      setOldCvText(localStorage.getItem("tr_old_cv_text") || "");

      // Check URL parameters for job details
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get("jobId");
      if (jobId) {
        const foundJob = DEMO_JOBS.find((j) => j.id === jobId);
        if (foundJob) {
          setJobTitle(foundJob.title);
          setCompany(foundJob.company || "");
          setJobDescription(foundJob.description || foundJob.ai_summary || "");
        } else {
          fetchJobFromSupabase(jobId);
        }
      }
    }
  }, []);

  const fetchJobFromSupabase = async (id: string) => {
    try {
      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("job_listings")
        .select("*")
        .eq("id", id)
        .single();

      if (data && !error) {
        setJobTitle(data.title);
        setCompany(data.company || "");
        setJobDescription(data.description || data.ai_summary || "");
      }
    } catch (e) {
      console.error("Supabase'den ilan çekilemedi:", e);
    }
  };

  const generateCV = async () => {
    if (!geminiKey.trim()) {
      setError("Lütfen Gemini API Key girin veya Dashboard'da profilinize kaydedin.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Lütfen iş ilanı açıklamasını girin.");
      return;
    }
    if (!createCV && !createCoverLetter) {
      setError("Lütfen en az bir oluşturma seçeneği (CV veya Kapak Mektubu) seçin.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      let prompt = "";
      if (createCV && createCoverLetter) {
        prompt = buildCVPrompt(jobDescription, jobTitle, company, {
          github_url: githubUrl,
          kaggle_url: kaggleUrl,
          linkedin_url: linkedinUrl,
          old_cv_text: oldCvText,
        });
      } else if (createCV) {
        prompt = `Sen deneyimli bir İnsan Kaynakları uzmanı ve kariyer koçusun. Senden ATS (Applicant Tracking System) uyumlu bir CV oluşturmanı istiyorum.\n\nİş İlanı: ${jobTitle} @ ${company}\nAçıklama: ${jobDescription}\n\nKişisel Bilgiler:\nGitHub: ${githubUrl}\nKaggle: ${kaggleUrl}\nLinkedIn: ${linkedinUrl}\n\nMevcut CV: ${oldCvText}\n\nLütfen sadece ATS uyumlu, Markdown formatında bir CV oluştur. Başlık olarak ### 📄 CV kullan.`;
      } else {
        prompt = `Sen deneyimli bir İnsan Kaynakları uzmanısın. Senden bu iş ilanına özel profesyonel bir Kapak Mektubu (Cover Letter) oluşturmanı istiyorum.\n\nİş İlanı: ${jobTitle} @ ${company}\nAçıklama: ${jobDescription}\n\nKişisel Bilgiler:\nGitHub: ${githubUrl}\nKaggle: ${kaggleUrl}\nLinkedIn: ${linkedinUrl}\n\nMevcut CV: ${oldCvText}\n\nLütfen sadece Markdown formatında, ilana özel yazılmış bir Cover Letter oluştur. Başlık olarak ### ✉️ COVER LETTER kullan.`;
      }

      const output = await generateWithGemini(geminiKey, prompt);
      setResult(output);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Bir hata oluştu. API key'inizi veya bağlantınızı kontrol edin."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
  };

  const loadMarkedAndHtml2Pdf = (): Promise<{ marked: any, html2pdf: any }> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return reject();
      
      const loadScript = (src: string): Promise<void> => {
        return new Promise((res, rej) => {
          if (document.querySelector(`script[src="${src}"]`)) return res();
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => res();
          script.onerror = rej;
          document.head.appendChild(script);
        });
      };

      Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/marked/4.3.0/marked.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js")
      ]).then(() => {
        resolve({
          marked: (window as any).marked,
          html2pdf: (window as any).html2pdf
        });
      }).catch(reject);
    });
  };

  const downloadPDFFile = async () => {
    if (!result) return;
    try {
      const { marked, html2pdf } = await loadMarkedAndHtml2Pdf();
      
      // Convert Markdown to HTML
      const htmlContent = marked.parse(result);
      
      // Create temporary container
      const element = document.createElement("div");
      element.innerHTML = htmlContent;
      
      // Styling rules for clean resume layout
      element.style.padding = "30px";
      element.style.color = "#1f2937";
      element.style.backgroundColor = "#ffffff";
      element.style.fontFamily = "'Inter', sans-serif";
      element.style.fontSize = "11px";
      element.style.lineHeight = "1.5";
      
      const headers = element.querySelectorAll("h1, h2, h3, h4");
      headers.forEach((h: any) => {
        h.style.color = "#111827";
        h.style.borderBottom = "1px solid #e5e7eb";
        h.style.paddingBottom = "4px";
        h.style.marginTop = "16px";
        h.style.marginBottom = "8px";
        h.style.fontWeight = "700";
      });
      
      const lists = element.querySelectorAll("ul, ol");
      lists.forEach((l: any) => {
        l.style.paddingLeft = "16px";
        l.style.marginBottom = "8px";
      });

      const opt = {
        margin: 10,
        filename: `${company.toLowerCase().replace(/[^a-z0-9]/g, "_")}_basvuru_belgeleri.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(element).set(opt).save();
    } catch (err) {
      alert("PDF yükleyici hazırlanamadı. Lütfen internet bağlantınızı kontrol edin.");
    }
  };

  const downloadMDFile = () => {
    const element = document.createElement("a");
    const file = new Blob([result], { type: "text/markdown;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    const fileName = `${company.toLowerCase().replace(/[^a-z0-9]/g, "_")}_basvuru_belgeleri.md`;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
        <div className="container">
          <h1 className="page-title">AI CV & Cover Letter Builder</h1>
          <p className="page-subtitle">
            İş ilanını yapıştırın veya listeden seçin. Profil bilgileriniz otomatik doldurulur ve ATS uyumlu belgeler oluşturulur.
          </p>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="grid-2">
            {/* Sol: Form */}
            <div>
              {/* API Key */}
              <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
                <h3 style={{ marginBottom: "var(--space-lg)", fontWeight: 700 }}>
                  Gemini API Key
                </h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="gemini-key">API Key</label>
                  <input
                    id="gemini-key"
                    type="password"
                    className="form-input"
                    placeholder="AIzaSy..."
                    value={geminiKey}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setGeminiKey(e.target.value)}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "var(--space-xs)" }}>
                    Profil bilgileriniz ve API anahtarınız tarayıcınızda (localStorage) saklanır.
                  </p>
                </div>
              </div>

              {/* Seçenekler */}
              <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
                <h3 style={{ marginBottom: "var(--space-lg)", fontWeight: 700 }}>
                  Oluşturulacak Belgeler
                </h3>
                <div className="form-group" style={{ display: "flex", gap: "var(--space-xl)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <input
                      type="checkbox"
                      id="opt-cv"
                      checked={createCV}
                      onChange={(e) => setCreateCV(e.target.checked)}
                      style={{ transform: "scale(1.2)", cursor: "pointer" }}
                    />
                    <label htmlFor="opt-cv" style={{ cursor: "pointer", fontWeight: 600 }}>ATS CV</label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <input
                      type="checkbox"
                      id="opt-cover"
                      checked={createCoverLetter}
                      onChange={(e) => setCreateCoverLetter(e.target.checked)}
                      style={{ transform: "scale(1.2)", cursor: "pointer" }}
                    />
                    <label htmlFor="opt-cover" style={{ cursor: "pointer", fontWeight: 600 }}>Cover Letter (Kapak Mektubu)</label>
                  </div>
                </div>
              </div>

              {/* İlan Bilgileri */}
              <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
                <h3 style={{ marginBottom: "var(--space-lg)", fontWeight: 700 }}>
                  İş İlanı Bilgileri
                </h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="job-title">Pozisyon Adı</label>
                  <input
                    id="job-title"
                    type="text"
                    className="form-input"
                    placeholder="Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="company-name">Şirket</label>
                  <input
                    id="company-name"
                    type="text"
                    className="form-input"
                    placeholder="Google, Trendyol, ..."
                    value={company}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="job-desc">İlan Açıklaması</label>
                  <textarea
                    id="job-desc"
                    className="form-textarea"
                    placeholder="İş ilanının tam metnini buraya yapıştırın..."
                    value={jobDescription}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
                    style={{ minHeight: "200px" }}
                  />
                </div>
              </div>

              {/* Profil Bilgileri */}
              <div className="card" style={{ marginBottom: "var(--space-xl)" }}>
                <h3 style={{ marginBottom: "var(--space-lg)", fontWeight: 700 }}>
                  Profil Bilgileriniz
                </h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="cv-github">GitHub URL</label>
                  <input
                    id="cv-github"
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/username"
                    value={githubUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setGithubUrl(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cv-kaggle">Kaggle URL</label>
                  <input
                    id="cv-kaggle"
                    type="url"
                    className="form-input"
                    placeholder="https://kaggle.com/username"
                    value={kaggleUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setKaggleUrl(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cv-linkedin">LinkedIn URL</label>
                  <input
                    id="cv-linkedin"
                    type="url"
                    className="form-input"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedinUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLinkedinUrl(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="cv-old">Mevcut CV (Metin)</label>
                  <textarea
                    id="cv-old"
                    className="form-textarea"
                    placeholder="Mevcut CV'nizin içeriği..."
                    value={oldCvText}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setOldCvText(e.target.value)}
                    style={{ minHeight: "150px" }}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                className="btn btn-primary btn-lg"
                onClick={generateCV}
                disabled={loading}
                type="button"
                style={{ width: "100%" }}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner" style={{ width: 18, height: 18 }} />
                    AI Belgeleri Oluşturuyor...
                  </>
                ) : (
                  "CV & Cover Letter Oluştur"
                )}
              </button>

              {error && (
                <div
                  className="card"
                  style={{
                    marginTop: "var(--space-md)",
                    padding: "var(--space-md)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                  }}
                >
                  <p style={{ color: "var(--accent-danger)", fontSize: "0.9rem" }}>
                    {error}
                  </p>
                </div>
              )}
            </div>

            {/* Sağ: Sonuç */}
            <div>
              <div className="card" style={{ position: "sticky", top: "80px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-lg)" }}>
                  <h3 style={{ fontWeight: 700 }}>Sonuç</h3>
                  {result && (
                    <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={copyToClipboard}
                        type="button"
                      >
                        Kopyala
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={downloadPDFFile}
                        type="button"
                      >
                        PDF İndir
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={downloadMDFile}
                        type="button"
                      >
                        Markdown İndir
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div className="empty-state" style={{ padding: "var(--space-3xl) 0" }}>
                    <div className="loading-dots" style={{ justifyContent: "center", display: "flex", marginBottom: "var(--space-md)" }}>
                      <span />
                      <span />
                      <span />
                    </div>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Yapay zeka belgelerinizi oluşturuyor...
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "var(--space-sm)" }}>
                      Bu işlem 15-30 saniye sürebilir.
                    </p>
                  </div>
                ) : result ? (
                  <div className="cv-output" style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-sans)", maxHeight: "600px", overflowY: "auto" }}>
                    {result}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h4 className="empty-state-title">Henüz Sonuç Yok</h4>
                    <p className="empty-state-desc">
                      Sol taraftaki formu doldurup veya bir ilandan yönlenip &quot;CV & Cover Letter Oluştur&quot; butonuna
                      tıklayın.
                    </p>
                  </div>
                )}
              </div>
            </div>
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
