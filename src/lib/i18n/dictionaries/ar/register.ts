import type { register as enRegister } from "../en/register";

// Arabic translations for the public registration page + form (right-to-left).
export const register: typeof enRegister = {
  hero: {
    eyebrow: "التسجيل",
    title: "سجّل اهتمامك",
    subtitle:
      "أرسل تفاصيل الدورية والتنسيق لمراجعة المقر الرئيسي (HQ). لا يكتمل التسجيل حتى يتم تأكيد رسوم الدورية.",
  },

  closed: {
    title: "التسجيل مغلق",
    body: "لقد انقضى الموعد النهائي للتسجيل. يرجى التواصل مع إدارة PATS إذا كنت تعتقد أن هذا خطأ.",
  },

  notice: {
    intro: (site: string) => `قبل التسجيل في ${site} يرجى`,
    emphasis: "التأكد من توفّر جميع التفاصيل الواردة أدناه لديك.",
    rest: "سيتم رفض الطلبات التي تحتوي على معلومات غير صحيحة. جميع الحقول مطلوبة ما لم يُشَر إلى خلاف ذلك.",
    phaseNote:
      "ملاحظة: يتوفر اختيار المرحلة في الخطوة التالية. لا يكتمل التسجيل حتى يتم سداد رسوم الدوريات.",
    intlClosedPrefix:
      "أصبح التسجيل مغلقًا الآن للدوريات الدولية فقط. يرجى التواصل مع",
    intlClosedSuffix: "إذا كنت بحاجة إلى أي مساعدة.",
  },

  sections: {
    account: "تفاصيل الحساب",
    unit: "تفاصيل الوحدة",
    attache: "تفاصيل الملحق الدفاعي",
  },

  fields: {
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    passwordHint: "8 أحرف على الأقل: حرف كبير، حرف صغير، رقم، رمز خاص",
    confirmPassword: "تأكيد كلمة المرور",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    rank: "الرتبة",
    gender: "الجنس",
    unitType: "نوع الوحدة",
    branch: "الفرع",
    unitName: "اسم الوحدة",
    selectUnit: "اختر الوحدة",
    country: "بلد التقديم",
    specifyCountry: "حدّد البلد",
    specifyCountryHint: "أدخل بلدك إذا لم يكن مدرجًا أعلاه",
    specifyCountryPlaceholder: "أدخل بلدك",
    nationality: "الجنسية",
    nationalityHint: "مطلوبة للمشاركين الدوليين",
    nationalityPlaceholder: "مثال: بريطاني، تركي، أردني",
    arm: "السلاح",
    select: "اختر",
    secondPoc: "بريد نقطة الاتصال الثانية (POC)",
    thirdPoc: "بريد نقطة الاتصال الثالثة (POC) (اختياري)",
    additionalInfo: "معلومات إضافية (اختياري)",
    coName: "اسم القائد (CO)",
    coEmail: "بريد القائد (CO)",
    coPhone: "هاتف القائد (CO)",
  },

  options: {
    gender: { Male: "ذكر", Female: "أنثى", Other: "آخر" },
    unitType: { Regular: "نظامي", Reserve: "احتياطي" },
    branch: { Army: "الجيش", Navy: "البحرية", "Air Force": "القوات الجوية" },
    arm: {
      Combat: "قتالي",
      "Combat Support": "الإسناد القتالي",
      "Combat Service Support": "إسناد الخدمة القتالية",
    },
  },

  consent: {
    prefix: "لقد قرأت وأوافق على",
    link: "سياسة الخصوصية",
  },

  submit: "المرحلة التالية",
  submitting: "جارٍ الإرسال...",
  afterSubmit:
    "بعد التسجيل ستتلقى تأكيدًا عبر البريد الإلكتروني. يرجى التحقق من مجلد الرسائل غير المرغوب فيها / السخام تحسّبًا لوصوله إليه.",

  errors: {
    csrf: "فشل التحقق الأمني. يرجى التحديث والمحاولة مرة أخرى.",
  },
};
