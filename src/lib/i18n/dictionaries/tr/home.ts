import type { home as enHome } from "../en/home";

// Turkish translations for the public landing (home) page.
export const home: typeof enHome = {
  hero: {
    featuredAria: "Öne çıkanlar",
    titleLine1: "Pakistan Ordusu Takım Ruhu (PATS)",
    titleLine2: "Yarışması",
    // Armadaki Urduca özdeyişin (İkbal) anlam çevirisi.
    motto: "Sarsılmaz iman, bitmeyen amel, âlemi fetheden sevgi",
    description:
      "Uluslararası Pakistan Ordusu Takım Ruhu (PATS) — ortak ülkeler arasında taktik ustalığı, dayanıklılığı ve takım ruhunu sınayan 60 saatlik bir devriye tatbikatı.",
    scrollHint: "Aşağı kaydırın",
  },

  stats: [
    { suffix: " SA", label: "Devriye tatbikatı süresi" },
    { suffix: "", label: "İstasyonlar" },
    { suffix: "+", label: "Taktik testler" },
    { suffix: "", label: "Puanlanan görevler" },
  ],

  mission: {
    eyebrow: "Konsept / Amaç",
    imageAlt: "PATS uluslararası yarışma amblemleri",
    quote: "TAKIM RUHUYLA TAKDİR EDİLEN AZİM",
    body:
      "Pakistan Army Team Spirit (PATS), her yıl JLA — PATS kapsamında düzenlenen görev ve görev odaklı bir devriye yarışmasıdır. Temel amaç, taktik ve zihinsel yetenekleri değerlendirmek ve geliştirmek için zorlu bir devriye tatbikatıdır — katılımcılar zihinsel ve fiziksel olarak hazır olmalıdır. Takımlar; küçük operasyonlarda ustalık, dayanıklılık ile temel tatbikat ve prosedürlerde yetkinlik kazanmalıdır.",
  },

  careers: {
    eyebrow: "Katılım",
    title: "PATS yolculuğunuza başlayın",
    description:
      "Doğru üye listesi ve irtibat bilgileriyle devriyenizi bu portal üzerinden kaydedin. Duyuruları, önemli tarihleri ve ödeme adımlarını katılımcı panelinizden takip edin.",
    cards: {
      register: { tag: "Katılım", title: "Takımınızı kaydedin" },
      operations: { tag: "Puanlı etkinlikler", title: "Operasyon brifingi" },
      international: { tag: "Ortak ülkeler", title: "Uluslararası edisyonlar" },
    },
  },

  about: {
    eyebrow: "PATS Hakkında",
    title: "Yarışmaya genel bakış",
    lead:
      "Pakistan Army Team Spirit (PATS), her yıl JLA — PATS kapsamında düzenlenen görev ve görev odaklı bir devriye yarışmasıdır. Takım ruhuyla takdir edilen azim.",
    imageAlt: "PATS yarışmasına genel bakış",
    points: [
      {
        title: "60 saatlik operasyonel tatbikat",
        body: "Bir keşif devriyesi, 30×30 km'lik terörist hâkimiyetindeki araziye sızar; planlanmış hiçbir dinlenme olmadan 20–22 taktik senaryodan geçerek 50–60 km yol kat eder.",
      },
      {
        title: "2016'dan beri uluslararası",
        body: "Dokuzuncu uluslararası edisyonlar; gerçekçi devriye, oryantasyon ve ortak yarışma standartları için ortak ülkeleri bir araya getirmiştir.",
      },
      {
        title: "Puanlanan muharebe etkinlikleri",
        body: "Testler, sub-konvansiyonel operasyonları yansıtır — navigasyon, CTR, CBRN, taarruz, sağlık, ateş desteği ve dayanıklılık; birleşik puanlama sistemiyle değerlendirilir.",
      },
    ],
  },

  dates: {
    eyebrow: "Önemli tarihler",
    title: "Program",
    fullSchedule: "Tam program",
  },
};
