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

  // English pending translation review — the familiarization brief carries
  // military terminology that needs a subject-matter check per locale.
  familiarization: {
    meta: {
      title: "‏التعريف بـ PATS",
      description:
        "‏إحاطة ما قبل الوصول للوحدات المشاركة — مفهوم PATS، والأرض والمسار، وتشكيل الفريق، وتخصيص الأسلحة والمعدات، ونقاط التنسيق.",
    },

    hero: {
      eyebrow: "إحاطة ما قبل الوصول",
      title: "‏التعريف بـ PATS",
      subtitle:
        "كل ما تحتاجه الوحدة المشاركة قبل الوصول — مفهوم التمرين، وطبيعة الأرض والمسار، وتشكيل الفريق، وتخصيص الأسلحة والمعدات، ونقاط التنسيق التي تحكم سير التمرين.",
      metaDuration: "التمرين",
      metaDurationValue: "60 ساعة",
      metaDistance: "المسير",
      metaDistanceValue: "50–60 كم",
      metaTeam: "الدورية",
      metaTeamValue: "8 أفراد",
    },

    anchorsAria: "أقسام هذه الصفحة",
    anchors: {
      concept: "المفهوم",
      terrain: "الأرض",
      route: "المسار",
      team: "الفريق",
      equipment: "المعدات",
      training: "التدريب",
      coordination: "التنسيق",
      "dos-donts": "المسموح والممنوع",
      facilitation: "التسهيلات",
    },

    concept: {
      eyebrow: "المفهوم",
      title: "‏مفهوم PATS",
      description:
        "مسابقة دوريات قائمة على المهام والواجبات تُجرى وفق سيناريو دون تقليدي، وتقيس الخبرة التكتيكية والجَلَد والصفات القتالية على مدى تمرين متواصل مدته 60 ساعة.",
      imageAlt:
        "‏مخطط مفهوم PATS: منطقة التجمع، ومسار التسلل عبر المنطقة الخاضعة لسيطرة الإرهابيين إلى المخبأ ثم الهدف، ومرحلة الانسحاب والمسير السريع الختامي، والمهام المنفَّذة عند كل نقطة تفتيش.",
      imageCaption:
        "‏مفهوم PATS — المخطط التعريفي الصادر في مؤتمر التخطيط الرئيسي.",
    },

    terrain: {
      eyebrow: "الأرض",
      title: "طبيعة الأرض",
      description:
        "الأرض التي تعبرها الدورية والظروف المتوقعة عليها — اطّلع عليها قبل تحديد الملبس والأحذية وإجراءات الطقس البارد.",
      groundTitle: "طبيعة التضاريس",
      demandTitle: "ما تتطلبه الأرض من الدورية",
    },

    route: {
      eyebrow: "المسار",
      title: "تسلسل التمرين",
      description:
        "تتحرك الدورية من منطقة التجمع عبر التسلل والمخبأ واستطلاع الهدف من مسافة قريبة والانسحاب وصولًا إلى المنطقة الختامية.",
      distanceLabel: "المسافة",
      totalLabel: "إجمالي المسير",
      totalValue: "50–60 كم",
    },

    team: {
      eyebrow: "التنظيم",
      title: "تشكيل الفريق",
      description:
        "تشارك كل دولة بدورية واحدة — فريق استطلاع من ثمانية أفراد، إضافة إلى ثنائي احتياطي ومدير للفريق.",
      roleHeading: "الوظيفة",
      strengthHeading: "العدد",
      noteLabel: "ملاحظة",
    },

    equipment: {
      eyebrow: "التخصيص",
      title: "الأسلحة والمعدات",
      description:
        "التخصيص الكامل الذي يحمله كل فرد وما يُصرف لكل فريق. الكميات كما صُرفت؛ لا يجوز التخلص من أي جزء منها أثناء المسير، وتُجرى فحوص وزن عشوائية خلال التمرين.",
      itemHeading: "الأصناف",
      indlHeading: "لكل فرد",
      teamHeading: "لكل فريق",
      notApplicable: "غير مخصص",
      groups: {
        personal: "الملبس والأسلحة والمعدات الشخصية",
        stores: "معدات الملاحة والمعدات الفنية والتخصصية",
      },
      note: "إجمالي حمولة الفريق 200 كجم، شاملة قوارير المياه المملوءة والذخيرة وجهاز التتبع المُسلَّم. أما بقية المعدات فحسب التعليمات الصادرة.",
    },

    training: {
      eyebrow: "التهيئة",
      title: "التدريب التعريفي",
      description:
        "تهيئة ما قبل المسابقة للفرق الدولية، تُستكمل قبل التحرك إلى منطقة التمرين، مع التركيز بوجه خاص على:",
    },

    coordination: {
      eyebrow: "التنسيق",
      title: "نقاط التنسيق",
      description:
        "تعليمات صادرة عن مؤتمر التخطيط الرئيسي. وقد يترتب على مخالفتها خصم درجات أو الاستبعاد.",
    },

    dosDonts: {
      eyebrow: "السلوك",
      title: "المسموح والممنوع",
      description:
        "الالتزامات والمحظورات السارية على كل مشارك طوال مدة الزيارة.",
      dos: "مسموح",
      donts: "ممنوع",
    },

    facilitation: {
      eyebrow: "الدعم",
      title: "التسهيلات والرعاية الطبية والجوانب القانونية",
      description:
        "ما يوفره الجيش الباكستاني، وحدود المسؤولية الطبية، والموقف القانوني المُبلَّغ لجميع الدول المشاركة.",
      facilitationTitle: "يوفره الجيش الباكستاني",
      medicalTitle: "التغطية الطبية",
      legalTitle: "الجوانب القانونية",
      informationTitle: "المعلومات المطلوبة من الفرق",
      informationDeadline: (deadline: string): string =>
        `الموعد النهائي: ${deadline}`,
    },

  },

  carousel: {
    prev: "البطاقات السابقة",
    next: "البطاقات التالية",
  },
};
