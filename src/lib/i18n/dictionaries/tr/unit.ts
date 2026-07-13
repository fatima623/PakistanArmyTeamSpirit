import type { unit as enUnit } from "../en/unit";

export const unit: typeof enUnit = {
  page: {
    title: "Birlik bilgileri",
    subtitle: "Kayıt bilgilerinizi aşağıdan güncelleyin.",
  },
  sections: {
    personalDetails: "Kişisel bilgiler",
    unitDetails: "Birlik bilgileri",
    coDetails: "Komutan / Yardımcı bilgileri",
  },
  fields: {
    firstName: "Ad",
    lastName: "Soyad",
    rank: "Rütbe",
    unitType: "Birlik türü",
    branch: "Kuvvet",
    unitName: "Birlik adı",
    arm: "Sınıf",
    secondPocEmail: "2. irtibat kişisi e-postası",
    thirdPocEmail: "3. irtibat kişisi e-postası (isteğe bağlı)",
    additionalInfo: "Ek bilgi (isteğe bağlı)",
    coName: "Komutan adı",
    coEmail: "Komutan e-postası",
    coPhone: "Komutan telefonu",
  },
  options: {
    regular: "Muvazzaf",
    reserve: "Yedek",
    army: "Kara Kuvvetleri",
    navy: "Deniz Kuvvetleri",
    airForce: "Hava Kuvvetleri",
  },
  placeholders: {
    selectUnit: "Birlik seçin",
    select: "Seçin",
  },
  actions: {
    saveChanges: "Değişiklikleri kaydet",
  },
};
