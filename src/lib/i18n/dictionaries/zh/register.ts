import type { register as enRegister } from "../en/register";

// Simplified Chinese (zh-CN) translations for the public registration page + form.
export const register: typeof enRegister = {
  hero: {
    eyebrow: "注册",
    title: "登记参赛意向",
    subtitle:
      "提交巡逻队与联络信息以供 HQ 审核。在巡逻队费用得到确认之前，注册尚未完成。",
  },

  closed: {
    title: "注册已关闭",
    body: "注册截止日期已过。如果您认为这是误报，请联系 PATS 管理部门。",
  },

  notice: {
    intro: (site: string) => `在注册 ${site} 之前，请`,
    emphasis: "确保您已备齐以下所有信息。",
    rest: "包含错误信息的申请将被拒绝。除另有标注外，所有字段均为必填。",
    phaseNote:
      "注意：阶段选择将在下一环节提供。在巡逻队完成付款之前，注册尚未完成。",
    intlClosedPrefix:
      "目前仅国际巡逻队的申请已关闭。如需任何协助，请联系",
    intlClosedSuffix: "。",
  },

  sections: {
    account: "账户信息",
    unit: "单位信息",
    attache: "国防武官详情",
  },

  fields: {
    email: "电子邮件",
    password: "密码",
    passwordHint: "至少 8 位：含大写、小写、数字、特殊字符",
    confirmPassword: "确认密码",
    firstName: "名字",
    lastName: "姓氏",
    rank: "军衔",
    gender: "性别",
    unitType: "单位类型",
    branch: "军种",
    unitName: "单位名称",
    selectUnit: "选择单位",
    country: "申请国家",
    specifyCountry: "指定国家",
    specifyCountryHint: "如果上方未列出您的国家，请在此填写",
    specifyCountryPlaceholder: "请输入您的国家",
    nationality: "国籍",
    nationalityHint: "国际参赛者必填",
    nationalityPlaceholder: "例如：英国、土耳其、约旦",
    arm: "兵种",
    select: "选择",
    secondPoc: "第二 POC 电子邮件",
    thirdPoc: "第三 POC 电子邮件（选填）",
    additionalInfo: "补充信息（选填）",
    coName: "CO 姓名",
    coEmail: "CO 电子邮件",
    coPhone: "CO 电话",
  },

  options: {
    gender: { Male: "男", Female: "女", Other: "其他" },
    unitType: { Regular: "现役", Reserve: "预备役" },
    branch: { Army: "陆军", Navy: "海军", "Air Force": "空军" },
    arm: {
      Combat: "作战",
      "Combat Support": "作战支援",
      "Combat Service Support": "作战勤务支援",
    },
  },

  consent: {
    prefix: "我已阅读并同意",
    link: "隐私政策",
  },

  submit: "下一环节",
  submitting: "提交中…",
  afterSubmit:
    "注册后，您将收到一封电子邮件确认。请检查您的垃圾邮件文件夹，以防邮件被误归入其中。",

  errors: {
    csrf: "安全校验失败。请刷新后重试。",
  },
};
