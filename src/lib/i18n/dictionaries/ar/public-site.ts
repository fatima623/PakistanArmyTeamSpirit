import type { publicSite as enPublicSite } from "../en/public-site";

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

// Arabic translations for shared public chrome: marketing nav and login page (right-to-left).
export const publicSite: typeof enPublicSite = {
  nav: {
    home: "الرئيسية",
    eventsDetail: "تفاصيل الفعاليات",
    operations: "العمليات",
    exerciseContour: "محاور التمرين",
    international: "المشاركة الدولية",
    awards: "الجوائز",
    gallery: "معرض الصور",
    announcements: "الإعلانات",
    documents: "الوثائق",
    keyDates: "المواعيد الرئيسية",
    login: "تسجيل الدخول",
  },

  gallery: {
    eyebrow: "الأرشيف الميداني",
    title: "معرض صور المسابقة",
    subtitle:
      "أرشيف وثائقي لنسخ PATS الدولية — الوفود والمراسم والإرث العملياتي.",
    allArchives: "كل الأرشيف",
    photos: (count: number) => `${count} صورة`,
    empty: "يجري تحديث المعرض. يرجى العودة قريبًا.",
    close: "إغلاق",
    previous: "السابق",
    next: "التالي",
  },

  announcements: {
    eyebrow: "إشعارات",
    title: "الإعلانات",
    subtitle: "الإشعارات الرسمية والتحديثات ونشرات التنسيق الخاصة بمسابقة PATS.",
    latest: "الأحدث",
    countLabel: (count: number) => `تم نشر ${count} إعلان`,
    readMore: "اقرأ المزيد",
    empty: "لا توجد إعلانات بعد — يرجى العودة قريبًا.",
  },

  chrome: {
    siteNav: "الموقع",
    mainNav: "التنقل الرئيسي",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    brandHome: "الصفحة الرئيسية لـ PATS",
    selectLanguage: "اختر اللغة",
  },

  breadcrumb: {
    home: "الرئيسية",
    label: "مسار التنقل",
  },

  footer: {
    isprWebsite: "موقع ISPR",
    registerNow: "سجّل الآن",
    contactUs: "اتصل بنا",
  },

  pages: {
    awards: {
      heroEyebrow: "سجل التكريم",
      heroTitle: "الجوائز والتكريم",
      heroSubtitle:
        "تُقيَّم الفرق في جميع الفعاليات التكتيكية. تحدد النسبة الإجمالية مستوى الميدالية وشهادة المشاركة.",
      metaGold: "ذهبية",
      metaSilver: "فضية",
      metaBronze: "برونزية",
      showcaseLabel: "سجل التكريم",
      showcaseTitle: "الجوائز والأوسمة",
      showcaseSubtitle:
        "تُقيَّم الفرق في جميع الفعاليات التكتيكية. تحدد النسبة الإجمالية مستوى الميدالية وشهادة المشاركة.",
      tierGold: "المستوى الذهبي",
      tierSilver: "المستوى الفضي",
      tierBronze: "المستوى البرونزي",
      tierParticipation: "المشاركة",
      nameGold: "الميدالية الذهبية",
      nameSilver: "الميدالية الفضية",
      nameBronze: "الميدالية البرونزية",
      nameCertificate: "شهادة",
      rangeGold: "75% فأعلى",
      rangeSilver: "من 65% إلى 74.99%",
      rangeBronze: "من 55% إلى 64.99%",
      rangeCertificate: "أقل من 55%",
      standingsTitle: "الترتيب الحالي",
      standingsSubtitle:
        "الدول مُجمَّعة حسب فئة الميدالية التي تؤهلها لها نسبتها الإجمالية حاليًا.",
      standingsBadge: "بيانات مباشرة",
      colMedal: "فئة الميدالية",
      colMinimum: "النسبة الدنيا المطلوبة",
      colCountries: "الدول المؤهلة",
      noTeams: "لا توجد فرق في هذه الفئة",
      standingsFootnote:
        "ترتيب توضيحي لمراجعة القيادة. تُعتمد النتائج النهائية بعد التمرين.",
      teamEyebrow: "الفريق",
      teamTitle: "تشكيل الفريق",
      teamDescription: "الهيكل الرسمي للدورية لفرق المسابقة.",
      teamRoles: [
        { role: "قائد الفريق", qty: "1 × نقيب / ملازم" },
        { role: "نائب قائد الفريق", qty: "1 × رقيب / ما يعادله" },
        { role: "ضابط صف الفريق", qty: "1 × عريف / ما يعادله" },
        { role: "الرشاش الخفيف رقم 1", qty: "1 × جندي / ما يعادله" },
        { role: "الرشاش الخفيف رقم 2", qty: "1 × جندي / ما يعادله" },
        { role: "مشغل اللاسلكي", qty: "1 × جندي / ما يعادله" },
        { role: "رامي", qty: "2 × جندي / ما يعادله" },
        {
          role: "احتياط",
          qty: "1 × نقيب/ملازم + 1 × رقيب/جندي",
        },
        { role: "مدير الفريق", qty: "1 × رائد" },
      ],
    },
    international: {
      heroEyebrow: "الشراكات العالمية",
      heroTitle: "المشاركة الدولية",
      heroSubtitle:
        "تجمع PATS فرق الدوريات من الدول الشريكة عبر مسارح متعددة.",
      metaSince: "منذ",
      metaSinceValue: "2016",
      metaEditions: "النسخ",
      metaEditionsValue: "8 دولية",
      metaReach: "النطاق",
      metaReachValue: "متعدد المسارح",
      mapEyebrow: "خريطة المسرح",
      mapTitle: "الدول المسجَّلة",
      mapDescription:
        "الدول التي لديها فرق مسجَّلة في المسابقة. مرّر المؤشر فوق دولة مميزة لعرض فرقها وسنة تسجيلها.",
      historyEyebrow: "التاريخ",
      historyTitle: "الجدول الزمني للنسخ",
      historyDescription:
        "المشاركة الدولية عبر النسخ المتتالية للمسابقة.",
      orientationEyebrow: "التهيئة",
      orientationTitle: "التدريب التعريفي",
      orientationDescription:
        "التهيئة قبل المسابقة للفرق الدولية قبل التحرك.",
      orientationModules: [
        "الرماية / ضبط التصويب (أسلحة المسابقة)",
        "الملاحة / قراءة الخرائط",
        "معدات الإشارة",
        "الدفاع الكيميائي والبيولوجي والإشعاعي والنووي (CBRN)",
        "AFOS / ATGP",
        "الاستطلاع الأرضي للمنطقة",
      ],
      historyNarrative: [
        "بدأت PATS منذ عام 2005 كتمرين ملاحي يركّز على التحمل واللياقة البدنية.",
        "أُدمجت الدروس المستفادة من عمليات مكافحة الإرهاب في صورة فعاليات واقعية وسيناريوهات ميدانية — عمليات دون تكتيكية في بيئات تقليدية وغير تقليدية.",
        "أدى الاهتمام المتزايد من الدول الصديقة إلى إطلاق PATS الدولية عام 2016، بما يتيح تبادل الخبرات الثرية والتعلّم المتبادل.",
      ],
      mapAria: "خريطة العالم للدول المسجَّلة",
      mapCaption: (count: number) =>
        `${plural(count, {
          zero: "لا دول ممثَّلة",
          one: "دولة واحدة ممثَّلة",
          two: "دولتان ممثَّلتان",
          few: `${count} دول ممثَّلة`,
          many: `${count} دولة ممثَّلة`,
          other: `${count} دولة ممثَّلة`,
        })} — مرّر المؤشر فوق دولة مميزة لعرض فرقها.`,
      mapEmpty: "ستظهر الدول المسجَّلة هنا عند تسجيل الفرق.",
      mapCountryAria: (country: string, count: number) =>
        `${country}: ${plural(count, {
          zero: "لا فرق مسجَّلة",
          one: "فريق مسجَّل واحد",
          two: "فريقان مسجَّلان",
          few: `${count} فرق مسجَّلة`,
          many: `${count} فريقًا مسجَّلًا`,
          other: `${count} فريق مسجَّل`,
        })}`,
      tooltipMore: (count: number) => `+${count} أخرى`,
    },
    keyDates: {
      heroEyebrow: "الجدول",
      heroTitle: "المواعيد الرئيسية",
      heroSubtitle:
        "مواعيد مهمة لدورة مسابقة PATS. جميع الأوقات بتوقيت باكستان القياسي (PKT) ما لم يُذكر خلاف ذلك.",
      sectionEyebrow: "الجدول الزمني",
      sectionTitle: "جدول المسابقة",
      sectionDescription:
        "الجدول الزمني الرسمي للتسجيل والتمرين والمعالم الإدارية.",
      empty: "لم يتم تكوين مواعيد رئيسية.",
    },
    privacy: {
      heroEyebrow: "قانوني",
      heroTitle: "سياسة الخصوصية",
      body1: (siteName: string) =>
        `تلتزم ${siteName} بحماية معلوماتك الشخصية. توضح هذه السياسة كيفية جمعنا للبيانات المُرسَلة عبر بوابة التسجيل هذه واستخدامها وحمايتها.`,
      body2: (siteName: string, org: string) =>
        `بتسجيلك على هذا الموقع، فإنك توافق على معالجة بياناتك لأغراض إدارة المشاركة في ${siteName}، بما في ذلك التواصل مع وحدتك والتنسيق مع ${org}.`,
      body3Prefix: "للاطلاع على تفاصيل السياسة الكاملة أو لممارسة حقوقك في البيانات، تواصل مع ",
      externalLink: "عرض سياسة الخصوصية الخارجية",
    },
  },

  login: {
    hero: {
      eyebrow: "بوابة المشاركين",
      title: "تسجيل الدخول",
      subtitle: "ادخل إلى لوحة تحكم دورياتك وحالة تسجيلك.",
    },
    intro: {
      eyebrow: "دخول آمن",
      title: "تسجيل دخول المشارك",
      body: "استخدم بيانات اعتماد دوريتك المعتمدة للدخول إلى لوحة تحكم المشارك، ومتابعة حالة الرسوم، ومراجعة خطوات التنسيق الرئيسية قبل التحرك.",
      checklist: [
        "حسابات الدوريات المعتمدة فقط",
        "تتبّع حالة الدفع والتسجيل",
        "وصول مباشر إلى إجراءات المشارك والتحديثات",
      ],
    },
    card: {
      eyebrow: "وصول المشارك",
      title: "سجّل الدخول للمتابعة",
      description: "أدخل البريد الإلكتروني وكلمة المرور المعتمدين لحساب فريقك.",
      emailLabel: "عنوان البريد الإلكتروني",
      passwordLabel: "كلمة المرور",
      rememberHintOn: "سيبقى هذا الجهاز مسجّل الدخول لمدة تصل إلى 30 يومًا.",
      rememberHintOff: "بدون خيار تذكّرني، تنتهي جلستك بعد 24 ساعة.",
      rememberMe: "تذكّرني",
      signingIn: "جارٍ تسجيل الدخول…",
      login: "تسجيل الدخول",
      forgot: "هل نسيت كلمة المرور؟",
      footerPrefix: "إذا لم تكن قد سجّلت بعد، يرجى",
      footerLink: "النقر هنا لتسجيل وحدتك",
    },
    validation: {
      invalidEmail: "أدخل عنوان بريد إلكتروني صالحًا.",
      passwordRequired: "كلمة المرور مطلوبة.",
      emailPasswordRequired: "البريد الإلكتروني وكلمة المرور مطلوبان.",
    },
    toasts: {
      registered:
        "تم إرسال التسجيل. تحقق من بريدك الوارد للحصول على رابط التحقق قبل تسجيل الدخول.",
      passwordReset: "تم تحديث كلمة المرور. يرجى تسجيل الدخول بكلمة المرور الجديدة.",
      verified: "تم التحقق من البريد الإلكتروني. يمكنك تسجيل الدخول الآن.",
    },
  },
};
