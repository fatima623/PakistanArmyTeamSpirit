import type { flights as enFlights } from "../en/flights";

export const flights: typeof enFlights = {
  doc: {
    uploaded: "Yüklendi",
    notUploadedYet: "Henüz yüklenmedi",
    required: "Zorunlu",
    pdfLabel: (size) => `PDF${size ? ` · ${size}` : ""}`,
    openPdfTitle: (label) => `${label} PDF'sini aç`,
    viewPdf: "PDF'yi görüntüle",
    missing: "Eksik",
  },
  labels: {
    passport: "Pasaport",
    flightTicket: "Uçuş Bileti",
  },
  banners: {
    finalizedTitle:
      "Uçuş bilgileriniz yönetim tarafından incelenip kesinleştirildi.",
    finalizedSub:
      "Kayıtlar yalnızca görüntülenebilir. Ev sahibi bilgileri, organizatörler tarafından yayımlandığında kullanılabilir hale gelir.",
    deadlinePassed:
      "Uçuş bilgileri gönderim son tarihi geçti. Düzeltme gerekiyorsa organizatörlerle iletişime geçin.",
    deadlineInfo: (date) =>
      `Belgeleri ${date} tarihine kadar (veya kayıtlar yönetim tarafından kilitlenene kadar) gönderebilir veya değiştirebilirsiniz.`,
  },
  card: {
    title: "Takım uçuş bilgileri",
    desc: "Tek bir gönderim tüm takımınızı kapsar — baş yolcunun bilgilerini verin ve pasaport ve bilet belgelerini yükleyin (PDF, her biri maks. 10MB).",
    submitted: "Gönderildi",
    notSubmitted: "Gönderilmedi",
  },
  form: {
    leadName: "Baş yolcu adı (pasaporttaki gibi)",
    leadNamePlaceholder: "örn. YZB SARA KHAN",
    passportNumber: "Pasaport numarası",
    passportNumberPlaceholder: "örn. AB1234567",
    passportDoc: "Pasaport belgesi (PDF)",
    ticketDoc: "Uçuş bileti (PDF)",
    currentFile: (name) => `Mevcut: ${name}. Korumak için boş bırakın.`,
    saveChanges: "Değişiklikleri kaydet",
    submitFlight: "Uçuş bilgilerini gönder",
    cancel: "İptal",
  },
  view: {
    leadTraveller: "Baş Yolcu",
    passportNumber: "Pasaport Numarası",
    lastUpdated: "Son güncelleme",
    editDetails: "Bilgileri düzenle",
  },
  errors: {
    nameRequired: "Baş yolcu adı zorunludur",
    passportRequired: "Pasaport numarası zorunludur",
    mustBePdf: (label) => `${label} bir PDF dosyası olmalıdır`,
    mustBeUnder10: (label) => `${label} 10MB'ın altında olmalıdır`,
    passportLabel: "Pasaport",
    ticketLabel: "Uçuş bileti",
    updated: "Uçuş bilgileri güncellendi",
    submitted: "Uçuş bilgileri gönderildi",
  },
  none: "—",
};
