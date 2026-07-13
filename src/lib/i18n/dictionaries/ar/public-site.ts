import type { publicSite as enPublicSite } from "../en/public-site";

// Arabic translations for shared public chrome: marketing nav and login page (right-to-left).
export const publicSite: typeof enPublicSite = {
  nav: {
    home: "الرئيسية",
    eventsDetail: "تفاصيل الفعاليات",
    international: "المشاركة الدولية",
    awards: "الجوائز",
    gallery: "معرض الصور",
    announcements: "الإعلانات",
    keyDates: "المواعيد الرئيسية",
    login: "تسجيل الدخول",
  },

  login: {
    hero: {
      eyebrow: "بوابة المشاركين",
      title: "تسجيل الدخول",
      subtitle: "ادخل إلى لوحة تحكم دورياتك وحالة تسجيلك.",
    },
    intro: {
      eyebrow: "دخول آمن",
      title: "تسجيل دخول المشارك",
      body: "استخدم بيانات اعتماد دوريتك المعتمدة للدخول إلى لوحة تحكم المشارك، ومتابعة حالة الرسوم، ومراجعة خطوات التنسيق الرئيسية قبل التحرك.",
      checklist: [
        "حسابات الدوريات المعتمدة فقط",
        "تتبّع حالة الدفع والتسجيل",
        "وصول مباشر إلى إجراءات المشارك والتحديثات",
      ],
    },
    card: {
      eyebrow: "وصول المشارك",
      title: "سجّل الدخول للمتابعة",
      description: "أدخل البريد الإلكتروني وكلمة المرور المعتمدين لحساب فريقك.",
      emailLabel: "عنوان البريد الإلكتروني",
      passwordLabel: "كلمة المرور",
      rememberHintOn: "سيبقى هذا الجهاز مسجّل الدخول لمدة تصل إلى 30 يومًا.",
      rememberHintOff: "بدون خيار تذكّرني، تنتهي جلستك بعد 24 ساعة.",
      rememberMe: "تذكّرني",
      signingIn: "جارٍ تسجيل الدخول…",
      login: "تسجيل الدخول",
      forgot: "هل نسيت كلمة المرور؟",
      footerPrefix: "إذا لم تكن قد سجّلت بعد، يرجى",
      footerLink: "النقر هنا لتسجيل وحدتك",
    },
    validation: {
      invalidEmail: "أدخل عنوان بريد إلكتروني صالحًا.",
      passwordRequired: "كلمة المرور مطلوبة.",
      emailPasswordRequired: "البريد الإلكتروني وكلمة المرور مطلوبان.",
    },
    toasts: {
      registered:
        "تم إرسال التسجيل. تحقق من بريدك الوارد للحصول على رابط التحقق قبل تسجيل الدخول.",
      passwordReset: "تم تحديث كلمة المرور. يرجى تسجيل الدخول بكلمة المرور الجديدة.",
      verified: "تم التحقق من البريد الإلكتروني. يمكنك تسجيل الدخول الآن.",
    },
  },
};
