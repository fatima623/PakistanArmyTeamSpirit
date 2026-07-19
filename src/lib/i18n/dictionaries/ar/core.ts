import type { core as enCore } from "../en/core";

// Arabic translations for the portal's core surfaces (right-to-left).

// Arabic counts days with four forms: singular (1), dual (2), paucal (3–10,
// noun in the plural) and the 11+ form (noun in the accusative singular).
function arDaysLeft(n: number): string {
  const mod100 = n % 100;
  if (n === 1) return "بقي يوم واحد";
  if (n === 2) return "بقي يومان";
  if (mod100 >= 3 && mod100 <= 10) return `بقيت ${n} أيام`;
  return `بقي ${n} يومًا`;
}

export const core: typeof enCore = {
  common: {
    back: "رجوع",
    next: "التالي",
    backToDashboard: "العودة إلى لوحة التحكم",
    language: "اللغة",
    selectLanguage: "اختر اللغة",
    loadingTitle: "لوحة تحكم المشارك",
    loadingDesc: "جارٍ تحميل إجراءات المشارك ولوحات الحالة.",
    toasts: {
      genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
      saveSuccess: "تم حفظ التغييرات بنجاح",
      validationError: "يرجى مراجعة النموذج وتصحيح الأخطاء.",
    },
  },

  meta: {
    home: "الرئيسية",
    announcements: "الإعلانات",
    awards: "الجوائز والتكريم",
    login: "تسجيل الدخول",
    register: "التسجيل",
    exerciseContour: "Exercise Contour",
    gallery: "المعرض",
    international: "المشاركة الدولية",
    keyDates: "التواريخ الرئيسية",
    privacy: "سياسة الخصوصية",
    dashboard: "لوحة التحكم",
    unitInfo: "تحديث بيانات الوحدة",
    hostInfo: "معلومات الاستضافة",
    journey: "مسار التسجيل",
    support: "الدعم",
    supportTicket: "طلب دعم",
    confirmParticipation: "تأكيد المشاركة",
  },

  nav: {
    ariaLabel: "بوابة المشارك",
    portalName: "بوابة PATS",
    participant: "مشارك",
    menu: "القائمة",
    done: "تم",
    logout: "تسجيل الخروج",
    dashboard: "لوحة التحكم",
    unitInformation: "معلومات الوحدة",
    teamRegistration: "تسجيل الفريق",
    payment: "الدفع",
    flightDetails: "تفاصيل الرحلة",
    hostInformation: "معلومات الاستضافة",
    support: "الدعم",
    journeyComplete: "اكتمل التسجيل",
  },

  dashboard: {
    welcomeBack: "مرحبًا بعودتك",
    unitNotRegistered: "لم يتم تسجيل الوحدة",
    allStagesComplete: "اكتملت جميع المراحل",
    membersCount: (n) => `${n} من أعضاء الفريق`,
    scheduleEyebrow: "الجدول",
    dataEntryPeriods: "فترات إدخال البيانات",
    dataEntryDesc: "متاح فقط بعد التحقق من الدفع.",
    noPeriods: "لا توجد فترات مجدولة بعد.",
    deadlinesEyebrow: "المواعيد النهائية",
    timeline: "الجدول الزمني",
    updatesEyebrow: "التحديثات",
    latestNews: "أحدث الأخبار",
    noNews: "لا توجد أخبار بعد.",
    timelinePanel: {
      closed: "مغلق",
      dueToday: "الموعد النهائي اليوم",
      daysLeft: (n) => arDaysLeft(n),
      deadlines: "المواعيد النهائية",
      noDeadlines: "لم يتم تحديد أي مواعيد نهائية بعد.",
      keyDates: "التواريخ الرئيسية",
      noKeyDates: "لم يتم نشر أي تواريخ رئيسية بعد.",
      deadlineLabels: {
        registration: "الموعد النهائي للتسجيل",
        payment: "الموعد النهائي للدفع",
      },
    },
  },

  workflowPanel: {
    registrationProgress: "تقدم التسجيل",
    ariaLabel: "سير عمل التسجيل",
    progressAria: "تقدم سير العمل",
    countComplete: (done, total) => `اكتمل ${done} من ${total}`,
  },

  statusBar: {
    underReviewTitle: "الطلب قيد المراجعة",
    underReviewText:
      "يتم مراجعة تسجيلك من قبل PATS. سنرسل لك بريدًا إلكترونيًا بمجرد الموافقة عليه.",
    confirmedTitle: "تم التأكيد — أنت مؤهل للمشاركة في PATS 2026",
    confirmedTextWithDates: (dates) =>
      `تم التحقق من دفعتك وتأكيد مكانك. المواعيد المقررة: ${dates}.`,
    confirmedText: "تم التحقق من دفعتك وتأكيد مكانك.",
    approvedTitle: "تمت الموافقة — الدفع مطلوب",
    approvedText:
      "تمت الموافقة على طلبك. أكمل الدفع لتأمين مكانك في المسابقة.",
    returnedTitle: "أُعيد للتصحيح",
    approvedOn: (date) => `تمت الموافقة في ${date}`,
    goToPayment: "الانتقال إلى إرسال الدفع",
    paymentVerified: "تم التحقق من الدفع",
  },

  registration: {
    statuses: {
      PENDING: "قيد الانتظار",
      UNDER_REVIEW: "قيد المراجعة",
      APPROVED: "معتمد",
      REJECTED: "مرفوض",
      RETURNED: "أُعيد للتصحيح",
    },
    profileEyebrow: "الملف الشخصي",
    title: "تفاصيل التسجيل",
    name: "الاسم",
    unit: "الوحدة",
    email: "البريد الإلكتروني",
    rank: "الرتبة",
    dateRegistered: "تاريخ التسجيل",
    countryOfApplication: "بلد التقديم",
    nationality: "الجنسية",
    branchFormation: "الفرع / التشكيل",
  },

  journey: {
    suspended:
      "تم تعليق حسابك. يرجى التواصل مع إدارة PATS للمساعدة.",
    headers: {
      confirmation: {
        eyebrow: "",
        title: "تأكيد المشاركة",
        subtitle: "أكّد جاهزية فريقك للمشاركة في PATS 2026.",
      },
      verification: {
        eyebrow: "",
        title: "التحقق من التسجيل",
        subtitle:
          "تتم مراجعة تفاصيل تسجيلك من قبل المديرية الرياضية (SD).",
      },
      payment: {
        eyebrow: "",
        title: "إجراء الدفع",
        subtitle:
          "أكمل دفع رسوم التسجيل لتأكيد مشاركتك في PATS 2026.",
      },
      teamRegistration: {
        eyebrow: "تسجيل الفريق",
        title: "أعضاء الفريق",
        subtitle:
          "أضف أعضاء فريقك أدناه. بعد الحفظ، حدّد القائمة كمكتملة لفتح تفاصيل الرحلة.",
      },
      roster: {
        eyebrow: "تسجيل الفريق",
        title: "أعضاء الفريق",
        subtitle:
          "أضف أعضاء فريقك أدناه. بعد الحفظ، حدّد القائمة كمكتملة لفتح تفاصيل الرحلة.",
      },
      flights: {
        eyebrow: "",
        title: "تفاصيل الرحلة",
        subtitle:
          "أرسل معلومات سفر فريقك ووثائق جواز السفر / التذكرة في إرسال واحد.",
      },
      hostInfo: {
        eyebrow: "",
        title: "معلومات الاستضافة",
        subtitle: "تفاصيل الاستضافة التي ينشرها المنظمون لفريقك.",
      },
    },
    banners: {
      participationConfirmed: "تم تأكيد المشاركة.",
      confirmedOnSub: (date, unitName) =>
        `تم التأكيد في ${date}${unitName ? ` لصالح ${unitName}` : ""}. هذه الخطوة للعرض فقط.`,
      verifiedBySd: "تم التحقق من التسجيل من قبل المديرية الرياضية (SD).",
      verifiedBySdSub:
        "تفاصيل تسجيلك أدناه للعرض فقط. تابع إلى الخطوة التالية.",
      registrationVerification: "التحقق من التسجيل",
      messageFromSd: "رسالة من المديرية الرياضية:",
      paymentVerifiedMt: "تم التحقق من الدفع من قبل فريق الإدارة (MT).",
      paymentVerifiedMtSub:
        "سجلات الدفع الخاصة بك أدناه للعرض فقط. تابع إلى الخطوة التالية.",
      paymentDeadlinePassed:
        "انتهى الموعد النهائي للدفع، لذا أُغلقت عمليات إرسال الدفع الجديدة. يرجى التواصل مع إدارة PATS إذا كنت لا تزال بحاجة إلى إكمال دفعتك.",
      noPaymentInfo:
        "لا تتوفر معلومات دفع لحسابك بعد. يرجى المحاولة مرة أخرى بعد قليل.",
      teamRegistered: "تم تسجيل الفريق.",
      teamRegisteredSub: (date) =>
        `تم التسجيل في ${date}. املأ قائمة أعضائك أدناه.`,
      rosterCompleted: "اكتملت القائمة.",
      rosterCompletedSub: (count, date) =>
        `تم تأكيد ${count} عضو في ${date}. القائمة للعرض فقط ما لم تُعِد الإدارة فتحها.`,
      hostInfoTitle: "معلومات الاستضافة",
      hostInfoAvailable:
        "تم نشر تفاصيل استضافة فريقك من قبل المنظمين.",
      hostInfoLocked:
        "تصبح تفاصيل الاستضافة متاحة هنا بعد أن تُستكمل تفاصيل رحلتك ويقوم المنظمون بنشرها.",
      openHostInfo: "فتح معلومات الاستضافة",
    },
    wizard: {
      stepsAria: "خطوات التسجيل",
      lockedTitle: "مقفل — أكمل الخطوات السابقة أولًا",
      stepXofY: (current, total, activeLabel) =>
        `الخطوة ${current} من ${total}${activeLabel ? ` — ${activeLabel}` : ""}`,
      nextLockedTitle: "أكمل هذه الخطوة لفتح الخطوة التالية",
      finalStep: "الخطوة الأخيرة",
      finalStepTitle: "هذه هي الخطوة الأخيرة",
    },
  },

  confirm: {
    dateLocale: "ar",
    actionRequired: "إجراء مطلوب",
    title: "أكّد مشاركتك",
    description:
      "قبل الدخول إلى لوحة تحكم المشارك، يرجى تأكيد ما إذا كان فريقك سيكون متاحًا للمشاركة في التمرين. التأكيد يمنحك الوصول إلى مراحل التسجيل التالية. الرفض يسجّل خروجك — يمكنك تسجيل الدخول مرة أخرى والتأكيد في أي وقت قبل الموعد النهائي أدناه.",
    previouslyDeclined:
      "لقد رفضت التسجيل سابقًا. لا يزال بإمكانك التأكيد قبل انتهاء الموعد النهائي.",
    confirmationDeadline: "الموعد النهائي للتأكيد",
    deadlineExpired:
      "انتهى الموعد النهائي للتأكيد. لم يعد التأكيد ممكنًا. يرجى التواصل مع المنظمين للمساعدة.",
    days: "أيام",
    hours: "ساعات",
    min: "دقائق",
    sec: "ثوانٍ",
    remaining: "متبقٍ",
    timeRemainingAria: "الوقت المتبقي للتأكيد",
    toBeAnnounced: "سيُعلن عنه المنظمون.",
    rejectPrompt:
      "رفض التسجيل وتسجيل الخروج؟ يمكنك تسجيل الدخول مرة أخرى والتأكيد لاحقًا، طالما لم ينتهِ الموعد النهائي.",
    yesReject: "نعم، ارفض وسجّل الخروج",
    goBack: "العودة",
    confirm: "تأكيد",
    reject: "رفض",
    signOut: "تسجيل الخروج",
    confirmTitleAttr: "أكّد تسجيلك",
    deadlinePassedAttr: "انتهى الموعد النهائي للتأكيد",
    footer:
      "يُسجَّل قرارك مع طابع زمني لطاقم التنظيم. تحتاج مساعدة؟ تواصل مع الدعم من صفحة تسجيل الدخول.",
    toastConfirmed: "تم تأكيد التسجيل — أهلًا بك!",
    toastRejected: "تم رفض التسجيل. جارٍ تسجيل خروجك…",
  },

  hostInfo: {
    title: "معلومات الاستضافة",
    subtitleLocked: "معلومات الاستضافة والوصول النهائية من المنظمين.",
    subtitle: "معلومات الاستضافة والفريق والوصول النهائية — للعرض فقط.",
    notAvailableTitle: "غير متاح بعد",
    notAvailableText:
      "يصبح قسم معلومات الاستضافة مرئيًا بعد مراجعة تفاصيل رحلتك واستكمالها من قبل الإدارة وقيام المنظمين بنشر معلومات الاستضافة.",
    participatingCountries: "الدول المشاركة",
    registeredTeams: "الفرق المسجّلة",
    yourFinalizedTravelers: "المسافرون المعتمدون لديك",
    hostingArrivalInfo: "معلومات الاستضافة والوصول",
    countryWiseTeamNumbers: "أعداد الفرق حسب الدولة",
    sNo: "م",
    country: "الدولة",
    teams: "الفرق",
    noRegisteredTeams: "لا توجد فرق مسجّلة بعد.",
    unspecified: "غير محدد",
    yourTeamWithUnit: (unit) => `فريقك — ${unit}`,
    yourTeam: "فريقك",
    serialNumber: "الرقم التسلسلي",
    rank: "الرتبة",
    fullName: "الاسم الكامل",
    gender: "الجنس",
    finalizedFlightInfo: "معلومات الرحلة النهائية",
    traveler: "المسافر",
    passengerName: "اسم الراكب",
    passportNo: "رقم جواز السفر",
    documents: "المستندات",
    noFlightRecords: "لا توجد سجلات رحلات.",
    passport: "جواز السفر",
    ticket: "التذكرة",
    readOnlyNote:
      "هذه المعلومات للعرض فقط. تواصل مع المنظمين لأي تصحيحات.",
  },
};
