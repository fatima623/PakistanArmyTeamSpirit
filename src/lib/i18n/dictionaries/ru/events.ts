import type { events as enEvents } from "../en/events";

// Russian translations for the public Events Detail page.
// Helper for Russian plural forms (1 / 2–4 / 5+, with the 11–14 exception).
function ruPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export const events: typeof enEvents = {
  meta: {
    title: "Перечень испытаний",
    description:
      "Каждое зачётное испытание учения Pakistan Army Team Spirit — баллы, уровень сложности и полный разбор каждого соревновательного этапа.",
  },

  hero: {
    badge: "Каталог испытаний",
    titleLead: "Перечень",
    titleAccent: "испытаний",
    lede:
      "Каждое зачётное испытание учения — навигация, разведка, бой, медицинская подготовка и управление — с баллами, уровнем сложности и полным разбором за каждой карточкой.",
  },

  filters: {
    searchPlaceholder: "Поиск испытаний…",
    searchAria: "Поиск по соревновательным испытаниям",
    all: "Все",
  },

  summary: (serials, marks) =>
    `${serials} ${ruPlural(
      serials,
      "зачётное испытание",
      "зачётных испытания",
      "зачётных испытаний"
    )} · всего ${marks} ${ruPlural(marks, "балл", "балла", "баллов")}`,

  card: {
    marksUnit: (marks) => ruPlural(marks, "балл", "балла", "баллов"),
    thumbAlt: (title) => `Фотография испытания «${title}»`,
    viewDetails: "Подробнее",
  },

  empty: "Нет испытаний, соответствующих выбранным фильтрам.",

  modal: {
    participants: "Участники",
    breakdown: "Распределение баллов",
    total: "Всего баллов за это испытание",
  },
};
