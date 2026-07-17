import type { events as enEvents } from "../en/events";

/**
 * Arabic distinguishes six plural categories (zero, one, two, few = 3–10,
 * many = 11–99, other = 100+), and the counted noun changes form with each.
 * `Intl.PluralRules` implements the CLDR rule; callers supply the form for
 * every category so the noun always agrees with the numeral.
 */
const arPluralRules = new Intl.PluralRules("ar");
function plural(count: number, forms: Record<Intl.LDMLPluralRule, string>): string {
  return forms[arPluralRules.select(count)];
}

// Arabic translations for the public Events Detail page (right-to-left).
export const events: typeof enEvents = {
  meta: {
    title: "تفاصيل الفعاليات",
    description:
      "كل فعالية مُقيَّمة في تمرين Pakistan Army Team Spirit — الدرجات ومستوى الصعوبة والإيجاز الكامل لكل فعالية تنافسية.",
  },

  hero: {
    badge: "دليل الفعاليات التنافسية",
    titleLead: "تفاصيل",
    titleAccent: "الفعاليات",
    lede:
      "كل فعالية مُقيَّمة في التمرين — مهام الملاحة والاستطلاع والقتال والإسعاف الطبي والقيادة — مع الدرجات ومستوى الصعوبة والإيجاز الكامل خلف كل بطاقة.",
  },

  filters: {
    searchPlaceholder: "البحث في الفعاليات…",
    searchAria: "البحث في الفعاليات التنافسية",
    all: "الكل",
  },

  summary: (serials, marks) =>
    `${plural(serials, {
      zero: "لا توجد فعاليات مُقيَّمة",
      one: "فعالية مُقيَّمة واحدة",
      two: "فعاليتان مُقيَّمتان",
      few: `${serials} فعاليات مُقيَّمة`,
      many: `${serials} فعالية مُقيَّمة`,
      other: `${serials} فعالية مُقيَّمة`,
    })} · إجمالي ${plural(marks, {
      zero: "صفر درجة",
      one: "درجة واحدة",
      two: "درجتان",
      few: `${marks} درجات`,
      many: `${marks} درجة`,
      other: `${marks} درجة`,
    })}`,

  card: {
    marksUnit: (marks) =>
      plural(marks, {
        zero: "درجة",
        one: "درجة",
        two: "درجتان",
        few: "درجات",
        many: "درجة",
        other: "درجة",
      }),
    thumbAlt: (title) => `صورة من فعالية ${title}`,
    viewDetails: "عرض التفاصيل",
  },

  empty: "لا توجد فعاليات مطابقة للمرشِّحات الحالية.",

  modal: {
    participants: "المشاركون",
    breakdown: "توزيع الدرجات",
    total: "إجمالي درجات هذه الفعالية",
  },
};
