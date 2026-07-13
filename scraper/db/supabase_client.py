"""
KariyerRadarı — Supabase Python Client
Arka plan işçisi (scraper) için veritabanı işlemleri.
"""

import os
from supabase import create_client, Client


def get_supabase_client() -> Client:
    """Supabase client oluşturur (service_role key ile)."""
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not url or not key:
        raise ValueError(
            "SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY environment variable'ları gerekli!"
        )

    return create_client(url, key)


def get_all_users(client: Client) -> list[dict]:
    """Tüm kullanıcıları getirir."""
    response = client.table("users").select("*").execute()
    return response.data or []


def upsert_job_listing(client: Client, job: dict) -> dict | None:
    """İş ilanını ekler veya günceller (platform + external_id bazında)."""
    response = (
        client.table("job_listings")
        .upsert(job, on_conflict="platform,external_id")
        .execute()
    )
    return response.data[0] if response.data else None


def get_sent_job_ids_for_user(client: Client, user_id: str) -> set[str]:
    """Kullanıcıya daha önce gönderilmiş ilanların job_id'lerini döndürür."""
    response = (
        client.table("sent_notifications")
        .select("job_id")
        .eq("user_id", user_id)
        .execute()
    )
    return {row["job_id"] for row in (response.data or [])}


def record_sent_notification(
    client: Client, user_id: str, job_id: str, channel: str
) -> None:
    """Gönderilen bildirimi kaydeder."""
    client.table("sent_notifications").upsert(
        {"user_id": user_id, "job_id": job_id, "channel": channel},
        on_conflict="user_id,job_id,channel",
    ).execute()


def get_jobs_by_platform_and_keywords(
    client: Client, platform: str, keywords: list[str], work_types: list[str]
) -> list[dict]:
    """Platforma göre ilanları getirir ve keyword/work_type filtresi uygular."""
    query = client.table("job_listings").select("*").eq("platform", platform)

    # Work type filtresi
    if work_types and "unknown" not in work_types:
        # unknown'u da dahil et çünkü bazı ilanların tipi belirlenemeyebilir
        query = query.in_("work_type", work_types + ["unknown"])

    response = query.order("scraped_at", desc=True).limit(100).execute()
    jobs = response.data or []

    if not keywords:
        return jobs

    # Keyword filtresi (case-insensitive, title veya description'da arama)
    filtered = []
    for job in jobs:
        title = (job.get("title") or "").lower()
        desc = (job.get("description") or "").lower()
        for kw in keywords:
            kw_lower = kw.lower()
            if kw_lower in title or kw_lower in desc:
                filtered.append(job)
                break

    return filtered

def cleanup_old_data(client: Client, days_old: int = 30) -> None:
    """Temizlik Aşaması: Belirtilen günden eski iş ilanlarını ve gönderim kayıtlarını hafızadan siler."""
    try:
        from datetime import datetime, timedelta, timezone
        import logging
        logger = logging.getLogger(__name__)

        cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days_old)).isoformat()
        
        # 1. Gönderilen bildirimler hafızasını temizle (Tekrar yakalanabilmesi için)
        sn_res = client.table("sent_notifications").delete().lt("sent_at", cutoff_date).execute()
        sn_count = len(sn_res.data) if sn_res.data else 0
        logger.info(f"Temizlik: {sn_count} adet 30 günden eski bildirim kaydı silindi.")

        # 2. İş ilanları tablosunu temizle
        jl_res = client.table("job_listings").delete().lt("scraped_at", cutoff_date).execute()
        jl_count = len(jl_res.data) if jl_res.data else 0
        logger.info(f"Temizlik: {jl_count} adet 30 günden eski iş ilanı silindi.")

    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Eski verileri temizlerken hata oluştu: {e}")
