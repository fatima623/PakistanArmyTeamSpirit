import type { register as enRegister } from "../en/register";

// Turkish translations for the public registration page + form.
export const register: typeof enRegister = {
  hero: {
    eyebrow: "Kayıt",
    title: "İlgi kaydı",
    subtitle:
      "Devriye ve irtibat bilgilerini HQ incelemesi için gönderin. Devriye ücretleri onaylanana kadar kayıt tamamlanmaz.",
  },

  closed: {
    title: "Kayıtlar kapandı",
    body: "Kayıt son tarihi geçti. Bunun bir hata olduğunu düşünüyorsanız lütfen PATS yönetimiyle iletişime geçin.",
  },

  notice: {
    intro: (site: string) => `${site} için kayıt olmadan önce lütfen`,
    emphasis: "aşağıdaki tüm bilgilerin elinizde olduğundan emin olun.",
    rest: "Hatalı bilgi içeren başvurular reddedilecektir. Aksi belirtilmedikçe tüm alanlar zorunludur.",
    phaseNote:
      "Not: aşama seçimi bir sonraki adımda yapılabilir. Devriyelerin ödemesi yapılana kadar kayıt tamamlanmaz.",
    intlClosedPrefix:
      "Başvurular yalnızca Uluslararası Devriyeler için kapanmıştır. Yardıma ihtiyacınız varsa lütfen",
    intlClosedSuffix: "ile iletişime geçin.",
  },

  sections: {
    account: "Hesap bilgileri",
    unit: "Birlik bilgileri",
    attache: "SAVUNMA ATAŞESİ BİLGİLERİ",
  },

  fields: {
    email: "E-posta",
    password: "Şifre",
    passwordHint: "En az 8 karakter: büyük, küçük, rakam, özel",
    confirmPassword: "Şifreyi onaylayın",
    firstName: "Ad",
    lastName: "Soyad",
    rank: "Rütbe",
    gender: "Cinsiyet",
    unitType: "Birlik türü",
    branch: "Kuvvet",
    unitName: "Birlik adı",
    selectUnit: "Birlik seçin",
    country: "Başvuru ülkesi",
    specifyCountry: "Ülkeyi belirtin",
    specifyCountryHint: "Ülkeniz yukarıda listelenmemişse girin",
    specifyCountryPlaceholder: "Ülkenizi girin",
    nationality: "Uyruk",
    nationalityHint: "Uluslararası katılımcılar için gereklidir",
    nationalityPlaceholder: "örn. İngiliz, Türk, Ürdünlü",
    arm: "Sınıf",
    select: "Seçin",
    secondPoc: "2. POC e-postası",
    thirdPoc: "3. POC e-postası (isteğe bağlı)",
    additionalInfo: "Ek bilgi (isteğe bağlı)",
    coName: "CO adı",
    coEmail: "CO e-postası",
    coPhone: "CO telefonu",
  },

  // Labels only — the keys are the submitted values and must stay unchanged.
  options: {
    gender: { Male: "Erkek", Female: "Kadın", Other: "Diğer" },
    unitType: { Regular: "Muvazzaf", Reserve: "Yedek" },
    branch: { Army: "Kara Kuvvetleri", Navy: "Deniz Kuvvetleri", "Air Force": "Hava Kuvvetleri" },
    arm: {
      Combat: "Muharip",
      "Combat Support": "Muharebe Desteği",
      "Combat Service Support": "Muharebe Hizmet Desteği",
    },
  },

  consent: {
    prefix: "Şunu okudum ve kabul ediyorum:",
    link: "gizlilik politikası",
  },

  submit: "Sonraki aşama",
  submitting: "Gönderiliyor...",
  afterSubmit:
    "Kayıt olduktan sonra bir e-posta onayı alacaksınız. Oraya düşme ihtimaline karşı lütfen Spam/Önemsiz klasörünüzü kontrol edin.",

  errors: {
    csrf: "Güvenlik kontrolü başarısız oldu. Sayfayı yenileyip tekrar deneyin.",
  },
};
