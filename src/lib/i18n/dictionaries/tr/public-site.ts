import type { publicSite as enPublicSite } from "../en/public-site";

// Turkish translations for the shared public chrome: nav labels and login page.
export const publicSite: typeof enPublicSite = {
  loading: {
    title: "Genel sayfa",
    description: "Sayfa içeriği ve genel gezinme yükleniyor.",
  },

  nav: {
    home: "Ana Sayfa",
    eventsDetail: "Etkinlik Ayrıntıları",
    operations: "Operasyonlar",
    exerciseContour: "Tatbikat Konturu",
    international: "Uluslararası Katılım",
    awards: "Ödüller",
    gallery: "Galeri",
    announcements: "Duyurular",
    documents: "Belgeler",
    keyDates: "Önemli Tarihler",
    login: "Giriş",
  },

  gallery: {
    eyebrow: "Saha arşivi",
    title: "Yarışma Galerisi",
    subtitle:
      "Uluslararası PATS dönemlerinin belgesel arşivi — delegasyonlar, törenler ve operasyonel miras.",
    allArchives: "Tüm arşiv",
    photos: (count: number) => `${count} Fotoğraf`,
    metaPhotosLabel: "Fotoğraflar",
    metaYearsLabel: "Kapsanan yıllar",
    empty: "Galeri güncelleniyor. Lütfen daha sonra tekrar bakın.",
    close: "Kapat",
    previous: "Önceki",
    next: "Sonraki",
  },

  announcements: {
    eyebrow: "Bildirimler",
    title: "Duyurular",
    subtitle:
      "PATS yarışmasına ilişkin resmî bildirimler, güncellemeler ve koordinasyon bültenleri.",
    latest: "En son",
    countLabel: (count: number) => `${count} duyuru yayınlandı`,
    readMore: "Devamını oku",
    empty: "Henüz duyuru yok — lütfen daha sonra tekrar bakın.",
    downloadPdf: "PDF indir",
    backToList: "Duyurulara dön",
  },

  chrome: {
    siteNav: "Site",
    mainNav: "Ana gezinme",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    brandHome: "PATS ana sayfa",
    selectLanguage: "Dil seçin",
  },

  breadcrumb: {
    home: "Ana Sayfa",
    label: "Sayfa yolu",
  },

  footer: {
    isprWebsite: "ISPR Web Sitesi",
    registerNow: "Şimdi kaydolun",
    contactUs: "Bize ulaşın",
    disclaimer:
      "Yalnızca yetkili kullanım içindir. PATS Yarışması katılımı için resmî portal.",
  },

  pages: {
    awards: {
      heroEyebrow: "Onur kaydı",
      heroTitle: "Ödüller ve takdir",
      heroSubtitle:
        "Takımlar tüm taktik etkinliklerde değerlendirilir. Genel yüzde, madalya seviyesini ve katılım sertifikasını belirler.",
      metaGold: "Altın",
      metaSilver: "Gümüş",
      metaBronze: "Bronz",
      showcaseLabel: "Onur kaydı",
      showcaseTitle: "Ödüller ve onurlar",
      showcaseSubtitle:
        "Takımlar tüm taktik etkinliklerde değerlendirilir. Genel yüzde, madalya seviyesini ve katılım sertifikasını belirler.",
      tierGold: "Altın seviye",
      tierSilver: "Gümüş seviye",
      tierBronze: "Bronz seviye",
      tierParticipation: "Katılım",
      nameGold: "Altın Madalya",
      nameSilver: "Gümüş Madalya",
      nameBronze: "Bronz Madalya",
      nameCertificate: "Sertifika",
      rangeGold: "%75 ve üzeri",
      rangeSilver: "%65 ile %74,99 arası",
      rangeBronze: "%55 ile %64,99 arası",
      rangeCertificate: "%55'in altında",
      standingsTitle: "Güncel sıralama",
      standingsSubtitle:
        "Ülkeler, genel yüzdelerinin hak kazandığı madalya kategorisine göre gruplandırılmıştır.",
      standingsBadge: "Canlı veri",
      colMedal: "Madalya kategorisi",
      colMinimum: "Gereken asgari yüzde",
      colCountries: "Hak kazanan ülkeler",
      noTeams: "Bu aralıkta takım yok",
      standingsFootnote:
        "Komuta incelemesi için örnek sıralama. Nihai sonuçlar tatbikat sonrası onaylanır.",
      teamEyebrow: "Takım",
      teamTitle: "Takım yapısı",
      teamDescription: "Yarışma takımları için resmi devriye yapısı.",
      teamRoles: [
        { role: "Takım Lideri", qty: "1 × Yüzbaşı / Teğmen" },
        { role: "Takım İkinci Komutanı", qty: "1 × Çavuş / Eşdeğeri" },
        { role: "Takım Astsubayı", qty: "1 × Onbaşı / Eşdeğeri" },
        { role: "Hafif Makineli Tüfek No.1", qty: "1 × Er / Eşdeğeri" },
        { role: "Hafif Makineli Tüfek No.2", qty: "1 × Er / Eşdeğeri" },
        { role: "Muhabere Operatörü", qty: "1 × Er / Eşdeğeri" },
        { role: "Keskin Nişancı", qty: "2 × Er / Eşdeğeri" },
        {
          role: "Yedek",
          qty: "1 × Yüzbaşı/Teğmen + 1 × Çavuş/Er",
        },
        { role: "Takım Menajeri", qty: "1 × Binbaşı" },
      ],
    },
    international: {
      heroEyebrow: "Küresel ortaklıklar",
      heroTitle: "Uluslararası katılım",
      heroSubtitle:
        "PATS, birden fazla harekât alanındaki ortak ülkelerden devriye takımlarını bir araya getirir.",
      metaSince: "Başlangıç",
      metaSinceValue: "2016",
      metaEditions: "Dönemler",
      metaEditionsValue: "8 uluslararası",
      metaReach: "Erişim",
      metaReachValue: "Çok alanlı",
      mapEyebrow: "Harekât haritası",
      mapTitle: "Kayıtlı uluslar",
      mapDescription:
        "Yarışmaya takım kaydı yaptıran ülkeler. Takımlarını ve kayıt yıllarını görmek için vurgulanan bir ülkenin üzerine gelin.",
      historyEyebrow: "Tarihçe",
      historyTitle: "Dönem zaman çizelgesi",
      historyDescription:
        "Yarışmanın ardışık dönemlerindeki uluslararası katılım.",
      orientationEyebrow: "Oryantasyon",
      orientationTitle: "Tanıtım eğitimi",
      orientationDescription:
        "Uluslararası takımlar için harekât öncesi tanıtım eğitimi.",
      orientationModules: [
        "Atış / sıfırlama (yarışma silahları)",
        "Seyrüsefer / harita okuma",
        "Muhabere teçhizatı",
        "KBRN (CBRN)",
        "AFOS / ATGP",
        "Arazi oryantasyonu",
      ],
      historyNarrative: [
        "PATS, 2005 yılında dayanıklılık ve fiziksel kondisyonu öne çıkaran bir seyrüsefer tatbikatı olarak başladı.",
        "Terörle mücadele harekâtlarından çıkarılan dersler, gerçekçi etkinlikler ve muharebe senaryoları olarak tatbikata dâhil edildi — konvansiyonel ve konvansiyonel olmayan ortamlarda sub-taktik harekâtlar.",
        "Dost ülkelerin artan ilgisi, zengin tecrübelerin paylaşıldığı ve karşılıklı öğrenmenin sağlandığı Uluslararası PATS'ın (2016) doğmasına yol açtı.",
      ],
      mapAria: "Kayıtlı ulusların dünya haritası",
      mapCaption: (count: number) =>
        `${count} ulus temsil ediliyor — takımlarını görmek için vurgulanan bir ülkenin üzerine gelin.`,
      mapEmpty: "Takımlar kaydoldukça kayıtlı uluslar burada görünecek.",
      // Turkish does not mark plurality on a noun following a numeral.
      mapCountryAria: (country: string, count: number) =>
        `${country}: ${count} kayıtlı takım`,
      tooltipMore: (count: number) => `+${count} daha`,
    },
    keyDates: {
      heroEyebrow: "Takvim",
      heroTitle: "Önemli tarihler",
      heroSubtitle:
        "PATS Yarışma döngüsü için önemli tarihler. Aksi belirtilmedikçe tüm saatler Pakistan Standart Saati'dir (PKT).",
      sectionEyebrow: "Zaman çizelgesi",
      sectionTitle: "Yarışma programı",
      sectionDescription:
        "Kayıt, tatbikat ve idari kilometre taşları için resmi zaman çizelgesi.",
      empty: "Yapılandırılmış önemli tarih yok.",
    },
    privacy: {
      heroEyebrow: "Yasal",
      heroTitle: "Gizlilik politikası",
      body1: (siteName: string) =>
        `${siteName}, kişisel bilgilerinizi korumaya kararlıdır. Bu politika, bu kayıt portalı aracılığıyla gönderilen verileri nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.`,
      body2: (siteName: string, org: string) =>
        `Bu web sitesine kaydolarak, biriminizle iletişim ve ${org} ile koordinasyon dahil olmak üzere ${siteName} katılımının yönetilmesi amacıyla verilerinizin işlenmesine onay vermiş olursunuz.`,
      body3Prefix: "Politikanın tüm ayrıntıları veya veri haklarınızı kullanmak için iletişime geçin: ",
      externalLink: "Harici gizlilik politikasını görüntüle",
    },
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

  forgotPassword: {
    hero: {
      eyebrow: "Hesap kurtarma",
      title: "Parolayı sıfırla",
      subtitle:
        "Kayıtlı e-postanızı girin, size güvenli bir sıfırlama bağlantısı gönderelim.",
    },
    intro: {
      eyebrow: "Kurtarma erişimi",
      title: "Parola kurtarma",
      body: "Onaylı bir katılımcı hesabı için güvenli bir sıfırlama bağlantısı isteyin. Takım girişinize bağlı olan aynı kayıtlı e-posta adresini kullanın.",
      checklist: [
        "Kayıtlı katılımcı e-postası gereklidir",
        "Sınırlı geçerlilikte güvenli sıfırlama bağlantısı",
        "Parola güncellemesinden sonra girişe dönüş",
      ],
    },
    card: {
      eyebrow: "Sıfırlama isteği",
      title: "Sıfırlama bağlantısı gönder",
      description:
        "Katılımcı e-postanızı girin; hesap mevcutsa güvenli bir sıfırlama bağlantısı göndereceğiz.",
      emailLabel: "E-posta adresi",
      send: "Sıfırlama bağlantısı gönder",
      sending: "Gönderiliyor...",
      success:
        "Sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.",
      back: "Girişe dön",
    },
    validation: {
      invalidEmail: "Geçerli bir e-posta adresi girin.",
      csrf: "Güvenlik kontrolü başarısız. Sayfayı yenileyip tekrar deneyin.",
      generic: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
    },
  },

  resetPassword: {
    hero: {
      eyebrow: "Hesap kurtarma",
      title: "Yeni parola belirle",
      subtitle: "Katılımcı hesabınız için güçlü bir parola seçin.",
    },
    intro: {
      eyebrow: "Kurtarma erişimi",
      title: "Yeni bir parola belirleyin",
      body: "Portal güvenlik politikasına uygun güçlü bir parola kullanın.",
      checklist: [
        "Sıfırlama bağlantıları 30 dakika sonra sona erer",
        "Parolalar saklanmadan önce bcrypt ile karma haline getirilir",
        "Sıfırlama bağlantıları kullanıldıktan hemen sonra geçersiz olur",
      ],
    },
    card: {
      eyebrow: "Parola sıfırlama",
      title: "Yeni bir parola oluşturun",
      policy:
        "En az 8 karakter; büyük harf, küçük harf, bir rakam ve bir özel karakter içermelidir.",
    },
    validating: "Sıfırlama bağlantısı doğrulanıyor...",
    newPasswordLabel: "Yeni parola",
    confirmPasswordLabel: "Parolayı onayla",
    strengthLabel: "Parola gücü",
    strength: {
      weak: "Zayıf",
      good: "İyi",
      strong: "Güçlü",
    },
    checks: {
      length: "En az 8 karakter",
      uppercase: "Büyük harf",
      lowercase: "Küçük harf",
      number: "Rakam",
      special: "Özel karakter",
    },
    passwordsMustMatch: "Parolalar eşleşmelidir",
    passwordsDoNotMatch: "Parolalar eşleşmiyor.",
    policyError: "Parolanız güvenlik gereksinimlerini karşılamıyor.",
    tokenMissing: "Sıfırlama belirteci eksik.",
    invalidFallback: "Bu parola sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
    validateFailed: "Bu sıfırlama bağlantısı şu anda doğrulanamıyor.",
    update: "Parolayı güncelle",
    updating: "Güncelleniyor...",
    requestNewLink: "Yeni bir bağlantı iste",
    back: "Girişe dön",
    csrf: "Güvenlik kontrolü başarısız. Sayfayı yenileyip tekrar deneyin.",
    generic: "Bir şeyler ters gitti. Lütfen tekrar deneyin.",
    unableReset: "Parola sıfırlanamadı.",
    toastUpdated: "Parola güncellendi. Lütfen giriş yapın.",
  },

  verifyEmail: {
    hero: {
      eyebrow: "Hesap güvenliği",
      title: "E-postayı doğrula",
      subtitle: "Portal erişimini etkinleştirmek için e-postanızı onaylayın.",
    },
    eyebrowComplete: "Doğrulama tamamlandı",
    eyebrowRequired: "Doğrulama gerekli",
    invalidTitle: "Doğrulama bağlantısı geçersiz",
    invalidBody:
      "Bu e-posta doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeni bir kayıt isteyin veya sorun devam ederse destekle iletişime geçin.",
    invalidAlert: "Doğrulama belirteci artık geçerli değil.",
    registerAgain: "Yeniden kayıt ol",
    successTitle: "E-posta doğrulandı",
    successBody: (name: string) =>
      `Hesabınız artık etkin${name ? `, ${name}` : ""}. Girişe devam edip iş akışınızın geri kalanını tamamlayabilirsiniz.`,
    successAlert: "E-posta doğrulama başarılı oldu.",
    goToLogin: "Girişe git",
    back: "Girişe dön",
  },

  news: {
    eyebrow: "Haberler",
    downloadPdf: "PDF indir",
  },
};
