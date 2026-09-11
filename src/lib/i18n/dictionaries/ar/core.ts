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
    tour: "جولة الموقع",
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
    support: "الاستفسارات / الأسئلة الشائعة",
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
    tour: "الجولة الافتراضية",
    support: "استفسار / أسئلة شائعة",
    journeyComplete: "اكتمل التسجيل",
  },

  dashboard: {
    welcomeBack: "مرحبًا بعودتك",
    unitNotRegistered: "لم يتم تسجيل الوحدة",
    allStagesComplete: "اكتملت جميع المراحل",
    membersCount: (n) => `${n} من أعضاء الفريق`,
    scheduleEyebrow: "الجدول",
    dataEntryPeriods: "فترات إدخال البيانات",
    dataEntryDesc: "الفترات المجدولة لإرسال بيانات تسجيلك.",
    noPeriods: "لا توجد فترات مجدولة بعد.",
    deadlinesEyebrow: "المواعيد النهائية",
    timeline: "الجدول الزمني",
    updatesEyebrow: "التحديثات",
    latestNews: "أحدث التحديثات",
    noNews: "لا توجد تحديثات بعد.",
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
    inProgressTitle: "التسجيل قيد الإنجاز",
    inProgressText:
      "أكمل كل خطوة أدناه. تعتمد PATS تسجيلك بعد اكتمال جميع الخطوات.",
    underReviewTitle: "اكتمل التسجيل",
    underReviewText:
      "اكتمل تسجيلك — تم إرسال جميع الخطوات. ستقوم PATS بالتحقق منه، وستصلك رسالة تأكيد بالبريد الإلكتروني عند اعتماده.",
    confirmedTitle: "تم الاعتماد — أنت مؤهل للمشاركة في PATS 2026",
    confirmedTextWithDates: (dates) =>
      `تم اعتماد تسجيلك من قبل PATS وتأكيد مكانك. المواعيد المقررة: ${dates}.`,
    confirmedText:
      "تم اعتماد تسجيلك من قبل PATS وتأكيد مكانك.",
    returnedTitle: "أُعيد للتصحيح",
    approvedOn: (date) => `تمت الموافقة في ${date}`,
    continueRegistration: "متابعة التسجيل",
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
      unitInfo: {
        eyebrow: "التسجيل",
        title: "معلومات الوحدة",
        subtitle:
          "أدخل بيانات وحدتك وقائدها. الحفظ يفتح تسجيل الفريق.",
      },
      verification: {
        eyebrow: "",
        title: "اعتماد التسجيل",
        subtitle:
          "تعتمد PATS تسجيلك بعد اكتمال جميع الخطوات.",
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
      verifiedBySd: "تم التحقق من التسجيل من قبل PATS.",
      verifiedBySdSub:
        "تفاصيل تسجيلك أدناه للعرض فقط. تابع إلى الخطوة التالية.",
      registrationVerification: "التحقق من التسجيل",
      messageFromSd: "رسالة من PATS:",
      unitInfoSaved: "تم حفظ معلومات الوحدة.",
      unitInfoSavedSub: (date) =>
        `تم التسجيل في ${date}. يمكنك تحديثها حتى اعتماد تسجيلك.`,
      flightsComplete: "مستندات السفر مكتملة.",
      flightsCompleteSub:
        "لدى كل مسافر جواز سفر وتذكرة على الملف. راجع تسجيلك بالكامل في الخطوة التالية وأرسله للاعتماد.",
      continueToApproval: "المتابعة إلى اعتماد التسجيل",
      awaitingApproval: "بانتظار اعتماد PATS",
      awaitingApprovalSub:
        "اكتملت جميع الخطوات. ستقوم PATS بمراجعة تسجيلك واعتماده.",
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

  approval: {
    eyebrow: "الخطوة الأخيرة",
    title: "راجع تسجيلك",
    desc:
      "اقرأ كل التفاصيل قبل إرسالها إلى PATS. استخدم روابط التعديل لتصحيح أي خطأ — تراجع PATS التسجيل كما هو عند الإرسال.",
    edit: "تعديل",
    editAria: (section: string) => `تعديل ${section}`,
    sections: {
      participant: "بيانات المشارك",
      unit: "معلومات الوحدة",
      co: "بيانات القائد / النائب",
      roster: "أعضاء الفريق",
      flights: "تفاصيل الرحلة",
    },
    serviceArm: "الخدمة / السلاح",
    onFile: "مُرفق",
    missing: "ناقص",
    noRoster: "لم تتم إضافة أعضاء بعد.",
    noFlights: "لم يتم تسجيل بيانات رحلات بعد.",
    submit: {
      title: "الإرسال للاعتماد",
      desc: "اكتملت جميع الخطوات. أرسل تسجيلك إلى PATS للاعتماد.",
      incomplete:
        "أكمل جميع الخطوات أعلاه قبل إرسال التسجيل للاعتماد.",
      action: "إرسال للاعتماد",
      submittedTitle: "أُرسل للاعتماد",
      submittedSub: (date: string) =>
        `أُرسل إلى PATS في ${date}. يمكنك سحبه ما دام لم يصدر قرار.`,
      withdraw: "سحب الإرسال",
      submittedToast: "تم إرسال التسجيل للاعتماد",
      withdrawnToast: "تم سحب الإرسال — يمكنك التعديل وإعادة الإرسال",
      approvedTitle: "معتمد من PATS",
      approvedSub: "تم اعتماد تسجيلك. البيانات أدناه للقراءة فقط.",
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
    rejectConfirmTitle: "هل أنت متأكد أنك غير متاح؟",
    rejectPrompt:
      "تحديد فريقك بأنه غير متاح يسجّل هذا القرار على تسجيلك ويُخرجك من الحساب. لن تفقد شيئًا — يمكنك تسجيل الدخول والتأكيد في أي وقت قبل الموعد النهائي أعلاه.",
    yesReject: "نعم، نحن غير متاحين",
    goBack: "لا، العودة",
    confirm: "متاح",
    reject: "غير متاح",
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
    ticket: "تذكرة الذهاب",
    returnTicket: "تذكرة العودة",
    readOnlyNote:
      "هذه المعلومات للعرض فقط. تواصل مع المنظمين لأي تصحيحات.",
  },
};
