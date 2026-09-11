import type { core as enCore } from "../en/core";

// Turkish translations for the portal's core surfaces.
export const core: typeof enCore = {
  common: {
    back: "Geri",
    next: "İleri",
    backToDashboard: "Panele dön",
    language: "Dil",
    selectLanguage: "Dil seçin",
    loadingTitle: "Katılımcı paneli",
    loadingDesc: "Katılımcı işlemleri ve durum panelleri yükleniyor.",
    toasts: {
      genericError: "Bir sorun oluştu. Lütfen tekrar deneyin.",
      saveSuccess: "Değişiklikler başarıyla kaydedildi",
      validationError: "Lütfen formdaki hataları kontrol edin.",
    },
  },

  meta: {
    tour: "Site Turu",
    home: "Ana sayfa",
    announcements: "Duyurular",
    awards: "Ödüller ve Takdir",
    login: "Giriş",
    register: "Kayıt",
    exerciseContour: "Exercise Contour",
    gallery: "Galeri",
    international: "Uluslararası Katılım",
    keyDates: "Önemli Tarihler",
    privacy: "Gizlilik Politikası",
    dashboard: "Panel",
    unitInfo: "Birlik bilgilerini güncelle",
    hostInfo: "Ev Sahibi Bilgileri",
    journey: "Kayıt Süreci",
    support: "Talepler / SSS",
    supportTicket: "Destek talebi",
    confirmParticipation: "Katılımı Onayla",
  },

  nav: {
    ariaLabel: "Katılımcı portalı",
    portalName: "PATS Portalı",
    participant: "Katılımcı",
    menu: "Menü",
    done: "Tamamlandı",
    logout: "Çıkış yap",
    dashboard: "Panel",
    tour: "Sanal Tur",
    support: "Talep / SSS",
    journeyComplete: "Kayıt tamamlandı",
  },

  dashboard: {
    welcomeBack: "Tekrar hoş geldiniz",
    unitNotRegistered: "Birlik kaydı yapılmadı",
    allStagesComplete: "Tüm aşamalar tamamlandı",
    membersCount: (n) => `${n} takım üyesi`,
    scheduleEyebrow: "Program",
    dataEntryPeriods: "Veri giriş dönemleri",
    dataEntryDesc: "Kayıt verilerinizi göndermeniz için planlanan dönemler.",
    noPeriods: "Henüz planlanmış dönem yok.",
    deadlinesEyebrow: "Son tarihler",
    timeline: "Zaman çizelgesi",
    updatesEyebrow: "Güncellemeler",
    latestNews: "Son güncellemeler",
    noNews: "Henüz güncelleme yok.",
    timelinePanel: {
      closed: "Kapandı",
      dueToday: "Son gün bugün",
      daysLeft: (n) => `${n} gün kaldı`,
      deadlines: "Son tarihler",
      noDeadlines: "Henüz son tarih belirlenmedi.",
      keyDates: "Önemli tarihler",
      noKeyDates: "Henüz önemli tarih yayımlanmadı.",
      deadlineLabels: {
        registration: "Kayıt son tarihi",
      },
    },
  },

  workflowPanel: {
    registrationProgress: "Kayıt ilerlemesi",
    ariaLabel: "Kayıt iş akışı",
    progressAria: "İş akışı ilerlemesi",
    countComplete: (done, total) => `${total} adımdan ${done} tanesi tamamlandı`,
  },

  statusBar: {
    inProgressTitle: "Kayıt devam ediyor",
    inProgressText:
      "Aşağıdaki adımları tamamlayın. PATS, tüm adımlar tamamlandığında kaydınızı onaylar.",
    underReviewTitle: "Kayıt tamamlandı",
    underReviewText:
      "Kaydınız tamamlandı — tüm adımlar gönderildi. PATS kaydınızı doğrulayacak ve onaylandığında size bir onay e-postası gönderilecek.",
    confirmedTitle: "Onaylandı — PATS 2026 için hazırsınız",
    confirmedTextWithDates: (dates) =>
      `Kaydınız PATS tarafından onaylandı ve yeriniz kesinleşti. Program: ${dates}.`,
    confirmedText: "Kaydınız PATS tarafından onaylandı ve yeriniz kesinleşti.",
    returnedTitle: "Düzeltme için iade edildi",
    approvedOn: (date) => `${date} tarihinde onaylandı`,
    continueRegistration: "Kayda devam et",
  },

  registration: {
    statuses: {
      PENDING: "Beklemede",
      UNDER_REVIEW: "İncelemede",
      APPROVED: "Onaylandı",
      REJECTED: "Reddedildi",
      RETURNED: "Düzeltme için iade edildi",
    },
    profileEyebrow: "Profil",
    title: "Kayıt bilgileri",
    name: "Ad",
    unit: "Birlik",
    email: "E-posta",
    rank: "Rütbe",
    dateRegistered: "Kayıt tarihi",
    countryOfApplication: "Başvuru ülkesi",
    nationality: "Uyruk",
    branchFormation: "Sınıf / teşkil",
  },

  journey: {
    suspended:
      "Hesabınız askıya alındı. Yardım için PATS yönetimiyle iletişime geçin.",
    headers: {
      confirmation: {
        eyebrow: "",
        title: "Katılımı Onayla",
        subtitle: "Takımınızın PATS 2026'ya katılım uygunluğunu onaylayın.",
      },
      unitInfo: {
        eyebrow: "Kayıt",
        title: "Birlik Bilgileri",
        subtitle:
          "Birlik ve Birlik Komutanı bilgilerinizi girin. Kaydetmek takım kaydını açar.",
      },
      verification: {
        eyebrow: "",
        title: "Kayıt Onayı",
        subtitle:
          "PATS, tüm adımlar tamamlandığında kaydınızı onaylar.",
      },
      roster: {
        eyebrow: "Takım kaydı",
        title: "Takım Üyeleri",
        subtitle:
          "Takım üyelerinizi aşağıya ekleyin. Kaydettikten sonra, uçuş bilgilerinin kilidini açmak için listeyi tamamlanmış olarak işaretleyin.",
      },
      flights: {
        eyebrow: "",
        title: "Uçuş Bilgileri",
        subtitle:
          "Takımınızın seyahat bilgilerini ve pasaport / bilet belgelerini tek bir gönderimde iletin.",
      },
      hostInfo: {
        eyebrow: "",
        title: "Ev Sahibi Bilgileri",
        subtitle: "Takımınız için organizatörler tarafından yayımlanan ev sahibi bilgileri.",
      },
    },
    banners: {
      participationConfirmed: "Katılım onaylandı.",
      confirmedOnSub: (date, unitName) =>
        `${date} tarihinde${unitName ? ` ${unitName} için` : ""} onaylandı. Bu adım yalnızca görüntülenebilir.`,
      verifiedBySd: "Kayıt, PATS tarafından doğrulandı.",
      verifiedBySdSub:
        "Kayıt bilgileriniz aşağıda yalnızca görüntülenebilir. Bir sonraki adıma geçin.",
      registrationVerification: "Kayıt doğrulaması",
      messageFromSd: "PATS'den mesaj:",
      unitInfoSaved: "Birlik bilgileri kaydedildi.",
      unitInfoSavedSub: (date) =>
        `${date} tarihinde kaydedildi. Kaydınız onaylanana kadar güncelleyebilirsiniz.`,
      flightsComplete: "Seyahat belgeleri tamam.",
      flightsCompleteSub:
        "Her yolcunun pasaportu ve bileti yüklendi. Sonraki adımda kaydınızın tamamını gözden geçirip onaya gönderin.",
      continueToApproval: "Kayıt Onayına geç",
      awaitingApproval: "PATS onayı bekleniyor",
      awaitingApprovalSub:
        "Tüm adımlar tamamlandı. PATS kaydınızı inceleyip onaylayacak.",
      teamRegistered: "Takım kaydedildi.",
      teamRegisteredSub: (date) =>
        `${date} tarihinde kaydedildi. Üye listenizi aşağıya doldurun.`,
      rosterCompleted: "Liste tamamlandı.",
      rosterCompletedSub: (count, date) =>
        `${date} tarihinde ${count} üye onaylandı. Yönetim tarafından yeniden açılmadıkça liste yalnızca görüntülenebilir.`,
      hostInfoTitle: "Ev Sahibi Bilgileri",
      hostInfoAvailable:
        "Takımınızın ev sahibi bilgileri organizatörler tarafından yayımlandı.",
      hostInfoLocked:
        "Ev sahibi bilgileri, uçuş bilgileriniz kesinleştikten ve organizatörler yayımladıktan sonra burada görünür.",
      openHostInfo: "Ev Sahibi Bilgilerini Aç",
    },
    wizard: {
      stepsAria: "Kayıt adımları",
      lockedTitle: "Kilitli — önce önceki adımları tamamlayın",
      stepXofY: (current, total, activeLabel) =>
        `Adım ${current} / ${total}${activeLabel ? ` — ${activeLabel}` : ""}`,
      nextLockedTitle: "Sonraki adımın kilidini açmak için bu adımı tamamlayın",
      finalStep: "Son adım",
      finalStepTitle: "Bu son adımdır",
    },
  },

  approval: {
    eyebrow: "Son adım",
    title: "Kaydınızı gözden geçirin",
    desc:
      "PATS'a göndermeden önce tüm bilgileri okuyun. Hatalı bir şey varsa düzenle bağlantılarıyla düzeltin — PATS kaydı gönderdiğiniz hâliyle inceler.",
    edit: "Düzenle",
    editAria: (section: string) => `${section} bölümünü düzenle`,
    sections: {
      participant: "Katılımcı bilgileri",
      unit: "Birlik bilgileri",
      co: "Komutan / 2. Komutan bilgileri",
      roster: "Takım üyeleri",
      flights: "Uçuş bilgileri",
    },
    serviceArm: "Hizmet / sınıf",
    onFile: "Yüklendi",
    missing: "Eksik",
    noRoster: "Henüz takım üyesi eklenmedi.",
    noFlights: "Henüz uçuş kaydı girilmedi.",
    submit: {
      title: "Onaya gönder",
      desc: "Tüm adımlar tamamlandı. Kaydınızı PATS onayına gönderin.",
      incomplete:
        "Kaydınızı onaya göndermeden önce yukarıdaki tüm adımları tamamlayın.",
      action: "Onaya gönder",
      submittedTitle: "Onaya gönderildi",
      submittedSub: (date: string) =>
        `${date} tarihinde PATS'a gönderildi. Karar verilmediği sürece geri çekebilirsiniz.`,
      withdraw: "Gönderimi geri çek",
      submittedToast: "Kayıt onaya gönderildi",
      withdrawnToast: "Gönderim geri çekildi — düzenleyip yeniden gönderebilirsiniz",
      approvedTitle: "PATS tarafından onaylandı",
      approvedSub: "Kaydınız onaylandı. Aşağıdaki bilgiler salt okunurdur.",
    },
  },

  confirm: {
    dateLocale: "tr-TR",
    actionRequired: "İşlem gerekli",
    title: "Katılımınızı onaylayın",
    description:
      "Katılımcı Paneline girmeden önce, lütfen takımınızın tatbikata katılıp katılamayacağını onaylayın. Onaylamak, sonraki kayıt aşamalarına erişim sağlar. Reddetmek sizi oturumdan çıkarır — aşağıdaki son tarihe kadar istediğiniz zaman tekrar giriş yapıp onaylayabilirsiniz.",
    previouslyDeclined:
      "Kaydı daha önce reddettiniz. Son tarih dolmadan önce hâlâ onaylayabilirsiniz.",
    confirmationDeadline: "Onay son tarihi",
    deadlineExpired:
      "Onay son tarihi geçti. Onaylama artık mümkün değil. Lütfen yardım için organizatörlerle iletişime geçin.",
    days: "Gün",
    hours: "Saat",
    min: "Dk",
    sec: "Sn",
    remaining: "kaldı",
    timeRemainingAria: "Onaylamak için kalan süre",
    toBeAnnounced: "Organizatörler tarafından duyurulacak.",
    rejectConfirmTitle: "Müsait olmadığınızdan emin misiniz?",
    rejectPrompt:
      "Takımınızı müsait değil olarak işaretlemek bu kararı kaydınıza işler ve oturumunuzu kapatır. Hiçbir şey kaybolmaz — yukarıdaki son tarihe kadar tekrar giriş yapıp onaylayabilirsiniz.",
    yesReject: "Evet, müsait değiliz",
    goBack: "Hayır, geri dön",
    confirm: "Müsait",
    reject: "Müsait Değil",
    signOut: "Çıkış yap",
    confirmTitleAttr: "Kaydınızı onaylayın",
    deadlinePassedAttr: "Onay son tarihi geçti",
    footer:
      "Kararınız, organizasyon personeli için zaman damgasıyla kaydedilir. Yardıma mı ihtiyacınız var? Giriş sayfasından destekle iletişime geçin.",
    toastConfirmed: "Kayıt onaylandı — aramıza hoş geldiniz!",
    toastRejected: "Kayıt reddedildi. Oturumunuz kapatılıyor…",
  },

  hostInfo: {
    title: "Ev Sahibi Bilgileri",
    subtitleLocked: "Organizatörlerden kesinleşmiş ev sahibi ve varış bilgileri.",
    subtitle: "Kesinleşmiş ev sahibi, takım ve varış bilgileri — yalnızca görüntülenebilir.",
    notAvailableTitle: "Henüz mevcut değil",
    notAvailableText:
      "Ev Sahibi Bilgileri bölümü, uçuş bilgileriniz yönetim tarafından incelenip kesinleştirildikten ve organizatörler ev sahibi bilgilerini yayımladıktan sonra görünür hale gelir.",
    participatingCountries: "Katılımcı ülkeler",
    registeredTeams: "Kayıtlı takımlar",
    yourFinalizedTravelers: "Kesinleşmiş yolcularınız",
    hostingArrivalInfo: "Ev sahipliği ve varış bilgileri",
    countryWiseTeamNumbers: "Ülkelere göre takım sayıları",
    sNo: "S.No",
    country: "Ülke",
    teams: "Takımlar",
    noRegisteredTeams: "Henüz kayıtlı takım yok.",
    unspecified: "Belirtilmemiş",
    yourTeamWithUnit: (unit) => `Takımınız — ${unit}`,
    yourTeam: "Takımınız",
    serialNumber: "Sicil Numarası",
    rank: "Rütbe",
    fullName: "Ad Soyad",
    gender: "Cinsiyet",
    finalizedFlightInfo: "Kesinleşmiş uçuş bilgileri",
    traveler: "Yolcu",
    passengerName: "Yolcu Adı",
    passportNo: "Pasaport No.",
    documents: "Belgeler",
    noFlightRecords: "Uçuş kaydı yok.",
    passport: "Pasaport",
    ticket: "Gidiş bileti",
    returnTicket: "Dönüş bileti",
    readOnlyNote:
      "Bu bilgiler yalnızca görüntülenebilir. Herhangi bir düzeltme için organizatörlerle iletişime geçin.",
  },
};
