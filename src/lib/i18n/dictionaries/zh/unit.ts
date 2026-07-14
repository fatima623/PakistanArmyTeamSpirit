import type { unit as enUnit } from "../en/unit";

// Simplified Chinese (zh-CN) translations for the unit information page.
export const unit: typeof enUnit = {
  page: {
    title: "单位信息",
    subtitle: "在下方更新您的注册详情。",
  },
  sections: {
    personalDetails: "个人详情",
    unitDetails: "单位详情",
    coDetails: "指挥官 (CO) / 副指挥官 (2IC) 详情",
  },
  fields: {
    firstName: "名",
    lastName: "姓",
    rank: "军衔",
    unitType: "单位类型",
    branch: "军种",
    unitName: "单位名称",
    arm: "兵种",
    secondPocEmail: "第二联系人电子邮件",
    thirdPocEmail: "第三联系人电子邮件（可选）",
    additionalInfo: "补充信息（可选）",
    coName: "指挥官姓名",
    coEmail: "指挥官电子邮件",
    coPhone: "指挥官电话",
  },
  options: {
    regular: "常备",
    reserve: "预备役",
    army: "陆军",
    navy: "海军",
    airForce: "空军",
  },
  placeholders: {
    selectUnit: "选择单位",
    select: "请选择",
  },
  actions: {
    saveChanges: "保存更改",
  },
  descriptions: {
    personal: "请提供您的个人信息",
    co: "请提供指挥官 / 副指挥官详情",
    unit: "请提供有关您单位和军种的信息",
  },
  reviewNote: "保存更改前，请仔细核对您的信息。",
};
