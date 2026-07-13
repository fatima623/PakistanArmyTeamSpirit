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
    finalizedTitle:
      "تمت مراجعة تفاصيل رحلتك واعتمادها من قبل الإدارة.",
    finalizedSub:
      "السجلات للعرض فقط. تصبح معلومات الاستضافة متاحة بمجرد نشرها من قبل المنظمين.",
    deadlinePassed:
      "انتهى الموعد النهائي لتقديم تفاصيل الرحلة. تواصل مع المنظمين إذا كانت هناك حاجة إلى تصحيحات.",
    deadlineInfo: (date) =>
      `يمكنك إرسال المستندات أو استبدالها حتى ${date} (أو حتى تُقفل السجلات من قبل الإدارة).`,
  },
  card: {
    title: "معلومات رحلة الفريق",
    desc: "إرسال واحد يغطي فريقك بالكامل — قدّم بيانات المسافر الرئيسي وارفع مستندي جواز السفر والتذكرة (PDF، بحد أقصى 10 ميغابايت لكل منهما).",
    submitted: "تم الإرسال",
    notSubmitted: "لم يُرسل",
  },
  form: {
    leadName: "اسم المسافر الرئيسي (كما في جواز السفر)",
    leadNamePlaceholder: "مثل النقيب سارة خان",
    passportNumber: "رقم جواز السفر",
    passportNumberPlaceholder: "مثل AB1234567",
    passportDoc: "مستند جواز السفر (PDF)",
    ticketDoc: "تذكرة الطيران (PDF)",
    currentFile: (name) => `الحالي: ${name}. اتركه فارغًا للإبقاء عليه.`,
    saveChanges: "حفظ التغييرات",
    submitFlight: "إرسال تفاصيل الرحلة",
    cancel: "إلغاء",
  },
  view: {
    leadTraveller: "المسافر الرئيسي",
    passportNumber: "رقم جواز السفر",
    lastUpdated: "آخر تحديث",
    editDetails: "تعديل التفاصيل",
  },
  errors: {
    nameRequired: "اسم المسافر الرئيسي مطلوب",
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
