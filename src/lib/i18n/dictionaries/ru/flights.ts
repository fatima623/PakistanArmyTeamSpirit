import type { flights as enFlights } from "../en/flights";

export const flights: typeof enFlights = {
  doc: {
    uploaded: "Загружено",
    notUploadedYet: "Ещё не загружено",
    required: "Обязательно",
    pdfLabel: (size) => `PDF${size ? ` · ${size}` : ""}`,
    openPdfTitle: (label) => `Открыть PDF: ${label}`,
    viewPdf: "Открыть PDF",
    missing: "Отсутствует",
  },
  labels: {
    passport: "Паспорт",
    flightTicket: "Авиабилет",
  },
  banners: {
    finalizedTitle:
      "Ваши данные о рейсе проверены и окончательно оформлены администрацией.",
    finalizedSub:
      "Записи доступны только для просмотра. Информация о приёме появится после публикации организаторами.",
    deadlinePassed:
      "Срок подачи данных о рейсе истёк. Свяжитесь с организаторами, если требуются исправления.",
    deadlineInfo: (date) =>
      `Вы можете отправить или заменить документы до ${date} (или пока записи не будут заблокированы администрацией).`,
  },
  card: {
    title: "Информация о рейсе команды",
    desc: "Одна подача охватывает всю вашу команду — укажите данные главного путешественника и загрузите документы паспорта и билета (PDF, макс. 10 МБ каждый).",
    submitted: "Отправлено",
    notSubmitted: "Не отправлено",
  },
  form: {
    leadName: "Имя главного путешественника (как в паспорте)",
    leadNamePlaceholder: "напр. КАПТ САРА ХАН",
    passportNumber: "Номер паспорта",
    passportNumberPlaceholder: "напр. AB1234567",
    passportDoc: "Документ паспорта (PDF)",
    ticketDoc: "Авиабилет (PDF)",
    currentFile: (name) => `Текущий: ${name}. Оставьте пустым, чтобы сохранить.`,
    saveChanges: "Сохранить изменения",
    submitFlight: "Отправить данные о рейсе",
    cancel: "Отмена",
  },
  view: {
    leadTraveller: "Главный путешественник",
    passportNumber: "Номер паспорта",
    lastUpdated: "Последнее обновление",
    editDetails: "Изменить данные",
  },
  errors: {
    nameRequired: "Имя главного путешественника обязательно",
    passportRequired: "Номер паспорта обязателен",
    mustBePdf: (label) => `${label} должен быть файлом PDF`,
    mustBeUnder10: (label) => `${label} должен быть меньше 10 МБ`,
    passportLabel: "Паспорт",
    ticketLabel: "Авиабилет",
    updated: "Данные о рейсе обновлены",
    submitted: "Данные о рейсе отправлены",
  },
  none: "—",
};
