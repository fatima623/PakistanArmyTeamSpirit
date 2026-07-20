import type { flights as enFlights } from "../en/flights";

// Simplified Chinese (zh-CN) translations for the flight details surfaces.
export const flights: typeof enFlights = {
  doc: {
    uploaded: "已上传",
    notUploadedYet: "尚未上传",
    required: "必填",
    pdfLabel: (size) => `PDF${size ? ` · ${size}` : ""}`,
    openPdfTitle: (label) => `打开 ${label} PDF`,
    viewPdf: "查看 PDF",
    missing: "缺失",
  },
  labels: {
    passport: "护照",
    flightTicket: "机票",
  },
  banners: {
    finalizedTitle: "您的航班信息已经管理部门审核并最终确定。",
    finalizedSub: "记录为只读。接待信息将在组织方发布后可用。",
    deadlinePassed: "航班信息提交截止日期已过。如需更正，请联系组织方。",
    deadlineInfo: (date) =>
      `您可以在 ${date} 之前提交或替换文件（或在记录被管理部门锁定之前）。`,
  },
  card: {
    title: "出行人员航班信息",
    progress: (done, total) => `${total} 位出行人员中已完成 ${done} 位`,
    emptyRoster:
      "您的团队名单为空。请先添加团队成员 — 航班信息需按每位出行人员分别填写。",
  },
  status: {
    notStarted: "尚未开始",
    detailsSaved: "信息已保存，文件缺失",
    passportMissing: "缺少护照",
    ticketMissing: "缺少机票",
    complete: "已完成",
  },
  member: {
    noRecord: "尚未为该出行人员提交航班信息。",
    addDetails: "添加航班信息",
    editDetails: "编辑信息",
    delete: "删除",
    confirmDelete: "确定删除此航班信息吗？",
    confirmDeleteYes: "确定删除",
    keep: "保留",
    deleted: "航班信息已删除",
  },
  form: {
    passengerName: "乘客姓名（与护照一致）",
    passengerNamePlaceholder: "例如 CAPT SARA KHAN",
    passportNumber: "护照号码",
    passportNumberPlaceholder: "例如 AB1234567",
    passportDoc: "护照文件（PDF）",
    ticketDoc: "机票（PDF）",
    currentFile: (name) => `当前：${name}。留空则保留原文件。`,
    saveChanges: "保存更改",
    submitFlight: "保存航班信息",
    cancel: "取消",
  },
  view: {
    passenger: "乘客",
    passportNumber: "护照号码",
    lastUpdated: "最后更新",
  },
  unlinked: {
    title: "未关联的航班记录",
    desc: "这些记录是在航班信息改为按出行人员分别填写之前提交的。请将每条记录关联到名单中的一位成员以便保留 — 未关联的记录不计入团队进度。",
    assign: "关联",
    selectMember: "选择一位出行人员…",
    noneAvailable:
      "名单中的每位成员都已有航班记录。请删除其中一条以空出一位出行人员，或删除此未关联记录。",
    assigned: "航班记录已关联到该出行人员",
    selectRequired: "请选择此记录所属的出行人员",
  },
  errors: {
    nameRequired: "乘客姓名为必填项",
    passportRequired: "护照号码为必填项",
    mustBePdf: (label) => `${label}必须为 PDF 文件`,
    mustBeUnder10: (label) => `${label}必须小于 10MB`,
    passportLabel: "护照",
    ticketLabel: "机票",
    updated: "航班信息已更新",
    submitted: "航班信息已提交",
  },
  none: "—",
};
