"""
KariyerRadarı — LinkedIn Scraper (JobSpy ile)
"""

import uuid
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


# Monkeypatch LinkedIn scraper class to support f_E and f_WT filters
_patched = False

def _apply_monkeypatch():
    global _patched
    if _patched:
        return
    try:
        import jobspy.linkedin
        original_init = jobspy.linkedin.LinkedIn.__init__

        def patched_init(self, *args, **kwargs):
            original_init(self, *args, **kwargs)
            original_get = self.session.get

            def patched_get(url, *args, **kwargs):
                if "seeMoreJobPostings/search" in url and "params" in kwargs:
                    # Inject experience levels (f_E)
                    exp_levels = getattr(jobspy.linkedin.LinkedIn, "_current_experience_levels", [])
                    if exp_levels:
                        mapping = {
                            "internship": "1",
                            "entry": "2",
                            "associate": "3",
                            "mid_senior": "4",
                            "director": "5",
                            "executive": "6"
                        }
                        mapped_levels = [mapping[lvl] for lvl in exp_levels if lvl in mapping]
                        if mapped_levels:
                            kwargs["params"]["f_E"] = ",".join(mapped_levels)
                            logger.info(f"Injecting LinkedIn Experience Level filter: f_E={kwargs['params']['f_E']}")

                    # Inject work types (f_WT)
                    w_types = getattr(jobspy.linkedin.LinkedIn, "_current_work_types", [])
                    if w_types:
                        wt_mapping = {
                            "onsite": "1",
                            "remote": "2",
                            "hybrid": "3"
                        }
                        mapped_wts = [wt_mapping[wt] for wt in w_types if wt in wt_mapping]
                        if mapped_wts:
                            kwargs["params"]["f_WT"] = ",".join(mapped_wts)
                            logger.info(f"Injecting LinkedIn Work Type filter: f_WT={kwargs['params']['f_WT']}")

                return original_get(url, *args, **kwargs)

            self.session.get = patched_get

        jobspy.linkedin.LinkedIn.__init__ = patched_init
        _patched = True
        logger.info("Successfully monkeypatched JobSpy LinkedIn scraper for f_E and f_WT parameters")
    except Exception as e:
        logger.error(f"Failed to apply JobSpy monkeypatch: {e}")


def scrape_linkedin(
    keywords: list[str],
    locations: list[str] | None = None,
    results_wanted: int = 25,
    experience_levels: list[str] | None = None,
    work_types: list[str] | None = None,
) -> list[dict]:
    """
    LinkedIn'den iş ilanlarını çeker (python-jobspy kütüphanesi ile).

    Returns:
        list[dict]: job_listings tablosuna uygun formatta ilanlar
    """
    try:
        from jobspy import scrape_jobs
        import jobspy.linkedin
        _apply_monkeypatch()
        # Set dynamic filters
        jobspy.linkedin.LinkedIn._current_experience_levels = experience_levels
        jobspy.linkedin.LinkedIn._current_work_types = work_types
    except ImportError:
        logger.error("python-jobspy kurulu değil! pip install python-jobspy")
        return []

    all_jobs = []
    
    # Varsayılan olarak boş liste gelirse "Tüm lokasyonlar" (None) yap
    loc_list = locations if locations and len(locations) > 0 else [None]

    for keyword in keywords:
        for loc in loc_list:
            try:
                logger.info(f"LinkedIn'de aranan: '{keyword}' (Konum: {loc or 'Global'})")

                jobs_df = scrape_jobs(
                    site_name=["linkedin"],
                    search_term=keyword,
                    location=loc,
                    results_wanted=results_wanted,
                    hours_old=24,  # Son 24 saatteki ilanlar
                )

                if jobs_df is None or jobs_df.empty:
                    logger.info(f"LinkedIn'de '{keyword}' ({loc or 'Global'}) için sonuç bulunamadı.")
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
                    f"LinkedIn'de '{keyword}' (Konum: {loc or 'Global'}) için {len(jobs_df)} ilan bulundu."
                )

            except Exception as e:
                logger.error(f"LinkedIn scraping hatası ('{keyword}', Konum: {loc}): {e}")
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
