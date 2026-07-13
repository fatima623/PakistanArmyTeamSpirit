import type { core as enCore } from "../en/core";

// Russian translations for the portal's core surfaces.
// Helper for Russian plural forms (1 / 2–4 / 5+).
function ruPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export const core: typeof enCore = {
  common: {
    back: "Назад",
    next: "Далее",
    backToDashboard: "Назад к панели",
    language: "Язык",
    selectLanguage: "Выбрать язык",
    loadingTitle: "Панель участника",
    loadingDesc: "Загрузка действий и панелей статуса участника.",
  },

  nav: {
    ariaLabel: "Портал участника",
    portalName: "Портал PATS",
    participant: "Участник",
    menu: "Меню",
    done: "Готово",
    logout: "Выйти",
    dashboard: "Панель",
    unitInformation: "Данные подразделения",
    teamRegistration: "Регистрация команды",
    payment: "Оплата",
    flightDetails: "Данные о рейсе",
    hostInformation: "Информация о приёме",
    support: "Поддержка",
    journeyComplete: "Регистрация завершена",
  },

  dashboard: {
    welcomeBack: "С возвращением",
    unitNotRegistered: "Подразделение не зарегистрировано",
    allStagesComplete: "Все этапы завершены",
    membersCount: (n) =>
      `${n} ${ruPlural(n, "участник команды", "участника команды", "участников команды")}`,
    scheduleEyebrow: "Расписание",
    dataEntryPeriods: "Периоды ввода данных",
    dataEntryDesc: "Доступно только после подтверждения оплаты.",
    noPeriods: "Периоды пока не запланированы.",
    deadlinesEyebrow: "Сроки",
    timeline: "График",
    updatesEyebrow: "Новости",
    latestNews: "Последние новости",
    noNews: "Новостей пока нет.",
  },

  workflowPanel: {
    registrationProgress: "Ход регистрации",
    ariaLabel: "Процесс регистрации",
    progressAria: "Прогресс процесса",
    countComplete: (done, total) => `Выполнено ${done} из ${total}`,
  },

  statusBar: {
    underReviewTitle: "Заявка на рассмотрении",
    underReviewText:
      "Ваша регистрация рассматривается PATS. Мы сообщим вам по электронной почте, как только она будет одобрена.",
    confirmedTitle: "Подтверждено — вы допущены к PATS 2026",
    confirmedTextWithDates: (dates) =>
      `Ваша оплата подтверждена, и ваше участие закреплено. Запланировано: ${dates}.`,
    confirmedText: "Ваша оплата подтверждена, и ваше участие закреплено.",
    approvedTitle: "Одобрено — требуется оплата",
    approvedText:
      "Ваша заявка одобрена. Завершите оплату, чтобы закрепить своё место в соревновании.",
    returnedTitle: "Возвращено на доработку",
    approvedOn: (date) => `Одобрено ${date}`,
    goToPayment: "Перейти к отправке оплаты",
    paymentVerified: "Оплата подтверждена",
  },

  registration: {
    profileEyebrow: "Профиль",
    title: "Данные регистрации",
    name: "Имя",
    unit: "Подразделение",
    email: "Эл. почта",
    rank: "Звание",
    dateRegistered: "Дата регистрации",
    countryOfApplication: "Страна подачи заявки",
    nationality: "Гражданство",
    branchFormation: "Род войск / формирование",
  },

  journey: {
    suspended:
      "Ваша учётная запись заблокирована. Обратитесь к администрации PATS за помощью.",
    headers: {
      confirmation: {
        eyebrow: "",
        title: "Подтверждение участия",
        subtitle: "Подтвердите готовность вашей команды принять участие в PATS 2026.",
      },
      verification: {
        eyebrow: "",
        title: "Проверка регистрации",
        subtitle:
          "Данные вашей регистрации проверяются Спортивной дирекцией (СД).",
      },
      payment: {
        eyebrow: "",
        title: "Внести оплату",
        subtitle:
          "Завершите оплату регистрации, чтобы подтвердить своё участие в PATS 2026.",
      },
      teamRegistration: {
        eyebrow: "Регистрация команды",
        title: "Участники команды",
        subtitle:
          "Добавьте участников команды ниже. После сохранения отметьте список как завершённый, чтобы открыть данные о рейсах.",
      },
      roster: {
        eyebrow: "Регистрация команды",
        title: "Участники команды",
        subtitle:
          "Добавьте участников команды ниже. После сохранения отметьте список как завершённый, чтобы открыть данные о рейсах.",
      },
      flights: {
        eyebrow: "",
        title: "Данные о рейсе",
        subtitle:
          "Отправьте информацию о поездке вашей команды и документы паспорта / билета одной подачей.",
      },
      hostInfo: {
        eyebrow: "",
        title: "Информация о приёме",
        subtitle: "Данные о приёме, опубликованные организаторами для вашей команды.",
      },
    },
    banners: {
      participationConfirmed: "Участие подтверждено.",
      confirmedOnSub: (date, unitName) =>
        `Подтверждено ${date}${unitName ? ` для ${unitName}` : ""}. Этот шаг доступен только для просмотра.`,
      verifiedBySd: "Регистрация проверена Спортивной дирекцией (СД).",
      verifiedBySdSub:
        "Данные вашей регистрации ниже доступны только для просмотра. Перейдите к следующему шагу.",
      registrationVerification: "Проверка регистрации",
      messageFromSd: "Сообщение от СД:",
      paymentVerifiedMt: "Оплата подтверждена Группой управления (ГУ).",
      paymentVerifiedMtSub:
        "Ваши платёжные записи ниже доступны только для просмотра. Перейдите к следующему шагу.",
      paymentDeadlinePassed:
        "Срок оплаты истёк, поэтому новые платежи закрыты. Пожалуйста, свяжитесь с администрацией PATS, если вам всё ещё нужно завершить оплату.",
      noPaymentInfo:
        "Для вашей учётной записи пока нет платёжной информации. Пожалуйста, попробуйте снова чуть позже.",
      teamRegistered: "Команда зарегистрирована.",
      teamRegisteredSub: (date) =>
        `Зарегистрировано ${date}. Заполните список участников ниже.`,
      rosterCompleted: "Список участников завершён.",
      rosterCompletedSub: (count, date) =>
        `${count} ${ruPlural(count, "участник", "участника", "участников")} подтверждено ${date}. Список доступен только для просмотра, пока не будет снова открыт администрацией.`,
      hostInfoTitle: "Информация о приёме",
      hostInfoAvailable:
        "Данные о приёме вашей команды опубликованы организаторами.",
      hostInfoLocked:
        "Данные о приёме появятся здесь после того, как ваши данные о рейсах будут окончательно оформлены, а организаторы их опубликуют.",
      openHostInfo: "Открыть информацию о приёме",
    },
    wizard: {
      stepsAria: "Шаги регистрации",
      lockedTitle: "Заблокировано — сначала завершите предыдущие шаги",
      stepXofY: (current, total, activeLabel) =>
        `Шаг ${current} из ${total}${activeLabel ? ` — ${activeLabel}` : ""}`,
      nextLockedTitle: "Завершите этот шаг, чтобы открыть следующий",
      finalStep: "Последний шаг",
      finalStepTitle: "Это последний шаг",
    },
  },

  confirm: {
    dateLocale: "ru-RU",
    actionRequired: "Требуется действие",
    title: "Подтвердите своё участие",
    description:
      "Прежде чем войти в панель участника, пожалуйста, подтвердите, сможет ли ваша команда принять участие в учении. Подтверждение открывает доступ к следующим этапам регистрации. Отклонение выведет вас из системы — вы можете снова войти и подтвердить в любое время до указанного ниже срока.",
    previouslyDeclined:
      "Ранее вы отклонили регистрацию. Вы всё ещё можете подтвердить её до истечения срока.",
    confirmationDeadline: "Срок подтверждения",
    deadlineExpired:
      "Срок подтверждения истёк. Подтверждение больше невозможно. Пожалуйста, обратитесь к организаторам за помощью.",
    days: "Дни",
    hours: "Часы",
    min: "Мин",
    sec: "Сек",
    remaining: "осталось",
    timeRemainingAria: "Оставшееся время для подтверждения",
    toBeAnnounced: "Будет объявлено организаторами.",
    rejectPrompt:
      "Отклонить регистрацию и выйти? Вы можете снова войти и подтвердить позже, пока срок не истёк.",
    yesReject: "Да, отклонить и выйти",
    goBack: "Вернуться",
    confirm: "Подтвердить",
    reject: "Отклонить",
    signOut: "Выйти",
    confirmTitleAttr: "Подтвердите свою регистрацию",
    deadlinePassedAttr: "Срок подтверждения истёк",
    footer:
      "Ваше решение фиксируется с отметкой времени для организационного персонала. Нужна помощь? Обратитесь в поддержку со страницы входа.",
    toastConfirmed: "Регистрация подтверждена — добро пожаловать!",
    toastRejected: "Регистрация отклонена. Выполняется выход…",
  },

  hostInfo: {
    title: "Информация о приёме",
    subtitleLocked: "Окончательная информация о приёме и прибытии от организаторов.",
    subtitle: "Окончательная информация о приёме, команде и прибытии — только для просмотра.",
    notAvailableTitle: "Пока недоступно",
    notAvailableText:
      "Раздел «Информация о приёме» станет виден после того, как ваши данные о рейсах будут проверены и окончательно оформлены администрацией, а организаторы опубликуют информацию о приёме.",
    participatingCountries: "Страны-участницы",
    registeredTeams: "Зарегистрированные команды",
    yourFinalizedTravelers: "Ваши оформленные путешественники",
    hostingArrivalInfo: "Информация о приёме и прибытии",
    countryWiseTeamNumbers: "Количество команд по странам",
    sNo: "№",
    country: "Страна",
    teams: "Команды",
    noRegisteredTeams: "Зарегистрированных команд пока нет.",
    unspecified: "Не указано",
    yourTeamWithUnit: (unit) => `Ваша команда — ${unit}`,
    yourTeam: "Ваша команда",
    serialNumber: "Служебный номер",
    rank: "Звание",
    fullName: "Полное имя",
    gender: "Пол",
    finalizedFlightInfo: "Окончательная информация о рейсах",
    traveler: "Путешественник",
    passengerName: "Имя пассажира",
    passportNo: "№ паспорта",
    documents: "Документы",
    noFlightRecords: "Нет записей о рейсах.",
    passport: "Паспорт",
    ticket: "Билет",
    readOnlyNote:
      "Эта информация доступна только для просмотра. По любым исправлениям обращайтесь к организаторам.",
  },
};
