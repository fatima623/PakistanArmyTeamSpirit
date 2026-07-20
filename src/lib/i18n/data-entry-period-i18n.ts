/**
 * Best-effort localization for the admin-entered Data Entry Period labels (the
 * `DataEntryPeriod` model is single-language in the DB). The seeded milestone
 * labels are mapped per locale; anything unrecognised falls back to the original
 * text, so a custom row still renders — just untranslated. Mirrors the fixed
 * vocabulary approach in {@link file://./key-date-i18n.ts}.
 */

import type { Locale } from "@/lib/i18n/config";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Known data-entry stage labels → per-locale text (keyed by normalized English). */
const LABELS: Record<string, Record<Exclude<Locale, "en">, string>> = {
  patrolmanager: {
    ru: "Руководитель патруля",
    tr: "Devriye yöneticisi",
    ar: "مدير الدورية",
    zh: "巡逻管理员",
  },
  patrolcomposition: {
    ru: "Состав патруля",
    tr: "Devriye teşkili",
    ar: "تشكيل الدورية",
    zh: "巡逻编成",
  },
  unitvisits: {
    ru: "Визиты в подразделение",
    tr: "Birlik ziyaretleri",
    ar: "زيارات الوحدة",
    zh: "单位访问",
  },
  startstandarddeclaration: {
    ru: "Начать стандартную декларацию",
    tr: "Standart beyanı başlat",
    ar: "بدء الإقرار القياسي",
    zh: "开始标准申报",
  },
  weaponsandequipmentregister: {
    ru: "Реестр оружия и снаряжения",
    tr: "Silah ve teçhizat kaydı",
    ar: "سجل الأسلحة والمعدات",
    zh: "武器和装备登记",
  },
};

export function translateDataEntryLabel(label: string, locale: Locale): string {
  if (locale === "en") return label;
  return LABELS[norm(label)]?.[locale] ?? label;
}
