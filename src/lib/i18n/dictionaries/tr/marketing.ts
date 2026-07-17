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

  carousel: {
    prev: "Önceki kartlar",
    next: "Sonraki kartlar",
  },
};
