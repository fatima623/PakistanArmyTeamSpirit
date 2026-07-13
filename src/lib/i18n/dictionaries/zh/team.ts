import type { team as enTeam } from "../en/team";

// Simplified Chinese (zh-CN) translations for team registration surfaces.
export const team: typeof enTeam = {
  errors: {
    serialRequired: "编号为必填项",
    rankRequired: "军衔为必填项",
    fullNameRequired: "全名为必填项",
    rowError: (row, msg) => `第 ${row} 行：${msg}`,
    duplicateSerial: (serial) => `编号重复：${serial}`,
  },
  toasts: {
    teamRegistered: "团队已注册 — 您现在可以创建成员名单",
    rosterSaved: "名单已保存",
    rosterCompleted: "名单已完成 — 航班信息现已可用",
    rosterReopened: "名单已重新开放编辑",
    requestSubmitted: "请求已提交至管理员审批",
  },
  window: {
    opensOn: (date) => `团队注册将于 ${date} 开放。`,
    notOpenedYet: "团队注册尚未开放。",
    closedOn: (date) => `团队注册已于 ${date} 关闭。`,
    periodClosed: "团队注册时段已关闭。",
    openUntil: (date) => `团队注册开放至 ${date}。`,
    open: "团队注册已开放。",
  },
  settingUp: "正在设置您的团队名单…",
  register: {
    title: "团队注册",
    windowOpen: "注册窗口已开放",
    windowNotYetOpen: "窗口尚未开放",
    windowClosed: "窗口已关闭",
    unlockNote:
      "团队注册将在参与确认、体育局 (SD) 注册核验以及管理组 (MT) 付款核实后解锁。",
  },
  roster: {
    completedShort: "名单已完成",
    unsavedChanges: "您有未保存的更改",
    filledCount: (filled, total) =>
      `已填写 ${filled} / ${total} 名成员`,
    heading: "团队成员",
    addMembersDesc:
      "在下方添加您的团队成员。保存后，请将名单标记为完成，以解锁航班信息。",
    lockedByAdmin: "已被管理部门锁定",
    requestAdditional: "申请增加团队成员",
    saveRoster: "保存名单",
    saveTitleFill: "填写每位团队成员的详情后即可保存",
    saveTitleDirty: "保存您的名单",
    saveTitleNoChanges: "没有需要保存的更改",
    edit: "编辑",
    markComplete: "标记名单为完成",
    completeTitleFill: "请先填写每位团队成员的信息",
    completeTitleDirty: "请先保存您的名单",
    completeTitleReady: "完成名单以解锁航班信息",
    infoNote:
      "填写所有团队成员的详情并点击“保存”。然后将名单标记为完成，以解锁航班信息。",
  },
  table: {
    caption: "团队成员 — 编号、军衔、全名和性别",
    serialNumber: "编号",
    serialTitle: "服役 / 编号，例如 PA-12345",
    rank: "军衔",
    rankTitle: "军衔，例如上尉",
    fullName: "全名",
    fullNameTitle: "与官方文件一致的全名",
    gender: "性别",
    actions: "操作",
  },
  placeholders: {
    serialEg: "例如 PA-12345",
    rankEg: "例如上尉",
    fullName: "全名",
  },
  aria: {
    serialRow: (n) => `编号，第 ${n} 行`,
    rankRow: (n) => `军衔，第 ${n} 行`,
    fullNameRow: (n) => `全名，第 ${n} 行`,
    genderRow: (n) => `性别，第 ${n} 行`,
    clearRow: (n) => `清除第 ${n} 行`,
    clearRowTitle: "清除此行",
    prevPage: "上一页",
    nextPage: "下一页",
    page: (n) => `第 ${n} 页`,
    rowsPerPage: "每页行数",
    perPage: (n) => `每页 ${n} 行`,
  },
  genders: {
    male: "男",
    female: "女",
    other: "其他",
  },
  sizeRequest: {
    summary: (count, statusText) =>
      `团队规模申请 — ${count} 名成员：${statusText}`,
    pendingReview: "等待管理员审核",
    approved: "已批准",
    rejected: "已拒绝",
    pending: "待处理",
  },
  dialog: {
    title: "申请增加成员",
    desc: (limit) =>
      `您的团队上限为 ${limit} 人。请向管理部门申请提高上限 — 他们将审核您的请求。`,
    requestedSize: "申请的团队规模",
    between: (min) => `介于 ${min} 至 200 名成员之间。`,
    justification: "理由",
    justificationPlaceholder:
      "请说明您的团队为何需要增加成员…",
    charsMin: (n) => `至少 ${n}/20 个字符`,
    cancel: "取消",
    submit: "提交申请",
  },
};
