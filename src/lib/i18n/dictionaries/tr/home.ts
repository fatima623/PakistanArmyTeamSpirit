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
    { suffix: "", label: "Etkinlikler" },
  ],

  mission: {
    eyebrow: "Konsept / Amaç",
    imageAlt: "PATS uluslararası yarışma amblemleri",
    quote: "TAKIM RUHUYLA TAKDİR EDİLEN AZİM",
    body:
      "Pakistan Army Team Spirit (PATS), her yıl JLA — PATS kapsamında düzenlenen görev ve görev odaklı bir devriye yarışmasıdır. Temel amaç, taktik ve zihinsel yetenekleri değerlendirmek ve geliştirmek için zorlu bir devriye tatbikatıdır — katılımcılar zihinsel ve fiziksel olarak hazır olmalıdır. Takımlar; küçük operasyonlarda ustalık, dayanıklılık ile temel tatbikat ve prosedürlerde yetkinlik kazanmalıdır.",
  },



  dates: {
    eyebrow: "Önemli tarihler",
    title: "Program",
  },
};
