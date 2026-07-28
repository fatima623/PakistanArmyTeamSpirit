// Turkish — mirrors `en/marketing.ts` exactly (shape enforced via `typeof en`).
// See the English file for what belongs here and what is handled by
// `@/lib/i18n/pats-content-i18n`.

import type { marketing as enMarketing } from "../en/marketing";

export const marketing: typeof enMarketing = {
  operations: {
    meta: {
      title: "Harekât",
      description:
        "PATS yarışmasına ait taktik uygulamalar, kontrol noktaları ve puanlama.",
    },

    hero: {
      eyebrow: "Görev seçimi",
      title: "Harekât",
      subtitle:
        "Bir taktik uygulama seçin. Her görev emri; hedefleri, puanlama matrisini ve harekât safhası eşleşmesini içerir.",
      metaEvents: "Uygulama",
      metaTotalMarks: "Toplam puan",
      metaDuration: "Süre",
      metaDurationValue: "60 saat",
    },

    overview: {
      eyebrow: "Görev",
      title: "Harekât genel değerlendirmesi",
    },

    // Turkish does not inflect the noun after a numeral, so the count is not
    // used for plural selection — deliberate, not an oversight.
    scoredSummary: (events: number, marks: string): string =>
      `${events} puanlanan uygulama · tatbikat genelinde toplam ${marks} puan`,

    route: {
      eyebrow: "Güzergâh",
      title: "Uygulamaların yerleşimi",
      description:
        "Toplanma bölgesinden sızma, CTR ve tahliyeye kadar kontrol noktası sıralaması.",
    },

    map: {
      routeTitle: "Tatbikat güzergâhı — canlı sıralama",
      glossaryTitle: "Harekât göstergesi — terminoloji",
      entry: "GİR",
      exit: "ÇIK",
    },

    phases: {
      preparation: "Hazırlık",
      infiltration: "Sızma",
      hideout: "Saklanma yeri",
      ctr: "Yakın hedef keşfi",
      exfiltration: "Tahliye",
      terminal: "Bitiş safhası",
    },

    phaseSummary: (count: number): string =>
      `Bu safhada ${count} değerlendirilen uygulama bulunmaktadır.`,

    phaseCarouselAria: (phase: string): string => `${phase} yarışma uygulamaları`,

    rules: {
      eyebrow: "Kurallar",
      title: "Koordinasyon esasları",
      description:
        "Harekât talimatları ve cezalar — uyulmaması diskalifiye ile sonuçlanabilir.",
    },

    card: {
      missionBrief: "Görev emri",
    },

    difficulty: {
      foundational: "Temel",
      intermediate: "Orta",
      advanced: "İleri",
      elite: "Seçkin",
    },

    category: {
      inspection: "Denetleme",
      communications: "Muhabere",
      navigation: "Arazide yön bulma",
      reconnaissance: "Keşif",
      medical: "Sıhhiye",
      fires: "Ateş desteği",
      assault: "Taarruz",
      survival: "Hayatta kalma",
      admin: "İdare",
    },

    brief: {
      back: "← Görev seçimi",
      classified: "Gizli harekât emri",
      totalMarks: "Toplam puan",
      phase: "Safha",
      category: "Kategori",
      difficulty: "Zorluk",
      checkpoint: "Kontrol noktası",
      objective: "Görev maksadı",
      objectives: "Harekât hedefleri",
      scoring: "Puanlama matrisi",
      marksUnit: "p.",
      criticalNotice: "Kritik uyarı",
      skills: "Taktik beceriler",
      relatedArchive: "İlgili arşiv",
      allMissions: "Tüm görevler",
      fallbackTitle: "Harekât",
    },
  },

  documents: {
    meta: {
      title: "Dokümanlar",
      description:
        "Resmî PATS yarışma kaynağı — bilgi kitapçığıyla uyumlu etkileşimli özetler.",
    },

    hero: {
      eyebrow: "Kaynak kütüphanesi",
      title: "Doküman merkezi",
      subtitle:
        "Resmî PATS yarışma kaynağı — bilgi kitapçığıyla uyumlu etkileşimli özetlere göz atın.",
      metaSource: "Kaynak",
      metaSourceValue: "Resmî kitapçık",
      metaAccess: "Erişim",
      metaAccessValue: "Dijital özetler",
    },

    library: {
      eyebrow: "Kaynak",
      title: "Yarışma kütüphanesi",
      description:
        "Her başlık, bu sitedeki ilgili bölüme bağlanır. Kitapçığın tam taramaları yayımlanmaz — aşağıdaki yapılandırılmış özetleri kullanın.",
    },

    downloadResults: "Sonuç PDF'ini indir",
    interactiveOperations: "Etkileşimli harekât →",
    bookletPage: (page: number): string => `Kitapçık s.${page}`,
    openBrief: "Özeti aç →",

    sections: {
      overview: "Genel bakış — PATS",
      history: "Tarihçe — uluslararası takımlar",
      concept: "PATS konsepti",
      layout: "Uygulamaların yerleşimi",
      conduct: "Uygulamaların icrası (bölüm 1)",
      teamComposition: "Takım teşkili",
      scoresAwards: "Puanlar ve ödüller",
      weaponEquipment: "Silah ve teçhizat",
      coordinatingPoints: "Koordinasyon esasları",
    },
  },

  // English pending translation review — the familiarization brief carries
  // military terminology that needs a subject-matter check per locale.
  familiarization: {
    meta: {
      title: "PATS Tanıtımı",
      description:
        "Katılımcı birlikler için varış öncesi brifing — PATS konsepti, arazi ve güzergâh, takım teşkilatı, silah ve teçhizat kadrosu ve koordinasyon esasları.",
    },

    hero: {
      eyebrow: "Varış öncesi brifing",
      title: "PATS Tanıtımı",
      subtitle:
        "Katılımcı bir birliğin varıştan önce ihtiyaç duyduğu her şey — tatbikatın konsepti, arazi ve güzergâh, takım teşkilatı, silah ve teçhizat kadrosu ve uygulamayı düzenleyen koordinasyon esasları.",
      metaDuration: "Tatbikat",
      metaDurationValue: "60 saat",
      metaDistance: "İntikal",
      metaDistanceValue: "50–60 km",
      metaTeam: "Devriye",
      metaTeamValue: "8 personel",
    },

    anchorsAria: "Bu sayfadaki bölümler",
    anchors: {
      concept: "Konsept",
      terrain: "Arazi",
      route: "Güzergâh",
      team: "Takım",
      equipment: "Teçhizat",
      training: "Eğitim",
      coordination: "Koordinasyon",
      "dos-donts": "Yapılacaklar ve yasaklar",
      facilitation: "Destek",
    },

    concept: {
      eyebrow: "Konsept",
      title: "PATS Konsepti",
      description:
        "Konvansiyonel olmayan bir senaryo altında yürütülen, görev ve vazife odaklı bir devriye yarışması; kesintisiz 60 saatlik bir tatbikat boyunca taktik uzmanlığı, dayanıklılığı ve askerî nitelikleri değerlendirir.",
      imageAlt:
        "PATS konsept şeması: toplanma bölgesi, teröristlerin hâkim olduğu bölgeden saklanma yerine ve hedefe uzanan sızma güzergâhı, geri çekilme etabı ve bitiş sürat yürüyüşü ile her kontrol noktasında icra edilen görevler.",
      imageCaption:
        "PATS Konsepti — Ana Planlama Konferansı'nda yayımlanan brifing şeması.",
    },

    terrain: {
      eyebrow: "Arazi",
      title: "Arazi yapısı",
      description:
        "Devriyenin kat ettiği arazi ve beklenen koşullar — kıyafet, ayakkabı ve soğuk hava düzenine karar vermeden önce okuyun.",
      groundTitle: "Zemin",
      demandTitle: "Devriyeden beklenenler",
    },

    route: {
      eyebrow: "Güzergâh",
      title: "Tatbikatın düzeni",
      description:
        "Devriye; toplanma bölgesinden sızma, saklanma yeri, yakın hedef keşfi ve geri çekilme aşamalarıyla bitiş bölgesine intikal eder.",
      distanceLabel: "Mesafe",
      totalLabel: "Toplam intikal",
      totalValue: "50–60 km",
    },

    team: {
      eyebrow: "Teşkilat",
      title: "Takım teşkilatı",
      description:
        "Her ülke bir devriye çıkarır — sekiz kişilik bir keşif takımı ile bir yedek çift ve bir takım sorumlusu.",
      roleHeading: "Görev",
      strengthHeading: "Mevcut",
      noteLabel: "Not",
    },

    equipment: {
      eyebrow: "Kadro",
      title: "Silah ve teçhizat",
      description:
        "Her personelin taşıdığı ve takım başına verilen tam kadro. Miktarlar verildiği gibidir; yolda hiçbir parça bırakılamaz ve tatbikat sırasında rastgele ağırlık kontrolleri yapılır.",
      itemHeading: "Malzeme",
      indlHeading: "Personel başına",
      teamHeading: "Takım başına",
      notApplicable: "Uygulanmaz",
      groups: {
        personal: "Kıyafet, silah ve şahsi teçhizat",
        stores: "Seyrüsefer, teknik ve özel malzeme",
      },
      note: "Takımın toplam yükü, dolu matara, mühimmat ve verilen takip cihazı dâhil 200 kg'dır. Kalan teçhizat, yayımlanan talimatlara göredir.",
    },

    training: {
      eyebrow: "Oryantasyon",
      title: "Tanıtım eğitimi",
      description:
        "Uluslararası takımlar için, tatbikat bölgesine intikalden önce tamamlanan yarışma öncesi oryantasyon; özellikle şu konulara ağırlık verilir:",
    },

    coordination: {
      eyebrow: "Koordinasyon",
      title: "Koordinasyon esasları",
      description:
        "Ana Planlama Konferansı'nda yayımlanan talimatlar. Uyulmaması puan cezası veya diskalifiye ile sonuçlanabilir.",
    },

    dosDonts: {
      eyebrow: "Davranış",
      title: "Yapılacaklar ve yasaklar",
      description:
        "Ziyaret süresince her katılımcı için geçerli olan yükümlülükler ve yasaklar.",
      dos: "Yapılacaklar",
      donts: "Yasaklar",
    },

    facilitation: {
      eyebrow: "Destek",
      title: "Destek, sağlık ve hukuk",
      description:
        "Pakistan Ordusu'nun sağladıkları, sağlık sorumluluğunun sınırı ve katılımcı tüm uluslara bildirilen hukuki durum.",
      facilitationTitle: "Pakistan Ordusu tarafından sağlanır",
      medicalTitle: "Sağlık desteği",
      legalTitle: "Hukuki hususlar",
      informationTitle: "Takımlardan istenen bilgiler",
      informationDeadline: (deadline: string): string =>
        `Son tarih: ${deadline}`,
    },

  },

  carousel: {
    prev: "Önceki kartlar",
    next: "Sonraki kartlar",
  },
};
