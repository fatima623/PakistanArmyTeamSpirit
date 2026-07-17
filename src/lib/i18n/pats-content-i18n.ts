/**
 * Localization for the booklet-derived competition content in
 * `@/lib/pats-content` (drills, checkpoints, coordinating rules, glossary and
 * the operational overview).
 *
 * Why a lookup module rather than a dictionary section: `pats-content.ts` is a
 * single-language English data module imported by ~16 call sites (operations,
 * international, gallery, awards, army-content, contingents …). Reshaping it
 * into per-locale records would touch every one of those, so instead the pages
 * that render it translate the strings on the way out — the same approach
 * `key-date-i18n.ts` and `event-content-i18n.ts` take for DB rows.
 *
 * Keys are the *normalized English* source text, so a string that recurs across
 * drills ("Contingency planning", "Team comprehension") is translated once.
 * Anything unrecognised FALLS BACK to the original English, so a drill added to
 * `pats-content.ts` later still renders — just untranslated — rather than
 * showing a raw key or a blank.
 *
 * Genuine acronyms (PATS, CTR, CBRN, AFOS/ATGP, LMG, CP, HO, QBO, MRE, BUA,
 * MOPP, IED, EOD, RV, CQB, HUMINT, LZ) are kept as acronyms in every locale.
 */

import type { Locale } from "@/lib/i18n/config";

/** Normalize source text to a lookup key: lowercase, de-accented, alnum only. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

type Translations = Record<Exclude<Locale, "en">, string>;

/**
 * Every user-visible English string that `pats-content.ts` feeds to the
 * /operations pages, keyed by `norm(englishSource)`.
 */
const TEXT: Record<string, Translations> = {
  // ── Operational overview ────────────────────────────────────────────────
  "pakistanarmyteamspiritpatsisamissionandtaskorientedpatrollingcompetitionorganizedannuallyunderjlapats":
    {
      ru: "Pakistan Army Team Spirit (PATS) — соревнование по патрулированию, ориентированное на выполнение боевых задач, которое ежегодно проводится под эгидой JLA PATS.",
      tr: "Pakistan Army Team Spirit (PATS), JLA PATS bünyesinde her yıl düzenlenen, görev ve vazife odaklı bir devriye yarışmasıdır.",
      ar: "‏Pakistan Army Team Spirit (PATS) هي مسابقة دوريات قائمة على المهام والواجبات، تُنظَّم سنويًا تحت إشراف JLA PATS.",
      zh: "Pakistan Army Team Spirit（PATS）是每年在 JLA PATS 主办下举行的、以任务和课目为导向的巡逻竞赛。",
    },

  // Overview highlight labels
  duration: { ru: "Продолжительность", tr: "Süre", ar: "المدة", zh: "时长" },
  patrolsize: { ru: "Состав патруля", tr: "Devriye mevcudu", ar: "قوام الدورية", zh: "巡逻队规模" },
  area: { ru: "Район", tr: "Bölge", ar: "المنطقة", zh: "地域" },
  distance: { ru: "Дистанция", tr: "Mesafe", ar: "المسافة", zh: "距离" },
  scenarios: { ru: "Сценарии", tr: "Senaryolar", ar: "السيناريوهات", zh: "想定" },

  // Overview highlight values
  "60hours3days2nights": {
    ru: "60 часов (3 дня / 2 ночи)",
    tr: "60 saat (3 gün / 2 gece)",
    ar: "60 ساعة (3 أيام / ليلتان)",
    zh: "60 小时（3 天 / 2 夜）",
  },
  "8personnelreconnaissancepatrol": {
    ru: "Разведывательный патруль из 8 человек",
    tr: "8 personelden oluşan keşif devriyesi",
    ar: "دورية استطلاع مكوّنة من 8 أفراد",
    zh: "8 人侦察巡逻队",
  },
  "3030kmoperationalbox": {
    ru: "Операционный район 30 × 30 км",
    tr: "30 × 30 km harekât sahası",
    ar: "مربع عمليات 30 × 30 كم",
    zh: "30 × 30 公里行动区域",
  },
  "5060kmtraverse": {
    ru: "Переход 50–60 км",
    tr: "50–60 km intikal",
    ar: "مسير 50–60 كم",
    zh: "50–60 公里行程",
  },
  "2022tacticaltests": {
    ru: "20–22 тактических испытания",
    tr: "20–22 taktik test",
    ar: "20–22 اختبارًا تكتيكيًا",
    zh: "20–22 项战术测试",
  },

  // ── Checkpoints ─────────────────────────────────────────────────────────
  assemblyarea: { ru: "Район сбора", tr: "Toplanma bölgesi", ar: "منطقة التجمع", zh: "集结地域" },
  assemblye2: { ru: "Сбор (E+2)", tr: "Toplanma (E+2)", ar: "التجمع (E+2)", zh: "集结（E+2）" },
  checkpoint1: { ru: "Контрольный пункт 1", tr: "Kontrol noktası 1", ar: "نقطة التفتيش 1", zh: "检查点 1" },
  checkpoint2: { ru: "Контрольный пункт 2", tr: "Kontrol noktası 2", ar: "نقطة التفتيش 2", zh: "检查点 2" },
  checkpoint3hideout: {
    ru: "Контрольный пункт 3 / Укрытие",
    tr: "Kontrol noktası 3 / Saklanma yeri",
    ar: "نقطة التفتيش 3 / المخبأ",
    zh: "检查点 3 / 隐蔽地",
  },
  checkpoint4ctr: {
    ru: "Контрольный пункт 4 / CTR",
    tr: "Kontrol noktası 4 / CTR",
    ar: "نقطة التفتيش 4 / CTR",
    zh: "检查点 4 / CTR",
  },
  checkpoint5: { ru: "Контрольный пункт 5", tr: "Kontrol noktası 5", ar: "نقطة التفتيش 5", zh: "检查点 5" },
  checkpoint6: { ru: "Контрольный пункт 6", tr: "Kontrol noktası 6", ar: "نقطة التفتيش 6", zh: "检查点 6" },
  eday: { ru: "День учения", tr: "Tatbikat günü", ar: "يوم التمرين", zh: "演习日" },
  "45kmspeedmarch": {
    ru: "Марш-бросок 4–5 км",
    tr: "4–5 km sürat yürüyüşü",
    ar: "مسير سريع 4–5 كم",
    zh: "4–5 公里急行军",
  },
  assyarea: { ru: "Район сбора", tr: "Toplanma bölgesi", ar: "منطقة التجمع", zh: "集结地域" },

  // Checkpoint activities
  kitinspection: { ru: "Смотр снаряжения", tr: "Teçhizat denetimi", ar: "تفتيش المعدات", zh: "装具检查" },
  quadcopterhandling: {
    ru: "Работа с квадрокоптером",
    tr: "Quadcopter kullanımı",
    ar: "تشغيل الطائرة الرباعية المراوح",
    zh: "四旋翼无人机操作",
  },
  weaponrecognition: {
    ru: "Опознавание вооружения",
    tr: "Silah tanıma",
    ar: "تمييز الأسلحة",
    zh: "武器识别",
  },
  modelverbalordersprep: {
    ru: "Подготовка макета / устного боевого приказа",
    tr: "Maket / sözlü emir hazırlığı",
    ar: "إعداد المجسّم / الأوامر الشفهية",
    zh: "沙盘 / 口头命令准备",
  },
  powhandling: {
    ru: "Обращение с военнопленными",
    tr: "Savaş esiri muamelesi",
    ar: "التعامل مع أسرى الحرب",
    zh: "战俘处置",
  },
  minefieldclearance: {
    ru: "Разминирование минного поля",
    tr: "Mayın tarlası temizleme",
    ar: "تطهير حقل الألغام",
    zh: "雷场排除",
  },
  dealingwithstranger: {
    ru: "Действия при встрече с посторонним",
    tr: "Yabancı şahısla temas",
    ar: "التعامل مع شخص مجهول",
    zh: "陌生人处置",
  },
  reportcommunicationlines: {
    ru: "Доклады / линии связи",
    tr: "Rapor / muhabere hatları",
    ar: "التقارير / خطوط الاتصال",
    zh: "报告 / 通信线路",
  },
  establishoccupationofho: {
    ru: "Занятие укрытия (HO)",
    tr: "Saklanma yerinin (HO) tesisi",
    ar: "إشغال المخبأ (HO)",
    zh: "隐蔽地（HO）占领",
  },
  helilzselection: {
    ru: "Выбор вертолётной площадки (LZ)",
    tr: "Helikopter iniş bölgesi (LZ) seçimi",
    ar: "اختيار منطقة هبوط المروحية (LZ)",
    zh: "直升机着陆区（LZ）选择",
  },
  qbosforctrexfiltration: {
    ru: "QBO на CTR / отход",
    tr: "CTR / tahliye için QBO",
    ar: "أوامر القتال السريعة (QBO) لـ CTR / الانسحاب",
    zh: "CTR / 撤离的快速战斗命令（QBO）",
  },
  ctrdrill: { ru: "Отработка CTR", tr: "CTR uygulaması", ar: "تدريب CTR", zh: "CTR 课目" },
  ctrreportsubmission: {
    ru: "Сдача отчёта по CTR",
    tr: "CTR raporunun teslimi",
    ar: "تسليم تقرير CTR",
    zh: "提交 CTR 报告",
  },
  sectionassault: { ru: "Штурм отделением", tr: "Manga taarruzu", ar: "اقتحام بحجم فصيلة", zh: "班组突击" },
  cbrn: { ru: "РХБЗ (CBRN)", tr: "CBRN", ar: "CBRN", zh: "CBRN" },
  ambushantiambush: {
    ru: "Засада / противодействие засаде",
    tr: "Pusu / pusuya karşı hareket",
    ar: "الكمين / مواجهة الكمين",
    zh: "伏击 / 反伏击",
  },
  incidentsitefirstaid: {
    ru: "Место происшествия / первая помощь",
    tr: "Olay yeri / ilk yardım",
    ar: "موقع الحادث / الإسعافات الأولية",
    zh: "事发现场 / 急救",
  },
  mediahandling: {
    ru: "Работа со средствами массовой информации",
    tr: "Basınla ilişkiler",
    ar: "التعامل مع وسائل الإعلام",
    zh: "媒体应对",
  },
  speedmarch: { ru: "Марш-бросок", tr: "Sürat yürüyüşü", ar: "المسير السريع", zh: "急行军" },
  firing: { ru: "Стрельба", tr: "Atış", ar: "الرماية", zh: "射击" },
  terminalkitinspection: {
    ru: "Заключительный смотр снаряжения",
    tr: "Bitiş teçhizat denetimi",
    ar: "التفتيش الختامي على المعدات",
    zh: "终末装具检查",
  },
  watercrossing: { ru: "Преодоление водной преграды", tr: "Su geçişi", ar: "عبور المانع المائي", zh: "涉水通过" },
  debrief: { ru: "Разбор действий", tr: "Değerlendirme", ar: "استخلاص المعلومات", zh: "总结讲评" },
  afosatgp: { ru: "AFOS / ATGP", tr: "AFOS / ATGP", ar: "AFOS / ATGP", zh: "AFOS / ATGP" },

  // ── Glossary definitions (terms stay as acronyms) ────────────────────────
  exerciseday: { ru: "День учения", tr: "Tatbikat günü", ar: "يوم التمرين", zh: "演习日" },
  checkpoint: { ru: "Контрольный пункт", tr: "Kontrol noktası", ar: "نقطة التفتيش", zh: "检查点" },
  closetargetreconnaissance: {
    ru: "Разведка объекта с близкой дистанции",
    tr: "Yakın hedef keşfi",
    ar: "استطلاع الهدف عن قرب",
    zh: "近距离目标侦察",
  },
  hideout: { ru: "Укрытие", tr: "Saklanma yeri", ar: "المخبأ", zh: "隐蔽地" },
  quickbattleorders: {
    ru: "Краткий боевой приказ",
    tr: "Kısa muharebe emri",
    ar: "أوامر القتال السريعة",
    zh: "快速战斗命令",
  },
  artilleryforwardobserversimulatorartillerytargetgridprocedure: {
    ru: "Тренажёр передового артиллерийского наблюдателя / порядок работы по координатной сетке целей",
    tr: "Topçu ileri gözetleyici simülatörü / topçu hedef koordinat usulü",
    ar: "محاكي المراقب الأمامي للمدفعية / إجراء شبكة إحداثيات أهداف المدفعية",
    zh: "炮兵前进观察员模拟器 / 炮兵目标网格作业程序",
  },
  chemicalbiologicalradiologicalnuclear: {
    ru: "Химическая, биологическая, радиологическая и ядерная защита",
    tr: "Kimyasal, biyolojik, radyolojik ve nükleer",
    ar: "الكيميائي والبيولوجي والإشعاعي والنووي",
    zh: "化学、生物、放射与核",
  },
  mealsreadytoeat: {
    ru: "Индивидуальный рацион питания",
    tr: "Hazır tayın",
    ar: "وجبات جاهزة للأكل",
    zh: "即食口粮",
  },
  builduparea: { ru: "Населённый пункт", tr: "Meskûn mahal", ar: "منطقة مبنية", zh: "建成区" },

  // ── Coordinating rules — titles ─────────────────────────────────────────
  operationalsetting: {
    ru: "Оперативная обстановка",
    tr: "Harekât ortamı",
    ar: "الإطار العملياتي",
    zh: "行动背景",
  },
  testconduct: { ru: "Порядок проведения испытаний", tr: "Test icrası", ar: "إجراء الاختبارات", zh: "测试实施" },
  medicalreplacement: {
    ru: "Замена по медицинским показаниям",
    tr: "Sağlık nedeniyle değişiklik",
    ar: "الاستبدال لأسباب طبية",
    zh: "医疗替换",
  },
  weightcompliance: {
    ru: "Соблюдение весовой нормы",
    tr: "Ağırlık uygunluğu",
    ar: "الالتزام بالوزن",
    zh: "重量合规",
  },
  gpsprohibition: { ru: "Запрет GPS", tr: "GPS yasağı", ar: "حظر استخدام GPS", zh: "禁用 GPS" },
  teamtracking: {
    ru: "Отслеживание команд",
    tr: "Takım takibi",
    ar: "تتبّع الفرق",
    zh: "参赛队追踪",
  },
  terminalfiring: { ru: "Заключительная стрельба", tr: "Bitiş atışı", ar: "الرماية الختامية", zh: "终末射击" },
  buildupareas: { ru: "Населённые пункты", tr: "Meskûn mahaller", ar: "المناطق المبنية", zh: "建成区" },
  fielddiscipline: {
    ru: "Полевая дисциплина",
    tr: "Arazi disiplini",
    ar: "الانضباط الميداني",
    zh: "野外纪律",
  },
  watersafety: { ru: "Безопасность на воде", tr: "Su güvenliği", ar: "السلامة المائية", zh: "水域安全" },
  survivalrule: { ru: "Правило выживания", tr: "Hayatta kalma kuralı", ar: "قاعدة البقاء", zh: "生存规定" },

  // ── Coordinating rules — bodies ─────────────────────────────────────────
  subconventionalpatrolintoterroristdominatedareanarrativeissuedtopatrolleaderand2ic: {
    ru: "Патрулирование в районе, контролируемом террористами, в условиях неконвенционального конфликта; вводная выдаётся командиру патруля и его заместителю.",
    tr: "Terörist hâkimiyetindeki bölgeye konvansiyonel olmayan devriye; senaryo, devriye komutanı ve yardımcısına (2IC) verilir.",
    ar: "دورية في بيئة حرب غير نظامية داخل منطقة يسيطر عليها الإرهابيون؛ يُسلَّم السيناريو إلى قائد الدورية ومعاونه (2IC).",
    zh: "在恐怖分子控制地域实施的非常规巡逻；情况通报下达至巡逻队长及副队长（2IC）。",
  },
  "2022testsconductedindependentlyorincombinationsequencenotpreannounced": {
    ru: "20–22 испытания проводятся раздельно или в сочетании; последовательность заранее не объявляется.",
    tr: "20–22 test bağımsız olarak veya birlikte icra edilir; sıralama önceden bildirilmez.",
    ar: "تُجرى 20–22 اختبارًا بشكل منفرد أو مجتمع؛ ولا يُعلَن التسلسل مسبقًا.",
    zh: "20–22 项测试单独或组合实施；顺序不预先公布。",
  },
  onereplacementallowedonmedicalgroundsonly300pointssecondreplacement200points: {
    ru: "Одна замена допускается только по медицинским показаниям: −300 баллов; вторая замена — −200 баллов.",
    tr: "Yalnızca sağlık gerekçesiyle bir değişikliğe izin verilir: −300 puan; ikinci değişiklik −200 puan.",
    ar: "يُسمح باستبدال واحد لأسباب طبية فقط: −300 نقطة؛ والاستبدال الثاني −200 نقطة.",
    zh: "仅因医疗原因允许替换一人：扣 300 分；第二次替换扣 200 分。",
  },
  randomchecks100pointsperinstanceifteamweight200kg: {
    ru: "Выборочные проверки; −100 баллов за каждый случай, если вес команды не равен 200 кг.",
    tr: "Rastgele kontroller; takım ağırlığı 200 kg değilse her tespitte −100 puan.",
    ar: "فحوص عشوائية؛ −100 نقطة عن كل حالة إذا لم يكن وزن الفريق 200 كجم.",
    zh: "随机抽查；参赛队重量不等于 200 公斤的，每次扣 100 分。",
  },
  anygpsincludingwatchesorphonesdisqualificationifpossessedorused: {
    ru: "Любые устройства GPS, включая часы и телефоны, — дисквалификация за наличие или использование.",
    tr: "Saat veya telefon dâhil her türlü GPS — bulundurulması veya kullanılması hâlinde diskalifiye.",
    ar: "أي جهاز GPS بما في ذلك الساعات أو الهواتف — الاستبعاد في حال حيازته أو استخدامه.",
    zh: "任何 GPS 设备（含手表或手机）—— 持有或使用者取消参赛资格。",
  },
  allteamsissuedtrackersforlocationmonitoringthroughouttheexercise: {
    ru: "Всем командам выдаются трекеры для контроля местоположения на протяжении всего учения.",
    tr: "Tüm takımlara, tatbikat boyunca konum takibi için takip cihazı verilir.",
    ar: "تُسلَّم جميع الفرق أجهزة تتبّع لمراقبة الموقع طوال التمرين.",
    zh: "所有参赛队均配发追踪器，用于全程位置监控。",
  },
  firingwithoutpriorzeroingstrictweaponhandlingthroughout: {
    ru: "Стрельба без предварительной пристрелки — строгое соблюдение правил обращения с оружием на всём протяжении.",
    tr: "Önceden sıfırlama yapılmadan atış — baştan sona sıkı silah emniyeti.",
    ar: "الرماية دون تصفير مسبق — التزام صارم بقواعد مناولة السلاح طوال الوقت.",
    zh: "射击前不进行校枪 —— 全程严格执行武器操作规范。",
  },
  allbuasoutofboundsnocivilianassistancepermitted: {
    ru: "Все населённые пункты (BUA) закрыты для посещения; помощь со стороны гражданских лиц запрещена.",
    tr: "Tüm meskûn mahaller (BUA) yasak bölgedir; sivil yardım alınamaz.",
    ar: "جميع المناطق المبنية (BUA) محظورة؛ ولا يُسمح بأي مساعدة من المدنيين.",
    zh: "所有建成区（BUA）均为禁入区；不得接受平民协助。",
  },
  wasteburiedinteamblackplasticbagsshownatfinishpoint: {
    ru: "Отходы закапываются в чёрных пластиковых мешках команды; предъявляются на финише.",
    tr: "Atıklar takımın siyah plastik torbalarında gömülür; bitiş noktasında ibraz edilir.",
    ar: "تُدفن النفايات في أكياس الفريق البلاستيكية السوداء؛ وتُعرض عند نقطة النهاية.",
    zh: "垃圾装入参赛队黑色塑料袋掩埋；并在终点出示。",
  },
  nobathingorswimminginriverschannelsduringmovement: {
    ru: "Купание и плавание в реках и каналах во время передвижения запрещены.",
    tr: "İntikal sırasında nehir ve kanallarda yıkanmak veya yüzmek yasaktır.",
    ar: "يُمنع الاستحمام أو السباحة في الأنهار والقنوات أثناء التحرك.",
    zh: "行进途中禁止在河流或水渠中洗浴或游泳。",
  },
  nofoodresupplyteamssurviveonpersonalrationsmreforfullcompetitionperiod: {
    ru: "Пополнение продовольствия не производится — команды обеспечивают себя личными рационами / MRE на весь период соревнований.",
    tr: "Yiyecek ikmali yapılmaz — takımlar yarışma süresi boyunca şahsi tayın / MRE ile idare eder.",
    ar: "لا يوجد إعادة إمداد بالغذاء — تعتمد الفرق على مؤنها الشخصية / وجبات MRE طوال فترة المسابقة.",
    zh: "不进行食品补给 —— 参赛队全程依靠个人口粮 / MRE 自给。",
  },

  // ── Drill titles ────────────────────────────────────────────────────────
  initialkitinspection: {
    ru: "Первоначальный смотр снаряжения",
    tr: "İlk teçhizat denetimi",
    ar: "التفتيش الأولي على المعدات",
    zh: "初始装具检查",
  },
  reportlines: { ru: "Рубежи докладов", tr: "Rapor hatları", ar: "خطوط التقارير", zh: "报告线" },
  signalcommunication: { ru: "Связь", tr: "Muhabere", ar: "الاتصالات", zh: "通信联络" },
  recognitionofweaponsequipment: {
    ru: "Опознавание вооружения и снаряжения",
    tr: "Silah ve teçhizat tanıma",
    ar: "تمييز الأسلحة والمعدات",
    zh: "武器与装备识别",
  },
  verbalordersinfiltration: {
    ru: "Устный боевой приказ / скрытное выдвижение",
    tr: "Sözlü emir / sızma",
    ar: "الأوامر الشفهية / التسلل",
    zh: "口头命令 / 渗透",
  },
  infiltrationnavigation: {
    ru: "Скрытное выдвижение / навигация",
    tr: "Sızma / arazide yön bulma",
    ar: "التسلل / الملاحة",
    zh: "渗透 / 导航",
  },
  occupationofhideoutdrills: {
    ru: "Занятие укрытия и связанные действия",
    tr: "Saklanma yerinin işgali ve uygulamaları",
    ar: "إشغال المخبأ والإجراءات المرتبطة به",
    zh: "隐蔽地占领与课目",
  },
  closetargetreconnaissancectr: {
    ru: "Разведка объекта с близкой дистанции (CTR)",
    tr: "Yakın hedef keşfi (CTR)",
    ar: "استطلاع الهدف عن قرب (CTR)",
    zh: "近距离目标侦察（CTR）",
  },
  quickbattleordersctrexfiltration: {
    ru: "Краткий боевой приказ — CTR / отход",
    tr: "Kısa muharebe emri — CTR / tahliye",
    ar: "أوامر القتال السريعة — CTR / الانسحاب",
    zh: "快速战斗命令 —— CTR / 撤离",
  },
  helicoptercrashfirstaid: {
    ru: "Крушение вертолёта / первая помощь",
    tr: "Helikopter kazası / ilk yardım",
    ar: "تحطّم مروحية / الإسعافات الأولية",
    zh: "直升机坠毁 / 急救",
  },
  landingzoneselectionhelidrills: {
    ru: "Выбор вертолётной площадки и действия при работе с вертолётом",
    tr: "İniş bölgesi seçimi ve helikopter uygulamaları",
    ar: "اختيار منطقة الهبوط وإجراءات المروحيات",
    zh: "着陆区选择与直升机课目",
  },
  artilleryforwardobserversimulatoratgp: {
    ru: "Тренажёр передового артиллерийского наблюдателя / ATGP",
    tr: "Topçu ileri gözetleyici simülatörü / ATGP",
    ar: "محاكي المراقب الأمامي للمدفعية / ATGP",
    zh: "炮兵前进观察员模拟器 / ATGP",
  },
  counterambushantiambush: {
    ru: "Противодействие засаде / выход из засады",
    tr: "Pusuya karşı hareket / pusudan kurtulma",
    ar: "مواجهة الكمين / الخروج من الكمين",
    zh: "反伏击 / 脱离伏击",
  },
  minefieldiednegotiation: {
    ru: "Преодоление минного поля / участка с СВУ",
    tr: "Mayın tarlası / EYP geçişi",
    ar: "اجتياز حقل الألغام / منطقة العبوات الناسفة",
    zh: "雷场 / 简易爆炸装置通过",
  },
  crossingofwatergap: {
    ru: "Преодоление водной преграды",
    tr: "Su engelinin geçilmesi",
    ar: "عبور المانع المائي",
    zh: "水障通过",
  },
  incidentsite: { ru: "Место происшествия", tr: "Olay yeri", ar: "موقع الحادث", zh: "事发现场" },
  firingsmgonly: {
    ru: "Стрельба (только из пистолета-пулемёта)",
    tr: "Atış (yalnızca hafif makineli tabanca)",
    ar: "الرماية (بالرشاش الخفيف فقط)",
    zh: "射击（仅限冲锋枪）",
  },
  cbrntest: { ru: "Испытание по РХБЗ (CBRN)", tr: "CBRN testi", ar: "اختبار CBRN", zh: "CBRN 测试" },
  submissionofctrreport: {
    ru: "Сдача отчёта по CTR",
    tr: "CTR raporunun teslimi",
    ar: "تسليم تقرير CTR",
    zh: "提交 CTR 报告",
  },
  handlingofcapturedterrorist: {
    ru: "Обращение с задержанным террористом",
    tr: "Yakalanan teröristin muamelesi",
    ar: "التعامل مع إرهابي مقبوض عليه",
    zh: "被俘恐怖分子处置",
  },
  debriefing: { ru: "Разбор действий", tr: "Değerlendirme toplantısı", ar: "استخلاص المعلومات", zh: "总结讲评" },
  exfiltrationnavigation: {
    ru: "Отход / навигация",
    tr: "Tahliye / arazide yön bulma",
    ar: "الانسحاب / الملاحة",
    zh: "撤离 / 导航",
  },

  // ── Drill purposes ──────────────────────────────────────────────────────
  validateteamreadinessandloaddisciplinebeforeinfiltration: {
    ru: "Проверить готовность команды и дисциплину загрузки перед скрытным выдвижением.",
    tr: "Sızmadan önce takımın hazırlığını ve yük disiplinini doğrulamak.",
    ar: "التحقق من جاهزية الفريق وانضباط الحمل قبل التسلل.",
    zh: "在渗透前核验参赛队的准备情况与负荷纪律。",
  },
  assesscommandandcontrolduringinfiltrationandexfiltration: {
    ru: "Оценить управление и связь в ходе скрытного выдвижения и отхода.",
    tr: "Sızma ve tahliye sırasında sevk ve idareyi değerlendirmek.",
    ar: "تقييم القيادة والسيطرة أثناء التسلل والانسحاب.",
    zh: "评估渗透与撤离过程中的指挥控制能力。",
  },
  testvoiceprocedureandpracticalsignalequipmenthandling: {
    ru: "Проверить порядок ведения радиообмена и практические навыки работы со средствами связи.",
    tr: "Telsiz konuşma usulünü ve muhabere cihazlarının pratik kullanımını sınamak.",
    ar: "اختبار إجراءات المخابرة الصوتية والمناولة العملية لأجهزة الاتصال.",
    zh: "检验话音通信程序与通信器材实际操作。",
  },
  confirmfamiliaritywithmultinationalordnanceprofiles: {
    ru: "Подтвердить знание образцов вооружения различных стран.",
    tr: "Çok uluslu mühimmat profillerine aşinalığı teyit etmek.",
    ar: "التأكد من الإلمام بأنماط الذخائر متعددة الجنسيات.",
    zh: "确认对多国武器装备型号的熟悉程度。",
  },
  evaluateleadershipplanningandteamcomprehensionbeforemove: {
    ru: "Оценить командирские качества, планирование и понимание задачи личным составом перед выдвижением.",
    tr: "İntikalden önce liderliği, planlamayı ve takımın konuyu kavrayışını değerlendirmek.",
    ar: "تقييم القيادة والتخطيط واستيعاب الفريق قبل التحرك.",
    zh: "在行动前评估指挥能力、计划拟制与队员理解程度。",
  },
  navigateterroristdominatedterrainundertimeandtacticalpressure: {
    ru: "Осуществить навигацию по местности, контролируемой террористами, в условиях дефицита времени и тактического давления.",
    tr: "Zaman ve taktik baskı altında terörist hâkimiyetindeki arazide yön bulmak.",
    ar: "الملاحة في أرض يسيطر عليها الإرهابيون تحت ضغط الوقت والضغط التكتيكي.",
    zh: "在时间与战术压力下于恐怖分子控制地域实施导航。",
  },
  selectandsecurehideoutreactifcompromised: {
    ru: "Выбрать и обеспечить укрытие; действовать при его обнаружении противником.",
    tr: "Saklanma yeri seçip emniyete almak; deşifre olunması hâlinde tepki göstermek.",
    ar: "اختيار المخبأ وتأمينه؛ والتصرف حال انكشافه.",
    zh: "选择并确保隐蔽地安全；暴露时作出处置。",
  },
  executetechnicalandtacticalctragainstenemylocation: {
    ru: "Провести техническую и тактическую разведку объекта противника с близкой дистанции.",
    tr: "Düşman mevziine karşı teknik ve taktik CTR icra etmek.",
    ar: "تنفيذ استطلاع فني وتكتيكي عن قرب لموقع العدو.",
    zh: "对敌方位置实施技术与战术近距离侦察。",
  },
  rapidordersundertimepressureforctrorexfiltration: {
    ru: "Отдача краткого боевого приказа в условиях дефицита времени на CTR или отход.",
    tr: "CTR veya tahliye için zaman baskısı altında hızlı emir vermek.",
    ar: "إصدار أوامر سريعة تحت ضغط الوقت لتنفيذ CTR أو الانسحاب.",
    zh: "在时间压力下为 CTR 或撤离下达快速命令。",
  },
  securecrashsiteandevacuatecasualtiesfromthebattlefield: {
    ru: "Обеспечить охрану места крушения и эвакуировать пострадавших с поля боя.",
    tr: "Kaza yerini emniyete almak ve yaralıları muharebe sahasından tahliye etmek.",
    ar: "تأمين موقع التحطّم وإجلاء المصابين من ساحة المعركة.",
    zh: "控制坠机现场并将伤员撤离战场。",
  },
  selectmarkandsecurehelicopterlandingzones: {
    ru: "Выбрать, обозначить и обеспечить охрану вертолётных площадок.",
    tr: "Helikopter iniş bölgelerini seçmek, işaretlemek ve emniyete almak.",
    ar: "اختيار مناطق هبوط المروحيات وتعليمها وتأمينها.",
    zh: "选择、标示并确保直升机着陆区安全。",
  },
  conductartilleryshootsonsimulatororareatarget: {
    ru: "Выполнить артиллерийские стрельбы на тренажёре или по площадной цели.",
    tr: "Simülatörde veya alan hedefinde topçu atışı icra etmek.",
    ar: "تنفيذ رميات مدفعية على المحاكي أو على هدف مساحي.",
    zh: "在模拟器或面目标上实施炮兵射击。",
  },
  negotiatelikelyambushsitesandreactwhenambushed: {
    ru: "Преодолеть участки, вероятные для засады, и действовать при попадании в засаду.",
    tr: "Muhtemel pusu bölgelerini geçmek ve pusuya düşüldüğünde tepki göstermek.",
    ar: "اجتياز مواقع الكمين المحتملة والتصرف عند التعرض للكمين.",
    zh: "通过可能设伏地段并在遭伏击时作出反应。",
  },
  clearproceduresthroughdemarcatedhazardareas: {
    ru: "Отработать порядок преодоления обозначенных опасных участков.",
    tr: "İşaretlenmiş tehlikeli bölgelerden geçiş usullerini uygulamak.",
    ar: "تطبيق إجراءات الاجتياز عبر المناطق الخطرة المحدَّدة.",
    zh: "按规程通过已标定的危险地段。",
  },
  tacticalrivercrossingwithfullfightingload: {
    ru: "Тактическое форсирование водной преграды с полной боевой выкладкой.",
    tr: "Tam muharebe yüküyle taktik nehir geçişi.",
    ar: "عبور نهري تكتيكي بكامل حمل القتال.",
    zh: "携全套战斗负荷实施战术渡河。",
  },
  reacttochaoticincidentwithcasualtiesandlocalpopulation: {
    ru: "Действовать при внезапном происшествии с пострадавшими и местным населением.",
    tr: "Yaralıların ve yerel halkın bulunduğu karmaşık bir olaya müdahale etmek.",
    ar: "التعامل مع حادث فوضوي يشمل مصابين والسكان المحليين.",
    zh: "处置涉及伤员与当地民众的混乱事件。",
  },
  assessmarksmanshipunderfatiguewithoutpriorzeroing: {
    ru: "Оценить меткость стрельбы в условиях утомления без предварительной пристрелки.",
    tr: "Önceden sıfırlama yapılmadan, yorgunluk altında atış isabetini değerlendirmek.",
    ar: "تقييم دقة الرماية تحت الإجهاد ودون تصفير مسبق.",
    zh: "在疲劳状态且未校枪的条件下评估射击精度。",
  },
  extractinformationfromencounteredcivilianinhostileterritory: {
    ru: "Получить сведения от встреченного гражданского лица на территории противника.",
    tr: "Düşman bölgesinde karşılaşılan sivilden bilgi elde etmek.",
    ar: "استخلاص معلومات من مدني تتم مصادفته في أرض معادية.",
    zh: "在敌对区域从遇到的平民处获取信息。",
  },
  respondtochemicalbiologicalradiologicalornuclearattack: {
    ru: "Действовать при химическом, биологическом, радиологическом или ядерном нападении.",
    tr: "Kimyasal, biyolojik, radyolojik veya nükleer saldırıya karşılık vermek.",
    ar: "الاستجابة لهجوم كيميائي أو بيولوجي أو إشعاعي أو نووي.",
    zh: "应对化学、生物、放射或核袭击。",
  },
  finalendurancetestwithcasualtyevacuation: {
    ru: "Заключительное испытание на выносливость с эвакуацией пострадавшего.",
    tr: "Yaralı tahliyesiyle birlikte son dayanıklılık testi.",
    ar: "اختبار التحمل الختامي مع إجلاء المصابين.",
    zh: "含伤员后送的终末耐力测试。",
  },
  assessteamcaptainmediaengagementatincidentorhelicrashsite: {
    ru: "Оценить взаимодействие командира команды со СМИ на месте происшествия или крушения вертолёта.",
    tr: "Takım kaptanının olay yerinde veya helikopter kazası yerinde basınla iletişimini değerlendirmek.",
    ar: "تقييم تعامل قائد الفريق مع وسائل الإعلام في موقع الحادث أو تحطّم المروحية.",
    zh: "评估参赛队长在事发现场或坠机现场的媒体应对。",
  },
  exfiltratethroughhostileterrainontimewithtacticaldiscipline: {
    ru: "Совершить отход по территории противника в установленные сроки с соблюдением тактической дисциплины.",
    tr: "Taktik disiplinle ve zamanında düşman arazisinden tahliye olmak.",
    ar: "الانسحاب عبر أرض معادية في الوقت المحدد مع الالتزام بالانضباط التكتيكي.",
    zh: "以战术纪律按时经敌对地域撤离。",
  },
  clearterroristhideoutorcompoundhostagerescuemaybetested: {
    ru: "Зачистить укрытие или объект террористов; может проверяться освобождение заложников.",
    tr: "Terörist saklanma yerini veya yerleşkesini temizlemek; rehine kurtarma da sınanabilir.",
    ar: "تطهير مخبأ أو مجمّع للإرهابيين؛ وقد يُختبر تحرير الرهائن.",
    zh: "清剿恐怖分子隐蔽地或据点；可能考核人质解救。",
  },
  producecomprehensiveintelligencereportafterreconnaissance: {
    ru: "Подготовить исчерпывающий разведывательный отчёт по результатам разведки.",
    tr: "Keşif sonrası kapsamlı bir istihbarat raporu hazırlamak.",
    ar: "إعداد تقرير استخباري شامل عقب الاستطلاع.",
    zh: "侦察后形成完整的情报报告。",
  },
  testapprehensiontechniquesandgenevaconventionknowledge: {
    ru: "Проверить приёмы задержания и знание Женевских конвенций.",
    tr: "Yakalama tekniklerini ve Cenevre Sözleşmesi bilgisini sınamak.",
    ar: "اختبار أساليب إلقاء القبض والإلمام باتفاقية جنيف.",
    zh: "检验抓捕技术与《日内瓦公约》知识。",
  },
  finalverificationofteamloadandequipmentcompleteness: {
    ru: "Окончательная проверка веса и комплектности снаряжения команды.",
    tr: "Takım yükünün ve teçhizat eksiksizliğinin son kontrolü.",
    ar: "التحقق النهائي من حمل الفريق واكتمال المعدات.",
    zh: "对参赛队负荷与装备齐全性的最终核查。",
  },
  teamcaptaindebriefandpanelqaonexerciseconduct: {
    ru: "Разбор действий командиром команды и ответы на вопросы комиссии по проведению учения.",
    tr: "Takım kaptanının değerlendirmesi ve tatbikatın icrasına ilişkin heyet soru-cevabı.",
    ar: "استخلاص المعلومات من قائد الفريق وأسئلة اللجنة حول سير التمرين.",
    zh: "参赛队长总结讲评及评审组关于演习实施的问答。",
  },

  // ── Drill objectives ────────────────────────────────────────────────────
  serviceablekitofanyauthorizedpattern: {
    ru: "Исправное снаряжение любого утверждённого образца",
    tr: "İzin verilen herhangi bir modelde kullanılabilir teçhizat",
    ar: "معدات صالحة للاستخدام من أي نمط معتمد",
    zh: "任何获准型号的可用装具",
  },
  completeteaminspection: {
    ru: "Полный смотр команды",
    tr: "Takımın tam denetimi",
    ar: "تفتيش كامل للفريق",
    zh: "对参赛队的完整检查",
  },
  totalteamweight200kgincludingweaponsammunitiontrackerfilledwaterbottleharrissetwith2sparebatteries:
    {
      ru: "Общий вес команды 200 кг, включая вооружение, боеприпасы, трекер, наполненную флягу, радиостанцию Harris с 2 запасными аккумуляторами",
      tr: "Silahlar, mühimmat, takip cihazı, dolu matara ve 2 yedek bataryalı Harris telsiz dâhil toplam takım ağırlığı 200 kg",
      ar: "وزن الفريق الإجمالي 200 كجم شاملًا الأسلحة والذخيرة وجهاز التتبّع والمطرة المملوءة وجهاز Harris مع بطاريتين احتياطيتين",
      zh: "参赛队总重量 200 公斤，含武器、弹药、追踪器、注满的水壶及配 2 块备用电池的 Harris 电台",
    },
  equipmentcompleteperinstructions: {
    ru: "Снаряжение укомплектовано согласно указаниям",
    tr: "Teçhizat talimatlara uygun ve eksiksiz",
    ar: "المعدات مكتملة وفق التعليمات",
    zh: "装备按规定齐全",
  },
  fiveimaginarynavigationreportlines10markseach: {
    ru: "Пять условных навигационных рубежей докладов (по 10 баллов каждый)",
    tr: "Beş hayali seyir rapor hattı (her biri 10 puan)",
    ar: "خمسة خطوط تقارير ملاحية افتراضية (10 درجات لكل منها)",
    zh: "五条虚拟导航报告线（每条 10 分）",
  },
  reportstocontrolheadquartersoncrossing: {
    ru: "Доклады на пункт управления при пересечении рубежа",
    tr: "Hat geçişinde kontrol karargâhına rapor",
    ar: "تقديم التقارير إلى قيادة السيطرة عند العبور",
    zh: "越线时向控制指挥部报告",
  },
  nofixedpatternlinesmayappearanywhereduringmove: {
    ru: "Фиксированной схемы нет — рубежи могут встретиться в любой момент передвижения",
    tr: "Sabit bir düzen yoktur — hatlar intikal sırasında herhangi bir yerde çıkabilir",
    ar: "لا يوجد نمط ثابت — قد تظهر الخطوط في أي موضع أثناء التحرك",
    zh: "无固定模式 —— 报告线可能出现在行进中的任意位置",
  },
  voiceprocedureandequipmenttheoryvivapractical: {
    ru: "Порядок радиообмена и теория аппаратуры (устный опрос + практика)",
    tr: "Telsiz konuşma usulü ve cihaz teorisi (sözlü + uygulamalı)",
    ar: "إجراءات المخابرة الصوتية ونظرية الأجهزة (شفهي + عملي)",
    zh: "话音通信程序与器材理论（口试 + 实操）",
  },
  threememberstestedexcludingteamcaptainselectedbyumpiringstaff: {
    ru: "Проверяются три военнослужащих (кроме командира команды), отбираемых судейским составом",
    tr: "Hakem heyetince seçilen üç personel sınanır (takım kaptanı hariç)",
    ar: "يُختبر ثلاثة أفراد (باستثناء قائد الفريق) يختارهم طاقم التحكيم",
    zh: "由裁判组选定 3 名队员受测（不含参赛队长）",
  },
  chinarussiaandnatoweaponsequipment: {
    ru: "Вооружение и снаряжение Китая, России и НАТО",
    tr: "Çin, Rusya ve NATO silah/teçhizatı",
    ar: "أسلحة ومعدات الصين وروسيا وحلف الناتو",
    zh: "中国、俄罗斯及北约的武器装备",
  },
  practicaltestfor3individualsexcludingteamcaptain: {
    ru: "Практическое испытание для 3 военнослужащих (кроме командира команды)",
    tr: "3 personel için uygulamalı test (takım kaptanı hariç)",
    ar: "اختبار عملي لثلاثة أفراد (باستثناء قائد الفريق)",
    zh: "对 3 名队员进行实操测试（不含参赛队长）",
  },
  replicasorpicturesused: {
    ru: "Используются макеты или изображения",
    tr: "Maket veya görseller kullanılır",
    ar: "تُستخدم مجسّمات أو صور",
    zh: "使用仿制品或图片",
  },
  ordersinenglishnativelanguagepermitted: {
    ru: "Приказ отдаётся на английском языке (допускается родной язык)",
    tr: "Emirler İngilizce verilir (ana dile izin verilir)",
    ar: "تُصدر الأوامر بالإنجليزية (يُسمح باللغة الأم)",
    zh: "命令以英语下达（允许使用母语）",
  },
  "30minpreparation30mindelivery1hourtotal": {
    ru: "30 мин на подготовку + 30 мин на доведение (всего 1 час)",
    tr: "30 dk hazırlık + 30 dk sunum (toplam 1 saat)",
    ar: "30 دقيقة تحضير + 30 دقيقة إلقاء (ساعة واحدة إجمالًا)",
    zh: "准备 30 分钟 + 下达 30 分钟（共 1 小时）",
  },
  "1markpenaltyper2minutesoverlimit": {
    ru: "Штраф 1 балл за каждые 2 минуты сверх лимита",
    tr: "Süre aşımının her 2 dakikası için 1 puan ceza",
    ar: "خصم درجة واحدة عن كل دقيقتين تجاوزًا للحد",
    zh: "超时每 2 分钟扣 1 分",
  },
  sixfiguregridreferencesateachcheckpoint: {
    ru: "Шестизначные координаты на каждом контрольном пункте",
    tr: "Her kontrol noktasında altı haneli koordinat",
    ar: "إحداثيات شبكية من ستة أرقام عند كل نقطة تفتيش",
    zh: "在每个检查点报出六位坐标",
  },
  tacticaldrillsduringmove50marks: {
    ru: "Тактические действия в ходе передвижения: 50 баллов",
    tr: "İntikal sırasında taktik uygulamalar: 50 puan",
    ar: "الإجراءات التكتيكية أثناء التحرك: 50 درجة",
    zh: "行进中的战术动作：50 分",
  },
  pacerequirement2kmhr100marks: {
    ru: "Требуемый темп 2 км/ч: 100 баллов",
    tr: "Gerekli hız 2 km/sa: 100 puan",
    ar: "معدل السير المطلوب 2 كم/ساعة: 100 درجة",
    zh: "行进速度要求 2 公里/小时：100 分",
  },
  sixfiguregridreferencetocheckpoint: {
    ru: "Шестизначные координаты контрольного пункта",
    tr: "Kontrol noktasına ait altı haneli koordinat",
    ar: "إحداثيات شبكية من ستة أرقام لنقطة التفتيش",
    zh: "报出检查点六位坐标",
  },
  selecthideoutwithingivenarea: {
    ru: "Выбрать укрытие в пределах указанного района",
    tr: "Verilen bölge içinde saklanma yeri seçmek",
    ar: "اختيار المخبأ ضمن المنطقة المحددة",
    zh: "在指定地域内选择隐蔽地",
  },
  occupationdrillsandcompromiseresponse: {
    ru: "Действия при занятии укрытия и при его обнаружении",
    tr: "İşgal uygulamaları ve deşifre olma durumunda tepki",
    ar: "إجراءات الإشغال والتصرف عند الانكشاف",
    zh: "占领课目与暴露处置",
  },
  methodofmovementtoenemylocation: {
    ru: "Способ выдвижения к объекту противника",
    tr: "Düşman mevziine intikal yöntemi",
    ar: "أسلوب التحرك نحو موقع العدو",
    zh: "向敌方位置的机动方式",
  },
  technicaltacticalctrdrillsassessed: {
    ru: "Оцениваются технические и тактические приёмы CTR",
    tr: "Teknik/taktik CTR uygulamaları değerlendirilir",
    ar: "تُقيَّم إجراءات CTR الفنية/التكتيكية",
    zh: "考核技术/战术 CTR 课目",
  },
  patrolleaderdeliversqbosinenglishnativepermitted: {
    ru: "Командир патруля доводит краткий боевой приказ на английском языке (допускается родной)",
    tr: "Devriye komutanı QBO'yu İngilizce verir (ana dile izin verilir)",
    ar: "يُصدر قائد الدورية أوامر القتال السريعة بالإنجليزية (يُسمح باللغة الأم)",
    zh: "巡逻队长以英语下达快速战斗命令（允许使用母语）",
  },
  "10minpreparation10mindelivery20mintotal": {
    ru: "10 мин на подготовку + 10 мин на доведение (всего 20 мин)",
    tr: "10 dk hazırlık + 10 dk sunum (toplam 20 dk)",
    ar: "10 دقائق تحضير + 10 دقائق إلقاء (20 دقيقة إجمالًا)",
    zh: "准备 10 分钟 + 下达 10 分钟（共 20 分钟）",
  },
  securearea10marks: {
    ru: "Обеспечить охрану района: 10 баллов",
    tr: "Bölgeyi emniyete alma: 10 puan",
    ar: "تأمين المنطقة: 10 درجات",
    zh: "控制区域：10 分",
  },
  searchsurvivorsdocuments10marks: {
    ru: "Поиск выживших / документов: 10 баллов",
    tr: "Sağ kalanların / belgelerin aranması: 10 puan",
    ar: "البحث عن الناجين / الوثائق: 10 درجات",
    zh: "搜寻幸存者 / 文件：10 分",
  },
  firstaidtosurvivors30marks: {
    ru: "Первая помощь выжившим: 30 баллов",
    tr: "Sağ kalanlara ilk yardım: 30 puan",
    ar: "الإسعافات الأولية للناجين: 30 درجة",
    zh: "对幸存者实施急救：30 分",
  },
  lzwithinnearhideoutorpatrolbase4figuregrid: {
    ru: "Вертолётная площадка в районе укрытия или базы патруля (четырёхзначные координаты)",
    tr: "Saklanma yeri veya devriye üssü içinde/yakınında iniş bölgesi (dört haneli koordinat)",
    ar: "منطقة هبوط داخل المخبأ أو قاعدة الدورية أو بجوارهما (إحداثيات من أربعة أرقام)",
    zh: "位于隐蔽地或巡逻基地内/附近的着陆区（四位坐标）",
  },
  callinghelisupportandlzselection: {
    ru: "Вызов вертолётной поддержки и выбор площадки",
    tr: "Helikopter desteği talebi ve iniş bölgesi seçimi",
    ar: "طلب الإسناد بالمروحيات واختيار منطقة الهبوط",
    zh: "呼叫直升机支援与着陆区选择",
  },
  sitesecurityandmarkingequipment: {
    ru: "Охрана площадки и средства обозначения",
    tr: "Bölge emniyeti ve işaretleme teçhizatı",
    ar: "تأمين الموقع ومعدات التعليم",
    zh: "场地警戒与标示器材",
  },
  "2individualsperteamselectedbyumpirestaff": {
    ru: "От каждой команды отбираются 2 военнослужащих (судейским составом)",
    tr: "Hakem heyetince takım başına 2 personel seçilir",
    ar: "يُختار فردان من كل فريق بواسطة طاقم التحكيم",
    zh: "由裁判组从每队选定 2 名队员",
  },
  remainderofteamoutsidedesignatedsimulatorarea: {
    ru: "Остальной состав команды находится вне обозначенной зоны тренажёра",
    tr: "Takımın kalanı belirlenen simülatör alanının dışında bulunur",
    ar: "يبقى بقية أفراد الفريق خارج منطقة المحاكي المخصصة",
    zh: "其余队员在指定模拟器区域之外",
  },
  movethroughlikelyambushsite: {
    ru: "Передвижение через участок, вероятный для засады",
    tr: "Muhtemel pusu bölgesinden geçiş",
    ar: "التحرك عبر موقع كمين محتمل",
    zh: "通过可能设伏地段",
  },
  drillswhenambushedassessedbyumpires: {
    ru: "Действия при попадании в засаду оцениваются судьями",
    tr: "Pusuya düşüldüğündeki uygulamalar hakemlerce değerlendirilir",
    ar: "تُقيَّم الإجراءات عند التعرض للكمين من قِبل الحكام",
    zh: "遭伏击时的动作由裁判评定",
  },
  movethroughdemarcatedminefieldoriedpronearea: {
    ru: "Передвижение через обозначенное минное поле или участок, опасный по СВУ",
    tr: "İşaretlenmiş mayın tarlasından veya EYP'ye elverişli bölgeden geçiş",
    ar: "التحرك عبر حقل ألغام محدَّد أو منطقة معرّضة للعبوات الناسفة",
    zh: "通过已标定的雷场或简易爆炸装置易发区",
  },
  drillsfornegotiatinghazardschecked: {
    ru: "Проверяются приёмы преодоления опасных участков",
    tr: "Tehlikeleri geçme uygulamaları kontrol edilir",
    ar: "تُفحص إجراءات اجتياز المخاطر",
    zh: "检查通过危险物的动作",
  },
  "4050mwatergapwithcompletekit": {
    ru: "Водная преграда 40–50 м с полным снаряжением",
    tr: "Tam teçhizatla 40–50 m su engeli",
    ar: "مانع مائي بعرض 40–50 مترًا بكامل المعدات",
    zh: "携全套装具通过 40–50 米水障",
  },
  lifejacketswornbyall: {
    ru: "Спасательные жилеты надеты всеми",
    tr: "Herkes can yeleği giyer",
    ar: "ارتداء سترات النجاة من قِبل الجميع",
    zh: "全员穿着救生衣",
  },
  "20minprep20mincrossing": {
    ru: "20 мин на подготовку + 20 мин на переправу",
    tr: "20 dk hazırlık + 20 dk geçiş",
    ar: "20 دقيقة تحضير + 20 دقيقة عبور",
    zh: "准备 20 分钟 + 渡越 20 分钟",
  },
  secureincidentarea20marks: {
    ru: "Обеспечить охрану места происшествия: 20 баллов",
    tr: "Olay bölgesini emniyete alma: 20 puan",
    ar: "تأمين منطقة الحادث: 20 درجة",
    zh: "控制事发区域：20 分",
  },
  mobcontrol20marks: {
    ru: "Пресечение действий толпы: 20 баллов",
    tr: "Kalabalık kontrolü: 20 puan",
    ar: "السيطرة على الحشد: 20 درجة",
    zh: "人群控制：20 分",
  },
  firstaidandcasualtyevacuation10marks: {
    ru: "Первая помощь и эвакуация пострадавших: 10 баллов",
    tr: "İlk yardım ve yaralı tahliyesi: 10 puan",
    ar: "الإسعافات الأولية وإجلاء المصابين: 10 درجات",
    zh: "急救与伤员后送：10 分",
  },
  "2figure11targets100200mpronewithoutrest": {
    ru: "2 мишени «Figure 11», 100–200 м, лёжа без упора",
    tr: "2 adet Figure 11 hedefi, 100–200 m, destek almadan yatarak",
    ar: "هدفان من نوع Figure 11 على مسافة 100–200 م، من وضع الانبطاح دون سند",
    zh: "2 个 Figure 11 靶，100–200 米，无依托卧姿",
  },
  all8patrolmembers8rounds4permagin3minutes: {
    ru: "Все 8 членов патруля; 8 патронов (по 4 в магазине) за 3 минуты",
    tr: "Devriyenin 8 personelinin tamamı; 3 dakikada 8 fişek (şarjör başına 4)",
    ar: "جميع أفراد الدورية الثمانية؛ 8 طلقات (4 لكل مخزن) خلال 3 دقائق",
    zh: "巡逻队全部 8 名队员；3 分钟内射击 8 发（每弹匣 4 发）",
  },
  maximum4hitspertargetcounted: {
    ru: "Засчитывается не более 4 попаданий в мишень",
    tr: "Hedef başına en fazla 4 isabet sayılır",
    ar: "يُحتسب 4 إصابات كحد أقصى لكل هدف",
    zh: "每个靶最多计 4 发命中",
  },
  conductedduringinfiltrationorseparately: {
    ru: "Проводится в ходе скрытного выдвижения или отдельно",
    tr: "Sızma sırasında veya ayrı olarak icra edilir",
    ar: "يُجرى أثناء التسلل أو بشكل منفصل",
    zh: "在渗透过程中或单独实施",
  },
  gainmaximumusefulinformationapprehensiontechniquestested: {
    ru: "Получить максимум полезных сведений; проверяются приёмы задержания",
    tr: "Azami faydalı bilgiyi elde etmek; yakalama teknikleri sınanır",
    ar: "الحصول على أقصى قدر من المعلومات المفيدة؛ وتُختبر أساليب إلقاء القبض",
    zh: "获取最多有用信息；考核抓捕技术",
  },
  dresstomopplevel4: {
    ru: "Экипировка по уровню MOPP 4",
    tr: "MOPP seviye 4'e göre giyinme",
    ar: "الارتداء حتى مستوى MOPP 4",
    zh: "着装至 MOPP 4 级",
  },
  cordonareacasualtyhandlingincbrnenvironment: {
    ru: "Оцепление района; действия с пострадавшими в условиях РХБ заражения",
    tr: "Bölgenin çevrelenmesi; CBRN ortamında yaralı bakımı",
    ar: "تطويق المنطقة؛ والتعامل مع المصابين في بيئة CBRN",
    zh: "封锁区域；在 CBRN 环境下处置伤员",
  },
  samplinganddecontamination: {
    ru: "Отбор проб и дегазация",
    tr: "Numune alma ve arındırma",
    ar: "أخذ العينات وإزالة التلوث",
    zh: "取样与洗消",
  },
  "40minutesperteam": {
    ru: "40 минут на команду",
    tr: "Takım başına 40 dakika",
    ar: "40 دقيقة لكل فريق",
    zh: "每队 40 分钟",
  },
  "45kmondefinedtrackwith60kgdummycasualtyonstretcher": {
    ru: "4–5 км по обозначенному маршруту с манекеном пострадавшего 60 кг на носилках",
    tr: "Sedyede 60 kg'lık manken yaralı ile belirlenmiş parkurda 4–5 km",
    ar: "4–5 كم على مسار محدَّد مع دمية مصاب بوزن 60 كجم على نقالة",
    zh: "在指定路线上负担架 60 公斤伤员假人行进 4–5 公里",
  },
  qualifyingtime40minutes: {
    ru: "Зачётное время — 40 минут",
    tr: "Baraj süresi 40 dakika",
    ar: "الزمن المؤهل 40 دقيقة",
    zh: "及格时间 40 分钟",
  },
  "1markpenaltyperextraminute": {
    ru: "Штраф 1 балл за каждую дополнительную минуту",
    tr: "Her fazladan dakika için 1 puan ceza",
    ar: "خصم درجة واحدة عن كل دقيقة إضافية",
    zh: "每超出 1 分钟扣 1 分",
  },
  formulabestteamtimeteamtime100: {
    ru: "Формула: (лучшее время команды / время команды) × 100",
    tr: "Formül: (en iyi takım süresi / takım süresi) × 100",
    ar: "المعادلة: (أفضل زمن للفريق ÷ زمن الفريق) × 100",
    zh: "计算公式：（最佳成绩时间 ÷ 本队时间）× 100",
  },
  conductedathelicrashorincidentsite: {
    ru: "Проводится на месте крушения вертолёта или происшествия",
    tr: "Helikopter kazası veya olay yerinde icra edilir",
    ar: "يُجرى في موقع تحطّم المروحية أو موقع الحادث",
    zh: "在直升机坠毁或事发现场实施",
  },
  proficiencygradedbyumpiringstaff: {
    ru: "Уровень подготовки оценивается судейским составом",
    tr: "Yeterlilik hakem heyetince notlandırılır",
    ar: "يُقيَّم مستوى الكفاءة من قِبل طاقم التحكيم",
    zh: "熟练程度由裁判组评分",
  },
  sixfiguregridsatcheckpoints: {
    ru: "Шестизначные координаты на контрольных пунктах",
    tr: "Kontrol noktalarında altı haneli koordinatlar",
    ar: "إحداثيات شبكية من ستة أرقام عند نقاط التفتيش",
    zh: "在各检查点报出六位坐标",
  },
  tacticalmove50markspace2kmhr100marks: {
    ru: "Тактическое передвижение: 50 баллов; темп 2 км/ч: 100 баллов",
    tr: "Taktik intikal: 50 puan; hız 2 km/sa: 100 puan",
    ar: "التحرك التكتيكي: 50 درجة؛ ومعدل السير 2 كم/ساعة: 100 درجة",
    zh: "战术机动：50 分；速度 2 公里/小时：100 分",
  },
  "10pointsper30mindelayateachcheckpoint": {
    ru: "−10 баллов за каждые 30 минут опоздания на каждом контрольном пункте",
    tr: "Her kontrol noktasındaki her 30 dk gecikme için −10 puan",
    ar: "−10 نقاط عن كل تأخير 30 دقيقة عند كل نقطة تفتيش",
    zh: "在每个检查点每延误 30 分钟扣 10 分",
  },
  target23terroristsinhideoutcompound: {
    ru: "Цель: 2–3 террориста в укрытии / на объекте",
    tr: "Hedef: saklanma yerinde/yerleşkede 2–3 terörist",
    ar: "الهدف: 2–3 إرهابيين داخل مخبأ / مجمّع",
    zh: "目标：隐蔽地/据点内 2–3 名恐怖分子",
  },
  clearpositioncaptureorhostagerescueasdirected: {
    ru: "Зачистить позицию; захват или освобождение заложников по указанию",
    tr: "Mevziyi temizlemek; talimata göre ele geçirme veya rehine kurtarma",
    ar: "تطهير الموقع؛ والأسر أو تحرير الرهائن حسب التوجيه",
    zh: "清剿阵地；按指令实施抓捕或人质解救",
  },
  "1hourwritingtimeatnextcpnotattarget": {
    ru: "1 час на составление на следующем CP (не у объекта)",
    tr: "Bir sonraki CP'de 1 saat yazma süresi (hedefte değil)",
    ar: "ساعة واحدة للكتابة عند نقطة التفتيش التالية (وليس عند الهدف)",
    zh: "在下一个 CP 用 1 小时撰写（不在目标处）",
  },
  stampedblanksandbutterpaperissuedbyumpires: {
    ru: "Судьи выдают проштампованные бланки и кальку",
    tr: "Hakemlerce mühürlü form ve aydınger kâğıdı verilir",
    ar: "يُسلِّم الحكام نماذج مختومة وورق شفاف",
    zh: "由裁判发放盖章空白表格与描图纸",
  },
  capturedterroristhandedtoteam: {
    ru: "Задержанный террорист передаётся команде",
    tr: "Yakalanan terörist takıma teslim edilir",
    ar: "يُسلَّم الإرهابي المقبوض عليه إلى الفريق",
    zh: "将被俘恐怖分子移交参赛队",
  },
  apprehensiontechniquesandgenevaknowledgegauged: {
    ru: "Оцениваются приёмы задержания и знание Женевских конвенций",
    tr: "Yakalama teknikleri ve Cenevre bilgisi ölçülür",
    ar: "تُقاس أساليب إلقاء القبض والإلمام باتفاقية جنيف",
    zh: "考核抓捕技术与《日内瓦公约》知识掌握情况",
  },
  "200kgtotalincludingwaterharrissetbatteriestrackers": {
    ru: "Всего 200 кг, включая воду, радиостанцию Harris, аккумуляторы, трекеры",
    tr: "Su, Harris telsiz, bataryalar ve takip cihazları dâhil toplam 200 kg",
    ar: "200 كجم إجمالًا شاملة الماء وجهاز Harris والبطاريات وأجهزة التتبّع",
    zh: "总重 200 公斤，含饮水、Harris 电台、电池与追踪器",
  },
  equipmentmustbecomplete: {
    ru: "Снаряжение должно быть укомплектовано полностью",
    tr: "Teçhizat eksiksiz olmalıdır",
    ar: "يجب أن تكون المعدات مكتملة",
    zh: "装备必须齐全",
  },
  "30minutetimeboundcaptaindebrief": {
    ru: "Разбор командиром команды в течение 30 минут",
    tr: "30 dakika ile sınırlı kaptan değerlendirmesi",
    ar: "استخلاص من قائد الفريق محدَّد بـ 30 دقيقة",
    zh: "限时 30 分钟的队长讲评",
  },
  "1markpenaltyper2minutesover": {
    ru: "Штраф 1 балл за каждые 2 минуты сверх лимита",
    tr: "Süre aşımının her 2 dakikası için 1 puan ceza",
    ar: "خصم درجة واحدة عن كل دقيقتين تجاوزًا",
    zh: "超时每 2 分钟扣 1 分",
  },
  umpiresassesscomprehensionofminutestdetailsbyallmembers: {
    ru: "Судьи оценивают знание мельчайших деталей всеми членами команды",
    tr: "Hakemler, tüm personelin en ince ayrıntıları kavrayışını değerlendirir",
    ar: "يقيّم الحكام استيعاب جميع الأفراد لأدق التفاصيل",
    zh: "裁判评估全体队员对细节的掌握程度",
  },

  // ── Drill-level rules ───────────────────────────────────────────────────
  weaponsnotzeroedbeforetesthandlewithduecarethroughoutexercise: {
    ru: "Оружие не пристреливается перед испытанием — соблюдать надлежащую осторожность на всём протяжении учения",
    tr: "Silahlar testten önce sıfırlanmaz — tatbikat boyunca gereken özenle kullanın",
    ar: "لا تُصفَّر الأسلحة قبل الاختبار — يجب مناولتها بالعناية الواجبة طوال التمرين",
    zh: "测试前不进行校枪 —— 全程谨慎操作武器",
  },

  // ── Scoring-line labels ─────────────────────────────────────────────────
  deliveryofverbalorders: {
    ru: "Доведение устного боевого приказа",
    tr: "Sözlü emrin verilmesi",
    ar: "إلقاء الأوامر الشفهية",
    zh: "口头命令下达",
  },
  contingencyplanning: {
    ru: "Планирование на случай непредвиденных обстоятельств",
    tr: "Beklenmedik durum planlaması",
    ar: "تخطيط الطوارئ",
    zh: "应急计划拟制",
  },
  modelpreparation30min: {
    ru: "Подготовка макета (30 мин)",
    tr: "Maket hazırlığı (30 dk)",
    ar: "إعداد المجسّم (30 دقيقة)",
    zh: "沙盘制作（30 分钟）",
  },
  teamcomprehension: {
    ru: "Понимание задачи личным составом",
    tr: "Takımın konuyu kavrayışı",
    ar: "استيعاب الفريق",
    zh: "队员理解程度",
  },
  occupationoffinalrv: {
    ru: "Занятие конечного пункта сбора (RV)",
    tr: "Son buluşma noktasının (RV) işgali",
    ar: "إشغال نقطة الالتقاء النهائية (RV)",
    zh: "占领最终集合点（RV）",
  },
  movementfromrvtotarget: {
    ru: "Выдвижение от пункта сбора (RV) к объекту",
    tr: "RV'den hedefe intikal",
    ar: "التحرك من نقطة الالتقاء (RV) إلى الهدف",
    zh: "由集合点（RV）向目标机动",
  },
  conductofreconnaissance: {
    ru: "Порядок ведения разведки",
    tr: "Keşfin icrası",
    ar: "إجراء الاستطلاع",
    zh: "侦察实施",
  },
  deliveryoforder: { ru: "Доведение приказа", tr: "Emrin verilmesi", ar: "إلقاء الأمر", zh: "命令下达" },
  preparationofenlargement: {
    ru: "Подготовка увеличенной схемы объекта",
    tr: "Büyütülmüş kroki hazırlığı",
    ar: "إعداد المخطط المكبَّر",
    zh: "放大要图制作",
  },
  homefarbanksecurity: {
    ru: "Охрана исходного и противоположного берега",
    tr: "Yakın ve karşı kıyı emniyeti",
    ar: "تأمين الضفتين القريبة والبعيدة",
    zh: "近岸与对岸警戒",
  },
  waterproofingpacksequipment: {
    ru: "Гидроизоляция рюкзаков и снаряжения",
    tr: "Kumanya ve teçhizatın su geçirmez hâle getirilmesi",
    ar: "عزل الحقائب والمعدات عن الماء",
    zh: "背囊与装备防水处理",
  },
  tacticalcrossing: { ru: "Тактическая переправа", tr: "Taktik geçiş", ar: "العبور التكتيكي", zh: "战术渡越" },
  missionsituationdescription: {
    ru: "Задача, обстановка, описание",
    tr: "Görev, durum, tanımlama",
    ar: "المهمة والموقف والوصف",
    zh: "任务、情况与描述",
  },
  terrainenemyconclusion: {
    ru: "Выводы по местности и противнику",
    tr: "Arazi / düşman değerlendirmesi",
    ar: "الاستنتاج بشأن الأرض والعدو",
    zh: "地形与敌情结论",
  },
  optionswithreasons: {
    ru: "Варианты действий с обоснованием",
    tr: "Gerekçeleriyle seçenekler",
    ar: "الخيارات مع مسوّغاتها",
    zh: "方案及其理由",
  },
  chronologicaldescription: {
    ru: "Хронологическое описание",
    tr: "Kronolojik tanımlama",
    ar: "الوصف الزمني",
    zh: "时序描述",
  },

  // ── Tactical skills ─────────────────────────────────────────────────────
  loadmanagement: { ru: "Управление нагрузкой", tr: "Yük yönetimi", ar: "إدارة الحمل", zh: "负荷管理" },
  equipmentdiscipline: {
    ru: "Дисциплина обращения со снаряжением",
    tr: "Teçhizat disiplini",
    ar: "انضباط المعدات",
    zh: "装备纪律",
  },
  reporting: { ru: "Доклады", tr: "Raporlama", ar: "إعداد التقارير", zh: "报告" },
  navigation: { ru: "Навигация", tr: "Arazide yön bulma", ar: "الملاحة", zh: "导航" },
  commsdiscipline: { ru: "Дисциплина связи", tr: "Muhabere disiplini", ar: "انضباط الاتصالات", zh: "通信纪律" },
  radioprocedure: { ru: "Порядок радиообмена", tr: "Telsiz usulü", ar: "إجراءات اللاسلكي", zh: "无线电程序" },
  signalequipment: { ru: "Средства связи", tr: "Muhabere cihazları", ar: "أجهزة الاتصال", zh: "通信器材" },
  weaponsid: { ru: "Опознавание вооружения", tr: "Silah tanıma", ar: "تمييز الأسلحة", zh: "武器识别" },
  equipmentknowledge: { ru: "Знание снаряжения", tr: "Teçhizat bilgisi", ar: "المعرفة بالمعدات", zh: "装备知识" },
  leadership: { ru: "Командирские качества", tr: "Liderlik", ar: "القيادة", zh: "领导力" },
  planning: { ru: "Планирование", tr: "Planlama", ar: "التخطيط", zh: "计划拟制" },
  briefing: { ru: "Доведение задачи", tr: "Brifing", ar: "الإيجاز", zh: "任务宣达" },
  mapreading: { ru: "Чтение карты", tr: "Harita okuma", ar: "قراءة الخرائط", zh: "识图用图" },
  tacticalmovement: { ru: "Тактическое передвижение", tr: "Taktik hareket", ar: "التحرك التكتيكي", zh: "战术机动" },
  endurance: { ru: "Выносливость", tr: "Dayanıklılık", ar: "التحمل", zh: "耐力" },
  concealment: { ru: "Маскировка", tr: "Gizlenme", ar: "الإخفاء", zh: "隐蔽" },
  sops: { ru: "Порядок действий (SOP)", tr: "Standart uygulama esasları (SOP)", ar: "إجراءات التشغيل الموحدة (SOP)", zh: "标准作业程序（SOP）" },
  security: { ru: "Охрана", tr: "Emniyet", ar: "التأمين", zh: "警戒" },
  reconnaissance: { ru: "Разведка", tr: "Keşif", ar: "الاستطلاع", zh: "侦察" },
  stealth: { ru: "Скрытность", tr: "Gizlilik", ar: "التخفي", zh: "隐蔽行动" },
  observation: { ru: "Наблюдение", tr: "Gözetleme", ar: "المراقبة", zh: "观察" },
  battleorders: { ru: "Боевые приказы", tr: "Muharebe emirleri", ar: "أوامر القتال", zh: "战斗命令" },
  medical: { ru: "Медицинская помощь", tr: "Sıhhiye", ar: "الإسعاف الطبي", zh: "医疗救护" },
  sitesecurity: { ru: "Охрана объекта", tr: "Bölge emniyeti", ar: "تأمين الموقع", zh: "现场警戒" },
  aviationcoordination: {
    ru: "Взаимодействие с авиацией",
    tr: "Havacılık koordinasyonu",
    ar: "التنسيق مع الطيران",
    zh: "航空协同",
  },
  lzmarking: { ru: "Обозначение вертолётной площадки", tr: "İniş bölgesi işaretleme", ar: "تعليم منطقة الهبوط", zh: "着陆区标示" },
  firesupport: { ru: "Огневая поддержка", tr: "Ateş desteği", ar: "الإسناد الناري", zh: "火力支援" },
  immediateaction: { ru: "Немедленные действия", tr: "Ani hareket", ar: "الإجراء الفوري", zh: "紧急处置" },
  fireandmovement: { ru: "Огонь и манёвр", tr: "Ateş ve hareket", ar: "النيران والحركة", zh: "火力与运动" },
  eodawareness: { ru: "Знание основ обезвреживания боеприпасов (EOD)", tr: "EOD farkındalığı", ar: "الوعي بإبطال الذخائر (EOD)", zh: "爆炸物处理（EOD）意识" },
  routeclearance: { ru: "Разведка и очистка маршрута", tr: "Güzergâh temizleme", ar: "تطهير المسار", zh: "路线排障" },
  riverops: { ru: "Действия на водных преградах", tr: "Nehir harekâtı", ar: "عمليات الأنهار", zh: "江河行动" },
  loadwaterproofing: { ru: "Гидроизоляция снаряжения", tr: "Yükün su geçirmez hâle getirilmesi", ar: "عزل الحمل عن الماء", zh: "负荷防水" },
  crowdcontrol: { ru: "Пресечение действий толпы", tr: "Kalabalık kontrolü", ar: "السيطرة على الحشود", zh: "人群控制" },
  casevac: { ru: "Эвакуация пострадавших (CASEVAC)", tr: "CASEVAC", ar: "إجلاء المصابين (CASEVAC)", zh: "伤员后送（CASEVAC）" },
  marksmanship: { ru: "Меткость стрельбы", tr: "Atıcılık", ar: "دقة الرماية", zh: "射击技能" },
  weaponhandling: { ru: "Обращение с оружием", tr: "Silah kullanımı", ar: "مناولة السلاح", zh: "武器操作" },
  humint: { ru: "Агентурная разведка (HUMINT)", tr: "HUMINT", ar: "الاستخبارات البشرية (HUMINT)", zh: "人力情报（HUMINT）" },
  tacticalquestioning: { ru: "Тактический опрос", tr: "Taktik sorgulama", ar: "الاستجواب التكتيكي", zh: "战术问询" },
  decontamination: { ru: "Дегазация и дезактивация", tr: "Arındırma", ar: "إزالة التلوث", zh: "洗消" },
  teamcarry: { ru: "Переноска в составе команды", tr: "Takımla taşıma", ar: "الحمل الجماعي", zh: "集体搬运" },
  publicaffairs: { ru: "Связи с общественностью", tr: "Halkla ilişkiler", ar: "العلاقات العامة", zh: "公共事务" },
  commandpresence: { ru: "Командирская уверенность", tr: "Komuta duruşu", ar: "هيبة القيادة", zh: "指挥气势" },
  exfiltration: { ru: "Отход", tr: "Tahliye", ar: "الانسحاب", zh: "撤离" },
  assault: { ru: "Штурм", tr: "Taarruz", ar: "الاقتحام", zh: "突击" },
  cqb: { ru: "Ближний бой (CQB)", tr: "CQB (yakın muharebe)", ar: "القتال القريب (CQB)", zh: "近距离作战（CQB）" },
  analysis: { ru: "Анализ", tr: "Analiz", ar: "التحليل", zh: "分析" },
  lawofarmedconflict: {
    ru: "Право вооружённых конфликтов",
    tr: "Silahlı çatışma hukuku",
    ar: "قانون النزاعات المسلحة",
    zh: "武装冲突法",
  },
  afteractionreview: { ru: "Разбор после выполнения задачи", tr: "Harekât sonrası değerlendirme", ar: "المراجعة بعد التنفيذ", zh: "行动后总结" },
};

/**
 * Translate a booklet-derived English string. Unknown text falls back to the
 * original so new `pats-content.ts` rows still render (untranslated).
 */
export function translatePatsText(text: string, locale: Locale): string {
  if (locale === "en") return text;
  return TEXT[norm(text)]?.[locale] ?? text;
}

/** Convenience for the string arrays (objectives, activities, skills, rules). */
export function translatePatsList(items: readonly string[], locale: Locale): string[] {
  return items.map((item) => translatePatsText(item, locale));
}
