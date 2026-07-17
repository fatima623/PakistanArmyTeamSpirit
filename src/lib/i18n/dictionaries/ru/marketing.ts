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

  carousel: {
    prev: "Предыдущие карточки",
    next: "Следующие карточки",
  },
};
