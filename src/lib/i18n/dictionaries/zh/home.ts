import type { home as enHome } from "../en/home";

// Simplified Chinese (zh-CN) translations for the public landing (home) page.
export const home: typeof enHome = {
  hero: {
    featuredAria: "精选亮点",
    titleLine1: "巴基斯坦陆军团队精神 (PATS)",
    titleLine2: "竞赛",
    // 徽章箴言（伊克巴尔）的意译，原文为乌尔都语。
    motto: "信念坚定，行动不息，仁爱征服天下",
    description:
      "国际巴基斯坦陆军团队精神竞赛 — 一项为期 60 小时的巡逻演练，检验伙伴国之间的战术素养、耐力与团队精神。",
    scrollHint: "向下滚动",
  },

  stats: [
    { suffix: " 小时", label: "巡逻演练时长" },
    { suffix: "", label: "站点" },
    { suffix: "+", label: "战术考核" },
    { suffix: "", label: "计分任务" },
  ],

  mission: {
    eyebrow: "理念 / 宗旨",
    imageAlt: "PATS 国际竞赛徽标",
    quote: "以团队精神铸就坚韧不拔",
    body:
      "巴基斯坦陆军团队精神竞赛 (PATS) 是每年在 JLA — PATS 框架下举办的一项以任务和课目为导向的巡逻竞赛。其主要目标是通过一项高强度的巡逻演练，评估并提升战术与心理能力 — 参赛者必须做好身心两方面的准备。各队必须在小规模作战、耐力以及基本操演与程序方面达到熟练水平。",
  },



  dates: {
    eyebrow: "关键日期",
    title: "日程",
    fullSchedule: "完整日程",
  },
};
