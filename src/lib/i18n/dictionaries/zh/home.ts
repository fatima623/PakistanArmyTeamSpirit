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

  careers: {
    eyebrow: "参与",
    title: "开启您的 PATS 之旅",
    description:
      "通过本门户注册您的巡逻队，并填写准确的名单与联络信息。在参赛者仪表板中跟踪通知、关键日期与付款步骤。",
    cards: {
      register: { tag: "参与", title: "注册您的团队" },
      operations: { tag: "计分项目", title: "行动简报" },
      international: { tag: "伙伴国", title: "国际赛事" },
    },
  },

  about: {
    eyebrow: "关于 PATS",
    title: "竞赛概览",
    lead:
      "巴基斯坦陆军团队精神竞赛 (PATS) 是每年在 JLA — PATS 框架下举办的一项以任务和课目为导向的巡逻竞赛。以团队精神铸就坚韧不拔。",
    imageAlt: "PATS 竞赛概览",
    points: [
      {
        title: "60 小时作战演练",
        body: "一支侦察巡逻队渗透至恐怖分子控制的地形，跨越 30×30 km 区域，穿行 50–60 km，历经 20–22 个战术场景，且无预定休整时间。",
      },
      {
        title: "自 2016 年起走向国际",
        body: "第九届国际赛事已将各伙伴国汇聚一堂，进行贴近实战的巡逻、方位判定并共享竞赛标准。",
      },
      {
        title: "计分战场项目",
        body: "各项考核体现次常规作战 — 导航、CTR、CBRN、突击、救护、火力与耐力，采用综合计分办法。",
      },
    ],
  },

  dates: {
    eyebrow: "关键日期",
    title: "日程",
    fullSchedule: "完整日程",
  },
};
