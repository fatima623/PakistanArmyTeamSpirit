import type { events as enEvents } from "../en/events";

// Turkish translations for the public Events Detail page.
// Turkish has no grammatical plural agreement after a numeral — the counted
// noun stays singular ("27 etkinlik", not "27 etkinlikler"), so the count
// helpers below deliberately ignore the number.
export const events: typeof enEvents = {
  meta: {
    title: "Etkinlik Ayrıntıları",
    description:
      "Pakistan Army Team Spirit tatbikatının puanlanan her etkinliği — puanlar, zorluk düzeyi ve her yarışma etkinliğinin ardındaki ayrıntılı brifing.",
  },

  hero: {
    badge: "Yarışma kataloğu",
    titleLead: "Etkinlik",
    titleAccent: "Ayrıntıları",
    lede:
      "Tatbikatın puanlanan her etkinliği — navigasyon, keşif, muharebe, sıhhiye ve komuta görevleri — puanı, zorluk düzeyi ve her kartın ardındaki ayrıntılı brifingi ile birlikte.",
  },

  filters: {
    searchPlaceholder: "Etkinliklerde ara…",
    searchAria: "Yarışma etkinliklerinde arama yap",
    all: "Tümü",
  },

  summary: (serials, marks) =>
    `${serials} puanlanan etkinlik · toplam ${marks} puan`,

  card: {
    marksUnit: () => "Puan",
    thumbAlt: (title) => `${title} etkinliğinin fotoğrafı`,
    viewDetails: "Ayrıntıları Gör",
  },

  empty: "Seçili filtrelere uyan etkinlik bulunamadı.",

  modal: {
    participants: "Katılımcılar",
    breakdown: "Puan dağılımı",
    total: "Bu etkinlik için toplam puan",
  },
};
