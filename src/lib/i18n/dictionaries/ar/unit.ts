import type { unit as enUnit } from "../en/unit";

export const unit: typeof enUnit = {
  page: {
    title: "معلومات الوحدة",
    subtitle: "حدّث تفاصيل تسجيلك أدناه.",
  },
  sections: {
    personalDetails: "المعلومات الشخصية",
    unitDetails: "معلومات الوحدة",
    coDetails: "معلومات القائد / النائب",
  },
  fields: {
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    rank: "الرتبة",
    unitType: "نوع الوحدة",
    branch: "الفرع",
    unitName: "اسم الوحدة",
    arm: "الصنف",
    secondPocEmail: "البريد الإلكتروني لجهة الاتصال الثانية",
    thirdPocEmail: "البريد الإلكتروني لجهة الاتصال الثالثة (اختياري)",
    additionalInfo: "معلومات إضافية (اختياري)",
    coName: "اسم القائد",
    coEmail: "البريد الإلكتروني للقائد",
    coPhone: "هاتف القائد",
  },
  options: {
    regular: "نظامي",
    reserve: "احتياطي",
    army: "القوات البرية",
    navy: "القوات البحرية",
    airForce: "القوات الجوية",
  },
  placeholders: {
    selectUnit: "اختر الوحدة",
    select: "اختر",
  },
  actions: {
    saveChanges: "حفظ التغييرات",
  },
  descriptions: {
    personal: "يرجى تقديم معلوماتك الشخصية",
    co: "أدخل تفاصيل القائد / النائب",
    unit: "قدّم معلومات عن وحدتك وفرعك",
  },
  reviewNote: "يرجى مراجعة معلوماتك بعناية قبل حفظ التغييرات.",
};
