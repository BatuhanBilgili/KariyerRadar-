"""
TalentRadar — Telegram Notifier
Telegram Bot API ile kullanıcılara iş ilanı bildirimi gönderir.
"""

import os
import logging
from typing import Optional

import requests

logger = logging.getLogger(__name__)

TELEGRAM_API = "https://api.telegram.org"


def send_telegram_message(
    chat_id: str,
    message: str,
    bot_token: Optional[str] = None,
    parse_mode: str = "HTML",
) -> bool:
    """
    Telegram üzerinden mesaj gönderir.

    Args:
        chat_id: Kullanıcının Telegram chat ID'si
        message: Gönderilecek mesaj (HTML formatı desteklenir)
        bot_token: Bot token (env'den alınır, verilmezse)
        parse_mode: Mesaj formatı (HTML veya Markdown)

    Returns:
        bool: Başarılı ise True
    """
    token = bot_token or os.environ.get("TELEGRAM_BOT_TOKEN", "")
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN bulunamadı!")
        return False

    url = f"{TELEGRAM_API}/bot{token}/sendMessage"

    # Telegram mesaj limiti 4096 karakter
    # Uzun mesajları parçala
    messages = _split_message(message, max_length=4096)

    for msg in messages:
        try:
            response = requests.post(
                url,
                json={
                    "chat_id": chat_id,
                    "text": msg,
                    "parse_mode": parse_mode,
                    "disable_web_page_preview": True,
                },
                timeout=30,
            )

            if response.status_code == 200:
                logger.info(f"Telegram mesajı gönderildi → {chat_id}")
            else:
                logger.error(
                    f"Telegram API hatası: {response.status_code} — {response.text}"
                )
                return False

        except Exception as e:
            logger.error(f"Telegram gönderim hatası: {e}")
            return False

    return True


def format_job_notification(
    jobs_by_platform: dict[str, list[dict]],
    no_results_platforms: list[str],
) -> str:
    """
    İş ilanlarını Telegram mesaj formatına dönüştürür.

    Args:
        jobs_by_platform: Platform bazında ilanlar {platform_name: [jobs]}
        no_results_platforms: Yeni ilan bulunamayan platformlar

    Returns:
        str: Formatlanmış HTML mesaj
    """
    lines = ["<b>KariyerRadarı — Yeni İş İlanları</b>\n"]

    total_jobs = 0

    for platform_name, jobs in jobs_by_platform.items():
        if not jobs:
            continue

        for job in jobs:
            total_jobs += 1
            work_type_label = {
                "remote": "Remote",
                "hybrid": "Hybrid",
                "onsite": "Onsite",
                "unknown": "Belirtilmemiş",
            }.get(job.get("work_type", "unknown"), "Bilinmiyor")

            lines.append(f"<b>Platform:</b> {platform_name}")
            lines.append(
                f'<b>Pozisyon:</b> {job.get("title", "Bilinmiyor")}'
                + (f' @ {job["company"]}' if job.get("company") else "")
            )
            lines.append(f"<b>Tür:</b> {work_type_label}")

            if job.get("location"):
                lines.append(f'<b>Şehir:</b> {job["location"]}')

            if job.get("url"):
                lines.append(
                    f'<a href="{job["url"]}">İlan İçin Tıklayınız</a>'
                )

            if job.get("cv_builder_url"):
                cv_url = job["cv_builder_url"]
                if "localhost" in cv_url:
                    lines.append(
                        f'<b>CV/Kapak Mektubu:</b> <code>{cv_url}</code>\n<i>(Linki kopyalayıp tarayıcınızda açın)</i>'
                    )
                else:
                    lines.append(
                        f'<a href="{cv_url}">Bu İlan İçin CV/Kapak Mektubu Oluştur</a>'
                    )

            if job.get("ai_summary"):
                lines.append(f'\n<b>AI Özet:</b> {job["ai_summary"]}')

            lines.append("\n━━━━━━━━━━━━━━━━\n")

    # Sonuç bulunamayan platformlar
    for platform in no_results_platforms:
        lines.append(
            f"<b>{platform}</b> platformu için bugün yeni gösterilecek "
            "ilan bulunmamaktadır.\n"
        )

    # Özet
    if total_jobs > 0:
        lines.append(f"\nBugün toplam <b>{total_jobs}</b> yeni ilan bulundu.")
    else:
        lines.append("\nBugün hiçbir platformda yeni ilan bulunamadı.")

    return "\n".join(lines)


def _split_message(message: str, max_length: int = 4096) -> list[str]:
    """Uzun mesajları parçalara böler."""
    if len(message) <= max_length:
        return [message]

    parts = []
    while message:
        if len(message) <= max_length:
            parts.append(message)
            break

        # Son satır sonunu bul
        split_pos = message.rfind("\n", 0, max_length)
        if split_pos == -1:
            split_pos = max_length

        parts.append(message[:split_pos])
        message = message[split_pos:].lstrip("\n")

    return parts
