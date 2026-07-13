"""
KariyerRadarı — Email Notifier (Resend API)
Kullanıcılara e-posta ile iş ilanı bildirimi gönderir.
"""

import os
import logging

logger = logging.getLogger(__name__)


def send_email_notification(
    to_email: str,
    subject: str,
    html_body: str,
) -> bool:
    """
    Resend API ile e-posta gönderir.

    Args:
        to_email: Alıcı e-posta adresi
        subject: E-posta konusu
        html_body: HTML formatında e-posta içeriği

    Returns:
        bool: Başarılı ise True
    """
    api_key = os.environ.get("RESEND_API_KEY", "")
    from_email = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev")

    if not api_key:
        logger.warning("RESEND_API_KEY bulunamadı, e-posta gönderilemiyor.")
        return False

    try:
        import resend

        resend.api_key = api_key

        response = resend.Emails.send(
            {
                "from": f"KariyerRadarı <{from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_body,
            }
        )

        logger.info(f"E-posta gönderildi → {to_email} (ID: {response.get('id', 'N/A')})")
        return True

    except Exception as e:
        logger.error(f"E-posta gönderim hatası: {e}")
        return False


def format_email_html(
    jobs_by_platform: dict[str, list[dict]],
    no_results_platforms: list[str],
) -> str:
    """İlanları HTML e-posta formatına dönüştürür."""

    work_type_styles = {
        "remote": "background:#065f46;color:#6ee7b7;",
        "hybrid": "background:#78350f;color:#fcd34d;",
        "onsite": "background:#164e63;color:#67e8f9;",
        "unknown": "background:#374151;color:#d1d5db;",
    }

    work_type_labels = {
        "remote": "Remote",
        "hybrid": "Hybrid",
        "onsite": "Onsite",
        "unknown": "Belirtilmemiş",
    }

    html_parts = [
        """
        <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;
                     background:#0a0a0f;color:#f0f0f5;padding:24px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="font-size:24px;margin:0;">KariyerRadarı</h1>
            <p style="color:#a0a0b8;margin:8px 0 0;">Günlük İş İlanı Bildirimi</p>
          </div>
        """
    ]

    total = 0
    for platform_name, jobs in jobs_by_platform.items():
        for job in jobs:
            total += 1
            wt = job.get("work_type", "unknown")
            html_parts.append(f"""
            <div style="background:rgba(26,26,46,0.6);border:1px solid rgba(255,255,255,0.06);
                        border-radius:12px;padding:16px;margin-bottom:12px;">
              <div style="display:inline-block;padding:2px 8px;background:rgba(99,102,241,0.1);
                          border-radius:4px;font-size:12px;color:#818cf8;font-weight:600;
                          text-transform:uppercase;margin-bottom:8px;">
                {platform_name}
              </div>
              <h3 style="margin:8px 0 4px;font-size:16px;">
                {job.get('title', 'Bilinmiyor')}
              </h3>
              {'<p style="color:#a0a0b8;margin:0 0 8px;">@ ' + job['company'] + '</p>' if job.get('company') else ''}
              <div style="margin-bottom:8px;">
                <span style="display:inline-block;padding:2px 8px;border-radius:4px;
                             font-size:12px;font-weight:600;{work_type_styles.get(wt, '')}">
                  {work_type_labels.get(wt, wt)}
                </span>
                {'<span style="color:#6b6b80;font-size:13px;margin-left:8px;">' + job['location'] + '</span>' if job.get('location') else ''}
              </div>
              {'<p style="color:#a0a0b8;font-size:13px;border-left:2px solid #6366f1;padding-left:12px;margin:8px 0;">AI Özet: ' + job['ai_summary'] + '</p>' if job.get('ai_summary') else ''}
              {'<a href="' + job['url'] + '" style="display:inline-block;padding:8px 16px;background:linear-gradient(135deg,#6366f1,#06b6d4);color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;margin-right:8px;">İlan İçin Tıklayınız</a>' if job.get('url') else ''}
              {'<a href="' + job['cv_builder_url'] + '" style="display:inline-block;padding:8px 16px;background:transparent;border:1px solid #6366f1;color:#818cf8;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">Bu İlan İçin CV/Kapak Mektubu Oluştur</a>' if job.get('cv_builder_url') else ''}
            </div>
            """)

    # Sonuç bulunamayan platformlar
    for platform in no_results_platforms:
        html_parts.append(f"""
        <div style="padding:12px 16px;background:rgba(239,68,68,0.05);
                    border:1px solid rgba(239,68,68,0.15);border-radius:8px;
                    margin-bottom:8px;color:#a0a0b8;font-size:13px;">
          <b>{platform}</b> platformu için bugün yeni gösterilecek ilan bulunmamaktadır.
        </div>
        """)

    # Özet
    summary = (
        f"Bugün toplam <b>{total}</b> yeni ilan bulundu."
        if total > 0
        else "Bugün hiçbir platformda yeni ilan bulunamadı."
    )
    html_parts.append(f"""
          <div style="text-align:center;margin-top:24px;padding-top:16px;
                      border-top:1px solid rgba(255,255,255,0.06);">
            <p style="color:#a0a0b8;font-size:14px;">{summary}</p>
            <p style="color:#4a4a5e;font-size:12px;margin-top:8px;">
              KariyerRadarı — Açık Kaynak İş İlanı Takip Platformu
            </p>
          </div>
        </div>
    """)

    return "\n".join(html_parts)
