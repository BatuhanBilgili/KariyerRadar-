// ============================================
// TalentRadar — Gemini API Client (Frontend)
// ============================================
// CV Builder sayfasında kullanıcının kendi Gemini API key'i
// ile doğrudan browser'dan Gemini API'a istek atılır.

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export async function generateWithGemini(
  apiKey: string,
  prompt: string,
  model: string = "gemini-2.5-flash"
): Promise<string> {
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API hatası: ${response.status} - ${error}`);
  }

  const data: GeminiResponse = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sonuç oluşturulamadı.";
}

export function buildCVPrompt(
  jobDescription: string,
  jobTitle: string,
  company: string,
  userProfile: {
    github_url?: string;
    kaggle_url?: string;
    linkedin_url?: string;
    old_cv_text?: string;
  }
): string {
  return `Sen deneyimli bir İnsan Kaynakları uzmanı ve kariyer koçusun. Senden ATS (Applicant Tracking System) uyumlu bir CV ve Cover Letter oluşturmanı istiyorum.

## İş İlanı Bilgileri
**Pozisyon:** ${jobTitle}
**Şirket:** ${company}
**İlan Açıklaması:**
${jobDescription}

## Başvuran Kişinin Bilgileri
${userProfile.github_url ? `**GitHub:** ${userProfile.github_url}` : ""}
${userProfile.kaggle_url ? `**Kaggle:** ${userProfile.kaggle_url}` : ""}
${userProfile.linkedin_url ? `**LinkedIn:** ${userProfile.linkedin_url}` : ""}
${userProfile.old_cv_text ? `**Mevcut CV:**\n${userProfile.old_cv_text}` : ""}

## Görevin
1. İş ilanını analiz et — aranan temel beceriler, deneyim seviyesi, teknik gereksinimler neler?
2. Başvuran kişinin bilgilerini incele — hangi beceriler eşleşiyor, hangileri eksik?
3. ATS uyumlu bir CV oluştur:
   - Profesyonel özet
   - Teknik beceriler (ilanla eşleşenler öne çıksın)
   - İş deneyimi (başarı odaklı bullet point'ler)
   - Eğitim
   - Projeler (varsa GitHub/Kaggle'dan)
4. Kişiselleştirilmiş bir Cover Letter yaz:
   - İlana özel motivasyon
   - Eşleşen yetkinlikler
   - Profesyonel ve samimi ton

## Çıktı Formatı
Çıktını aşağıdaki formatta ver:

### 📊 EŞLEŞME ANALİZİ
(İlandaki gereksinimler vs. kişinin yetkinlikleri — kısa tablo)

### 📄 CV
(ATS uyumlu, Markdown formatında)

### ✉️ COVER LETTER
(Kişiselleştirilmiş, Markdown formatında)
`;
}

export function buildSummaryPrompt(jobDescription: string): string {
  return `Bu iş ilanını 3-4 cümle ile Türkçe olarak özetle. Aranan temel nitelikleri, deneyim gereksinimini ve dikkat çeken noktaları belirt. Kısa ve öz ol.

İlan:
${jobDescription}`;
}
