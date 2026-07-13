"""
KariyerRadarı — Indeed Scraper (JobSpy ile)
"""

import uuid
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def scrape_indeed(
    keywords: list[str],
    locations: list[str] | None = None,
    results_wanted: int = 25,
    country: str = "Turkey",
) -> list[dict]:
    """
    Indeed'den iş ilanlarını çeker (python-jobspy kütüphanesi ile).
    """
    try:
        from jobspy import scrape_jobs
    except ImportError:
        logger.error("python-jobspy kurulu değil!")
        return []

    all_jobs = []

    # Varsayılan olarak boş liste gelirse "Tüm lokasyonlar" (None) yap
    loc_list = locations if locations and len(locations) > 0 else [None]

    for keyword in keywords:
        for loc in loc_list:
            try:
                logger.info(f"Indeed'de aranan: '{keyword}' (Konum: {loc or 'Global'})")

                jobs_df = scrape_jobs(
                    site_name=["indeed"],
                    search_term=keyword,
                    location=loc,
                    results_wanted=results_wanted,
                    hours_old=24,
                    country_indeed=country,
                )

                if jobs_df is None or jobs_df.empty:
                    logger.info(f"Indeed'de '{keyword}' ({loc or 'Global'}) için sonuç bulunamadı.")
                continue

            for _, row in jobs_df.iterrows():
                job = {
                    "id": str(uuid.uuid4()),
                    "platform": "indeed",
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
                f"Indeed'de '{keyword}' için {len(jobs_df)} ilan bulundu."
            )

        except Exception as e:
            logger.error(f"Indeed scraping hatası ('{keyword}'): {e}")
            continue

    seen = set()
    unique_jobs = []
    for job in all_jobs:
        if job["external_id"] not in seen:
            seen.add(job["external_id"])
            unique_jobs.append(job)

    logger.info(f"Indeed toplam: {len(unique_jobs)} benzersiz ilan.")
    return unique_jobs


def _detect_work_type(row) -> str:
    if row.get("is_remote") is True:
        return "remote"
    text = f"{row.get('title', '')} {row.get('description', '')}".lower()
    if "remote" in text:
        return "remote"
    elif "hybrid" in text:
        return "hybrid"
    elif "onsite" in text or "on-site" in text or "office" in text:
        return "onsite"
    return "unknown"


def _parse_date(date_val) -> str | None:
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
