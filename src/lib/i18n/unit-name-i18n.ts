/**
 * Display localization for the fixed unit-name list (`UNIT_NAMES`). The stored
 * value stays the canonical English name — only the label a participant SEES in
 * the dropdown / trigger is translated. Anything unrecognised falls back to the
 * original English text, so a custom entry still renders untranslated.
 *
 * Each entry is "<N> Bn <Regiment>" (or "<N>st/nd Battalion, <Regiment>"), so we
 * split the battalion number from the regiment base, translate the base from a
 * small table, then re-compose in each locale's own word order. This keeps the
 * table to ~17 regiments instead of one row per battalion.
 */

import type { Locale } from "@/lib/i18n/config";

type NonEn = Exclude<Locale, "en">;

/** Regiment base (as it appears after "N Bn " / "Nth Battalion, ") → per-locale. */
const BASE: Record<string, Record<NonEn, string>> = {
  "The Royal Irish Regiment": {
    ru: "Королевский ирландский полк",
    tr: "Kraliyet İrlanda Alayı",
    ar: "الفوج الأيرلندي الملكي",
    zh: "皇家爱尔兰团",
  },
  "The Rifles": {
    ru: "полк «Стрелки»",
    tr: "Tüfekliler Alayı",
    ar: "فوج البنادق",
    zh: "步枪团",
  },
  "Welsh Guards": {
    ru: "Уэльская гвардия",
    tr: "Galler Muhafızları",
    ar: "حرس ويلز",
    zh: "威尔士卫队",
  },
  "Scots Guards": {
    ru: "Шотландская гвардия",
    tr: "İskoç Muhafızları",
    ar: "الحرس الاسكتلندي",
    zh: "苏格兰卫队",
  },
  "Irish Guards": {
    ru: "Ирландская гвардия",
    tr: "İrlanda Muhafızları",
    ar: "الحرس الأيرلندي",
    zh: "爱尔兰卫队",
  },
  "Grenadier Guards": {
    ru: "Гренадерская гвардия",
    tr: "Grenadier Muhafızları",
    ar: "حرس الغرينادير",
    zh: "掷弹兵卫队",
  },
  "Coldstream Guards": {
    ru: "Колдстримская гвардия",
    tr: "Coldstream Muhafızları",
    ar: "حرس كولدستريم",
    zh: "科尔德斯特里姆卫队",
  },
  "The Parachute Regiment": {
    ru: "Парашютный полк",
    tr: "Paraşüt Alayı",
    ar: "فوج المظليين",
    zh: "伞兵团",
  },
  "The Royal Regiment of Fusiliers": {
    ru: "Королевский фузилёрный полк",
    tr: "Kraliyet Fişekçiler Alayı",
    ar: "فوج الفيوسيلير الملكي",
    zh: "皇家燧发枪团",
  },
  "The Mercian Regiment": {
    ru: "Мерсийский полк",
    tr: "Mercian Alayı",
    ar: "فوج ميرسيا",
    zh: "麦西亚团",
  },
  "The Royal Anglian Regiment": {
    ru: "Королевский английский полк",
    tr: "Kraliyet Anglian Alayı",
    ar: "الفوج الأنجلي الملكي",
    zh: "皇家盎格利亚团",
  },
  "The Yorkshire Regiment": {
    ru: "Йоркширский полк",
    tr: "Yorkshire Alayı",
    ar: "فوج يوركشاير",
    zh: "约克郡团",
  },
  "The Duke of Lancaster's Regiment": {
    ru: "Полк герцога Ланкастерского",
    tr: "Lancaster Dükü Alayı",
    ar: "فوج دوق لانكستر",
    zh: "兰开斯特公爵团",
  },
  "The Princess of Wales's Royal Regiment": {
    ru: "Королевский полк принцессы Уэльской",
    tr: "Galler Prensesi Kraliyet Alayı",
    ar: "الفوج الملكي لأميرة ويلز",
    zh: "威尔士王妃皇家团",
  },
  "The Royal Welsh": {
    ru: "Королевский уэльский полк",
    tr: "Kraliyet Galler Alayı",
    ar: "الفوج الويلزي الملكي",
    zh: "皇家威尔士团",
  },
  "The Royal Regiment of Scotland": {
    ru: "Королевский полк Шотландии",
    tr: "Kraliyet İskoçya Alayı",
    ar: "الفوج الاسكتلندي الملكي",
    zh: "皇家苏格兰团",
  },
  "The Royal Gurkha Rifles": {
    ru: "Королевские гуркхские стрелки",
    tr: "Kraliyet Gurkha Tüfekleri",
    ar: "بنادق الغوركا الملكية",
    zh: "皇家廓尔喀步枪团",
  },
};

const OTHER: Record<NonEn, string> = {
  ru: "Другое",
  tr: "Diğer",
  ar: "أخرى",
  zh: "其他",
};

/** Re-compose "battalion N of <baseTranslated>" in the locale's word order. */
function compose(locale: NonEn, n: string, base: string): string {
  switch (locale) {
    case "zh":
      return `${base}第${n}营`;
    case "ar":
      return `الكتيبة ${n} - ${base}`;
    case "ru":
      return `${n}-й батальон, ${base}`;
    case "tr":
      return `${base} ${n}. Tabur`;
  }
}

export function translateUnitName(name: string, locale: Locale): string {
  if (locale === "en") return name;
  if (name === "Other") return OTHER[locale] ?? name;

  const match =
    name.match(/^(\d+)\s+Bn\s+(.+)$/) ??
    name.match(/^(\d+)(?:st|nd|rd|th)\s+Battalion,\s+(.+)$/);
  if (!match) return name;

  const base = BASE[match[2]]?.[locale];
  if (!base) return name;
  return compose(locale, match[1], base);
}
