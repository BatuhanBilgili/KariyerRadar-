"""
KariyerRadarı — AI CV Generator (Google Gemini)
ATS uyumlu CV ve Cover Letter oluşturur.
"""

import os
import logging

logger = logging.getLogger(__name__)


def generate_cv_and_cover_letter(
    job_title: str,
    company: str,
    job_description: str,
    user_profile: dict,
    api_key: str | None = None,
    model: str = "gemini-2.5-flash",
) -> dict | None:
    """
    İş ilanına özel ATS uyumlu CV ve Cover Letter oluşturur.

    Args:
        job_title: Pozisyon adı
        company: Şirket adı
        job_description: İlan açıklaması
        user_profile: Kullanıcının profil bilgileri
            - github_url: str
            - kaggle_url: str
            - linkedin_url: str
            - old_cv_text: str
        api_key: Gemini API key
        model: Kullanılacak Gemini modeli

    Returns:
        dict | None: {cv_markdown, cover_letter_markdown, match_analysis}
    """
    key = api_key or os.environ.get("GEMINI_API_KEY", "")
    if not key:
        logger.error("GEMINI_API_KEY bulunamadı!")
        return None

    prompt = _build_prompt(job_title, company, job_description, user_profile)

    try:
        import google.generativeai as genai

        genai.configure(api_key=key)
        gen_model = genai.GenerativeModel(model)

        response = gen_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=4096,
            ),
        )

        if response and response.text:
            result = _parse_response(response.text)
            logger.info("CV ve Cover Letter oluşturuldu.")
            return result

    except Exception as e:
        logger.error(f"Gemini CV oluşturma hatası: {e}")

    return None


def _build_prompt(
    job_title: str,
    company: str,
    job_description: str,
    user_profile: dict,
) -> str:
    """CV oluşturma prompt'unu hazırlar."""

    profile_parts = []
    if user_profile.get("github_url"):
        profile_parts.append(f"**GitHub:** {user_profile['github_url']}")
    if user_profile.get("kaggle_url"):
        profile_parts.append(f"**Kaggle:** {user_profile['kaggle_url']}")
    if user_profile.get("linkedin_url"):
        profile_parts.append(f"**LinkedIn:** {user_profile['linkedin_url']}")
    if user_profile.get("old_cv_text"):
        profile_parts.append(f"**Mevcut CV:**\n{user_profile['old_cv_text'][:5000]}")

    profile_text = "\n".join(profile_parts) if profile_parts else "Profil bilgisi verilmedi."

    return f"""Sen deneyimli bir İnsan Kaynakları uzmanı ve kariyer koçusun. Senden ATS (Applicant Tracking System) uyumlu bir CV ve Cover Letter oluşturmanı istiyorum.

## İş İlanı Bilgileri
**Pozisyon:** {job_title}
**Şirket:** {company}
**İlan Açıklaması:**
{job_description[:4000]}

## Başvuran Kişinin Bilgileri
{profile_text}

## Görevin
1. İş ilanını analiz et — aranan temel beceriler, deneyim seviyesi, teknik gereksinimler neler?
2. Başvuran kişinin bilgilerini incele — hangi beceriler eşleşiyor, hangileri eksik?
3. ATS formatına uygun bir CV oluştur:
   - Profesyonel özet (3-4 satır)
   - Teknik beceriler (ilanla eşleşenler öne çıksın)
   - İş deneyimi (başarı odaklı bullet point'ler, sayısal metrikler kullan)
   - Eğitim
   - Projeler (varsa GitHub/Kaggle'dan)
4. Kişiselleştirilmiş bir Cover Letter yaz:
   - İlana özel motivasyon
   - Eşleşen yetkinlikler
   - Profesyonel ve samimi ton

## Çıktı Formatı
Çıktını tam olarak aşağıdaki formatta ver (bu başlıkları koru):

### 📊 EŞLEŞME ANALİZİ
(İlandaki gereksinimler vs. kişinin yetkinlikleri)

### 📄 CV
(ATS uyumlu, Markdown formatında)

### ✉️ COVER LETTER
(Kişiselleştirilmiş, Markdown formatında)
"""


def _parse_response(response_text: str) -> dict:
    """Gemini çıktısını ayrıştırır."""
    result = {
        "cv_markdown": "",
        "cover_letter_markdown": "",
        "match_analysis": "",
        "full_text": response_text,
    }

    sections = {
        "match_analysis": ["EŞLEŞME ANALİZİ", "MATCH ANALYSIS"],
        "cv_markdown": ["📄 CV", "CV"],
        "cover_letter_markdown": ["COVER LETTER", "KAPAK MEKTUBU"],
    }

    text = response_text

    for key, headers in sections.items():
        for header in headers:
            marker = f"### {header}" if f"### {header}" in text else header
            if marker in text:
                start = text.index(marker) + len(marker)
                # Sonraki bölümün başlangıcını bul
                end = len(text)
                for other_key, other_headers in sections.items():
                    if other_key != key:
                        for oh in other_headers:
                            for prefix in ["### ", "## ", "# "]:
                                search = f"{prefix}{oh}"
                                pos = text.find(search, start)
                                if pos != -1 and pos < end:
                                    end = pos
                result[key] = text[start:end].strip()
                break

    return result
