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
    title: "Yolcu uçuş bilgileri",
    progress: (done, total) => `${total} yolcudan ${done} tanesi tamamlandı`,
    emptyRoster:
      "Kadronuz boş. Önce takım üyelerinizi ekleyin — uçuş bilgileri her yolcu için ayrı ayrı girilir.",
  },
  status: {
    notStarted: "Başlanmadı",
    detailsSaved: "Bilgiler kaydedildi, belgeler eksik",
    passportMissing: "Pasaport eksik",
    ticketMissing: "Bilet eksik",
    complete: "Tamamlandı",
  },
  member: {
    noRecord: "Bu yolcu için henüz uçuş bilgisi gönderilmedi.",
    addDetails: "Uçuş bilgisi ekle",
    editDetails: "Bilgileri düzenle",
    delete: "Sil",
    confirmDelete: "Bu uçuş bilgileri silinsin mi?",
    confirmDeleteYes: "Evet, sil",
    keep: "Vazgeç",
    deleted: "Uçuş bilgileri silindi",
  },
  form: {
    passengerName: "Yolcu adı (pasaporttaki gibi)",
    passengerNamePlaceholder: "örn. YZB SARA KHAN",
    passportNumber: "Pasaport numarası",
    passportNumberPlaceholder: "örn. AB1234567",
    passportDoc: "Pasaport belgesi (PDF)",
    ticketDoc: "Uçuş bileti (PDF)",
    currentFile: (name) => `Mevcut: ${name}. Korumak için boş bırakın.`,
    saveChanges: "Değişiklikleri kaydet",
    submitFlight: "Uçuş bilgilerini kaydet",
    cancel: "İptal",
  },
  view: {
    passenger: "Yolcu",
    passportNumber: "Pasaport Numarası",
    lastUpdated: "Son güncelleme",
  },
  unlinked: {
    title: "Eşleştirilmemiş uçuş kayıtları",
    desc: "Bu kayıtlar, uçuş bilgileri her yolcu için ayrı girilmeye başlanmadan önce gönderildi. Korumak için her birini bir kadro üyesiyle eşleştirin — eşleştirilmemiş kayıt, takımınızın ilerlemesine sayılmaz.",
    assign: "Eşleştir",
    selectMember: "Bir yolcu seçin…",
    noneAvailable:
      "Kadrodaki her üyenin zaten bir uçuş kaydı var. Bir yolcuyu boşaltmak için kayıtlardan birini silin veya bu eşleştirilmemiş kaydı silin.",
    assigned: "Uçuş kaydı yolcuyla eşleştirildi",
    selectRequired: "Bu kaydın ait olduğu yolcuyu seçin",
  },
  errors: {
    nameRequired: "Yolcu adı zorunludur",
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
