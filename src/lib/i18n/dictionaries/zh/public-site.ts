import type { publicSite as enPublicSite } from "../en/public-site";

// Simplified Chinese (zh-CN) translations for shared public chrome: nav + login.
export const publicSite: typeof enPublicSite = {
  nav: {
    home: "首页",
    eventsDetail: "活动详情",
    international: "国际参与",
    awards: "奖项",
    gallery: "图库",
    announcements: "公告",
    keyDates: "重要日期",
    login: "登录",
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
