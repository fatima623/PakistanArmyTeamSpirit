import type { publicSite as enPublicSite } from "../en/public-site";

// Simplified Chinese (zh-CN) translations for shared public chrome: nav + login.
export const publicSite: typeof enPublicSite = {
  nav: {
    home: "首页",
    eventsDetail: "活动详情",
    operations: "行动",
    exerciseContour: "演习概览",
    international: "国际参与",
    awards: "奖项",
    gallery: "图库",
    announcements: "公告",
    documents: "文件",
    keyDates: "重要日期",
    login: "登录",
  },

  gallery: {
    eyebrow: "现场存档",
    title: "赛事图库",
    subtitle: "PATS 历届国际赛事的纪实存档——代表团、典礼与作战传统。",
    allArchives: "全部存档",
    photos: (count: number) => `${count} 张照片`,
    empty: "图库正在更新，请稍后再来查看。",
    close: "关闭",
    previous: "上一张",
    next: "下一张",
  },

  announcements: {
    eyebrow: "通知",
    title: "公告",
    subtitle: "PATS 赛事的官方通知、更新与协调简报。",
    latest: "最新",
    countLabel: (count: number) => `已发布 ${count} 条公告`,
    readMore: "阅读更多",
    empty: "暂无公告，请稍后再来查看。",
  },

  chrome: {
    siteNav: "站点",
    mainNav: "主导航",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    brandHome: "PATS 首页",
    selectLanguage: "选择语言",
  },

  breadcrumb: {
    home: "首页",
    label: "面包屑导航",
  },

  footer: {
    isprWebsite: "ISPR 网站",
    registerNow: "立即注册",
    contactUs: "联系我们",
  },

  pages: {
    awards: {
      heroEyebrow: "荣誉名录",
      heroTitle: "奖项与表彰",
      heroSubtitle:
        "各队在所有战术项目中接受评分。总体百分比决定奖牌等级和参与证书。",
      metaGold: "金牌",
      metaSilver: "银牌",
      metaBronze: "铜牌",
      showcaseLabel: "荣誉名录",
      showcaseTitle: "奖项与荣誉",
      showcaseSubtitle:
        "各队在所有战术项目中接受评分。总体百分比决定奖牌等级和参与证书。",
      tierGold: "金牌等级",
      tierSilver: "银牌等级",
      tierBronze: "铜牌等级",
      tierParticipation: "参与",
      nameGold: "金牌",
      nameSilver: "银牌",
      nameBronze: "铜牌",
      nameCertificate: "证书",
      rangeGold: "75% 及以上",
      rangeSilver: "65% 至 74.99%",
      rangeBronze: "55% 至 64.99%",
      rangeCertificate: "低于 55%",
      standingsTitle: "当前排名",
      standingsSubtitle: "各国按其总体百分比目前所达到的奖牌类别分组。",
      standingsBadge: "实时数据",
      colMedal: "奖牌类别",
      colMinimum: "所需最低百分比",
      colCountries: "达标国家",
      noTeams: "该区间暂无队伍",
      standingsFootnote: "供指挥审阅的示例排名。最终结果于演习后核定。",
      teamEyebrow: "队伍",
      teamTitle: "队伍构成",
      teamDescription: "参赛队伍的官方巡逻编制。",
      teamRoles: [
        { role: "队长", qty: "1 × 上尉 / 副官" },
        { role: "副队长", qty: "1 × 中士 / 同等军衔" },
        { role: "队军士", qty: "1 × 下士 / 同等军衔" },
        { role: "轻机枪手 1 号", qty: "1 × 士兵 / 同等" },
        { role: "轻机枪手 2 号", qty: "1 × 士兵 / 同等" },
        { role: "通信员", qty: "1 × 士兵 / 同等" },
        { role: "步枪手", qty: "2 × 士兵 / 同等" },
        { role: "预备队", qty: "1 × 上尉/副官 + 1 × 中士/士兵" },
        { role: "队务经理", qty: "1 × 少校" },
      ],
    },
    international: {
      heroEyebrow: "全球伙伴关系",
      heroTitle: "国际参与",
      heroSubtitle: "PATS 汇聚了来自多个战区伙伴国家的巡逻队伍。",
      metaSince: "始于",
      metaSinceValue: "2016",
      metaEditions: "届数",
      metaEditionsValue: "8 届国际赛",
      metaReach: "覆盖",
      metaReachValue: "多战区",
      mapEyebrow: "战区地图",
      mapTitle: "已注册国家",
      mapDescription:
        "已为比赛注册队伍的国家。将鼠标悬停在高亮的国家上可查看其队伍及注册年份。",
      historyEyebrow: "历史",
      historyTitle: "历届时间线",
      historyDescription: "比赛历届的国际参与情况。",
      orientationEyebrow: "熟悉训练",
      orientationTitle: "适应性训练",
      orientationDescription: "国际队伍在行动前的赛前熟悉训练。",
      orientationModules: [
        "射击 / 校枪（竞赛用枪械）",
        "导航 / 地图判读",
        "通信器材",
        "核生化防护（CBRN）",
        "AFOS / ATGP",
        "地形勘察",
      ],
      historyNarrative: [
        "PATS 始于 2005 年，最初是一项着重耐力与体能的导航演练。",
        "反恐作战的经验被融入其中，形成贴近实战的课目与战场情景——涵盖常规与非常规环境下的次战术行动。",
        "友好国家日益浓厚的兴趣促成了 2016 年国际 PATS 的举办，各方由此分享丰富经验、相互学习。",
      ],
      mapAria: "已注册国家的世界地图",
      mapCaption: (count: number) =>
        `已呈现 ${count} 个国家——将鼠标悬停在高亮的国家上可查看其队伍。`,
      mapEmpty: "随着队伍报名，已注册国家将在此显示。",
      // Chinese does not mark plurality; 支 is the measure word for a team.
      mapCountryAria: (country: string, count: number) =>
        `${country}：${count} 支已注册队伍`,
      tooltipMore: (count: number) => `还有 ${count} 个`,
    },
    keyDates: {
      heroEyebrow: "日程",
      heroTitle: "重要日期",
      heroSubtitle:
        "PATS 赛事周期的重要日期。除另有说明外，所有时间均为巴基斯坦标准时间 (PKT)。",
      sectionEyebrow: "时间线",
      sectionTitle: "赛事日程",
      sectionDescription: "注册、演习及行政里程碑的官方时间线。",
      empty: "尚未配置重要日期。",
    },
    privacy: {
      heroEyebrow: "法律",
      heroTitle: "隐私政策",
      body1: (siteName: string) =>
        `${siteName} 致力于保护您的个人信息。本政策说明我们如何收集、使用和保护通过本注册门户提交的数据。`,
      body2: (siteName: string, org: string) =>
        `在本网站注册即表示您同意为管理 ${siteName} 参与事务（包括与您的单位沟通以及与 ${org} 协调）而处理您的数据。`,
      body3Prefix: "如需了解完整政策详情或行使您的数据权利，请联系 ",
      externalLink: "查看外部隐私政策",
    },
  },

  login: {
    hero: {
      eyebrow: "参赛者门户",
      title: "登录",
      subtitle: "访问您的巡逻队仪表板及注册状态。",
    },
    intro: {
      eyebrow: "安全访问",
      title: "参赛者登录",
      body: "使用您已获批的巡逻队凭证登录参赛者仪表板，查看费用状态，并在出发前查阅关键协调步骤。",
      checklist: [
        "仅限已获批的巡逻队账户",
        "付款与注册状态跟踪",
        "直接访问参赛者操作与动态",
      ],
    },
    card: {
      eyebrow: "参赛者访问",
      title: "登录以继续",
      description: "输入您团队账户已获批的电子邮件与密码。",
      emailLabel: "电子邮件地址",
      passwordLabel: "密码",
      rememberHintOn: "此设备将保持登录状态最长 30 天。",
      rememberHintOff: "若未勾选“记住我”，您的会话将在 24 小时后过期。",
      rememberMe: "记住我",
      signingIn: "正在登录…",
      login: "登录",
      forgot: "忘记密码？",
      footerPrefix: "如果您尚未注册，请",
      footerLink: "点击此处注册您的单位",
    },
    validation: {
      invalidEmail: "请输入有效的电子邮件地址。",
      passwordRequired: "密码为必填项。",
      emailPasswordRequired: "电子邮件和密码均为必填项。",
    },
    toasts: {
      registered:
        "注册已提交。登录前请查收邮箱中的验证链接。",
      passwordReset: "密码已更新。请使用新密码登录。",
      verified: "电子邮件已验证。您现在可以登录。",
    },
  },
};
