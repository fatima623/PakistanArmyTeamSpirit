import type { tickets as enTickets } from "../en/tickets";

export const tickets: typeof enTickets = {
  panel: {
    title: "Talepler / SSS",
    subtitle:
      "Önce aşağıdaki yanıtlara bakın. Sorunuz orada yoksa bir talep oluşturun, yönetim yanıtlayacaktır.",
    newTicket: "Yeni talep",
    empty:
      "Henüz bir talep oluşturmadınız. Yardıma ihtiyacınız varsa yukarıdan oluşturun.",
    listMeta: (category, count, updated) =>
      `${category} · ${count} mesaj · Güncellendi ${updated}`,
  },
  statuses: {
    OPEN: "Açık",
    IN_PROGRESS: "İşlemde",
    RESOLVED: "Çözüldü",
    CLOSED: "Kapalı",
  },
  priorities: {
    LOW: "Düşük",
    NORMAL: "Normal",
    HIGH: "Yüksek",
  },
  priorityTag: (label) => `${label} öncelik`,
  categories: {
    GENERAL: "Genel soru",
    REGISTRATION: "Kayıt",
    PAYMENT: "Ödeme",
    TECHNICAL: "Teknik sorun",
  },
  staffTag: "PATS ekibi",

  faq: {
    title: "Sık sorulan sorular",
    subtitle: "PATS hakkında en sık sorulan soruların kısa yanıtları.",
    items: [
      {
        q: "PATS portalı için hesabı nasıl alırım?",
        a: "Hesapları PATS yönetimi oluşturur; genel bir kayıt yoktur. Ekibiniz aday gösterildiğinde yönetim girişinizi oluşturur ve kimlik bilgilerini kayıtlı e-posta adresinize gönderir.",
      },
      {
        q: "Parolamı unuttum, ne yapmalıyım?",
        a: "Giriş ekranındaki “Parolanızı mı unuttunuz?” bağlantısını kullanın. Kayıtlı e-posta adresinize güvenli bir sıfırlama bağlantısı gönderilir ve sınırlı bir süre geçerlidir. E-posta ulaşmazsa buradan bir talep oluşturun.",
      },
      {
        q: "Kayıt adımları nelerdir ve hangi sırayla ilerler?",
        a: "Her biri bir sonrakini açan beş adım: 1) Katılım onayı, 2) Birlik bilgileri, 3) Ekip üyeleri, 4) Uçuş bilgileri, 5) SD (Spor Müdürlüğü) tarafından doğrulama. Panonuz hangi adımın açık olduğunu ve nelerin eksik kaldığını gösterir.",
      },
      {
        q: "Ekibimde kaç kişi olabilir?",
        a: "Ekip büyüklüğü sınırı panonuzda yayımlanır ve tüm ekipler için geçerlidir. Kafilenizin bu sınırı aşması gerekiyorsa gerekçesiyle birlikte bir ekip büyüklüğü talebi gönderin; yönetim her talebi ayrı ayrı değerlendirir.",
      },
      {
        q: "Uçuş bilgilerinde neleri sunmam gerekir?",
        a: "Seyahat eden her ekip üyesi için bir kayıt: tarih, saat ve uçuş numaralarıyla geliş ve dönüş uçuşları ile o yolcunun pasaport ve bilet belgeleri. Adım, ancak listedeki her üyenin kaydı tamamlandığında biter.",
      },
      {
        q: "Kaydım ne zaman gönderilmiş sayılır?",
        a: "Tüm listenin uçuş bilgileri gönderildiğinde kaydınız otomatik olarak SD doğrulama sırasına girer. Ayrıca bir şey göndermeniz gerekmez; panodaki durum nerede olduğunuzu gösterir.",
      },
      {
        q: "Birlik veya komutan bilgilerimi kaydettikten sonra değiştirebilir miyim?",
        a: "Adım açık olduğu sürece evet: panodan Birlik bilgilerini yeniden açıp değişikliklerinizi kaydedin. Kayıt doğrulandıktan sonra buradan bir talep oluşturun, düzeltmeyi yönetim yapar.",
      },
      {
        q: "Tatbikatın kendisini nereden okuyabilirim?",
        a: "Kenar çubuğundan Tur’u açın. Etkinlik ayrıntıları, uluslararası katılım, PATS tanıtımı, ödüller, galeri, duyurular ve önemli tarihler — PATS hakkında yayımlanan her şey oradadır.",
      },
      {
        q: "Talebimi kimler görür ve kim yanıtlar?",
        a: "Talep ortak bir görüşmedir: PATS yönetiminin tamamı ve ev sahibi teşkil onu görebilir ve herhangi biri yanıtlayabilir. Her yanıtta yazarın adı ve bağlı olduğu birim görünür.",
      },
      {
        q: "Kapatılan bir talebi yeniden açabilir miyim?",
        a: "Kapatılan talep okunabilir kalır ancak yeni yanıt almaz. Aynı sorun yeniden ortaya çıkarsa yeni bir talep oluşturun ve konuda öncekine atıfta bulunun.",
      },
      {
        q: "Portal hangi dillerde kullanılabilir?",
        a: "İngilizce, Arapça, Rusça, Türkçe ve Çince. Dil seçiciyle istediğiniz zaman değiştirebilirsiniz; seçiminiz bu cihazda hatırlanır.",
      },
    ],
  },
  detail: {
    backToSupport: "Taleplere dön",
    subtitle: (category, date) => `${category} · Açıldı ${date}`,
  },
  form: {
    title: "Talep oluştur",
    subject: "Konu",
    subjectPlaceholder: "Sorununuzun kısa özeti",
    category: "Kategori",
    priority: "Öncelik",
    help: "Size nasıl yardımcı olabiliriz?",
    helpPlaceholder: "Sorununuzu ayrıntılı olarak açıklayın",
    cancel: "İptal",
    submit: "Talebi gönder",
    toastRaised: "Talep oluşturuldu",
  },
  reply: {
    closedNotice:
      "Bu talep kapatıldı. Daha fazla yardıma ihtiyacınız varsa yeni bir talep oluşturun.",
    placeholder: "Bir yanıt yazın…",
    closeTicket: "Talebi kapat",
    sendReply: "Yanıt gönder",
    toastClosed: "Talep kapatıldı",
    reply: "Yanıtla",
    replyingTo: "Yanıtlanan",
    cancelReply: "Yanıtı iptal et",
  },
  actions: {
    resolve: "Çöz",
    close: "Kapat",
    toastResolved: "Talep çözüldü olarak işaretlendi",
  },
};
