import type { tickets as enTickets } from "../en/tickets";

export const tickets: typeof enTickets = {
  panel: {
    title: "Destek",
    subtitle: "Bir talep oluşturun, ekibimiz size geri dönecek.",
    newTicket: "Yeni talep",
    empty: "Henüz destek talebiniz yok. Yardıma ihtiyacınız varsa yukarıdan bir talep oluşturun.",
    listMeta: (category, count, updated) =>
      `${category} · ${count} mesaj · Güncellendi ${updated}`,
  },
  statuses: {
    OPEN: "Açık",
    IN_PROGRESS: "İşlemde",
    RESOLVED: "Çözüldü",
    CLOSED: "Kapalı",
  },
  priorities: {
    LOW: "Düşük",
    NORMAL: "Normal",
    HIGH: "Yüksek",
  },
  priorityTag: (label) => `${label} öncelik`,
  categories: {
    GENERAL: "Genel soru",
    REGISTRATION: "Kayıt",
    PAYMENT: "Ödeme",
    TECHNICAL: "Teknik sorun",
  },
  staffTag: "PATS ekibi",
  detail: {
    backToSupport: "Desteğe dön",
    subtitle: (category, date) => `${category} · Açıldı ${date}`,
  },
  form: {
    title: "Destek talebi oluştur",
    subject: "Konu",
    subjectPlaceholder: "Sorununuzun kısa özeti",
    category: "Kategori",
    priority: "Öncelik",
    help: "Size nasıl yardımcı olabiliriz?",
    helpPlaceholder: "Sorununuzu ayrıntılı olarak açıklayın",
    cancel: "İptal",
    submit: "Talebi gönder",
    toastRaised: "Talep oluşturuldu",
  },
  reply: {
    closedNotice:
      "Bu talep kapatıldı. Daha fazla yardıma ihtiyacınız varsa yeni bir talep oluşturun.",
    placeholder: "Bir yanıt yazın…",
    closeTicket: "Talebi kapat",
    sendReply: "Yanıt gönder",
    toastClosed: "Talep kapatıldı",
  },
};
