/**
 * Best-effort localization for gallery album categories. `GalleryImage.category`
 * is free text in the schema (the curated list in `gallery-categories.ts` is only
 * what the admin form suggests), so the curated names are mapped per locale and
 * anything unrecognised falls back to the original text — custom, admin-entered
 * categories still render, just untranslated.
 */

import type { Locale } from "@/lib/i18n/config";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Curated category names → per-locale text (keyed by normalized English). */
const CATEGORIES: Record<string, Record<Exclude<Locale, "en">, string>> = {
  openingceremony: {
    ru: "Церемония открытия",
    tr: "Açılış Töreni",
    ar: "حفل الافتتاح",
    zh: "开幕式",
  },
  competitionevents: {
    ru: "Соревновательные этапы",
    tr: "Yarışma Etkinlikleri",
    ar: "فعاليات المسابقة",
    zh: "赛事项目",
  },
  internationaldelegations: {
    ru: "Международные делегации",
    tr: "Uluslararası Delegasyonlar",
    ar: "الوفود الدولية",
    zh: "国际代表团",
  },
  equipmentdemonstrations: {
    ru: "Демонстрация вооружения и техники",
    tr: "Teçhizat Gösterileri",
    ar: "عروض المعدات",
    zh: "装备展示",
  },
  awardsrecognition: {
    ru: "Награды и отличия",
    tr: "Ödüller ve Takdir",
    ar: "الجوائز والتكريم",
    zh: "颁奖与表彰",
  },
  trainingactivities: {
    ru: "Учебно-боевая подготовка",
    tr: "Eğitim Faaliyetleri",
    ar: "الأنشطة التدريبية",
    zh: "训练活动",
  },
  fieldarchive: {
    ru: "Полевой архив",
    tr: "Saha Arşivi",
    ar: "الأرشيف الميداني",
    zh: "现场存档",
  },
};

/** Localized album category, or the original string when not curated. */
export function translateGalleryCategory(category: string, locale: Locale): string {
  if (locale === "en") return category;
  return CATEGORIES[norm(category)]?.[locale] ?? category;
}
