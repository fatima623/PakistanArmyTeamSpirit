import type { WorkflowStrings } from "../../workflow-strings";

function ruPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export const workflow: WorkflowStrings = {
  label: {
    confirmation: "Подтверждение участия",
    verification: "Проверка регистрации",
    payment: "Оплата",
    teamRegistration: "Регистрация команды",
    roster: "Участники команды",
    flights: "Данные о рейсе",
    hostInfo: "Информация о приёме",
  },
  sub: {
    confirmed: "Подтверждено",
    deadlineExpired: "Срок истёк",
    actionRequired: "Требуется действие",
    confirmBy: (date) => `Подтвердить до ${date}`,
    locked: "Заблокировано",
    returnedForCorrection: "Возвращено на доработку",
    approvedBySd: "Одобрено СД",
    rejected: "Отклонено",
    underReviewBySd: "На рассмотрении СД",
    pendingSdVerification: "Ожидает проверки СД",
    verifiedByMt: "Подтверждено ГУ",
    underReviewByMt: "На рассмотрении ГУ",
    proofRejected: "Подтверждение отклонено",
    paymentRequired: "Требуется оплата",
    teamRegistered: "Команда зарегистрирована",
    opensOn: (date) => `Открывается ${date}`,
    notYetOpen: "Ещё не открыто",
    windowClosed: "Окно закрыто",
    openUntil: (date) => `Открыто до ${date}`,
    windowOpen: "Окно открыто",
    membersConfirmed: (count) =>
      `${count} ${ruPlural(count, "участник", "участника", "участников")} подтверждено`,
    membersAdded: (count, limit) => `Добавлено ${count} из ${limit}`,
    finalized: "Оформлено администрацией",
    deadlinePassedLocked: "Срок истёк — заблокировано",
    submitBy: (date) => `Отправить до ${date}`,
    provideTravelDocs: "Предоставьте документы для поездки",
    available: "Доступно",
    awaitingPublication: "Ожидает публикации",
  },
  formatDate: (d) =>
    d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }),
};
