/**
 * Best-effort localization for the DB/config-driven content on the
 * International Participation map (`/api/public/registered-countries`).
 *
 * Follows the same contract as `key-date-i18n.ts`: known values are mapped per
 * locale, and anything unrecognised falls back to the ORIGINAL English string
 * so admin-entered rows still render — just untranslated — rather than showing
 * a raw key or a blank.
 *
 * Country names are keyed by ISO-3166 alpha-2 (resolved through
 * `country-iso.ts`, which already owns the name → ISO2 table) so naming
 * variants — "Turkey"/"Türkiye", "USA"/"United States of America" — all land on
 * the same entry. Countries with no ISO2 fall back to the normalized name.
 */

import {
  countryNameToIso2,
  normalizeCountryKey,
} from "@/lib/country-iso";
import type { Locale } from "@/lib/i18n/config";

type Translations = Record<Exclude<Locale, "en">, string>;

/** Accent-insensitive, punctuation-free key (mirrors key-date-i18n.ts's `norm`). */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Country name by ISO2 → per-locale name.
 *
 * Covers every nation in `PREDEFINED_PARTICIPANTS` (the confirmed 9th PATS
 * roster) plus every code in `pats-content.COUNTRY_NAMES` (historic edition
 * participants) and a few common nations a DB-added registration could carry.
 */
const COUNTRY_NAMES_BY_ISO2: Record<string, Translations> = {
  // --- 9th PATS roster (PREDEFINED_PARTICIPANTS) ---
  PK: { ru: "Пакистан", tr: "Pakistan", ar: "باكستان", zh: "巴基斯坦" },
  BH: { ru: "Бахрейн", tr: "Bahreyn", ar: "البحرين", zh: "巴林" },
  BY: { ru: "Беларусь", tr: "Belarus", ar: "بيلاروسيا", zh: "白俄罗斯" },
  BD: { ru: "Бангладеш", tr: "Bangladeş", ar: "بنغلاديش", zh: "孟加拉国" },
  EG: { ru: "Египет", tr: "Mısır", ar: "مصر", zh: "埃及" },
  JO: { ru: "Иордания", tr: "Ürdün", ar: "الأردن", zh: "约旦" },
  SA: {
    ru: "Саудовская Аравия",
    tr: "Suudi Arabistan",
    ar: "المملكة العربية السعودية",
    zh: "沙特阿拉伯",
  },
  MV: { ru: "Мальдивы", tr: "Maldivler", ar: "المالديف", zh: "马尔代夫" },
  MY: { ru: "Малайзия", tr: "Malezya", ar: "ماليزيا", zh: "马来西亚" },
  MA: { ru: "Марокко", tr: "Fas", ar: "المغرب", zh: "摩洛哥" },
  NP: { ru: "Непал", tr: "Nepal", ar: "نيبال", zh: "尼泊尔" },
  QA: { ru: "Катар", tr: "Katar", ar: "قطر", zh: "卡塔尔" },
  LK: { ru: "Шри-Ланка", tr: "Sri Lanka", ar: "سريلانكا", zh: "斯里兰卡" },
  TR: { ru: "Турция", tr: "Türkiye", ar: "تركيا", zh: "土耳其" },
  US: {
    ru: "Соединённые Штаты",
    tr: "Amerika Birleşik Devletleri",
    ar: "الولايات المتحدة",
    zh: "美国",
  },
  UZ: { ru: "Узбекистан", tr: "Özbekistan", ar: "أوزبكستان", zh: "乌兹别克斯坦" },
  ID: { ru: "Индонезия", tr: "Endonezya", ar: "إندونيسيا", zh: "印度尼西亚" },
  MM: { ru: "Мьянма", tr: "Myanmar", ar: "ميانمار", zh: "缅甸" },
  TH: { ru: "Таиланд", tr: "Tayland", ar: "تايلاند", zh: "泰国" },

  // --- Historic international-edition participants ---
  CN: { ru: "Китай", tr: "Çin", ar: "الصين", zh: "中国" },
  GB: {
    ru: "Великобритания",
    tr: "Birleşik Krallık",
    ar: "المملكة المتحدة",
    zh: "英国",
  },
  ZA: { ru: "Южно-Африканская Республика", tr: "Güney Afrika", ar: "جنوب أفريقيا", zh: "南非" },
  KE: { ru: "Кения", tr: "Kenya", ar: "كينيا", zh: "肯尼亚" },
  IQ: { ru: "Ирак", tr: "Irak", ar: "العراق", zh: "伊拉克" },
  KZ: { ru: "Казахстан", tr: "Kazakistan", ar: "كازاخستان", zh: "哈萨克斯坦" },
  AZ: { ru: "Азербайджан", tr: "Azerbaycan", ar: "أذربيجان", zh: "阿塞拜疆" },
  GH: { ru: "Гана", tr: "Gana", ar: "غانا", zh: "加纳" },

  // --- Common nations a DB-added registration could carry ---
  RU: { ru: "Россия", tr: "Rusya", ar: "روسيا", zh: "俄罗斯" },
  IN: { ru: "Индия", tr: "Hindistan", ar: "الهند", zh: "印度" },
};

/** Fallback for countries with no ISO2, keyed by normalized English name. */
const COUNTRY_NAMES_BY_NAME: Record<string, Translations> = {};

/**
 * Localized country name, or the original string when unknown.
 *
 * Unknown countries (added through the admin panel / database) intentionally
 * render untranslated rather than blank.
 */
export function translateCountryName(name: string, locale: Locale): string {
  if (locale === "en") return name;
  const iso = countryNameToIso2(name);
  if (iso) {
    const hit = COUNTRY_NAMES_BY_ISO2[iso]?.[locale];
    if (hit) return hit;
  }
  return COUNTRY_NAMES_BY_NAME[normalizeCountryKey(name)]?.[locale] ?? name;
}

/**
 * Generated team labels → per-locale text, keyed by normalized English.
 *
 * These are the machine-generated names produced by
 * `international-participants.ts` (`National contingent`, `Observer
 * delegation`, `Host contingent`) and the API's fallback (`Registered team`).
 * A unit's own `unitName` from the database is a PROPER NOUN and is deliberately
 * NOT listed here — it falls through and renders verbatim.
 */
const TEAM_NAMES: Record<string, Translations> = {
  nationalcontingent: {
    ru: "Национальный контингент",
    tr: "Ulusal birlik",
    ar: "المفرزة الوطنية",
    zh: "国家代表队",
  },
  hostcontingent: {
    ru: "Контингент принимающей стороны",
    tr: "Ev sahibi birlik",
    ar: "مفرزة الدولة المضيفة",
    zh: "东道国代表队",
  },
  observerdelegation: {
    ru: "Делегация наблюдателей",
    tr: "Gözlemci heyeti",
    ar: "وفد المراقبين",
    zh: "观察员代表团",
  },
  registeredteam: {
    ru: "Зарегистрированная команда",
    tr: "Kayıtlı takım",
    ar: "فريق مسجَّل",
    zh: "已注册队伍",
  },
};

/**
 * Trailing ordinal suffix on a generated team name — Roman ("III") or Arabic
 * ("3") numerals. `international-participants.ts` numbers a nation's contingents
 * when it fields more than one ("National contingent I".."National contingent
 * VIII"), so the stem is translated and the numeral is kept verbatim (numerals
 * are locale-neutral here).
 */
const ORDINAL_SUFFIX = /^(.*?)[\s ]+((?:[IVXLCDM]+|\d+))$/;

/**
 * Localized team label, or the original string when unrecognised.
 *
 * A real `unit.unitName` is a proper noun and is returned untouched.
 */
export function translateTeamName(name: string, locale: Locale): string {
  if (locale === "en") return name;

  const direct = TEAM_NAMES[norm(name)]?.[locale];
  if (direct) return direct;

  const match = ORDINAL_SUFFIX.exec(name.trim());
  if (match) {
    const stem = TEAM_NAMES[norm(match[1])]?.[locale];
    if (stem) return `${stem} ${match[2]}`;
  }

  return name;
}
