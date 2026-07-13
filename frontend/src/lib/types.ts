// ============================================
// KariyerRadarı — TypeScript Type Definitions
// ============================================

export type NotificationMethod = "telegram" | "email" | "both";
export type WorkType = "remote" | "hybrid" | "onsite";
export type Platform = "linkedin" | "indeed" | "itu" | "bogazici";
export type NotificationChannel = "telegram" | "email";

export interface User {
  id: string;
  email: string | null;
  telegram_chat_id: string | null;
  notification_method: NotificationMethod;
  notification_time: string;
  timezone: string;
  search_keywords: string[];
  work_types: WorkType[];
  platforms: Platform[];
  github_url: string | null;
  kaggle_url: string | null;
  linkedin_url: string | null;
  old_cv_text: string | null;
  gemini_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobListing {
  id: string;
  platform: Platform;
  title: string;
  company: string | null;
  location: string | null;
  work_type: WorkType | "unknown";
  url: string | null;
  description: string | null;
  ai_summary: string | null;
  external_id: string | null;
  posted_at: string | null;
  scraped_at: string;
}

export interface SentNotification {
  id: string;
  user_id: string;
  job_id: string;
  channel: NotificationChannel;
  sent_at: string;
}

// Form types
export interface UserSettings {
  email: string;
  telegram_chat_id: string;
  notification_method: NotificationMethod;
  notification_time: string;
  timezone: string;
  search_keywords: string[];
  work_types: WorkType[];
  platforms: Platform[];
  github_url: string;
  kaggle_url: string;
  linkedin_url: string;
  old_cv_text: string;
  gemini_api_key: string;
}

export interface CVRequest {
  job_listing: JobListing;
  user_profile: {
    github_url: string;
    kaggle_url: string;
    linkedin_url: string;
    old_cv_text: string;
  };
  gemini_api_key: string;
}

export interface CVResult {
  cv_markdown: string;
  cover_letter_markdown: string;
  match_analysis: string;
}

// Platform display info
export const PLATFORM_INFO: Record<Platform, { name: string; emoji: string; color: string }> = {
  linkedin: { name: "LinkedIn", emoji: "", color: "#0A66C2" },
  indeed: { name: "Indeed", emoji: "", color: "#2164F3" },
  itu: { name: "İTÜ Arı Teknokent", emoji: "", color: "#CC0000" },
  bogazici: { name: "Boğaziçi Kariyer", emoji: "", color: "#003366" },
};

export const WORK_TYPE_INFO: Record<WorkType, { label: string; emoji: string }> = {
  remote: { label: "Remote", emoji: "" },
  hybrid: { label: "Hybrid", emoji: "" },
  onsite: { label: "Onsite", emoji: "" },
};

// Popüler arama önerileri
export const POPULAR_KEYWORDS = [
  "Software Engineer",
  "Yazılım Mühendisi",
  "Yazılım Geliştirici",
  "Computer Engineer",
  "Bilgisayar Mühendisi",
  "Data Scientist",
  "Veri Bilimcisi",
  "Veri Bilimi",
  "Data Analyst",
  "Veri Analisti",
  "Business Analyst",
  "İş Analisti",
  "Machine Learning Engineer",
  "Yapay Zeka Mühendisi",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Electrical Engineer",
  "Elektrik Elektronik Mühendisi",
  "Embedded Systems Engineer",
];

// Timezone listesi (popüler)
export const TIMEZONES = [
  "Europe/Istanbul",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Asia/Dubai",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];
