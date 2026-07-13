import type { tickets as enTickets } from "../en/tickets";

// Simplified Chinese (zh-CN) translations for the support tickets surfaces.
export const tickets: typeof enTickets = {
  panel: {
    title: "支持",
    subtitle: "提交工单，我们的团队会尽快回复您。",
    newTicket: "新建工单",
    empty: "您还没有任何支持工单。如果需要帮助，请在上方提交工单。",
    listMeta: (category, count, updated) =>
      `${category} · ${count} 条消息 · 更新于 ${updated}`,
  },
  statuses: {
    OPEN: "待处理",
    IN_PROGRESS: "处理中",
    RESOLVED: "已解决",
    CLOSED: "已关闭",
  },
  priorities: {
    LOW: "低",
    NORMAL: "普通",
    HIGH: "高",
  },
  priorityTag: (label) => `${label}优先级`,
  categories: {
    GENERAL: "一般咨询",
    REGISTRATION: "注册",
    PAYMENT: "付款",
    TECHNICAL: "技术问题",
  },
  staffTag: "PATS 团队",
  detail: {
    backToSupport: "返回支持",
    subtitle: (category, date) => `${category} · 创建于 ${date}`,
  },
  form: {
    title: "提交支持工单",
    subject: "主题",
    subjectPlaceholder: "简要概述您的问题",
    category: "类别",
    priority: "优先级",
    help: "我们能为您做些什么？",
    helpPlaceholder: "请详细描述您的问题",
    cancel: "取消",
    submit: "提交工单",
    toastRaised: "工单已提交",
  },
  reply: {
    closedNotice:
      "此工单已关闭。如需进一步帮助，请提交新工单。",
    placeholder: "撰写回复…",
    closeTicket: "关闭工单",
    sendReply: "发送回复",
    toastClosed: "工单已关闭",
  },
};
