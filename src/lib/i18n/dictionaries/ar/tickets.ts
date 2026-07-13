import type { tickets as enTickets } from "../en/tickets";

export const tickets: typeof enTickets = {
  panel: {
    title: "الدعم",
    subtitle: "أنشئ تذكرة وسيعاود فريقنا التواصل معك.",
    newTicket: "تذكرة جديدة",
    empty: "ليس لديك تذاكر دعم بعد. أنشئ تذكرة أعلاه إذا كنت بحاجة إلى مساعدة.",
    listMeta: (category, count, updated) =>
      `${category} · ${count} رسالة · حُدّث ${updated}`,
  },
  statuses: {
    OPEN: "مفتوحة",
    IN_PROGRESS: "قيد المعالجة",
    RESOLVED: "تم الحل",
    CLOSED: "مغلقة",
  },
  priorities: {
    LOW: "منخفضة",
    NORMAL: "عادية",
    HIGH: "عالية",
  },
  priorityTag: (label) => `أولوية ${label}`,
  categories: {
    GENERAL: "استفسار عام",
    REGISTRATION: "التسجيل",
    PAYMENT: "الدفع",
    TECHNICAL: "مشكلة تقنية",
  },
  staffTag: "فريق PATS",
  detail: {
    backToSupport: "العودة إلى الدعم",
    subtitle: (category, date) => `${category} · فُتحت ${date}`,
  },
  form: {
    title: "إنشاء تذكرة دعم",
    subject: "الموضوع",
    subjectPlaceholder: "ملخص موجز لمشكلتك",
    category: "الفئة",
    priority: "الأولوية",
    help: "كيف يمكننا المساعدة؟",
    helpPlaceholder: "صف مشكلتك بالتفصيل",
    cancel: "إلغاء",
    submit: "إرسال التذكرة",
    toastRaised: "تم إنشاء التذكرة",
  },
  reply: {
    closedNotice:
      "هذه التذكرة مغلقة. أنشئ تذكرة جديدة إذا كنت بحاجة إلى مزيد من المساعدة.",
    placeholder: "اكتب ردًا…",
    closeTicket: "إغلاق التذكرة",
    sendReply: "إرسال الرد",
    toastClosed: "تم إغلاق التذكرة",
  },
};
