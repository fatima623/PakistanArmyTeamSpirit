/**
 * Best-effort localization for the admin-entered `Event` rows (the model is
 * single-language in the DB). Follows the `key-date-i18n.ts` pattern: normalize
 * the English source into a lookup key, map it per locale, and fall back to the
 * original string when unrecognised — so an event an admin adds tomorrow still
 * renders (just untranslated) rather than showing a raw key or a blank.
 *
 * SCOPE — only the *fixed-vocabulary* fields are covered:
 *   • category   — 7 known values (see EVENT_CATEGORIES in lib/exercise-contour)
 *   • difficulty — 4 known values (see DIFFICULTIES)
 *   • duration   — the known catalogue values, plus a generic "<n> min" rule
 *   • breakdown[].label — the known scoring-line labels
 *
 * The free-text fields (`title`, `summary`, `details`, `participants`) are
 * authored per event at runtime and cannot be covered by a static table: a new
 * event would fall through to English anyway. They are deliberately left as
 * entered — the server makes no external translation calls. Per-locale admin
 * copy is the intended fix and is tracked separately.
 */

import type { Locale } from "@/lib/i18n/config";

type NonEnLocale = Exclude<Locale, "en">;

/**
 * Lookup key: case/diacritic/punctuation-insensitive, so "Report line 1",
 * "Report Line 1" and "report-line-1" all collapse to the same entry.
 */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Generic lookup with a silent fall back to the original English text. */
function lookup(
  table: Record<string, Record<NonEnLocale, string>>,
  value: string,
  locale: Locale
): string {
  if (locale === "en") return value;
  return table[norm(value)]?.[locale] ?? value;
}

/* ------------------------------------------------------------------ *
 * Category — the 7 values in EVENT_CATEGORIES.
 * ------------------------------------------------------------------ */

const CATEGORIES: Record<string, Record<NonEnLocale, string>> = {
  inspection: { ru: "Проверка", tr: "Teftiş", ar: "التفتيش", zh: "检查" },
  command: { ru: "Управление", tr: "Komuta", ar: "القيادة", zh: "指挥" },
  navigation: { ru: "Навигация", tr: "Navigasyon", ar: "الملاحة", zh: "导航" },
  reconnaissance: { ru: "Разведка", tr: "Keşif", ar: "الاستطلاع", zh: "侦察" },
  combat: { ru: "Бой", tr: "Muharebe", ar: "القتال", zh: "作战" },
  medical: { ru: "Медицина", tr: "Sıhhiye", ar: "الإسعاف الطبي", zh: "医疗" },
  // Distinct from "Reconnaissance" above in every locale.
  intelligence: { ru: "Разведданные", tr: "İstihbarat", ar: "الاستخبارات", zh: "情报" },
};

/* ------------------------------------------------------------------ *
 * Difficulty — the 4 values in DIFFICULTIES.
 * ------------------------------------------------------------------ */

const DIFFICULTIES: Record<string, Record<NonEnLocale, string>> = {
  foundational: { ru: "Базовый", tr: "Temel", ar: "أساسي", zh: "基础" },
  standard: { ru: "Стандартный", tr: "Standart", ar: "قياسي", zh: "标准" },
  advanced: { ru: "Повышенный", tr: "İleri", ar: "متقدم", zh: "进阶" },
  extreme: { ru: "Экстремальный", tr: "Zorlu", ar: "شديد", zh: "极限" },
};

/* ------------------------------------------------------------------ *
 * Duration — every catalogue value, plus a "<n> min" rule for new rows.
 * ------------------------------------------------------------------ */

const MINUTES: Record<NonEnLocale, (n: number) => string> = {
  // Abbreviated units sidestep numeral agreement ("45 мин", not "45 минут").
  ru: (n) => `${n} мин`,
  tr: (n) => `${n} dk`,
  ar: (n) => `${n} دقيقة`,
  zh: (n) => `${n} 分钟`,
};

const DURATIONS: Record<string, Record<NonEnLocale, string>> = {
  "3minserial": {
    ru: "серия 3 мин",
    tr: "3 dk'lık seri",
    ar: "مرحلة مدتها 3 دقائق",
    zh: "3 分钟科目",
  },
  "40minqualifying": {
    ru: "норматив 40 мин",
    tr: "40 dk baraj süresi",
    ar: "40 دقيقة (الزمن المؤهل)",
    zh: "40 分钟合格时限",
  },
  "60min30prep30delivery": {
    ru: "60 мин (30 подготовка + 30 доклад)",
    tr: "60 dk (30 hazırlık + 30 sunum)",
    ar: "60 دقيقة (30 للتحضير + 30 للإلقاء)",
    zh: "60 分钟（30 分钟准备 + 30 分钟宣达）",
  },
  throughout: {
    ru: "На протяжении учений",
    tr: "Tatbikat boyunca",
    ar: "طوال التمرين",
    zh: "全程",
  },
  timed: { ru: "На время", tr: "Süre tutulur", ar: "محسوب بالزمن", zh: "计时" },
};

/* ------------------------------------------------------------------ *
 * Marks-breakdown labels — the known scoring lines.
 * ------------------------------------------------------------------ */

const BREAKDOWN_LABELS: Record<string, Record<NonEnLocale, string>> = {
  areasecurity: {
    ru: "Охранение района",
    tr: "Bölge güvenliği",
    ar: "تأمين المنطقة",
    zh: "区域警戒",
  },
  casualtyevacuation: {
    ru: "Эвакуация раненых",
    tr: "Yaralı tahliyesi",
    ar: "إخلاء المصابين",
    zh: "伤员后送",
  },
  chronologicalreport: {
    ru: "Хронологический отчёт",
    tr: "Kronolojik rapor",
    ar: "التقرير الزمني",
    zh: "时序报告",
  },
  contingencyplanning: {
    ru: "Планирование на случай непредвиденных обстоятельств",
    tr: "Beklenmedik durum planlaması",
    ar: "تخطيط الطوارئ",
    zh: "应急预案",
  },
  crowdcontrol: {
    ru: "Сдерживание толпы",
    tr: "Kalabalık kontrolü",
    ar: "السيطرة على الحشود",
    zh: "人群管制",
  },
  // Delivery of verbal / quick battle orders.
  delivery: {
    ru: "Доведение приказа",
    tr: "Emir sunumu",
    ar: "إلقاء الأوامر",
    zh: "宣达",
  },
  // The enlarged sketch of the objective prepared for orders.
  enlargement: {
    ru: "Увеличенная схема",
    tr: "Büyütülmüş kroki",
    ar: "المخطط المكبَّر",
    zh: "放大略图",
  },
  finalrv: {
    ru: "Конечный пункт сбора (FRV)",
    tr: "Son buluşma noktası (FRV)",
    ar: "نقطة الالتقاء النهائية (FRV)",
    zh: "最终集合点（FRV）",
  },
  firstaid: {
    ru: "Первая помощь",
    tr: "İlk yardım",
    ar: "الإسعافات الأولية",
    zh: "急救",
  },
  missiondescription: {
    ru: "Описание задачи",
    tr: "Görev tanımı",
    ar: "وصف المهمة",
    zh: "任务描述",
  },
  modelpreparation: {
    ru: "Подготовка макета",
    tr: "Maket hazırlığı",
    ar: "إعداد المجسم",
    zh: "沙盘制作",
  },
  movement: { ru: "Передвижение", tr: "İntikal", ar: "التحرك", zh: "机动" },
  optionsadopted: {
    ru: "Принятые решения",
    tr: "Seçilen seçenekler",
    ar: "الخيارات المعتمدة",
    zh: "所采方案",
  },
  planning: { ru: "Планирование", tr: "Planlama", ar: "التخطيط", zh: "计划拟制" },
  reconnaissance: { ru: "Разведка", tr: "Keşif", ar: "الاستطلاع", zh: "侦察" },
  reportline1: {
    ru: "Рубеж донесения 1",
    tr: "Rapor hattı 1",
    ar: "خط الإبلاغ 1",
    zh: "报告线 1",
  },
  reportline2: {
    ru: "Рубеж донесения 2",
    tr: "Rapor hattı 2",
    ar: "خط الإبلاغ 2",
    zh: "报告线 2",
  },
  reportline3: {
    ru: "Рубеж донесения 3",
    tr: "Rapor hattı 3",
    ar: "خط الإبلاغ 3",
    zh: "报告线 3",
  },
  reportline4: {
    ru: "Рубеж донесения 4",
    tr: "Rapor hattı 4",
    ar: "خط الإبلاغ 4",
    zh: "报告线 4",
  },
  reportline5: {
    ru: "Рубеж донесения 5",
    tr: "Rapor hattı 5",
    ar: "خط الإبلاغ 5",
    zh: "报告线 5",
  },
  searchrescue: {
    ru: "Поиск и спасение",
    tr: "Arama kurtarma",
    ar: "البحث والإنقاذ",
    zh: "搜救",
  },
  securearea: {
    ru: "Оцепление района",
    tr: "Bölgenin emniyete alınması",
    ar: "تطويق المنطقة",
    zh: "封控现场",
  },
  // The two banks of the water obstacle.
  securityofbanks: {
    ru: "Охранение берегов",
    tr: "Kıyı emniyeti",
    ar: "تأمين الضفتين",
    zh: "两岸警戒",
  },
  tacticalcrossing: {
    ru: "Тактическая переправа",
    tr: "Taktik geçiş",
    ar: "العبور التكتيكي",
    zh: "战术泅渡",
  },
  tacticalmovement: {
    ru: "Тактическое передвижение",
    tr: "Taktik intikal",
    ar: "التحرك التكتيكي",
    zh: "战术机动",
  },
  tacticaldrills: {
    ru: "Тактические приёмы",
    tr: "Taktik teamüller",
    ar: "الإجراءات التكتيكية",
    zh: "战术动作",
  },
  teamunderstanding: {
    ru: "Усвоение задачи командой",
    tr: "Ekibin görevi kavraması",
    ar: "استيعاب الفريق للمهمة",
    zh: "小组理解程度",
  },
  terrainenemy: {
    ru: "Местность и противник",
    tr: "Arazi ve düşman",
    ar: "الأرض والعدو",
    zh: "地形与敌情",
  },
  time: { ru: "Время", tr: "Süre", ar: "الزمن", zh: "用时" },
  timelycompletion: {
    ru: "Выполнение в срок",
    tr: "Zamanında tamamlama",
    ar: "الإنجاز في الوقت المحدد",
    zh: "按时完成",
  },
  waterproofingequipment: {
    ru: "Гидроизоляция снаряжения",
    tr: "Teçhizatın su geçirmez hâle getirilmesi",
    ar: "عزل المعدات عن الماء",
    zh: "装备防水",
  },
};

/* ------------------------------------------------------------------ *
 * Public API — every function falls back to the original English text.
 * ------------------------------------------------------------------ */

export function translateEventCategory(category: string, locale: Locale): string {
  return lookup(CATEGORIES, category, locale);
}

export function translateEventDifficulty(difficulty: string, locale: Locale): string {
  return lookup(DIFFICULTIES, difficulty, locale);
}

/**
 * Known catalogue durations first; otherwise a bare "<n> min" / "<n> mins" is
 * localized generically so a newly added event still reads correctly. Anything
 * else falls back to the original text.
 */
export function translateEventDuration(duration: string, locale: Locale): string {
  if (locale === "en") return duration;

  const known = DURATIONS[norm(duration)];
  if (known) return known[locale];

  const minutes = /^\s*(\d+)\s*(?:min|mins|minutes)\s*$/i.exec(duration);
  if (minutes) return MINUTES[locale](Number(minutes[1]));

  return duration;
}

export function translateBreakdownLabel(label: string, locale: Locale): string {
  return lookup(BREAKDOWN_LABELS, label, locale);
}
