import type { core as enCore } from "../en/core";

// Simplified Chinese (zh-CN) translations for the portal's core surfaces.
// Mirrors the English shape exactly (enforced via `typeof`).
export const core: typeof enCore = {
  common: {
    back: "返回",
    next: "下一步",
    backToDashboard: "返回仪表板",
    language: "语言",
    selectLanguage: "选择语言",
    loadingTitle: "参赛者仪表板",
    loadingDesc: "正在加载参赛者操作与状态面板。",
    toasts: {
      genericError: "出现问题，请重试。",
      saveSuccess: "更改已成功保存",
      validationError: "请检查表单中的错误。",
    },
  },

  meta: {
    home: "首页",
    announcements: "公告",
    awards: "奖项与表彰",
    login: "登录",
    register: "注册",
    exerciseContour: "Exercise Contour",
    gallery: "图库",
    international: "国际参与",
    keyDates: "关键日期",
    privacy: "隐私政策",
    dashboard: "仪表板",
    unitInfo: "更新单位信息",
    hostInfo: "东道信息",
    journey: "注册流程",
    support: "支持",
    supportTicket: "支持工单",
    confirmParticipation: "确认参与",
  },

  nav: {
    ariaLabel: "参赛者门户",
    portalName: "PATS 门户",
    participant: "参赛者",
    menu: "菜单",
    done: "完成",
    logout: "退出登录",
    dashboard: "仪表板",
    unitInformation: "单位信息",
    teamRegistration: "团队注册",
    payment: "付款",
    flightDetails: "航班信息",
    hostInformation: "接待信息",
    support: "支持",
    journeyComplete: "流程已完成",
  },

  dashboard: {
    welcomeBack: "欢迎回来",
    unitNotRegistered: "单位未注册",
    allStagesComplete: "所有阶段已完成",
    membersCount: (n) => `${n} 名队员`,
    scheduleEyebrow: "日程",
    dataEntryPeriods: "数据录入时段",
    dataEntryDesc: "仅在付款经核实后可用。",
    noPeriods: "尚未安排时段。",
    deadlinesEyebrow: "截止日期",
    timeline: "时间线",
    updatesEyebrow: "动态",
    latestNews: "最新动态",
    noNews: "暂无动态。",
    timelinePanel: {
      closed: "已截止",
      dueToday: "今日截止",
      daysLeft: (n) => `剩余 ${n} 天`,
      deadlines: "截止日期",
      noDeadlines: "尚未设定截止日期。",
      keyDates: "重要日期",
      noKeyDates: "尚未发布重要日期。",
      deadlineLabels: {
        registration: "报名截止日期",
        payment: "付款截止日期",
      },
    },
  },

  workflowPanel: {
    registrationProgress: "注册进度",
    ariaLabel: "注册流程",
    progressAria: "流程进度",
    countComplete: (done, total) => `已完成 ${done} / ${total}`,
  },

  statusBar: {
    underReviewTitle: "申请审核中",
    underReviewText:
      "您的注册正在由 PATS 审核。一经批准，我们将立即通过电子邮件通知您。",
    confirmedTitle: "已确认 — 您已获准参加 PATS 2026",
    confirmedTextWithDates: (dates) =>
      `您的付款已核实，参赛资格已确认。安排时间：${dates}。`,
    confirmedText: "您的付款已核实，参赛资格已确认。",
    approvedTitle: "已批准 — 需要付款",
    approvedText:
      "您的申请已获批准。请完成付款以确保您在比赛中的席位。",
    returnedTitle: "已退回以待更正",
    approvedOn: (date) => `批准于 ${date}`,
    goToPayment: "前往付款提交",
    paymentVerified: "付款已核实",
  },

  registration: {
    statuses: {
      PENDING: "待处理",
      UNDER_REVIEW: "审核中",
      APPROVED: "已批准",
      REJECTED: "已驳回",
      RETURNED: "已退回修改",
    },
    profileEyebrow: "个人资料",
    title: "注册详情",
    name: "姓名",
    unit: "单位",
    email: "电子邮件",
    rank: "军衔",
    dateRegistered: "注册日期",
    countryOfApplication: "申请国家",
    nationality: "国籍",
    branchFormation: "军种 / 编队",
  },

  journey: {
    suspended:
      "您的账户已被暂停。请联系 PATS 管理部门寻求帮助。",
    headers: {
      confirmation: {
        eyebrow: "",
        title: "确认参与",
        subtitle: "确认您的团队可参加 PATS 2026。",
      },
      verification: {
        eyebrow: "",
        title: "注册核验",
        subtitle:
          "您的注册详情将由体育局 (SD) 审核。",
      },
      payment: {
        eyebrow: "",
        title: "进行付款",
        subtitle:
          "完成注册付款以确认您参加 PATS 2026。",
      },
      teamRegistration: {
        eyebrow: "团队注册",
        title: "团队成员",
        subtitle:
          "在下方添加您的团队成员。保存后，请将名单标记为完成，以解锁航班信息。",
      },
      roster: {
        eyebrow: "团队注册",
        title: "团队成员",
        subtitle:
          "在下方添加您的团队成员。保存后，请将名单标记为完成，以解锁航班信息。",
      },
      flights: {
        eyebrow: "",
        title: "航班信息",
        subtitle:
          "一次性提交您团队的出行信息以及护照 / 机票文件。",
      },
      hostInfo: {
        eyebrow: "",
        title: "接待信息",
        subtitle: "由组织方为您的团队发布的接待详情。",
      },
    },
    banners: {
      participationConfirmed: "参与已确认。",
      confirmedOnSub: (date, unitName) =>
        `确认于 ${date}${unitName ? `，单位为 ${unitName}` : ""}。此步骤为只读。`,
      verifiedBySd: "注册已由体育局 (SD) 核验。",
      verifiedBySdSub:
        "以下您的注册详情为只读。请继续下一步。",
      registrationVerification: "注册核验",
      messageFromSd: "来自 SD 的消息：",
      paymentVerifiedMt: "付款已由管理组 (MT) 核实。",
      paymentVerifiedMtSub:
        "以下您的付款记录为只读。请继续下一步。",
      paymentDeadlinePassed:
        "付款截止日期已过，因此新的付款提交已关闭。如果您仍需完成付款，请联系 PATS 管理部门。",
      noPaymentInfo:
        "您的账户暂无可用的付款信息。请稍后再试。",
      teamRegistered: "团队已注册。",
      teamRegisteredSub: (date) =>
        `注册于 ${date}。请在下方填写您的成员名单。`,
      rosterCompleted: "名单已完成。",
      rosterCompletedSub: (count, date) =>
        `${count} 名成员已于 ${date} 确认。除非管理部门重新开放，否则名单为只读。`,
      hostInfoTitle: "接待信息",
      hostInfoAvailable:
        "您团队的接待详情已由组织方发布。",
      hostInfoLocked:
        "在您的航班信息最终确定且组织方发布后，接待详情将在此处提供。",
      openHostInfo: "打开接待信息",
    },
    wizard: {
      stepsAria: "注册步骤",
      lockedTitle: "已锁定 — 请先完成前面的步骤",
      stepXofY: (current, total, activeLabel) =>
        `第 ${current} 步，共 ${total} 步${activeLabel ? ` — ${activeLabel}` : ""}`,
      nextLockedTitle: "完成此步骤以解锁下一步",
      finalStep: "最后一步",
      finalStepTitle: "这是最后一步",
    },
  },

  confirm: {
    dateLocale: "zh-CN",
    actionRequired: "需要采取行动",
    title: "确认您的参与",
    description:
      "在进入参赛者仪表板之前，请确认您的团队是否能够参加此次演练。确认后即可进入下一注册阶段。拒绝将使您退出登录 — 您可以在下方截止日期之前随时重新登录并确认。",
    previouslyDeclined:
      "您此前拒绝了注册。在截止日期到期之前，您仍可以确认。",
    confirmationDeadline: "确认截止日期",
    deadlineExpired:
      "确认截止日期已过。已无法确认。请联系组织方寻求帮助。",
    days: "天",
    hours: "小时",
    min: "分",
    sec: "秒",
    remaining: "剩余",
    timeRemainingAria: "确认剩余时间",
    toBeAnnounced: "将由组织方公布。",
    rejectPrompt:
      "拒绝注册并退出登录？只要截止日期尚未到期，您可以稍后重新登录并确认。",
    yesReject: "是，拒绝并退出登录",
    goBack: "返回",
    confirm: "确认",
    reject: "拒绝",
    signOut: "退出登录",
    confirmTitleAttr: "确认您的注册",
    deadlinePassedAttr: "确认截止日期已过",
    footer:
      "您的决定将带时间戳记录，供组织人员查阅。需要帮助？请从登录页面联系支持。",
    toastConfirmed: "注册已确认 — 欢迎加入！",
    toastRejected: "注册已拒绝。正在为您退出登录…",
  },

  hostInfo: {
    title: "接待信息",
    subtitleLocked: "来自组织方的最终接待与抵达信息。",
    subtitle: "最终的接待、团队与抵达信息 — 只读。",
    notAvailableTitle: "尚不可用",
    notAvailableText:
      "在您的航班信息经管理部门审核并最终确定，且组织方发布接待信息后，接待信息板块将变为可见。",
    participatingCountries: "参与国家",
    registeredTeams: "已注册团队",
    yourFinalizedTravelers: "您已最终确定的出行人员",
    hostingArrivalInfo: "接待与抵达信息",
    countryWiseTeamNumbers: "各国团队数量",
    sNo: "序号",
    country: "国家",
    teams: "团队",
    noRegisteredTeams: "暂无已注册团队。",
    unspecified: "未指定",
    yourTeamWithUnit: (unit) => `您的团队 — ${unit}`,
    yourTeam: "您的团队",
    serialNumber: "编号",
    rank: "军衔",
    fullName: "全名",
    gender: "性别",
    finalizedFlightInfo: "最终航班信息",
    traveler: "出行人员",
    passengerName: "乘客姓名",
    passportNo: "护照号码",
    documents: "文件",
    noFlightRecords: "无航班记录。",
    passport: "护照",
    ticket: "机票",
    readOnlyNote:
      "此信息为只读。如需任何更正，请联系组织方。",
  },
};
