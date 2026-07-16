/**
 * Best-effort localization for the admin-entered Key Dates (the `KeyDate` model
 * is single-language in the DB). Known milestone labels are mapped per locale,
 * and English month names inside the value are swapped for their localized
 * form. Anything unrecognised falls back to the original text, so custom rows
 * still render — just untranslated.
 */

import type { Locale } from "@/lib/i18n/config";

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Known milestone labels → per-locale text (keyed by normalized English). */
const LABELS: Record<string, Record<Exclude<Locale, "en">, string>> = {
  mpc: { ru: "ПВК", tr: "MPC (Ana Planlama Konferansı)", ar: "مؤتمر التخطيط الرئيسي", zh: "主计划会议" },
  openingdateforapplications: {
    ru: "Дата открытия приёма заявок",
    tr: "Başvuruların açılış tarihi",
    ar: "تاريخ فتح باب التقديم",
    zh: "报名开放日期",
  },
  closingdates: {
    ru: "Даты закрытия",
    tr: "Kapanış tarihleri",
    ar: "تواريخ الإغلاق",
    zh: "截止日期",
  },
  participationinclphaseconfirmedby: {
    ru: "Участие (вкл. этап) подтверждается до",
    tr: "Katılım (aşama dahil) onay tarihi",
    ar: "تأكيد المشاركة (بما في ذلك المرحلة) بحلول",
    zh: "参与（含阶段）确认截止",
  },
};

const MONTHS_EN = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const MONTHS: Record<Exclude<Locale, "en">, string[]> = {
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  tr: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  zh: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
};

export function translateKeyDateLabel(label: string, locale: Locale): string {
  if (locale === "en") return label;
  return LABELS[norm(label)]?.[locale] ?? label;
}

export function translateKeyDateValue(value: string, locale: Locale): string {
  if (locale === "en") return value;
  const months = MONTHS[locale];
  return value.replace(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi,
    (m) => months[MONTHS_EN.indexOf(m.toLowerCase())] ?? m
  );
}
