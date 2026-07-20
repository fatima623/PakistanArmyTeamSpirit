import type { flights as enFlights } from "../en/flights";

export const flights: typeof enFlights = {
  doc: {
    uploaded: "تم الرفع",
    notUploadedYet: "لم يُرفع بعد",
    required: "مطلوب",
    pdfLabel: (size) => `PDF${size ? ` · ${size}` : ""}`,
    openPdfTitle: (label) => `فتح ملف PDF لـ ${label}`,
    viewPdf: "عرض PDF",
    missing: "مفقود",
  },
  labels: {
    passport: "جواز السفر",
    flightTicket: "تذكرة الطيران",
  },
  banners: {
    finalizedTitle: "تمت مراجعة تفاصيل رحلتك واعتمادها من قبل الإدارة.",
    finalizedSub:
      "السجلات للعرض فقط. تصبح معلومات الاستضافة متاحة بمجرد نشرها من قبل المنظمين.",
    deadlinePassed:
      "انتهى الموعد النهائي لتقديم تفاصيل الرحلة. تواصل مع المنظمين إذا كانت هناك حاجة إلى تصحيحات.",
    deadlineInfo: (date) =>
      `يمكنك إرسال المستندات أو استبدالها حتى ${date} (أو حتى تُقفل السجلات من قبل الإدارة).`,
  },
  card: {
    title: "تفاصيل رحلة المسافرين",
    progress: (done, total) => `اكتمل ${done} من ${total} مسافرين`,
    emptyRoster:
      "قائمة فريقك فارغة. أضف أعضاء فريقك أولاً — تُقدَّم تفاصيل الرحلة لكل مسافر على حدة.",
  },
  status: {
    notStarted: "لم يبدأ",
    detailsSaved: "تم حفظ البيانات، المستندات ناقصة",
    passportMissing: "جواز السفر مفقود",
    ticketMissing: "التذكرة مفقودة",
    complete: "مكتمل",
  },
  member: {
    noRecord: "لم تُقدَّم تفاصيل رحلة لهذا المسافر بعد.",
    addDetails: "إضافة تفاصيل الرحلة",
    editDetails: "تعديل التفاصيل",
    delete: "حذف",
    confirmDelete: "هل تريد حذف تفاصيل الرحلة هذه؟",
    confirmDeleteYes: "نعم، احذف",
    keep: "إبقاء",
    deleted: "تم حذف تفاصيل الرحلة",
  },
  form: {
    passengerName: "اسم المسافر (كما في جواز السفر)",
    passengerNamePlaceholder: "مثل النقيب سارة خان",
    passportNumber: "رقم جواز السفر",
    passportNumberPlaceholder: "مثل AB1234567",
    passportDoc: "مستند جواز السفر (PDF)",
    ticketDoc: "تذكرة الطيران (PDF)",
    currentFile: (name) => `الحالي: ${name}. اتركه فارغًا للإبقاء عليه.`,
    saveChanges: "حفظ التغييرات",
    submitFlight: "حفظ تفاصيل الرحلة",
    cancel: "إلغاء",
  },
  view: {
    passenger: "المسافر",
    passportNumber: "رقم جواز السفر",
    lastUpdated: "آخر تحديث",
  },
  unlinked: {
    title: "سجلات رحلات غير مرتبطة",
    desc: "أُرسلت هذه السجلات قبل أن تصبح تفاصيل الرحلة تُقدَّم لكل مسافر على حدة. اربط كل سجل بأحد أعضاء القائمة للاحتفاظ به — السجل غير المرتبط لا يُحتسب ضمن تقدم فريقك.",
    assign: "ربط",
    selectMember: "اختر مسافرًا…",
    noneAvailable:
      "كل عضو في القائمة لديه سجل رحلة بالفعل. احذف أحد السجلات لتحرير مسافر، أو احذف هذا السجل غير المرتبط.",
    assigned: "تم ربط سجل الرحلة بالمسافر",
    selectRequired: "اختر المسافر الذي يعود إليه هذا السجل",
  },
  errors: {
    nameRequired: "اسم المسافر مطلوب",
    passportRequired: "رقم جواز السفر مطلوب",
    mustBePdf: (label) => `يجب أن يكون ${label} ملف PDF`,
    mustBeUnder10: (label) => `يجب أن يكون ${label} أقل من 10 ميغابايت`,
    passportLabel: "جواز السفر",
    ticketLabel: "تذكرة الطيران",
    updated: "تم تحديث تفاصيل الرحلة",
    submitted: "تم إرسال تفاصيل الرحلة",
  },
  none: "—",
};
