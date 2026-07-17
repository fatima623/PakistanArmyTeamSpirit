import type { events as enEvents } from "../en/events";

// Chinese (Simplified) translations for the public Events Detail page.
// Chinese has no plural inflection — the measure word carries the count, so
// the count helpers below deliberately ignore the number.
export const events: typeof enEvents = {
  meta: {
    title: "活动详情",
    description:
      "Pakistan Army Team Spirit 演习的每一项计分科目——分值、难度以及每项竞赛活动背后的完整简报。",
  },

  hero: {
    badge: "竞赛项目一览",
    titleLead: "活动",
    titleAccent: "详情",
    lede:
      "演习中的每一项计分科目——导航、侦察、作战、医疗与指挥任务——均附分值、难度以及每张卡片背后的完整简报。",
  },

  filters: {
    searchPlaceholder: "搜索活动…",
    searchAria: "搜索竞赛活动",
    all: "全部",
  },

  summary: (serials, marks) => `${serials} 项计分科目 · 共 ${marks} 分`,

  card: {
    marksUnit: () => "分",
    thumbAlt: (title) => `${title} 活动照片`,
    viewDetails: "查看详情",
  },

  empty: "没有符合当前筛选条件的活动。",

  modal: {
    participants: "参与人员",
    breakdown: "分值构成",
    total: "本项活动总分",
  },
};
