"""
KariyerRadarı — AI Summarizer (Google Gemini)
İş ilanlarının kısa özetlerini oluşturur.
"""

import os
import logging
import time

logger = logging.getLogger(__name__)


def summarize_job(
    description: str,
    api_key: str | None = None,
    model: str = "gemini-2.5-flash",
) -> str | None:
    """
    İş ilanı açıklamasından Gemini ile Türkçe özet oluşturur.

    Args:
        description: İlan açıklaması
        api_key: Gemini API key (env'den alınır, verilmezse)
        model: Kullanılacak Gemini modeli

    Returns:
        str | None: 3-4 cümlelik özet
    """
    key = api_key or os.environ.get("GEMINI_API_KEY", "")
    if not key:
        logger.warning("GEMINI_API_KEY bulunamadı, özet oluşturulamıyor.")
        return None

    if not description or len(description.strip()) < 50:
        return None

    prompt = (
        "Bu iş ilanını 3-4 cümle ile Türkçe olarak özetle. "
        "Aranan temel nitelikleri, deneyim gereksinimini ve dikkat çeken noktaları belirt. "
        "Kısa ve öz ol.\n\n"
        f"İlan:\n{description[:3000]}"  # Token limiti için kırp
    )

    try:
        import google.generativeai as genai

        genai.configure(api_key=key)
        gen_model = genai.GenerativeModel(model)

        response = gen_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.5,
                max_output_tokens=300,
            ),
        )

        if response and response.text:
            summary = response.text.strip()
            logger.info(f"Özet oluşturuldu ({len(summary)} karakter)")
            return summary

    except Exception as e:
        logger.error(f"Gemini özet hatası: {e}")
        # Rate limit hatası ise bekle
        if "429" in str(e):
            logger.info("Rate limit — 10 saniye bekleniyor...")
            time.sleep(10)

    return None


def batch_summarize_jobs(
    jobs: list[dict],
    api_key: str | None = None,
    delay: float = 2.0,
) -> list[dict]:
    """
    Birden fazla ilanı toplu olarak özetler.
    Rate limiting için aralarında bekleme yapar.

    Args:
        jobs: İlan listesi
        api_key: Gemini API key
        delay: İstekler arası bekleme süresi (saniye)

    Returns:
        list[dict]: ai_summary alanı eklenmiş ilanlar
    """
    for job in jobs:
        if job.get("description") and not job.get("ai_summary"):
            summary = summarize_job(job["description"], api_key=api_key)
            if summary:
                job["ai_summary"] = summary
            time.sleep(delay)  # Rate limit koruması

    return jobs
