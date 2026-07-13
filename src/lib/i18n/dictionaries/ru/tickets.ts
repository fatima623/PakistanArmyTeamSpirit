import type { tickets as enTickets } from "../en/tickets";

function ruPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export const tickets: typeof enTickets = {
  panel: {
    title: "Поддержка",
    subtitle: "Создайте обращение, и наша команда свяжется с вами.",
    newTicket: "Новое обращение",
    empty: "У вас пока нет обращений в поддержку. Создайте обращение выше, если вам нужна помощь.",
    listMeta: (category, count, updated) =>
      `${category} · ${count} ${ruPlural(count, "сообщение", "сообщения", "сообщений")} · Обновлено ${updated}`,
  },
  statuses: {
    OPEN: "Открыто",
    IN_PROGRESS: "В работе",
    RESOLVED: "Решено",
    CLOSED: "Закрыто",
  },
  priorities: {
    LOW: "Низкий",
    NORMAL: "Обычный",
    HIGH: "Высокий",
  },
  priorityTag: (label) => `${label} приоритет`,
  categories: {
    GENERAL: "Общий вопрос",
    REGISTRATION: "Регистрация",
    PAYMENT: "Оплата",
    TECHNICAL: "Техническая проблема",
  },
  staffTag: "Команда PATS",
  detail: {
    backToSupport: "Назад к поддержке",
    subtitle: (category, date) => `${category} · Открыто ${date}`,
  },
  form: {
    title: "Создать обращение в поддержку",
    subject: "Тема",
    subjectPlaceholder: "Краткое описание вашей проблемы",
    category: "Категория",
    priority: "Приоритет",
    help: "Чем мы можем помочь?",
    helpPlaceholder: "Опишите вашу проблему подробно",
    cancel: "Отмена",
    submit: "Отправить обращение",
    toastRaised: "Обращение создано",
  },
  reply: {
    closedNotice:
      "Это обращение закрыто. Создайте новое обращение, если вам нужна дальнейшая помощь.",
    placeholder: "Напишите ответ…",
    closeTicket: "Закрыть обращение",
    sendReply: "Отправить ответ",
    toastClosed: "Обращение закрыто",
  },
};
