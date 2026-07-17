// Arabic — mirrors `en/marketing.ts` exactly (shape enforced via `typeof en`).
// Right-to-left: the "back" / "more" arrows are written as ← (pointing left,
// i.e. forward in RTL) rather than the English →, and the page separator "·"
// is kept because it is direction-neutral.
// See the English file for what belongs here and what is handled by
// `@/lib/i18n/pats-content-i18n`.

import type { marketing as enMarketing } from "../en/marketing";

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

export const marketing: typeof enMarketing = {
  operations: {
    meta: {
      title: "العمليات",
      description: "التدريبات التكتيكية ونقاط التفتيش ونظام التقييم في مسابقة PATS.",
    },

    hero: {
      eyebrow: "اختيار المهمة",
      title: "العمليات",
      subtitle:
        "اختر فعالية تكتيكية. يتضمن كل إيجاز مهمة الأهداف ومصفوفة التقييم والارتباط بمرحلة العملية.",
      metaEvents: "الفعاليات",
      metaTotalMarks: "إجمالي الدرجات",
      metaDuration: "المدة",
      metaDurationValue: "60 ساعة",
    },

    overview: {
      eyebrow: "المهمة",
      title: "نظرة عامة على العملية",
    },

    scoredSummary: (events: number, marks: string): string =>
      `${plural(events, {
        zero: "لا توجد فعاليات مُقيَّمة",
        one: "فعالية مُقيَّمة واحدة",
        two: "فعاليتان مُقيَّمتان",
        few: `${events} فعاليات مُقيَّمة`,
        many: `${events} فعالية مُقيَّمة`,
        other: `${events} فعالية مُقيَّمة`,
      })} · إجمالي ${marks} درجة على مدى التمرين`,

    route: {
      eyebrow: "المسار",
      title: "تخطيط الفعاليات",
      description:
        "تسلسل نقاط التفتيش من منطقة التجمع مرورًا بالتسلل واستطلاع الهدف عن قرب (CTR) وحتى الانسحاب.",
    },

    map: {
      routeTitle: "مسار التمرين — التسلسل المباشر",
      glossaryTitle: "شاشة العمليات — المصطلحات",
      entry: "دخول",
      exit: "خروج",
    },

    phases: {
      preparation: "التحضير",
      infiltration: "التسلل",
      hideout: "المخبأ",
      ctr: "استطلاع الهدف عن قرب",
      exfiltration: "الانسحاب",
      terminal: "المرحلة الختامية",
    },

    phaseSummary: (count: number): string =>
      `${plural(count, {
        zero: "لا توجد فعاليات مُقيَّمة",
        one: "فعالية مُقيَّمة واحدة",
        two: "فعاليتان مُقيَّمتان",
        few: `${count} فعاليات مُقيَّمة`,
        many: `${count} فعالية مُقيَّمة`,
        other: `${count} فعالية مُقيَّمة`,
      })} في هذه المرحلة.`,

    phaseCarouselAria: (phase: string): string => `الفعاليات التنافسية: ${phase}`,

    rules: {
      eyebrow: "القواعد",
      title: "نقاط التنسيق",
      description:
        "تعليمات العمليات والجزاءات — قد يؤدي عدم الالتزام إلى الاستبعاد من المسابقة.",
    },

    card: {
      missionBrief: "إيجاز المهمة",
    },

    difficulty: {
      foundational: "أساسي",
      intermediate: "متوسط",
      advanced: "متقدم",
      elite: "نخبة",
    },

    category: {
      inspection: "التفتيش",
      communications: "الاتصالات",
      navigation: "الملاحة",
      reconnaissance: "الاستطلاع",
      medical: "الإسعاف الطبي",
      fires: "الإسناد الناري",
      assault: "الاقتحام",
      survival: "البقاء",
      admin: "الإدارة",
    },

    brief: {
      back: "← اختيار المهمة",
      classified: "إيجاز عمليات سري",
      totalMarks: "إجمالي الدرجات",
      phase: "المرحلة",
      category: "الفئة",
      difficulty: "الصعوبة",
      checkpoint: "نقطة التفتيش",
      objective: "غاية المهمة",
      objectives: "الأهداف العملياتية",
      scoring: "مصفوفة التقييم",
      marksUnit: "درجة",
      criticalNotice: "تنبيه بالغ الأهمية",
      skills: "المهارات التكتيكية",
      relatedArchive: "الأرشيف ذو الصلة",
      allMissions: "جميع المهام",
      fallbackTitle: "عملية",
    },
  },

  documents: {
    meta: {
      title: "المستندات",
      description:
        "المرجع الرسمي لمسابقة PATS — إيجازات تفاعلية متوافقة مع الكتيّب الإعلامي.",
    },

    hero: {
      eyebrow: "مكتبة المراجع",
      title: "مركز المستندات",
      subtitle:
        "المرجع الرسمي لمسابقة PATS — تصفّح الإيجازات التفاعلية المتوافقة مع الكتيّب الإعلامي.",
      metaSource: "المصدر",
      metaSourceValue: "الكتيّب الرسمي",
      metaAccess: "الإتاحة",
      metaAccessValue: "إيجازات رقمية",
    },

    library: {
      eyebrow: "المراجع",
      title: "مكتبة المسابقة",
      description:
        "يرتبط كل موضوع بالقسم المقابل له في هذا الموقع. لا تُعرض النسخ الممسوحة الكاملة من الكتيّب — يُرجى استخدام الإيجازات المنظَّمة أدناه.",
    },

    downloadResults: "تنزيل ملف النتائج PDF",
    interactiveOperations: "← العمليات التفاعلية",
    bookletPage: (page: number): string => `الكتيّب ص. ${page}`,
    openBrief: "← فتح الإيجاز",

    sections: {
      overview: "نظرة عامة — PATS",
      history: "التاريخ — الفرق الدولية",
      concept: "مفهوم PATS",
      layout: "تخطيط الفعاليات",
      conduct: "إجراء الفعاليات (الجزء الأول)",
      teamComposition: "تشكيل الفريق",
      scoresAwards: "الدرجات والجوائز",
      weaponEquipment: "السلاح والمعدات",
      coordinatingPoints: "نقاط التنسيق",
    },
  },

  carousel: {
    prev: "البطاقات السابقة",
    next: "البطاقات التالية",
  },
};
