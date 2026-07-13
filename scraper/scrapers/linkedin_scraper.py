"""
KariyerRadarı — LinkedIn Scraper (JobSpy ile)
"""

import uuid
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def scrape_linkedin(
    keywords: list[str],
    location: str = "",
    results_wanted: int = 25,
) -> list[dict]:
    """
    LinkedIn'den iş ilanlarını çeker (python-jobspy kütüphanesi ile).

    Returns:
        list[dict]: job_listings tablosuna uygun formatta ilanlar
    """
    try:
        from jobspy import scrape_jobs
    except ImportError:
        logger.error("python-jobspy kurulu değil! pip install python-jobspy")
        return []

    all_jobs = []

    for keyword in keywords:
        try:
            logger.info(f"LinkedIn'de aranan: '{keyword}'")

            jobs_df = scrape_jobs(
                site_name=["linkedin"],
                search_term=keyword,
                location=location if location else None,
                results_wanted=results_wanted,
                hours_old=24,  # Son 24 saatteki ilanlar
                country_indeed="Turkey",
            )

            if jobs_df is None or jobs_df.empty:
                logger.info(f"LinkedIn'de '{keyword}' için sonuç bulunamadı.")
                continue

            for _, row in jobs_df.iterrows():
                job = {
                    "id": str(uuid.uuid4()),
                    "platform": "linkedin",
                    "title": str(row.get("title", "")).strip(),
                    "company": str(row.get("company", "")).strip() or None,
                    "location": str(row.get("location", "")).strip() or None,
                    "work_type": _detect_work_type(row),
                    "url": str(row.get("job_url", "")).strip() or None,
                    "description": str(row.get("description", "")).strip() or None,
                    "external_id": str(
                        row.get("id", row.get("job_url", str(uuid.uuid4())))
                    ).strip(),
                    "posted_at": _parse_date(row.get("date_posted")),
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                }

                if job["title"]:
                    all_jobs.append(job)

            logger.info(
                f"LinkedIn'de '{keyword}' için {len(jobs_df)} ilan bulundu."
            )

        except Exception as e:
            logger.error(f"LinkedIn scraping hatası ('{keyword}'): {e}")
            continue

    # Benzersiz ilanları filtrele (external_id bazında)
    seen = set()
    unique_jobs = []
    for job in all_jobs:
        if job["external_id"] not in seen:
            seen.add(job["external_id"])
            unique_jobs.append(job)

    logger.info(f"LinkedIn toplam: {len(unique_jobs)} benzersiz ilan.")
    return unique_jobs


def _detect_work_type(row) -> str:
    """İlandan çalışma tipini tespit eder."""
    # JobSpy'ın is_remote alanını kontrol et
    if row.get("is_remote") is True:
        return "remote"

    # Başlık ve açıklamadan tespit
    text = f"{row.get('title', '')} {row.get('description', '')}".lower()
    if "remote" in text:
        return "remote"
    elif "hybrid" in text:
        return "hybrid"
    elif "onsite" in text or "on-site" in text or "office" in text:
        return "onsite"

    return "unknown"


def _parse_date(date_val) -> str | None:
    """Tarih değerini ISO format string'e dönüştürür."""
    if date_val is None:
        return None
    try:
        if hasattr(date_val, "isoformat"):
            return date_val.isoformat()
        val_str = str(date_val)
        if val_str.lower() in ("nan", "nat", "null", "none"):
            return None
        return val_str
    except Exception:
        return None
