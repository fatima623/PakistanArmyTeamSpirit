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
    finalizedTitle:
      "您的航班信息已经管理部门审核并最终确定。",
    finalizedSub:
      "记录为只读。接待信息将在组织方发布后可用。",
    deadlinePassed:
      "航班信息提交截止日期已过。如需更正，请联系组织方。",
    deadlineInfo: (date) =>
      `您可以在 ${date} 之前提交或替换文件（或在记录被管理部门锁定之前）。`,
  },
  card: {
    title: "团队航班信息",
    desc: "一次提交涵盖您的整个团队 — 请提供领队出行人员的详情，并上传护照和机票文件（PDF，每个最大 10MB）。",
    submitted: "已提交",
    notSubmitted: "未提交",
  },
  form: {
    leadName: "领队出行人员姓名（与护照一致）",
    leadNamePlaceholder: "例如 CAPT SARA KHAN",
    passportNumber: "护照号码",
    passportNumberPlaceholder: "例如 AB1234567",
    passportDoc: "护照文件（PDF）",
    ticketDoc: "机票（PDF）",
    currentFile: (name) => `当前：${name}。留空则保留原文件。`,
    saveChanges: "保存更改",
    submitFlight: "提交航班信息",
    cancel: "取消",
  },
  view: {
    leadTraveller: "领队出行人员",
    passportNumber: "护照号码",
    lastUpdated: "最后更新",
    editDetails: "编辑详情",
  },
  errors: {
    nameRequired: "领队出行人员姓名为必填项",
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
