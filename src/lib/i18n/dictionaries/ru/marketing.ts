// Russian — mirrors `en/marketing.ts` exactly (shape enforced via `typeof en`).
// See the English file for what belongs here and what is handled by
// `@/lib/i18n/pats-content-i18n`.

import type { marketing as enMarketing } from "../en/marketing";

/**
 * Russian plural selector: 1 / 2–4 / 5+, with the 11–14 exception that always
 * takes the "many" form (11 испытаний, not 11 испытание).
 */
function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = n % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export const marketing: typeof enMarketing = {
  operations: {
    meta: {
      title: "Операции",
      description:
        "Тактические испытания, контрольные пункты и система оценки соревнований PATS.",
    },

    hero: {
      eyebrow: "Выбор задачи",
      title: "Операции",
      subtitle:
        "Выберите тактическое испытание. Каждая боевая задача содержит цели, матрицу оценки и привязку к этапу операции.",
      metaEvents: "Испытания",
      metaTotalMarks: "Всего баллов",
      metaDuration: "Продолжительность",
      metaDurationValue: "60 часов",
    },

    overview: {
      eyebrow: "Задача",
      title: "Общий обзор операции",
    },

    scoredSummary: (events: number, marks: string): string =>
      `${events} ${plural(events, "зачётное испытание", "зачётных испытания", "зачётных испытаний")} · ${marks} баллов суммарно за учение`,

    route: {
      eyebrow: "Маршрут",
      title: "Схема проведения испытаний",
      description:
        "Последовательность контрольных пунктов: от района сбора через выдвижение, разведку объекта (CTR) и отход.",
    },

    map: {
      routeTitle: "Маршрут учения — текущая последовательность",
      glossaryTitle: "Оперативный индикатор — терминология",
      entry: "ВХ",
      exit: "ВЫХ",
    },

    phases: {
      preparation: "Подготовка",
      infiltration: "Скрытное выдвижение",
      hideout: "Укрытие",
      ctr: "Разведка объекта с близкой дистанции",
      exfiltration: "Отход",
      terminal: "Завершающий этап",
    },

    phaseSummary: (count: number): string =>
      `${count} ${plural(count, "оцениваемое испытание", "оцениваемых испытания", "оцениваемых испытаний")} на этом этапе.`,

    phaseCarouselAria: (phase: string): string =>
      `Соревновательные испытания: ${phase}`,

    rules: {
      eyebrow: "Правила",
      title: "Координирующие указания",
      description:
        "Оперативные указания и штрафные санкции — несоблюдение может повлечь дисквалификацию.",
    },

    card: {
      missionBrief: "Боевая задача",
    },

    difficulty: {
      foundational: "Базовый",
      intermediate: "Средний",
      advanced: "Повышенный",
      elite: "Высший",
    },

    category: {
      inspection: "Смотр",
      communications: "Связь",
      navigation: "Навигация",
      reconnaissance: "Разведка",
      medical: "Медицинское обеспечение",
      fires: "Огневая поддержка",
      assault: "Штурм",
      survival: "Выживание",
      admin: "Управление",
    },

    brief: {
      back: "← Выбор задачи",
      classified: "Боевая задача — секретно",
      totalMarks: "Всего баллов",
      phase: "Этап",
      category: "Категория",
      difficulty: "Сложность",
      checkpoint: "Контрольный пункт",
      objective: "Цель задачи",
      objectives: "Оперативные задачи",
      scoring: "Матрица оценки",
      marksUnit: "б.",
      criticalNotice: "Особо важное указание",
      skills: "Тактические навыки",
      relatedArchive: "Связанный архив",
      allMissions: "Все задачи",
      fallbackTitle: "Операция",
    },
  },

  documents: {
    meta: {
      title: "Документы",
      description:
        "Официальные справочные материалы соревнований PATS — интерактивные справки в соответствии с информационной брошюрой.",
    },

    hero: {
      eyebrow: "Справочная библиотека",
      title: "Центр документации",
      subtitle:
        "Официальные справочные материалы соревнований PATS — интерактивные справки в соответствии с информационной брошюрой.",
      metaSource: "Источник",
      metaSourceValue: "Официальная брошюра",
      metaAccess: "Доступ",
      metaAccessValue: "Цифровые справки",
    },

    library: {
      eyebrow: "Справочные материалы",
      title: "Библиотека соревнований",
      description:
        "Каждая тема ведёт к соответствующему разделу сайта. Полные сканы брошюры не публикуются — используйте структурированные справки ниже.",
    },

    downloadResults: "Скачать PDF с результатами",
    interactiveOperations: "Интерактивные операции →",
    bookletPage: (page: number): string => `Брошюра, с. ${page}`,
    openBrief: "Открыть справку →",

    sections: {
      overview: "Обзор — PATS",
      history: "История — международные команды",
      concept: "Концепция PATS",
      layout: "Схема проведения испытаний",
      conduct: "Порядок проведения испытаний (часть 1)",
      teamComposition: "Состав команды",
      scoresAwards: "Баллы и награды",
      weaponEquipment: "Вооружение и снаряжение",
      coordinatingPoints: "Координирующие указания",
    },
  },

  // English pending translation review — the familiarization brief carries
  // military terminology that needs a subject-matter check per locale.
  familiarization: {
    meta: {
      title: "Ознакомление с PATS",
      description:
        "Материал для участвующих контингентов до прибытия — концепция PATS, маршрут, состав команды, вооружение и снаряжение, ознакомительная подготовка.",
    },

    hero: {
      eyebrow: "Материал до прибытия",
      title: "Ознакомление с PATS",
      subtitle:
        "Всё, что нужно участвующему контингенту до прибытия: концепция учения, маршрут, состав команды, нормы вооружения и снаряжения, а также ознакомительная подготовка перед выдвижением.",
      metaDuration: "Учение",
      metaDurationValue: "60 часов",
      metaDistance: "Переход",
      metaDistanceValue: "50–60 км",
      metaTeam: "Патруль",
      metaTeamValue: "8 человек",
    },

    anchorsAria: "Разделы этой страницы",
    anchors: {
      concept: "Концепция",
      route: "Маршрут",
      team: "Команда",
      equipment: "Снаряжение",
      training: "Подготовка",
    },

    concept: {
      eyebrow: "Концепция",
      title: "Концепция PATS",
      description:
        "Соревнование по патрулированию, ориентированное на выполнение боевых задач и проводимое по сценарию неконвенционального характера; оценивает тактическую подготовку, выносливость и солдатские качества в течение непрерывного 60-часового учения.",
      imageAlt:
        "Схема концепции PATS: район сбора, маршрут проникновения через контролируемую террористами территорию к укрытию и объекту, этап отхода и завершающий марш-бросок, а также задачи, выполняемые на каждом контрольном пункте.",
      imageCaption:
        "Концепция PATS — схема, представленная на основной конференции по планированию.",
    },

    route: {
      eyebrow: "Маршрут",
      title: "Схема учения",
      description:
        "Патруль движется из района сбора через этап проникновения, укрытие, разведку объекта с близкого расстояния и отход в конечный район.",
      distanceLabel: "Дистанция",
      totalLabel: "Общий переход",
      totalValue: "50–60 км",
    },

    team: {
      eyebrow: "Организация",
      title: "Состав команды",
      description:
        "Каждая страна выставляет один патруль — разведывательную команду из восьми человек, а также резервную пару и руководителя команды.",
      roleHeading: "Должность",
      strengthHeading: "Численность",
      noteLabel: "Примечание",
    },

    equipment: {
      eyebrow: "Нормы",
      title: "Вооружение и снаряжение",
      description:
        "Полный перечень, переносимый каждым участником и выдаваемый на команду. Количество — как выдано: сбрасывать что-либо в пути запрещено, в ходе учения проводятся выборочные проверки веса.",
      itemHeading: "Наименование",
      indlHeading: "На человека",
      teamHeading: "На команду",
      notApplicable: "Не предусмотрено",
      groups: {
        personal: "Обмундирование, вооружение и личное снаряжение",
        stores: "Навигационное, техническое и специальное имущество",
      },
      note: "Общий вес снаряжения команды — 200 кг, включая заполненные фляги, боеприпасы и выданный трекер. Остальное имущество — согласно выданным инструкциям.",
    },

    training: {
      eyebrow: "Подготовка",
      title: "Ознакомительная подготовка",
      description:
        "Предсоревновательная подготовка международных команд, проводимая до выдвижения в район учения, с особым вниманием к следующим темам:",
    },

  },

  carousel: {
    prev: "Предыдущие карточки",
    next: "Следующие карточки",
  },
};
