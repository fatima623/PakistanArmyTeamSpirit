// Chinese (Simplified) — mirrors `en/marketing.ts` exactly (shape enforced via
// `typeof en`). Chinese has no plural inflection — the measure word carries the
// count — so the count helpers below deliberately ignore the number.
// See the English file for what belongs here and what is handled by
// `@/lib/i18n/pats-content-i18n`.

import type { marketing as enMarketing } from "../en/marketing";

export const marketing: typeof enMarketing = {
  operations: {
    meta: {
      title: "行动",
      description: "PATS 竞赛的战术课目、检查点与评分办法。",
    },

    hero: {
      eyebrow: "任务选择",
      title: "行动",
      subtitle:
        "请选择一项战术课目。每份任务简令均包含目标、评分矩阵以及所属行动阶段。",
      metaEvents: "课目",
      metaTotalMarks: "总分",
      metaDuration: "时长",
      metaDurationValue: "60 小时",
    },

    overview: {
      eyebrow: "任务",
      title: "行动概览",
    },

    scoredSummary: (events: number, marks: string): string =>
      `${events} 项计分课目 · 全程演习共计 ${marks} 分`,

    route: {
      eyebrow: "路线",
      title: "课目编排",
      description: "自集结地域经渗透、近距离目标侦察（CTR）至撤离的检查点顺序。",
    },

    map: {
      routeTitle: "演习路线 — 实时序列",
      glossaryTitle: "行动界面 — 术语",
      entry: "入",
      exit: "出",
    },

    phases: {
      preparation: "准备",
      infiltration: "渗透",
      hideout: "隐蔽地",
      ctr: "近距离目标侦察",
      exfiltration: "撤离",
      terminal: "终末阶段",
    },

    phaseSummary: (count: number): string => `本阶段设有 ${count} 项评分课目。`,

    phaseCarouselAria: (phase: string): string => `${phase}竞赛课目`,

    rules: {
      eyebrow: "规则",
      title: "协同事项",
      description: "行动须知与处罚规定 —— 违反规定可能导致取消参赛资格。",
    },

    card: {
      missionBrief: "任务简令",
    },

    difficulty: {
      foundational: "基础",
      intermediate: "中级",
      advanced: "高级",
      elite: "精英",
    },

    category: {
      inspection: "检查",
      communications: "通信",
      navigation: "导航",
      reconnaissance: "侦察",
      medical: "医疗救护",
      fires: "火力支援",
      assault: "突击",
      survival: "生存",
      admin: "行政管理",
    },

    brief: {
      back: "← 任务选择",
      classified: "机密行动简令",
      totalMarks: "总分",
      phase: "阶段",
      category: "类别",
      difficulty: "难度",
      checkpoint: "检查点",
      objective: "任务目的",
      objectives: "行动目标",
      scoring: "评分矩阵",
      marksUnit: "分",
      criticalNotice: "重要提示",
      skills: "战术技能",
      relatedArchive: "相关档案",
      allMissions: "全部任务",
      fallbackTitle: "行动",
    },
  },

  documents: {
    meta: {
      title: "文件",
      description: "PATS 竞赛官方参考资料 —— 与信息手册对应的交互式简介。",
    },

    hero: {
      eyebrow: "参考资料库",
      title: "文件中心",
      subtitle:
        "PATS 竞赛官方参考资料 —— 浏览与信息手册对应的交互式简介。",
      metaSource: "来源",
      metaSourceValue: "官方手册",
      metaAccess: "获取方式",
      metaAccessValue: "数字简介",
    },

    library: {
      eyebrow: "参考资料",
      title: "竞赛资料库",
      description:
        "每个主题均链接至本站对应章节。手册扫描件不予公开 —— 请使用下方的结构化简介。",
    },

    downloadResults: "下载成绩 PDF",
    interactiveOperations: "交互式行动 →",
    bookletPage: (page: number): string => `手册第 ${page} 页`,
    openBrief: "查看简介 →",

    sections: {
      overview: "概览 — PATS",
      history: "沿革 — 国际参赛队",
      concept: "PATS 理念",
      layout: "课目编排",
      conduct: "课目实施（第一部分）",
      teamComposition: "参赛队编成",
      scoresAwards: "成绩与奖项",
      weaponEquipment: "武器与装备",
      coordinatingPoints: "协同事项",
    },
  },

  carousel: {
    prev: "上一组卡片",
    next: "下一组卡片",
  },
};
