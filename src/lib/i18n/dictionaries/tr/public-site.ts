import type { publicSite as enPublicSite } from "../en/public-site";

// Turkish translations for the shared public chrome: nav labels and login page.
export const publicSite: typeof enPublicSite = {
  nav: {
    home: "Ana Sayfa",
    eventsDetail: "Etkinlik Ayrıntıları",
    international: "Uluslararası Katılım",
    awards: "Ödüller",
    gallery: "Galeri",
    announcements: "Duyurular",
    keyDates: "Önemli Tarihler",
    login: "Giriş",
  },

  login: {
    hero: {
      eyebrow: "Katılımcı portalı",
      title: "Giriş yap",
      subtitle: "Devriye panelinize ve kayıt durumunuza erişin.",
    },
    intro: {
      eyebrow: "Güvenli erişim",
      title: "Katılımcı girişi",
      body: "Katılımcı paneline erişmek, ödeme durumunu izlemek ve hareketten önce önemli koordinasyon adımlarını gözden geçirmek için onaylı devriye kimlik bilgilerinizi kullanın.",
      checklist: [
        "Yalnızca onaylı devriye hesapları",
        "Ödeme ve kayıt durumu takibi",
        "Katılımcı işlemlerine ve güncellemelere doğrudan erişim",
      ],
    },
    card: {
      eyebrow: "Katılımcı erişimi",
      title: "Devam etmek için giriş yapın",
      description: "Takım hesabınız için onaylanan e-posta ve parolayı girin.",
      emailLabel: "E-posta adresi",
      passwordLabel: "Parola",
      rememberHintOn: "Bu cihazda oturum 30 güne kadar açık kalır.",
      rememberHintOff: "Beni Hatırla seçili değilse oturumunuz 24 saat sonra sona erer.",
      rememberMe: "Beni Hatırla",
      signingIn: "Giriş yapılıyor…",
      login: "Giriş",
      forgot: "Parolanızı mı Unuttunuz?",
      footerPrefix: "Henüz kayıt olmadıysanız lütfen",
      footerLink: "birliğinizi kaydetmek için buraya tıklayın",
    },
    validation: {
      invalidEmail: "Geçerli bir e-posta adresi girin.",
      passwordRequired: "Parola gereklidir.",
      emailPasswordRequired: "E-posta ve parola gereklidir.",
    },
    toasts: {
      registered:
        "Kayıt gönderildi. Giriş yapmadan önce doğrulama bağlantısı için gelen kutunuzu kontrol edin.",
      passwordReset: "Parola güncellendi. Lütfen yeni parolanızla giriş yapın.",
      verified: "E-posta doğrulandı. Artık giriş yapabilirsiniz.",
    },
  },
};
