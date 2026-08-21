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
    unitInfo: "Данные подразделения",
    roster: "Участники команды",
    flights: "Данные о рейсе",
    verification: "Утверждение регистрации",
    hostInfo: "Информация о приёме",
  },
  sub: {
    confirmed: "Подтверждено",
    deadlineExpired: "Срок истёк",
    actionRequired: "Требуется действие",
    confirmBy: (date) => `Подтвердить до ${date}`,
    locked: "Заблокировано",
    returnedForCorrection: "Возвращено на доработку",
    unitRecorded: "Данные подразделения сохранены",
    provideUnitDetails: "Укажите данные подразделения",
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
    flightsSubmitted: "Отправлено на утверждение",
    deadlinePassedLocked: "Срок истёк — заблокировано",
    submitBy: (date) => `Отправить до ${date}`,
    provideTravelDocs: "Предоставьте документы для поездки",
    approvedBySd: "Одобрено СД",
    rejected: "Отклонено",
    underReviewBySd: "На рассмотрении СД",
    pendingSdVerification: "Ожидает утверждения СД",
    completeStepsFirst: "Сначала завершите предыдущие шаги",
    available: "Доступно",
    awaitingPublication: "Ожидает публикации",
  },
  formatDate: (d) =>
    d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" }),
};
