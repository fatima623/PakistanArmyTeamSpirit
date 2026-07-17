/**
 * Localization for the Exercise Contour dashboard content in
 * `@/lib/exercise-contour` (stats, overview, timeline, events, equipment,
 * rules and orientation) plus the dashboard's own UI chrome.
 *
 * Why a lookup module rather than a dictionary section: `exercise-contour.ts`
 * is a single-language English data module and the dashboard renders it as a
 * thin layer. Reshaping the data into per-locale records would be invasive, so
 * — exactly like `pats-content-i18n.ts`, `key-date-i18n.ts` and
 * `event-content-i18n.ts` — the component translates each string on the way
 * out via `translateContour()`, which FALLS BACK to the original English when
 * a string is unknown (so a newly-added event still renders, just untranslated).
 *
 * Entries are written as raw English source and normalized to lookup keys at
 * module load, so repeated strings ("Compass", "Delivery", "Team Understanding"
 * …) are translated once and there is no hand-computed key to drift.
 *
 * Genuine military acronyms (SMG, LMG, CBRN, MOPP, AFOS, ATGP, IED, CTR, RV,
 * FRV, GPS, MRE, BUA, HQ, KG, KM, NATO, MOPP Level 4) are kept verbatim in
 * every locale.
 */

import type { Locale } from "@/lib/i18n/config";

type Translations = Record<Exclude<Locale, "en">, string>;

/** Normalize source text to a lookup key: lowercase, de-accented, alnum only. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * [ englishSource, { ru, tr, ar, zh } ] pairs. Order is for human review only;
 * lookup is by `norm(englishSource)`.
 */
const ENTRIES: Array<[string, Translations]> = [
  /* ── Dashboard chrome ────────────────────────────────────────────────── */
  ["Operational overview · Classified brief", { ru: "Оперативный обзор · Секретная сводка", tr: "Harekât genel bakışı · Gizli brifing", ar: "نظرة عملياتية عامة · إحاطة سرّية", zh: "作战概览 · 机密简报" }],
  ["The complete operational overview of the exercise — competition events, weapon and equipment requirements, rules, the evaluation system, international orientation and the full conduct of events, presented as a single command dashboard.", { ru: "Полный оперативный обзор учения — соревновательные этапы, требования к оружию и снаряжению, правила, система оценивания, международная подготовка и весь ход мероприятий, представленные единой командной панелью.", tr: "Tatbikatın eksiksiz harekât genel bakışı — yarışma etkinlikleri, silah ve teçhizat gereksinimleri, kurallar, değerlendirme sistemi, uluslararası oryantasyon ve etkinliklerin tüm icrası, tek bir komuta panelinde sunulur.", ar: "نظرة عملياتية شاملة على التمرين — فعاليات المسابقة، ومتطلبات الأسلحة والمعدات، والقواعد، ونظام التقييم، والتوجيه الدولي، والسير الكامل للفعاليات، معروضة في لوحة قيادة واحدة.", zh: "本演习的完整作战概览——竞赛项目、武器与装备要求、规则、评分体系、国际适应训练以及全部项目实施，统一呈现于一个指挥面板中。" }],

  ["Situation", { ru: "Обстановка", tr: "Durum", ar: "الموقف", zh: "态势" }],
  ["Exercise Overview", { ru: "Обзор учения", tr: "Tatbikat Genel Bakışı", ar: "نظرة عامة على التمرين", zh: "演习概览" }],
  ["How the exercise runs from the Assembly Area through 60 continuous hours of scenario-driven serials.", { ru: "Как проходит учение — от района сбора через 60 непрерывных часов сценарных этапов.", tr: "Tatbikatın Toplanma Bölgesinden başlayarak 60 saat kesintisiz, senaryo temelli seriler boyunca nasıl yürüdüğü.", ar: "كيف يجري التمرين من منطقة التجمع عبر 60 ساعة متواصلة من الفعاليات القائمة على السيناريو.", zh: "演习如何从集结地域出发，历经 60 小时连续、以想定驱动的科目。" }],

  ["Conduct of events", { ru: "Ход мероприятий", tr: "Etkinliklerin icrası", ar: "سير الفعاليات", zh: "项目实施" }],
  ["Interactive Timeline", { ru: "Интерактивная хронология", tr: "Etkileşimli Zaman Çizelgesi", ar: "الجدول الزمني التفاعلي", zh: "交互式时间线" }],
  ["The exercise flow from arrival to debriefing. Select any phase to read its intent.", { ru: "Ход учения от прибытия до разбора итогов. Выберите этап, чтобы прочитать его замысел.", tr: "Varıştan değerlendirme toplantısına kadar tatbikat akışı. Amacını okumak için herhangi bir aşamayı seçin.", ar: "تسلسل التمرين من الوصول حتى استخلاص المعلومات. اختر أي مرحلة لقراءة الغرض منها.", zh: "从抵达到总结汇报的演习流程。选择任一阶段查看其意图。" }],

  ["Evaluation system", { ru: "Система оценивания", tr: "Değerlendirme sistemi", ar: "نظام التقييم", zh: "评分体系" }],
  ["Competition Events", { ru: "Соревновательные этапы", tr: "Yarışma Etkinlikleri", ar: "فعاليات المسابقة", zh: "竞赛项目" }],
  ["scored serials", { ru: "оцениваемых этапов", tr: "puanlı seri", ar: "فعاليات مُقيَّمة", zh: "个计分科目" }],
  ["total marks", { ru: "всего баллов", tr: "toplam puan", ar: "إجمالي الدرجات", zh: "总分" }],
  ["Filter by category or difficulty, or open a card for the full brief.", { ru: "Фильтруйте по категории или сложности либо откройте карточку для полного описания.", tr: "Kategoriye veya zorluğa göre filtreleyin ya da tam brifing için bir kartı açın.", ar: "صفِّ حسب الفئة أو الصعوبة، أو افتح بطاقة للاطّلاع على الإحاطة الكاملة.", zh: "按类别或难度筛选，或打开卡片查看完整简报。" }],

  ["Loadout", { ru: "Снаряжение", tr: "Teçhizat", ar: "التجهيز", zh: "携行装备" }],
  ["Weapons & Equipment", { ru: "Оружие и снаряжение", tr: "Silah ve Teçhizat", ar: "الأسلحة والمعدات", zh: "武器与装备" }],
  ["Everything a patrol carries — organised by category. Total team weight, fully loaded, must not exceed 200 KG.", { ru: "Всё, что несёт патруль, — по категориям. Суммарный вес команды в полной выкладке не должен превышать 200 KG.", tr: "Bir devriyenin taşıdığı her şey — kategoriye göre düzenlenmiş. Tam yüklü toplam takım ağırlığı 200 KG'yi aşmamalıdır.", ar: "كل ما تحمله الدورية — مُنظَّمًا حسب الفئة. يجب ألا يتجاوز وزن الفريق الإجمالي بكامل حمولته 200 KG.", zh: "巡逻队携带的全部物品——按类别整理。满载时队伍总重不得超过 200 KG。" }],

  ["Coordinating points", { ru: "Координационные положения", tr: "Koordinasyon hususları", ar: "نقاط التنسيق", zh: "协调要点" }],
  ["Rules, Do's & Don'ts", { ru: "Правила: что можно и чего нельзя", tr: "Kurallar, Yapılması ve Yapılmaması Gerekenler", ar: "القواعد والمسموح والممنوع", zh: "规则与注意事项" }],
  ["Operational rules, penalties and prohibitions. Critical items carry disqualification or heavy penalty points.", { ru: "Оперативные правила, штрафы и запреты. Критические пункты влекут дисквалификацию или крупные штрафные баллы.", tr: "Harekât kuralları, cezalar ve yasaklar. Kritik maddeler diskalifiye ya da ağır ceza puanı getirir.", ar: "قواعد العمليات والعقوبات والمحظورات. البنود الحرجة تستوجب الاستبعاد أو نقاط جزائية ثقيلة.", zh: "作战规则、处罚与禁令。关键项将导致取消资格或重罚分。" }],

  ["Before the competition", { ru: "Перед соревнованием", tr: "Yarışmadan önce", ar: "قبل المسابقة", zh: "赛前" }],
  ["International Team Orientation", { ru: "Подготовка международных команд", tr: "Uluslararası Takım Oryantasyonu", ar: "توجيه الفرق الدولية", zh: "国际队适应训练" }],
  ["Foreign teams receive pre-exercise familiarisation before the competition begins.", { ru: "Иностранные команды проходят ознакомление перед началом соревнования.", tr: "Yabancı takımlar, yarışma başlamadan önce tatbikat öncesi tanıtım eğitimi alır.", ar: "تتلقى الفرق الأجنبية تدريبًا تعريفيًا قبل بدء المسابقة.", zh: "外国队在竞赛开始前接受赛前熟悉训练。" }],
  ["Foreign teams are given hands-on orientation in Pakistan Army weapons and systems, navigation, communications and CBRN drills — levelling the field before the exercise clock starts.", { ru: "Иностранные команды получают практическую подготовку по оружию и системам Пакистанской армии, навигации, связи и РХБЗ-приёмам (CBRN) — уравнивая условия до старта учения.", tr: "Yabancı takımlara Pakistan Ordusu silah ve sistemleri, seyrüsefer, muhabere ve CBRN talimlerinde uygulamalı oryantasyon verilir — tatbikat saati başlamadan önce şartlar eşitlenir.", ar: "تحصل الفرق الأجنبية على توجيه عملي على أسلحة وأنظمة الجيش الباكستاني والملاحة والاتصالات وتمارين CBRN — لتكافؤ الفرص قبل انطلاق ساعة التمرين.", zh: "外国队会就巴基斯坦陆军的武器与系统、导航、通信及 CBRN 演练接受实操适应训练——在演习计时开始前拉平起点。" }],

  ["Search events…", { ru: "Поиск этапов…", tr: "Etkinlik ara…", ar: "ابحث في الفعاليات…", zh: "搜索项目…" }],
  ["Search competition events", { ru: "Поиск соревновательных этапов", tr: "Yarışma etkinliklerinde ara", ar: "البحث في فعاليات المسابقة", zh: "搜索竞赛项目" }],
  ["All", { ru: "Все", tr: "Tümü", ar: "الكل", zh: "全部" }],
  ["View Details", { ru: "Подробнее", tr: "Ayrıntıları Gör", ar: "عرض التفاصيل", zh: "查看详情" }],
  ["Marks", { ru: "Баллы", tr: "Puan", ar: "درجات", zh: "分" }],
  ["Participants", { ru: "Участники", tr: "Katılımcılar", ar: "المشاركون", zh: "参与人员" }],
  ["Marks breakdown", { ru: "Разбивка баллов", tr: "Puan dağılımı", ar: "توزيع الدرجات", zh: "分数明细" }],
  ["Total marks for this event", { ru: "Всего баллов за этот этап", tr: "Bu etkinliğin toplam puanı", ar: "إجمالي درجات هذه الفعالية", zh: "该项目总分" }],
  ["No events match the current filters.", { ru: "Нет этапов, соответствующих текущим фильтрам.", tr: "Geçerli filtrelere uyan etkinlik yok.", ar: "لا توجد فعاليات تطابق عوامل التصفية الحالية.", zh: "没有符合当前筛选条件的项目。" }],

  /* ── Categories & difficulties (display labels; raw values drive logic) ─ */
  ["Inspection", { ru: "Осмотр", tr: "Teftiş", ar: "التفتيش", zh: "检查" }],
  ["Command", { ru: "Командование", tr: "Komuta", ar: "القيادة", zh: "指挥" }],
  ["Navigation", { ru: "Навигация", tr: "Seyrüsefer", ar: "الملاحة", zh: "导航" }],
  ["Reconnaissance", { ru: "Разведка", tr: "Keşif", ar: "الاستطلاع", zh: "侦察" }],
  ["Combat", { ru: "Бой", tr: "Muharebe", ar: "القتال", zh: "战斗" }],
  ["Medical", { ru: "Медицина", tr: "Sıhhiye", ar: "الطب", zh: "医疗" }],
  ["Intelligence", { ru: "Разведданные", tr: "İstihbarat", ar: "الاستخبارات", zh: "情报" }],
  ["Foundational", { ru: "Базовый", tr: "Temel", ar: "أساسي", zh: "基础" }],
  ["Standard", { ru: "Стандартный", tr: "Standart", ar: "قياسي", zh: "标准" }],
  ["Advanced", { ru: "Продвинутый", tr: "İleri", ar: "متقدم", zh: "高级" }],
  ["Extreme", { ru: "Экстремальный", tr: "Ekstrem", ar: "قصوى", zh: "极限" }],

  /* ── Timeline phases ───────────────────────────────────────────────── */
  ["Reception", { ru: "Приём", tr: "Karşılama", ar: "الاستقبال", zh: "接收" }],
  ["Movement", { ru: "Передвижение", tr: "Hareket", ar: "التحرك", zh: "机动" }],
  ["Skills", { ru: "Навыки", tr: "Beceriler", ar: "المهارات", zh: "技能" }],
  ["Recce", { ru: "Разведка", tr: "Keşif", ar: "الاستطلاع", zh: "侦察" }],
  ["Field", { ru: "Полевой этап", tr: "Saha", ar: "الميدان", zh: "野外" }],
  ["Response", { ru: "Реагирование", tr: "Müdahale", ar: "الاستجابة", zh: "响应" }],
  ["Endurance", { ru: "Выносливость", tr: "Dayanıklılık", ar: "التحمل", zh: "耐力" }],
  ["Closure", { ru: "Завершение", tr: "Kapanış", ar: "الختام", zh: "收尾" }],

  /* ── Stats ─────────────────────────────────────────────────────────── */
  ["Exercise Duration", { ru: "Продолжительность учения", tr: "Tatbikat Süresi", ar: "مدة التمرين", zh: "演习时长" }],
  ["Team Size", { ru: "Размер команды", tr: "Takım Mevcudu", ar: "حجم الفريق", zh: "队伍规模" }],
  ["Maximum Team Weight", { ru: "Максимальный вес команды", tr: "Azami Takım Ağırlığı", ar: "الحد الأقصى لوزن الفريق", zh: "队伍最大负重" }],
  ["Weapons", { ru: "Оружие", tr: "Silahlar", ar: "الأسلحة", zh: "武器" }],
  ["Discipline", { ru: "Направление", tr: "Disiplin", ar: "التخصص", zh: "科目" }],
  ["60 Hours", { ru: "60 часов", tr: "60 Saat", ar: "60 ساعة", zh: "60 小时" }],
  ["8 Members", { ru: "8 человек", tr: "8 Kişi", ar: "8 أفراد", zh: "8 名成员" }],
  ["Provided", { ru: "Предоставляется", tr: "Temin edilir", ar: "يُوفَّر", zh: "由主办方提供" }],
  ["Navigation & Tactical", { ru: "Навигация и тактика", tr: "Seyrüsefer ve taktik", ar: "الملاحة والتكتيك", zh: "导航与战术" }],
  ["Conducted over the exercise", { ru: "Проводятся в ходе учения", tr: "Tatbikat boyunca yapılır", ar: "تُجرى خلال التمرين", zh: "在演习期间进行" }],
  ["Continuous · no fixed rest", { ru: "Непрерывно · без фиксированного отдыха", tr: "Kesintisiz · sabit dinlenme yok", ar: "متواصل · دون راحة ثابتة", zh: "连续进行 · 无固定休息" }],
  ["One patrol per nation", { ru: "Один патруль от каждой страны", tr: "Her ülkeden bir devriye", ar: "دورية واحدة لكل دولة", zh: "每个国家一支巡逻队" }],
  ["All kit, water & ammunition", { ru: "Всё снаряжение, вода и боеприпасы", tr: "Tüm teçhizat, su ve mühimmat", ar: "كل العتاد والماء والذخيرة", zh: "全部装备、饮水与弹药" }],
  ["By the Pakistan Army", { ru: "Пакистанской армией", tr: "Pakistan Ordusu tarafından", ar: "من قِبَل الجيش الباكستاني", zh: "由巴基斯坦陆军提供" }],
  ["Sub-conventional scenarios", { ru: "Неконвенциональные сценарии", tr: "Konvansiyonel altı senaryolar", ar: "سيناريوهات دون تقليدية", zh: "亚常规想定" }],

  /* ── Overview cards ────────────────────────────────────────────────── */
  ["Assembly Area Start", { ru: "Начало в районе сбора", tr: "Toplanma Bölgesinde Başlangıç", ar: "الانطلاق من منطقة التجمع", zh: "集结地域出发" }],
  ["The exercise launches from a designated Assembly Area whose location is communicated to teams in advance.", { ru: "Учение начинается из назначенного района сбора, местоположение которого сообщается командам заранее.", tr: "Tatbikat, konumu takımlara önceden bildirilen belirlenmiş bir Toplanma Bölgesinden başlar.", ar: "ينطلق التمرين من منطقة تجمع محددة يُبلَّغ موقعها للفرق مسبقًا.", zh: "演习从指定的集结地域展开，该地域位置会提前通知各队。" }],
  ["Immediate Commencement", { ru: "Немедленное начало", tr: "Anında Başlama", ar: "البدء الفوري", zh: "立即开始" }],
  ["After arrival at the Assembly Area the exercise begins immediately — there is no acclimatisation window.", { ru: "После прибытия в район сбора учение начинается немедленно — времени на акклиматизацию не предусмотрено.", tr: "Toplanma Bölgesine varıştan sonra tatbikat hemen başlar — uyum sağlama süresi yoktur.", ar: "بعد الوصول إلى منطقة التجمع يبدأ التمرين فورًا — لا توجد فترة للتأقلم.", zh: "抵达集结地域后演习立即开始——没有适应缓冲时间。" }],
  ["≈ 60 Hours, Continuous", { ru: "≈ 60 часов, непрерывно", tr: "≈ 60 Saat, Kesintisiz", ar: "≈ 60 ساعة، متواصلة", zh: "≈ 60 小时，连续进行" }],
  ["The full competition lasts approximately 60 hours with no fixed sleeping or resting time allotted.", { ru: "Полное соревнование длится примерно 60 часов без выделенного времени на сон или отдых.", tr: "Yarışmanın tamamı yaklaşık 60 saat sürer ve belirli bir uyku ya da dinlenme süresi ayrılmaz.", ar: "تستغرق المسابقة كاملةً نحو 60 ساعة دون تخصيص وقت ثابت للنوم أو الراحة.", zh: "整场竞赛约持续 60 小时，不安排固定的睡眠或休息时间。" }],
  ["Independent or Combined", { ru: "Раздельно или совместно", tr: "Bağımsız veya Birleşik", ar: "منفصلة أو مجتمعة", zh: "独立或组合进行" }],
  ["Events are conducted either independently or in combination, back-to-back, throughout the exercise window.", { ru: "Этапы проводятся либо по отдельности, либо в сочетании, друг за другом, на протяжении всего учения.", tr: "Etkinlikler tatbikat boyunca ya bağımsız olarak ya da art arda birleşik biçimde yürütülür.", ar: "تُجرى الفعاليات إما منفصلة أو مجتمعة، تباعًا، على مدار فترة التمرين.", zh: "各项目在整个演习期间独立或组合、接连进行。" }],
  ["Scenarios On the Move", { ru: "Сценарии в движении", tr: "Hareket Hâlinde Senaryolar", ar: "السيناريوهات أثناء التحرك", zh: "行进中下达想定" }],
  ["Teams receive their tactical scenarios during the exercise rather than beforehand — planning happens under pressure.", { ru: "Команды получают тактические сценарии во время учения, а не заранее — планирование идёт под давлением.", tr: "Takımlar taktik senaryolarını önceden değil, tatbikat sırasında alır — planlama baskı altında yapılır.", ar: "تتلقى الفرق سيناريوهاتها التكتيكية أثناء التمرين لا قبله — ويجري التخطيط تحت الضغط.", zh: "各队在演习进行中而非事先接到战术想定——须在压力下完成计划。" }],

  /* ── Timeline labels & details ─────────────────────────────────────── */
  ["Arrival at Assembly Area", { ru: "Прибытие в район сбора", tr: "Toplanma Bölgesine Varış", ar: "الوصول إلى منطقة التجمع", zh: "抵达集结地域" }],
  ["Teams report to the Assembly Area; exercise clock starts.", { ru: "Команды прибывают в район сбора; отсчёт учения начинается.", tr: "Takımlar Toplanma Bölgesine katılır; tatbikat saati başlar.", ar: "تتوجه الفرق إلى منطقة التجمع؛ وتبدأ ساعة التمرين.", zh: "各队向集结地域报到；演习计时开始。" }],
  ["Initial Kit Inspection", { ru: "Первичный осмотр снаряжения", tr: "İlk Teçhizat Teftişi", ar: "التفتيش الأولي للعتاد", zh: "初始装备检查" }],
  ["Full team and equipment inspection; weight verified.", { ru: "Полный осмотр команды и снаряжения; вес проверяется.", tr: "Tam takım ve teçhizat teftişi; ağırlık doğrulanır.", ar: "تفتيش كامل للفريق والمعدات؛ ويُتحقَّق من الوزن.", zh: "全队与装备检查；核实负重。" }],
  ["Report Lines", { ru: "Рубежи донесений", tr: "Rapor Hatları", ar: "خطوط الإبلاغ", zh: "报告线" }],
  ["Cross imaginary report lines and report to Control HQ.", { ru: "Пересечение условных рубежей донесений и доклад в контрольный штаб (HQ).", tr: "Hayalî rapor hatlarını geçip Kontrol HQ'ya rapor verin.", ar: "اجتياز خطوط الإبلاغ الافتراضية والإبلاغ إلى مقر السيطرة HQ.", zh: "跨越假想报告线并向控制指挥部（HQ）报告。" }],
  ["Signal Communication", { ru: "Радиосвязь", tr: "Muhabere", ar: "الاتصالات اللاسلكية", zh: "通信联络" }],
  ["Voice procedure and handling of signal equipment.", { ru: "Правила радиообмена и работа с аппаратурой связи.", tr: "Telsiz konuşma usulü ve muhabere teçhizatının kullanımı.", ar: "إجراءات المحادثة اللاسلكية والتعامل مع معدات الاتصال.", zh: "话音规程与通信器材操作。" }],
  ["Recognition of Weapons", { ru: "Распознавание оружия", tr: "Silah Tanıma", ar: "التعرّف على الأسلحة", zh: "武器识别" }],
  ["Identify Chinese, Russian and NATO weapons.", { ru: "Опознавание китайского, российского и натовского оружия.", tr: "Çin, Rus ve NATO silahlarını tanıyın.", ar: "التعرّف على الأسلحة الصينية والروسية وأسلحة NATO.", zh: "识别中式、俄式及 NATO 武器。" }],
  ["Verbal Orders", { ru: "Устный боевой приказ", tr: "Sözlü Emirler", ar: "الأوامر الشفهية", zh: "口头命令" }],
  ["Patrol leader delivers verbal orders with a model.", { ru: "Командир патруля отдаёт устный приказ с использованием макета.", tr: "Devriye lideri, maket üzerinden sözlü emirleri verir.", ar: "يصدر قائد الدورية الأوامر الشفهية باستخدام مجسّم.", zh: "巡逻队长借助沙盘下达口头命令。" }],
  ["Navigation & Infiltration", { ru: "Навигация и проникновение", tr: "Seyrüsefer ve Sızma", ar: "الملاحة والتسلل", zh: "导航与渗透" }],
  ["Navigate terrorist-held ground on six-figure grids.", { ru: "Навигация по местности, удерживаемой террористами, по шестизначным координатам.", tr: "Teröristlerin elindeki araziyi altı haneli kılavuz karelerle geçin.", ar: "الملاحة في أرض يسيطر عليها الإرهابيون باستخدام إحداثيات من ستة أرقام.", zh: "以六位方格坐标在恐怖分子控制地域内导航。" }],
  ["Hideout Occupation", { ru: "Занятие укрытия", tr: "Saklanma Yerinin Tutulması", ar: "احتلال المخبأ", zh: "占领隐蔽点" }],
  ["Occupy a hideout and set defensive positions.", { ru: "Занять укрытие и оборудовать оборонительные позиции.", tr: "Bir saklanma yerini tutun ve savunma mevzilerini kurun.", ar: "احتلال مخبأ وإنشاء مواضع دفاعية.", zh: "占领隐蔽点并布设防御阵地。" }],
  ["Close Target Reconnaissance", { ru: "Ближняя разведка цели", tr: "Yakın Hedef Keşfi", ar: "استطلاع الهدف عن قرب", zh: "近距离目标侦察" }],
  ["Move to the FRV and reconnoitre the objective.", { ru: "Выдвижение к конечному пункту сбора (FRV) и разведка объекта.", tr: "FRV'ye ilerleyip hedefi keşfedin.", ar: "التحرك إلى نقطة الالتقاء الأخيرة FRV واستطلاع الهدف.", zh: "前出至最终集合点（FRV）并侦察目标。" }],
  ["Quick Battle Orders", { ru: "Краткий боевой приказ", tr: "Hızlı Muharebe Emirleri", ar: "أوامر القتال السريعة", zh: "快速战斗命令" }],
  ["Prepare an enlargement and deliver battle orders.", { ru: "Подготовить увеличенную схему и отдать боевой приказ.", tr: "Bir büyütme hazırlayıp muharebe emirlerini verin.", ar: "إعداد مخطط مُكبَّر وإصدار أوامر القتال.", zh: "制作放大图并下达战斗命令。" }],
  ["First Aid", { ru: "Первая помощь", tr: "İlk Yardım", ar: "الإسعافات الأولية", zh: "急救" }],
  ["Secure a heli crash site and treat casualties.", { ru: "Обеспечить безопасность места крушения вертолёта и оказать помощь пострадавшим.", tr: "Helikopter kaza yerini emniyete alıp yaralıları tedavi edin.", ar: "تأمين موقع تحطم مروحية وإسعاف المصابين.", zh: "控制直升机坠毁现场并救治伤员。" }],
  ["Landing Zone Selection", { ru: "Выбор площадки приземления", tr: "İniş Bölgesi Seçimi", ar: "اختيار منطقة الهبوط", zh: "着陆区选择" }],
  ["Select, mark and secure a helicopter landing zone.", { ru: "Выбрать, обозначить и обеспечить безопасность вертолётной площадки.", tr: "Bir helikopter iniş bölgesi seçin, işaretleyin ve emniyete alın.", ar: "اختيار منطقة هبوط للمروحية وتعليمها وتأمينها.", zh: "选择、标示并控制直升机着陆区。" }],
  ["AFOS / ATGP", { ru: "AFOS / ATGP", tr: "AFOS / ATGP", ar: "AFOS / ATGP", zh: "AFOS / ATGP" }],
  ["Conduct artillery observation on the simulator.", { ru: "Проведение артиллерийской корректировки на симуляторе.", tr: "Simülatörde topçu gözetlemesi yapın.", ar: "إجراء رصد مدفعي على المحاكي.", zh: "在模拟器上实施火炮观察。" }],
  ["Counter Ambush", { ru: "Противодействие засаде", tr: "Pusuya Karşı Koyma", ar: "مواجهة الكمين", zh: "反伏击" }],
  ["React to and negotiate an ambush site.", { ru: "Реагировать на засаду и преодолеть её участок.", tr: "Bir pusu bölgesine tepki verin ve onu aşın.", ar: "الاستجابة لموقع كمين واجتيازه.", zh: "对伏击点作出反应并通过。" }],
  ["Minefield Negotiation", { ru: "Преодоление минного поля", tr: "Mayın Tarlası Geçişi", ar: "اجتياز حقل الألغام", zh: "雷场通过" }],
  ["Negotiate mine and IED prone areas tactically.", { ru: "Тактически преодолеть участки, опасные по минам и СВУ (IED).", tr: "Mayın ve IED riskli bölgeleri taktik olarak geçin.", ar: "اجتياز المناطق المعرضة للألغام والعبوات الناسفة IED تكتيكيًا.", zh: "以战术方式通过雷场及 IED 高风险地域。" }],
  ["Water Crossing", { ru: "Форсирование водной преграды", tr: "Su Geçişi", ar: "عبور المسطح المائي", zh: "涉水渡越" }],
  ["Cross a 40–50 m water obstacle with full kit.", { ru: "Форсировать водную преграду шириной 40–50 м в полной выкладке.", tr: "Tam teçhizatla 40–50 m'lik bir su engelini geçin.", ar: "عبور عائق مائي بعرض 40–50 م بكامل العتاد.", zh: "携带全套装备渡越 40–50 米宽的水障。" }],
  ["Incident Site", { ru: "Место происшествия", tr: "Olay Yeri", ar: "موقع الحادث", zh: "事件现场" }],
  ["Respond to a civilian casualty incident.", { ru: "Реагировать на происшествие с пострадавшими среди гражданских.", tr: "Bir sivil yaralı olayına müdahale edin.", ar: "الاستجابة لحادث إصابة بين المدنيين.", zh: "处置涉及平民伤员的事件。" }],
  ["Firing", { ru: "Стрельба", tr: "Atış", ar: "الرماية", zh: "射击" }],
  ["Engage figure targets with SMG at 100–200 m.", { ru: "Поражение ростовых мишеней из SMG на 100–200 м.", tr: "100–200 m'de SMG ile figür hedeflere ateş edin.", ar: "إصابة أهداف شخوصية بسلاح SMG من مسافة 100–200 م.", zh: "在 100–200 米用 SMG 射击人形靶。" }],
  ["Stranger Handling", { ru: "Обращение с незнакомцем", tr: "Yabancıyla Muhatap Olma", ar: "التعامل مع الغرباء", zh: "陌生人应对" }],
  ["Gather intelligence from civilians securely.", { ru: "Безопасно собрать разведданные у гражданских.", tr: "Sivillerden güvenli biçimde istihbarat toplayın.", ar: "جمع المعلومات من المدنيين بأمان.", zh: "安全地从平民处收集情报。" }],
  ["CBRN", { ru: "CBRN (РХБЗ)", tr: "CBRN", ar: "CBRN", zh: "CBRN" }],
  ["Respond to a chemical attack in MOPP Level 4.", { ru: "Реагировать на химическую атаку в комплекте MOPP Level 4.", tr: "MOPP Level 4 ile bir kimyasal saldırıya müdahale edin.", ar: "الاستجابة لهجوم كيميائي بمستوى MOPP Level 4.", zh: "在 MOPP Level 4 防护下应对化学袭击。" }],
  ["Speed March", { ru: "Форсированный марш", tr: "Sürat Yürüyüşü", ar: "المسير السريع", zh: "急行军" }],
  ["March 4–5 km carrying a 60 kg dummy casualty.", { ru: "Марш 4–5 км с переноской 60-кг манекена-пострадавшего.", tr: "60 kg'lık cansız yaralı taşıyarak 4–5 km yürüyün.", ar: "المسير 4–5 كم مع حمل مصاب صوري وزنه 60 كغ.", zh: "背负 60 公斤假伤员行进 4–5 公里。" }],
  ["Media Handling", { ru: "Работа со СМИ", tr: "Medya Yönetimi", ar: "التعامل مع الإعلام", zh: "媒体应对" }],
  ["Captain handles a media interaction.", { ru: "Капитан ведёт взаимодействие со СМИ.", tr: "Takım kaptanı bir medya etkileşimini yönetir.", ar: "يتولى القائد التعامل مع تفاعل إعلامي.", zh: "队长处理一次媒体互动。" }],
  ["Exfiltration", { ru: "Отход", tr: "Tahliye", ar: "الانسحاب", zh: "撤离" }],
  ["Navigate out through hostile territory.", { ru: "Навигация на выход через враждебную территорию.", tr: "Düşman arazisinden geçerek dışarı yön bulun.", ar: "الملاحة للخروج عبر أرض معادية.", zh: "穿越敌对地域向外导航。" }],
  ["Section Assault", { ru: "Штурм отделением", tr: "Manga Taarruzu", ar: "هجوم الفصيلة", zh: "班级突击" }],
  ["Clear a terrorist hideout or compound.", { ru: "Зачистка укрытия или объекта террористов.", tr: "Bir terörist saklanma yerini veya tesisi temizleyin.", ar: "تطهير مخبأ إرهابي أو مجمّع.", zh: "清剿恐怖分子隐蔽点或据点。" }],
  ["CTR Report Submission", { ru: "Подача отчёта CTR", tr: "CTR Raporu Sunumu", ar: "تقديم تقرير CTR", zh: "提交 CTR 报告" }],
  ["Submit a one-hour written mission report.", { ru: "Подать письменный отчёт о задаче за один час.", tr: "Bir saatlik yazılı görev raporu sunun.", ar: "تقديم تقرير مهمة مكتوب خلال ساعة واحدة.", zh: "在一小时内提交书面任务报告。" }],
  ["Captured Terrorist Handling", { ru: "Обращение с захваченным террористом", tr: "Yakalanan Teröristin Muamelesi", ar: "التعامل مع إرهابي مأسور", zh: "被俘恐怖分子处置" }],
  ["Apply apprehension and Geneva Convention drills.", { ru: "Применить приёмы задержания и нормы Женевской конвенции.", tr: "Yakalama ve Cenevre Sözleşmesi talimlerini uygulayın.", ar: "تطبيق تمارين الاعتقال واتفاقية جنيف.", zh: "运用抓捕与《日内瓦公约》相关演练。" }],
  ["Terminal Kit Inspection", { ru: "Заключительный осмотр снаряжения", tr: "Son Teçhizat Teftişi", ar: "التفتيش النهائي للعتاد", zh: "最终装备检查" }],
  ["Final kit inspection and weight verification.", { ru: "Заключительный осмотр снаряжения и проверка веса.", tr: "Son teçhizat teftişi ve ağırlık doğrulaması.", ar: "التفتيش النهائي للعتاد والتحقق من الوزن.", zh: "最终装备检查与负重核实。" }],
  ["Debriefing", { ru: "Разбор итогов", tr: "Değerlendirme Toplantısı", ar: "استخلاص المعلومات", zh: "总结汇报" }],
  ["Captain presents the exercise summary to umpires.", { ru: "Капитан представляет судьям сводку по учению.", tr: "Takım kaptanı tatbikat özetini hakemlere sunar.", ar: "يقدّم القائد ملخص التمرين إلى الحكّام.", zh: "队长向裁判呈报演习总结。" }],

  /* ── Event durations ───────────────────────────────────────────────── */
  ["45 min", { ru: "45 мин", tr: "45 dk", ar: "45 دقيقة", zh: "45 分钟" }],
  ["Throughout", { ru: "На протяжении всего учения", tr: "Tatbikat boyunca", ar: "طوال التمرين", zh: "全程" }],
  ["30 min", { ru: "30 мин", tr: "30 dk", ar: "30 دقيقة", zh: "30 分钟" }],
  ["60 min (30 prep + 30 delivery)", { ru: "60 мин (30 подготовка + 30 доклад)", tr: "60 dk (30 hazırlık + 30 sunum)", ar: "60 دقيقة (30 تحضير + 30 إلقاء)", zh: "60 分钟（30 准备 + 30 下达）" }],
  ["Timed", { ru: "На время", tr: "Süreli", ar: "موقوت", zh: "计时" }],
  ["90 min", { ru: "90 мин", tr: "90 dk", ar: "90 دقيقة", zh: "90 分钟" }],
  ["40 min", { ru: "40 мин", tr: "40 dk", ar: "40 دقيقة", zh: "40 分钟" }],
  ["20 min", { ru: "20 мин", tr: "20 dk", ar: "20 دقيقة", zh: "20 分钟" }],
  ["3 min serial", { ru: "Этап 3 мин", tr: "3 dk'lık seri", ar: "فعالية 3 دقائق", zh: "3 分钟科目" }],
  ["45 min qualifying", { ru: "Квалификация 45 мин", tr: "45 dk baraj", ar: "تأهيل 45 دقيقة", zh: "45 分钟达标" }],
  ["40 min qualifying", { ru: "Квалификация 40 мин", tr: "40 dk baraj", ar: "تأهيل 40 دقيقة", zh: "40 分钟达标" }],
  ["15 min", { ru: "15 мин", tr: "15 dk", ar: "15 دقيقة", zh: "15 分钟" }],
  ["60 min", { ru: "60 мин", tr: "60 dk", ar: "60 دقيقة", zh: "60 分钟" }],

  /* ── Event participants ────────────────────────────────────────────── */
  ["3 members (excluding captain)", { ru: "3 человека (без капитана)", tr: "3 kişi (kaptan hariç)", ar: "3 أفراد (باستثناء القائد)", zh: "3 名成员（不含队长）" }],
  ["2 members", { ru: "2 человека", tr: "2 kişi", ar: "فردان", zh: "2 名成员" }],

  /* ── Event titles ──────────────────────────────────────────────────── */
  ["Recognition of Weapons & Equipment", { ru: "Распознавание оружия и снаряжения", tr: "Silah ve Teçhizat Tanıma", ar: "التعرّف على الأسلحة والمعدات", zh: "武器与装备识别" }],
  ["Infiltration / Navigation", { ru: "Проникновение / навигация", tr: "Sızma / Seyrüsefer", ar: "التسلل / الملاحة", zh: "渗透 / 导航" }],
  ["Occupation of Hideout", { ru: "Занятие укрытия", tr: "Saklanma Yerinin Tutulması", ar: "احتلال المخبأ", zh: "占领隐蔽点" }],
  ["Heli Crash & First Aid", { ru: "Крушение вертолёта и первая помощь", tr: "Helikopter Kazası ve İlk Yardım", ar: "تحطم مروحية والإسعافات الأولية", zh: "直升机坠毁与急救" }],
  ["AFOS / ATGP Simulator", { ru: "Симулятор AFOS / ATGP", tr: "AFOS / ATGP Simülatörü", ar: "محاكي AFOS / ATGP", zh: "AFOS / ATGP 模拟器" }],
  ["Minefield / IED Negotiation", { ru: "Преодоление минного поля / СВУ (IED)", tr: "Mayın Tarlası / IED Geçişi", ar: "اجتياز حقل الألغام / العبوات الناسفة IED", zh: "雷场 / IED 通过" }],
  ["Dealing with Stranger", { ru: "Обращение с незнакомцем", tr: "Yabancıyla Muhatap Olma", ar: "التعامل مع الغرباء", zh: "陌生人应对" }],
  ["CBRN Test", { ru: "Тест CBRN (РХБЗ)", tr: "CBRN Testi", ar: "اختبار CBRN", zh: "CBRN 测试" }],
  ["Exfiltration / Navigation", { ru: "Отход / навигация", tr: "Tahliye / Seyrüsefer", ar: "الانسحاب / الملاحة", zh: "撤离 / 导航" }],
  ["Submission of CTR Report", { ru: "Подача отчёта CTR", tr: "CTR Raporunun Sunulması", ar: "تقديم تقرير CTR", zh: "提交 CTR 报告" }],
  ["Handling of Captured Terrorist", { ru: "Обращение с захваченным террористом", tr: "Yakalanan Teröristin Muamelesi", ar: "التعامل مع إرهابي مأسور", zh: "被俘恐怖分子处置" }],

  /* ── Event summaries ───────────────────────────────────────────────── */
  ["Full team and equipment inspection with a hard 200 KG weight ceiling.", { ru: "Полный осмотр команды и снаряжения с жёстким лимитом веса 200 KG.", tr: "Kesin 200 KG ağırlık tavanıyla tam takım ve teçhizat teftişi.", ar: "تفتيش كامل للفريق والمعدات بسقف وزن صارم قدره 200 KG.", zh: "全队与装备检查，硬性负重上限 200 KG。" }],
  ["Report to Control HQ on crossing each of five report lines.", { ru: "Доклад в контрольный штаб (HQ) при пересечении каждого из пяти рубежей донесений.", tr: "Beş rapor hattının her birini geçerken Kontrol HQ'ya rapor verin.", ar: "الإبلاغ إلى مقر السيطرة HQ عند عبور كل خط من خطوط الإبلاغ الخمسة.", zh: "跨越五条报告线中的每一条时向控制指挥部（HQ）报告。" }],
  ["Voice procedure, equipment handling and theory tested on three members.", { ru: "Радиообмен, работа с аппаратурой и теория проверяются у трёх человек.", tr: "Telsiz usulü, teçhizat kullanımı ve teori üç kişide sınanır.", ar: "اختبار إجراءات المحادثة والتعامل مع المعدات والنظرية على ثلاثة أفراد.", zh: "对三名成员测试话音规程、器材操作与理论。" }],
  ["Identify Chinese, Russian and NATO weapons from replicas or photographs.", { ru: "Опознавание китайского, российского и натовского оружия по макетам или фотографиям.", tr: "Çin, Rus ve NATO silahlarını maket veya fotoğraflardan tanıyın.", ar: "التعرّف على الأسلحة الصينية والروسية وأسلحة NATO من مجسّمات أو صور.", zh: "从复制品或照片中识别中式、俄式及 NATO 武器。" }],
  ["Patrol leader delivers verbal orders in English with a terrain model.", { ru: "Командир патруля отдаёт устный приказ на английском с использованием макета местности.", tr: "Devriye lideri, arazi maketiyle sözlü emirleri İngilizce verir.", ar: "يصدر قائد الدورية الأوامر الشفهية بالإنجليزية باستخدام مجسّم للأرض.", zh: "巡逻队长借助地形沙盘用英语下达口头命令。" }],
  ["Navigate terrorist-controlled ground using six-figure grid references.", { ru: "Навигация по местности под контролем террористов по шестизначным координатам.", tr: "Altı haneli kılavuz kareleri kullanarak teröristlerin kontrolündeki araziyi geçin.", ar: "الملاحة في أرض يسيطر عليها الإرهابيون باستخدام إحداثيات من ستة أرقام.", zh: "使用六位方格坐标在恐怖分子控制地域内导航。" }],
  ["Occupy a hideout, establish defence and rehearse response drills.", { ru: "Занять укрытие, организовать оборону и отработать приёмы реагирования.", tr: "Bir saklanma yerini tutun, savunmayı kurun ve müdahale talimlerini prova edin.", ar: "احتلال مخبأ وإقامة الدفاع والتدرب على تمارين الاستجابة.", zh: "占领隐蔽点、组织防御并演练响应科目。" }],
  ["Move to the Final RV, close on the target and reconnoitre it.", { ru: "Выдвинуться к конечному пункту сбора (RV), сблизиться с целью и разведать её.", tr: "Son RV'ye ilerleyin, hedefe yaklaşın ve keşfini yapın.", ar: "التحرك إلى نقطة الالتقاء الأخيرة RV والاقتراب من الهدف واستطلاعه.", zh: "前出至最终集合点（RV），逼近并侦察目标。" }],
  ["Patrol leader builds an enlargement and delivers quick battle orders.", { ru: "Командир патруля готовит увеличенную схему и отдаёт краткий боевой приказ.", tr: "Devriye lideri bir büyütme hazırlar ve hızlı muharebe emirlerini verir.", ar: "يُعدّ قائد الدورية مخططًا مُكبَّرًا ويصدر أوامر القتال السريعة.", zh: "巡逻队长制作放大图并下达快速战斗命令。" }],
  ["Secure a crash site, rescue survivors and administer first aid.", { ru: "Обеспечить безопасность места крушения, спасти выживших и оказать первую помощь.", tr: "Kaza yerini emniyete alın, hayatta kalanları kurtarın ve ilk yardım uygulayın.", ar: "تأمين موقع التحطم وإنقاذ الناجين وتقديم الإسعافات الأولية.", zh: "控制坠毁现场、救援幸存者并实施急救。" }],
  ["Select, mark and secure a helicopter landing zone near the base.", { ru: "Выбрать, обозначить и обеспечить безопасность вертолётной площадки возле базы.", tr: "Üs yakınında bir helikopter iniş bölgesi seçin, işaretleyin ve emniyete alın.", ar: "اختيار منطقة هبوط للمروحية قرب القاعدة وتعليمها وتأمينها.", zh: "在基地附近选择、标示并控制直升机着陆区。" }],
  ["Two members conduct artillery observation on the simulator.", { ru: "Двое участников проводят артиллерийскую корректировку на симуляторе.", tr: "İki kişi simülatörde topçu gözetlemesi yapar.", ar: "يجري فردان رصدًا مدفعيًا على المحاكي.", zh: "两名成员在模拟器上实施火炮观察。" }],
  ["React to an ambush and execute counter-ambush drills.", { ru: "Реагировать на засаду и выполнить противозасадные приёмы.", tr: "Bir pusuya tepki verin ve pusuya karşı talimleri uygulayın.", ar: "الاستجابة لكمين وتنفيذ تمارين مواجهة الكمين.", zh: "对伏击作出反应并执行反伏击科目。" }],
  ["Negotiate mine and IED prone areas with correct procedures.", { ru: "Преодолеть участки, опасные по минам и СВУ (IED), с соблюдением правил.", tr: "Mayın ve IED riskli bölgeleri doğru usullerle geçin.", ar: "اجتياز المناطق المعرضة للألغام والعبوات الناسفة IED بالإجراءات الصحيحة.", zh: "以正确程序通过雷场及 IED 高风险地域。" }],
  ["Cross a 40–50 m water obstacle with full equipment.", { ru: "Форсировать водную преграду 40–50 м в полной выкладке.", tr: "Tam teçhizatla 40–50 m'lik bir su engelini geçin.", ar: "عبور عائق مائي بعرض 40–50 م بكامل المعدات.", zh: "携带全套装备渡越 40–50 米宽的水障。" }],
  ["Respond to a casualty incident involving civilians.", { ru: "Реагировать на происшествие с пострадавшими среди гражданских.", tr: "Sivillerin dâhil olduğu bir yaralı olayına müdahale edin.", ar: "الاستجابة لحادث إصابة يشمل مدنيين.", zh: "处置涉及平民的伤员事件。" }],
  ["Engage figure targets with SMG at 100–200 m — 8 rounds, 3 minutes.", { ru: "Поражение ростовых мишеней из SMG на 100–200 м — 8 патронов, 3 минуты.", tr: "100–200 m'de SMG ile figür hedeflere ateş edin — 8 mermi, 3 dakika.", ar: "إصابة أهداف شخوصية بسلاح SMG من 100–200 م — 8 طلقات في 3 دقائق.", zh: "在 100–200 米用 SMG 射击人形靶——8 发，3 分钟。" }],
  ["Gather intelligence from civilians while keeping operational security.", { ru: "Собрать разведданные у гражданских, сохраняя оперативную безопасность.", tr: "Harekât güvenliğini korurken sivillerden istihbarat toplayın.", ar: "جمع المعلومات من المدنيين مع الحفاظ على أمن العمليات.", zh: "在保持行动保密的同时从平民处收集情报。" }],
  ["Respond to a chemical attack in MOPP Level 4 kit.", { ru: "Реагировать на химическую атаку в комплекте MOPP Level 4.", tr: "MOPP Level 4 teçhizatıyla bir kimyasal saldırıya müdahale edin.", ar: "الاستجابة لهجوم كيميائي بعتاد MOPP Level 4.", zh: "在 MOPP Level 4 防护装具下应对化学袭击。" }],
  ["Cover 4–5 km carrying a 60 KG dummy casualty; 40 min to qualify.", { ru: "Пройти 4–5 км с 60-кг манекеном-пострадавшим; квалификация — 40 мин.", tr: "60 KG'lık cansız yaralı taşıyarak 4–5 km gidin; baraj süresi 40 dk.", ar: "قطع 4–5 كم مع حمل مصاب صوري وزنه 60 KG؛ زمن التأهل 40 دقيقة.", zh: "背负 60 KG 假伤员行进 4–5 公里；40 分钟内达标。" }],
  ["Captain's media interaction and communication skills assessed.", { ru: "Оценивается взаимодействие капитана со СМИ и его навыки коммуникации.", tr: "Kaptanın medya etkileşimi ve iletişim becerileri değerlendirilir.", ar: "يُقيَّم تفاعل القائد الإعلامي ومهاراته في التواصل.", zh: "评估队长的媒体互动与沟通能力。" }],
  ["Navigate out through hostile territory under tactical movement.", { ru: "Навигация на выход через враждебную территорию с тактическим передвижением.", tr: "Taktik hareketle düşman arazisinden geçerek dışarı yön bulun.", ar: "الملاحة للخروج عبر أرض معادية مع الحركة التكتيكية.", zh: "以战术机动穿越敌对地域向外导航。" }],
  ["Clear a terrorist hideout or compound; hostage rescue possible.", { ru: "Зачистка укрытия или объекта террористов; возможно освобождение заложников.", tr: "Bir terörist saklanma yerini veya tesisi temizleyin; rehine kurtarma olabilir.", ar: "تطهير مخبأ إرهابي أو مجمّع؛ مع احتمال إنقاذ رهائن.", zh: "清剿恐怖分子隐蔽点或据点；可能含人质解救。" }],
  ["One-hour written report on mission, terrain, enemy and chronology.", { ru: "Часовой письменный отчёт о задаче, местности, противнике и хронологии.", tr: "Görev, arazi, düşman ve kronoloji üzerine bir saatlik yazılı rapor.", ar: "تقرير مكتوب خلال ساعة عن المهمة والأرض والعدو والتسلسل الزمني.", zh: "关于任务、地形、敌情与时序的一小时书面报告。" }],
  ["Apprehension technique and Geneva Convention knowledge assessed.", { ru: "Оцениваются приёмы задержания и знание Женевской конвенции.", tr: "Yakalama tekniği ve Cenevre Sözleşmesi bilgisi değerlendirilir.", ar: "يُقيَّم أسلوب الاعتقال ومعرفة اتفاقية جنيف.", zh: "评估抓捕技巧与《日内瓦公约》知识。" }],
  ["Final equipment inspection and verification of the 200 KG weight.", { ru: "Заключительный осмотр снаряжения и проверка веса 200 KG.", tr: "Son teçhizat teftişi ve 200 KG ağırlığının doğrulanması.", ar: "التفتيش النهائي للمعدات والتحقق من وزن 200 KG.", zh: "最终装备检查与 200 KG 负重核实。" }],
  ["Captain presents the exercise summary; umpires question the team.", { ru: "Капитан представляет сводку по учению; судьи задают команде вопросы.", tr: "Kaptan tatbikat özetini sunar; hakemler takıma soru sorar.", ar: "يقدّم القائد ملخص التمرين؛ ويوجّه الحكّام أسئلة للفريق.", zh: "队长呈报演习总结；裁判向队伍提问。" }],

  /* ── Event details ─────────────────────────────────────────────────── */
  ["Inspect the complete team and all equipment and verify that the kit is serviceable. Total team weight — including filled water bottles, Harris wireless set, batteries, weapons, ammunition and tracker — must not exceed 200 KG.", { ru: "Осмотреть всю команду и всё снаряжение и убедиться в его исправности. Суммарный вес команды — включая наполненные фляги, радиостанцию Harris, батареи, оружие, боеприпасы и трекер — не должен превышать 200 KG.", tr: "Tüm takımı ve bütün teçhizatı teftiş edin ve teçhizatın kullanılabilir olduğunu doğrulayın. Dolu mataralar, Harris telsizi, piller, silahlar, mühimmat ve tracker dâhil toplam takım ağırlığı 200 KG'yi aşmamalıdır.", ar: "افحص الفريق كاملًا وكل المعدات وتحقق من صلاحية العتاد. يجب ألا يتجاوز وزن الفريق الإجمالي — بما في ذلك زجاجات الماء الممتلئة وجهاز Harris اللاسلكي والبطاريات والأسلحة والذخيرة وجهاز التتبع — 200 KG.", zh: "检查全队及全部装备，确认器材可用。队伍总重（含灌满的水壶、Harris 无线电台、电池、武器、弹药及追踪器）不得超过 200 KG。" }],
  ["Teams cross imaginary report lines during infiltration and exfiltration and must report to Control Headquarters at each. Five report lines exist, each carrying 10 marks.", { ru: "Во время проникновения и отхода команды пересекают условные рубежи донесений и обязаны докладывать в контрольный штаб на каждом. Всего пять рубежей, каждый по 10 баллов.", tr: "Takımlar sızma ve tahliye sırasında hayalî rapor hatlarını geçer ve her birinde Kontrol Karargâhına rapor vermelidir. Beş rapor hattı vardır, her biri 10 puandır.", ar: "تعبر الفرق خطوط الإبلاغ الافتراضية أثناء التسلل والانسحاب وعليها الإبلاغ إلى مقر السيطرة عند كل خط. توجد خمسة خطوط إبلاغ، كل منها بـ 10 درجات.", zh: "各队在渗透与撤离途中跨越假想报告线，并须在每条线向控制指挥部报告。共有五条报告线，每条 10 分。" }],
  ["Voice procedure, handling of signal equipment, practical handling and theoretical knowledge are tested. Three participants excluding the captain are selected for assessment.", { ru: "Проверяются радиообмен, работа с аппаратурой связи, практические навыки и теоретические знания. Для оценки отбираются три участника, кроме капитана.", tr: "Telsiz usulü, muhabere teçhizatının kullanımı, pratik kullanım ve teorik bilgi sınanır. Değerlendirme için kaptan hariç üç katılımcı seçilir.", ar: "تُختبر إجراءات المحادثة والتعامل مع معدات الاتصال والمهارة العملية والمعرفة النظرية. يُختار ثلاثة مشاركين باستثناء القائد للتقييم.", zh: "测试话音规程、通信器材操作、实操与理论知识。选取不含队长的三名成员进行评估。" }],
  ["Recognition of Chinese, Russian and NATO weapons using replicas or photographs. Three participants excluding the captain participate in the assessment.", { ru: "Опознавание китайского, российского и натовского оружия по макетам или фотографиям. В оценке участвуют три человека, кроме капитана.", tr: "Maket veya fotoğraflarla Çin, Rus ve NATO silahlarının tanınması. Değerlendirmeye kaptan hariç üç katılımcı katılır.", ar: "التعرّف على الأسلحة الصينية والروسية وأسلحة NATO باستخدام مجسّمات أو صور. يشارك في التقييم ثلاثة أفراد باستثناء القائد.", zh: "使用复制品或照片识别中式、俄式及 NATO 武器。由不含队长的三名成员参加评估。" }],
  ["The patrol leader delivers verbal orders in English (the native language is also allowed). Preparation time is 30 minutes and presentation time is 30 minutes.", { ru: "Командир патруля отдаёт устный приказ на английском (допускается и родной язык). Время подготовки — 30 минут, время доклада — 30 минут.", tr: "Devriye lideri sözlü emirleri İngilizce verir (ana dil de kabul edilir). Hazırlık süresi 30 dakika, sunum süresi 30 dakikadır.", ar: "يصدر قائد الدورية الأوامر الشفهية بالإنجليزية (ويُسمح باللغة الأم أيضًا). زمن التحضير 30 دقيقة وزمن الإلقاء 30 دقيقة.", zh: "巡逻队长用英语下达口头命令（也允许使用母语）。准备时间 30 分钟，讲解时间 30 分钟。" }],
  ["Teams navigate through terrorist-controlled territory using six-figure grid references, maintaining tactical drills throughout the move.", { ru: "Команды осуществляют навигацию по территории под контролем террористов по шестизначным координатам, соблюдая тактические приёмы на всём протяжении движения.", tr: "Takımlar altı haneli kılavuz kareleri kullanarak teröristlerin kontrolündeki araziyi geçer ve hareket boyunca taktik talimleri sürdürür.", ar: "تتنقّل الفرق عبر أرض يسيطر عليها الإرهابيون باستخدام إحداثيات من ستة أرقام مع الحفاظ على التمارين التكتيكية طوال التحرك.", zh: "各队使用六位方格坐标在恐怖分子控制地域内导航，全程保持战术动作。" }],
  ["Teams occupy a selected hideout, establish defensive positions and perform the appropriate response drills.", { ru: "Команды занимают выбранное укрытие, оборудуют оборонительные позиции и выполняют соответствующие приёмы реагирования.", tr: "Takımlar seçilen bir saklanma yerini tutar, savunma mevzileri kurar ve uygun müdahale talimlerini yapar.", ar: "تحتل الفرق مخبأً مختارًا وتنشئ مواضع دفاعية وتنفّذ تمارين الاستجابة المناسبة.", zh: "各队占领选定的隐蔽点，布设防御阵地并实施相应的响应科目。" }],
  ["Evaluate the move to the Final Rendezvous, the movement to the target area, and the reconnaissance of the objective.", { ru: "Оцениваются выдвижение к конечному пункту сбора, движение к району цели и разведка объекта.", tr: "Son Buluşma Noktasına ilerleme, hedef bölgeye hareket ve hedefin keşfi değerlendirilir.", ar: "يُقيَّم التحرك إلى نقطة الالتقاء الأخيرة، والتحرك إلى منطقة الهدف، واستطلاع الهدف.", zh: "评估向最终集合点的前出、向目标区域的机动以及对目标的侦察。" }],
  ["The patrol leader prepares an enlargement / model and delivers quick battle orders to the team.", { ru: "Командир патруля готовит увеличенную схему / макет и отдаёт команде краткий боевой приказ.", tr: "Devriye lideri bir büyütme / maket hazırlar ve takıma hızlı muharebe emirlerini verir.", ar: "يُعدّ قائد الدورية مخططًا مُكبَّرًا / مجسّمًا ويصدر أوامر القتال السريعة للفريق.", zh: "巡逻队长制作放大图/沙盘，并向队伍下达快速战斗命令。" }],
  ["Secure a helicopter crash site, rescue survivors, recover important documents and administer first aid to the casualties.", { ru: "Обеспечить безопасность места крушения вертолёта, спасти выживших, изъять важные документы и оказать первую помощь пострадавшим.", tr: "Helikopter kaza yerini emniyete alın, hayatta kalanları kurtarın, önemli belgeleri kurtarın ve yaralılara ilk yardım uygulayın.", ar: "تأمين موقع تحطم مروحية وإنقاذ الناجين واستعادة الوثائق المهمة وتقديم الإسعافات الأولية للمصابين.", zh: "控制直升机坠毁现场、救援幸存者、取回重要文件并对伤员实施急救。" }],
  ["Select and mark a helicopter landing zone near the patrol base. Securing the landing zone and correctly signalling helicopters are evaluated.", { ru: "Выбрать и обозначить вертолётную площадку возле базы патруля. Оцениваются обеспечение безопасности площадки и правильная сигнализация вертолётам.", tr: "Devriye üssü yakınında bir helikopter iniş bölgesi seçip işaretleyin. İniş bölgesinin emniyete alınması ve helikopterlere doğru işaret verilmesi değerlendirilir.", ar: "اختيار منطقة هبوط للمروحية قرب قاعدة الدورية وتعليمها. يُقيَّم تأمين منطقة الهبوط والإشارة الصحيحة للمروحيات.", zh: "在巡逻基地附近选择并标示直升机着陆区。评估对着陆区的控制及对直升机的正确信号指示。" }],
  ["Two team members conduct artillery observation using the AFOS / ATGP simulator while the remaining team waits outside.", { ru: "Двое участников проводят артиллерийскую корректировку на симуляторе AFOS / ATGP, пока остальная команда ждёт снаружи.", tr: "İki takım üyesi AFOS / ATGP simülatörünü kullanarak topçu gözetlemesi yaparken takımın geri kalanı dışarıda bekler.", ar: "يجري فردان من الفريق رصدًا مدفعيًا باستخدام محاكي AFOS / ATGP بينما ينتظر بقية الفريق في الخارج.", zh: "两名队员使用 AFOS / ATGP 模拟器实施火炮观察，其余队员在外等候。" }],
  ["Drills, reactions and tactical procedures are evaluated while the team negotiates an ambush site.", { ru: "Оцениваются приёмы, реакции и тактические действия при преодолении командой участка засады.", tr: "Takım bir pusu bölgesini aşarken talimler, tepkiler ve taktik usuller değerlendirilir.", ar: "تُقيَّم التمارين وردود الفعل والإجراءات التكتيكية بينما يجتاز الفريق موقع كمين.", zh: "在队伍通过伏击点时，评估各项动作、反应与战术程序。" }],
  ["Teams negotiate minefields and improvised explosive device prone areas using proper tactical procedures.", { ru: "Команды преодолевают минные поля и участки, опасные по самодельным взрывным устройствам, применяя надлежащие тактические действия.", tr: "Takımlar uygun taktik usulleri kullanarak mayın tarlalarını ve el yapımı patlayıcı riskli bölgeleri geçer.", ar: "تجتاز الفرق حقول الألغام والمناطق المعرضة للعبوات الناسفة المرتجلة باستخدام إجراءات تكتيكية سليمة.", zh: "各队采用正确战术程序通过雷场及简易爆炸装置高风险地域。" }],
  ["Cross a 40–50 metre water obstacle with full equipment, waterproofing kit and securing both banks during the tactical crossing.", { ru: "Форсировать водную преграду шириной 40–50 метров в полной выкладке, гидроизолировав снаряжение и обеспечив безопасность обоих берегов при тактическом форсировании.", tr: "Tam teçhizatla 40–50 metrelik bir su engelini geçin; teçhizatı su geçirmez hâle getirin ve taktik geçiş sırasında her iki kıyıyı emniyete alın.", ar: "عبور عائق مائي بعرض 40–50 مترًا بكامل المعدات، مع عزلها عن الماء وتأمين الضفتين أثناء العبور التكتيكي.", zh: "携带全套装备渡越 40–50 米宽的水障，做好装备防水并在战术渡越期间控制两岸。" }],
  ["Respond to a casualty incident involving civilians — securing the area, controlling the crowd and evacuating casualties.", { ru: "Реагировать на происшествие с пострадавшими среди гражданских — обеспечить безопасность района, контролировать толпу и эвакуировать пострадавших.", tr: "Sivillerin dâhil olduğu bir yaralı olayına müdahale edin — bölgeyi emniyete alarak, kalabalığı kontrol ederek ve yaralıları tahliye ederek.", ar: "الاستجابة لحادث إصابة يشمل مدنيين — بتأمين المنطقة والسيطرة على الحشد وإخلاء المصابين.", zh: "处置涉及平民的伤员事件——控制现场、管控人群并后送伤员。" }],
  ["Fire using SMGs at figure targets from 100–200 metres while lying down. Eight bullets are fired within three minutes.", { ru: "Стрельба из SMG по ростовым мишеням с 100–200 метров из положения лёжа. Восемь патронов за три минуты.", tr: "Yatar vaziyette 100–200 metreden figür hedeflere SMG ile ateş edin. Üç dakika içinde sekiz mermi atılır.", ar: "الرماية بأسلحة SMG على أهداف شخوصية من مسافة 100–200 متر من وضع الانبطاح. تُطلق ثماني طلقات خلال ثلاث دقائق.", zh: "卧姿使用 SMG 在 100–200 米射击人形靶。三分钟内射出八发子弹。" }],
  ["Gather intelligence from civilians while maintaining operational security. Apprehension techniques are assessed.", { ru: "Собрать разведданные у гражданских, сохраняя оперативную безопасность. Оцениваются приёмы задержания.", tr: "Harekât güvenliğini korurken sivillerden istihbarat toplayın. Yakalama teknikleri değerlendirilir.", ar: "جمع المعلومات من المدنيين مع الحفاظ على أمن العمليات. تُقيَّم أساليب الاعتقال.", zh: "在保持行动保密的同时从平民处收集情报。评估抓捕技巧。" }],
  ["Respond to a chemical attack scenario using MOPP Level 4 equipment. Perform casualty handling, decontamination and sampling.", { ru: "Реагировать на сценарий химической атаки в комплекте MOPP Level 4. Выполнить эвакуацию пострадавших, дегазацию и отбор проб.", tr: "MOPP Level 4 teçhizatıyla bir kimyasal saldırı senaryosuna müdahale edin. Yaralı bakımı, dekontaminasyon ve numune alma işlemlerini yapın.", ar: "الاستجابة لسيناريو هجوم كيميائي باستخدام عتاد MOPP Level 4. تنفيذ التعامل مع المصابين والتطهير وأخذ العينات.", zh: "使用 MOPP Level 4 装具应对化学袭击想定。实施伤员处置、洗消与采样。" }],
  ["Cover 4–5 KM while carrying a 60 KG dummy casualty. The qualifying time is 40 minutes and penalties apply for delays.", { ru: "Пройти 4–5 KM с переноской 60-KG манекена-пострадавшего. Квалификационное время — 40 минут, за задержки начисляются штрафы.", tr: "60 KG'lık cansız yaralı taşıyarak 4–5 KM gidin. Baraj süresi 40 dakikadır ve gecikmelere ceza uygulanır.", ar: "قطع 4–5 KM مع حمل مصاب صوري وزنه 60 KG. زمن التأهل 40 دقيقة وتُطبَّق عقوبات على التأخير.", zh: "背负 60 KG 假伤员行进 4–5 KM。达标时间为 40 分钟，超时将受罚。" }],
  ["The captain's media interaction and communication skills are evaluated in a simulated press engagement.", { ru: "Взаимодействие капитана со СМИ и его навыки коммуникации оцениваются в имитации пресс-мероприятия.", tr: "Kaptanın medya etkileşimi ve iletişim becerileri, benzetilmiş bir basın etkinliğinde değerlendirilir.", ar: "يُقيَّم تفاعل القائد الإعلامي ومهاراته في التواصل ضمن لقاء صحفي محاكى.", zh: "在模拟的新闻活动中评估队长的媒体互动与沟通能力。" }],
  ["Navigate through hostile territory while maintaining tactical movement and completing the route within time.", { ru: "Навигация через враждебную территорию с сохранением тактического передвижения и прохождением маршрута в отведённое время.", tr: "Taktik hareketi sürdürerek düşman arazisinden geçin ve rotayı süresi içinde tamamlayın.", ar: "الملاحة عبر أرض معادية مع الحفاظ على الحركة التكتيكية وإكمال المسار في الوقت المحدد.", zh: "穿越敌对地域，保持战术机动并在规定时间内完成路线。" }],
  ["Clear a terrorist hideout or compound. Hostage rescue may also be assessed as part of the serial.", { ru: "Зачистка укрытия или объекта террористов. В рамках этапа может оцениваться и освобождение заложников.", tr: "Bir terörist saklanma yerini veya tesisi temizleyin. Serinin bir parçası olarak rehine kurtarma da değerlendirilebilir.", ar: "تطهير مخبأ إرهابي أو مجمّع. وقد يُقيَّم إنقاذ الرهائن أيضًا كجزء من الفعالية.", zh: "清剿恐怖分子隐蔽点或据点。人质解救亦可能作为该科目的一部分予以评估。" }],
  ["A one-hour written report describing the mission, terrain, enemy, options adopted, chronology and conclusions.", { ru: "Часовой письменный отчёт с описанием задачи, местности, противника, принятых решений, хронологии и выводов.", tr: "Görevi, araziyi, düşmanı, benimsenen seçenekleri, kronolojiyi ve sonuçları anlatan bir saatlik yazılı rapor.", ar: "تقرير مكتوب خلال ساعة يصف المهمة والأرض والعدو والخيارات المعتمدة والتسلسل الزمني والاستنتاجات.", zh: "一小时书面报告，说明任务、地形、敌情、所采方案、时序与结论。" }],
  ["Apprehension techniques and knowledge of the Geneva Convention are assessed during handling of a captured terrorist.", { ru: "При обращении с захваченным террористом оцениваются приёмы задержания и знание Женевской конвенции.", tr: "Yakalanan bir teröristin muamelesi sırasında yakalama teknikleri ve Cenevre Sözleşmesi bilgisi değerlendirilir.", ar: "تُقيَّم أساليب الاعتقال ومعرفة اتفاقية جنيف أثناء التعامل مع إرهابي مأسور.", zh: "在处置被俘恐怖分子时，评估抓捕技巧与《日内瓦公约》知识。" }],
  ["Final inspection of the complete equipment and verification of the total team weight (200 KG).", { ru: "Заключительный осмотр всего снаряжения и проверка суммарного веса команды (200 KG).", tr: "Tüm teçhizatın son teftişi ve toplam takım ağırlığının (200 KG) doğrulanması.", ar: "التفتيش النهائي للمعدات كاملة والتحقق من وزن الفريق الإجمالي (200 KG).", zh: "对全部装备进行最终检查并核实队伍总重（200 KG）。" }],
  ["The captain presents a complete exercise summary followed by questions from the umpires. The time limit is 30 minutes with penalties for exceeding it.", { ru: "Капитан представляет полную сводку по учению, после чего судьи задают вопросы. Лимит времени — 30 минут, за превышение начисляются штрафы.", tr: "Kaptan eksiksiz bir tatbikat özeti sunar, ardından hakemler soru sorar. Süre sınırı 30 dakikadır ve aşımına ceza uygulanır.", ar: "يقدّم القائد ملخصًا كاملًا للتمرين يتبعه أسئلة من الحكّام. الحد الزمني 30 دقيقة وتُطبَّق عقوبات على تجاوزه.", zh: "队长呈报完整的演习总结，随后接受裁判提问。时限 30 分钟，超时受罚。" }],

  /* ── Mark-breakdown labels ─────────────────────────────────────────── */
  ["Report line 1", { ru: "Рубеж донесений 1", tr: "Rapor hattı 1", ar: "خط الإبلاغ 1", zh: "报告线 1" }],
  ["Report line 2", { ru: "Рубеж донесений 2", tr: "Rapor hattı 2", ar: "خط الإبلاغ 2", zh: "报告线 2" }],
  ["Report line 3", { ru: "Рубеж донесений 3", tr: "Rapor hattı 3", ar: "خط الإبلاغ 3", zh: "报告线 3" }],
  ["Report line 4", { ru: "Рубеж донесений 4", tr: "Rapor hattı 4", ar: "خط الإبلاغ 4", zh: "报告线 4" }],
  ["Report line 5", { ru: "Рубеж донесений 5", tr: "Rapor hattı 5", ar: "خط الإبلاغ 5", zh: "报告线 5" }],
  ["Delivery", { ru: "Доклад", tr: "Sunum", ar: "الإلقاء", zh: "下达" }],
  ["Contingency Planning", { ru: "Планирование на случай непредвиденных ситуаций", tr: "Beklenmedik Durum Planlaması", ar: "التخطيط للطوارئ", zh: "应急计划" }],
  ["Model Preparation", { ru: "Подготовка макета", tr: "Maket Hazırlığı", ar: "إعداد المجسّم", zh: "沙盘制作" }],
  ["Team Understanding", { ru: "Понимание командой", tr: "Takımın Anlayışı", ar: "استيعاب الفريق", zh: "团队理解" }],
  ["Tactical drills", { ru: "Тактические приёмы", tr: "Taktik talimler", ar: "التمارين التكتيكية", zh: "战术动作" }],
  ["Time", { ru: "Время", tr: "Süre", ar: "الزمن", zh: "时间" }],
  ["Final RV", { ru: "Конечный пункт сбора (RV)", tr: "Son RV", ar: "نقطة الالتقاء الأخيرة RV", zh: "最终集合点 RV" }],
  ["Movement", { ru: "Передвижение", tr: "Hareket", ar: "التحرك", zh: "机动" }],
  ["Reconnaissance", { ru: "Разведка", tr: "Keşif", ar: "الاستطلاع", zh: "侦察" }],
  ["Planning", { ru: "Планирование", tr: "Planlama", ar: "التخطيط", zh: "计划" }],
  ["Enlargement", { ru: "Увеличенная схема", tr: "Büyütme", ar: "المخطط المُكبَّر", zh: "放大图" }],
  ["Area Security", { ru: "Обеспечение безопасности района", tr: "Bölge Emniyeti", ar: "تأمين المنطقة", zh: "区域警戒" }],
  ["Search & Rescue", { ru: "Поиск и спасение", tr: "Arama ve Kurtarma", ar: "البحث والإنقاذ", zh: "搜救" }],
  ["Waterproofing Equipment", { ru: "Гидроизоляция снаряжения", tr: "Teçhizatın Su Geçirmez Hâle Getirilmesi", ar: "عزل المعدات عن الماء", zh: "装备防水" }],
  ["Security of Banks", { ru: "Безопасность берегов", tr: "Kıyıların Emniyeti", ar: "تأمين الضفتين", zh: "两岸警戒" }],
  ["Tactical Crossing", { ru: "Тактическое форсирование", tr: "Taktik Geçiş", ar: "العبور التكتيكي", zh: "战术渡越" }],
  ["Secure Area", { ru: "Обеспечение безопасности района", tr: "Bölgeyi Emniyete Alma", ar: "تأمين المنطقة", zh: "控制现场" }],
  ["Crowd Control", { ru: "Контроль толпы", tr: "Kalabalık Kontrolü", ar: "السيطرة على الحشد", zh: "人群管控" }],
  ["Casualty Evacuation", { ru: "Эвакуация пострадавших", tr: "Yaralı Tahliyesi", ar: "إخلاء المصابين", zh: "伤员后送" }],
  ["Tactical Movement", { ru: "Тактическое передвижение", tr: "Taktik Hareket", ar: "الحركة التكتيكية", zh: "战术机动" }],
  ["Timely Completion", { ru: "Своевременное прохождение", tr: "Zamanında Tamamlama", ar: "الإنجاز في الوقت", zh: "按时完成" }],
  ["Mission Description", { ru: "Описание задачи", tr: "Görev Tanımı", ar: "وصف المهمة", zh: "任务描述" }],
  ["Terrain & Enemy", { ru: "Местность и противник", tr: "Arazi ve Düşman", ar: "الأرض والعدو", zh: "地形与敌情" }],
  ["Options Adopted", { ru: "Принятые решения", tr: "Benimsenen Seçenekler", ar: "الخيارات المعتمدة", zh: "所采方案" }],
  ["Chronological Report", { ru: "Хронологический отчёт", tr: "Kronolojik Rapor", ar: "التقرير الزمني", zh: "时序报告" }],

  /* ── Equipment category titles ─────────────────────────────────────── */
  ["Personal Equipment", { ru: "Личное снаряжение", tr: "Şahsi Teçhizat", ar: "المعدات الشخصية", zh: "个人装备" }],
  ["Communication Equipment", { ru: "Снаряжение связи", tr: "Muhabere Teçhizatı", ar: "معدات الاتصال", zh: "通信装备" }],
  ["Navigation Equipment", { ru: "Навигационное снаряжение", tr: "Seyrüsefer Teçhizatı", ar: "معدات الملاحة", zh: "导航装备" }],
  ["Medical Equipment", { ru: "Медицинское снаряжение", tr: "Sıhhiye Teçhizatı", ar: "المعدات الطبية", zh: "医疗装备" }],
  ["Engineering & Survival", { ru: "Инженерное снаряжение и выживание", tr: "İstihkâm ve Hayatta Kalma", ar: "الهندسة والبقاء", zh: "工兵与生存" }],

  /* ── Equipment items ───────────────────────────────────────────────── */
  ["Combat Dress", { ru: "Полевая форма", tr: "Muharebe Elbisesi", ar: "بذلة القتال", zh: "作战服" }],
  ["Field Cap", { ru: "Полевая кепи", tr: "Arazi Kepi", ar: "قبعة ميدانية", zh: "作战帽" }],
  ["T-Shirt", { ru: "Футболка", tr: "Tişört", ar: "قميص داخلي", zh: "T 恤" }],
  ["Socks", { ru: "Носки", tr: "Çorap", ar: "جوارب", zh: "袜子" }],
  ["Boots", { ru: "Ботинки", tr: "Postal", ar: "حذاء عسكري", zh: "作战靴" }],
  ["Housewife Kit", { ru: "Швейный набор", tr: "Dikiş Seti", ar: "طقم خياطة", zh: "缝补包" }],
  ["Anti-Snake Bite Kit", { ru: "Набор от укуса змеи", tr: "Yılan Isırığı Seti", ar: "طقم مضاد للدغات الأفاعي", zh: "防蛇咬急救包" }],
  ["Plastic Waste Bag", { ru: "Пластиковый мусорный мешок", tr: "Plastik Atık Torbası", ar: "كيس نفايات بلاستيكي", zh: "塑料垃圾袋" }],
  ["Cleaning Kit", { ru: "Набор для чистки", tr: "Temizlik Seti", ar: "طقم تنظيف", zh: "清洁套件" }],
  ["Compass", { ru: "Компас", tr: "Pusula", ar: "بوصلة", zh: "指北针" }],
  ["Night Vision Goggles", { ru: "Очки ночного видения", tr: "Gece Görüş Gözlüğü", ar: "نظارات رؤية ليلية", zh: "夜视镜" }],
  ["Service Protractor", { ru: "Штатный транспортир", tr: "Muharebe İletkisi", ar: "منقلة عسكرية", zh: "制式量角器" }],
  ["Gloves", { ru: "Перчатки", tr: "Eldiven", ar: "قفازات", zh: "手套" }],
  ["Helmet", { ru: "Каска", tr: "Kask", ar: "خوذة", zh: "头盔" }],
  ["Camouflage Kit", { ru: "Маскировочный набор", tr: "Kamuflaj Seti", ar: "طقم تمويه", zh: "伪装套件" }],
  ["Reflective Vest", { ru: "Светоотражающий жилет", tr: "Reflektörlü Yelek", ar: "سترة عاكسة", zh: "反光背心" }],
  ["Pull Over", { ru: "Свитер", tr: "Kazak", ar: "سترة صوفية", zh: "套头衫" }],
  ["Head Comforter", { ru: "Головной платок-баф", tr: "Boyunluk / Bere", ar: "غطاء رأس", zh: "头套" }],
  ["SMG", { ru: "SMG", tr: "SMG", ar: "SMG", zh: "SMG" }],
  ["Light Machine Gun", { ru: "Ручной пулемёт (LMG)", tr: "Hafif Makineli Tüfek (LMG)", ar: "رشاش خفيف (LMG)", zh: "轻机枪（LMG）" }],
  ["Spare Magazines", { ru: "Запасные магазины", tr: "Yedek Şarjörler", ar: "مخازن احتياطية", zh: "备用弹匣" }],
  ["SMG Ammunition", { ru: "Боеприпасы к SMG", tr: "SMG Mühimmatı", ar: "ذخيرة SMG", zh: "SMG 弹药" }],
  ["LMG Ammunition (1000 rounds)", { ru: "Боеприпасы к LMG (1000 патронов)", tr: "LMG Mühimmatı (1000 mermi)", ar: "ذخيرة LMG (1000 طلقة)", zh: "LMG 弹药（1000 发）" }],
  ["LMG Night Sight", { ru: "Ночной прицел LMG", tr: "LMG Gece Nişangâhı", ar: "منظار ليلي لـ LMG", zh: "LMG 夜瞄" }],
  ["Pocket Knife", { ru: "Складной нож", tr: "Çakı", ar: "سكين جيب", zh: "折叠刀" }],
  ["Dagger", { ru: "Кинжал", tr: "Hançer", ar: "خنجر", zh: "匕首" }],
  ["Hand Grenades", { ru: "Ручные гранаты", tr: "El Bombaları", ar: "قنابل يدوية", zh: "手榴弹" }],
  ["Smoke Grenades", { ru: "Дымовые гранаты", tr: "Sis Bombaları", ar: "قنابل دخانية", zh: "烟雾弹" }],
  ["Wireless Set", { ru: "Радиостанция", tr: "Telsiz", ar: "جهاز لاسلكي", zh: "无线电台" }],
  ["Spare Battery", { ru: "Запасная батарея", tr: "Yedek Pil", ar: "بطارية احتياطية", zh: "备用电池" }],
  ["Harris Set", { ru: "Радиостанция Harris", tr: "Harris Telsizi", ar: "جهاز Harris", zh: "Harris 电台" }],
  ["Voice Recorder", { ru: "Диктофон", tr: "Ses Kaydedici", ar: "مسجّل صوت", zh: "录音机" }],
  ["Tracker", { ru: "Трекер", tr: "Tracker", ar: "جهاز تتبّع", zh: "追踪器" }],
  ["Map Set", { ru: "Комплект карт", tr: "Harita Seti", ar: "طقم خرائط", zh: "地图套组" }],
  ["Map Case", { ru: "Планшет для карт", tr: "Harita Kılıfı", ar: "حافظة خرائط", zh: "地图袋" }],
  ["Binoculars", { ru: "Бинокль", tr: "Dürbün", ar: "منظار ثنائي", zh: "望远镜" }],
  ["Writing Material", { ru: "Письменные принадлежности", tr: "Yazı Malzemesi", ar: "أدوات الكتابة", zh: "书写用具" }],
  ["Field Dressing", { ru: "Индивидуальный перевязочный пакет", tr: "Sahra Sargısı", ar: "ضمادة ميدانية", zh: "急救绷带" }],
  ["Tourniquet", { ru: "Жгут", tr: "Turnike", ar: "عاصبة", zh: "止血带" }],
  ["First Aid Bag", { ru: "Аптечка", tr: "İlk Yardım Çantası", ar: "حقيبة إسعافات أولية", zh: "急救包" }],
  ["Entrenching Tool", { ru: "Малая пехотная лопата", tr: "Kazma Küreği", ar: "أداة حفر", zh: "工兵铲" }],
  ["Ground Sheet", { ru: "Подстилка", tr: "Yer Örtüsü", ar: "فرشة أرضية", zh: "地布" }],
  ["Mess Tin / Food Pan", { ru: "Котелок / судок", tr: "Matara Sefertası / Yemek Kabı", ar: "وعاء طعام", zh: "餐盒 / 饭盒" }],
  ["MRE Ration Pack", { ru: "Сухпаёк MRE", tr: "MRE Hazır Yemek Paketi", ar: "حزمة إعاشة MRE", zh: "MRE 口粮包" }],
  ["Torch with Colored Paper", { ru: "Фонарь с цветной бумагой", tr: "Renkli Kâğıtlı Fener", ar: "مصباح مع ورق ملوّن", zh: "带彩纸手电" }],
  ["Wire Cutter", { ru: "Кусачки", tr: "Tel Makası", ar: "قاطع أسلاك", zh: "断线钳" }],
  ["Mine Detector", { ru: "Миноискатель", tr: "Mayın Dedektörü", ar: "كاشف ألغام", zh: "探雷器" }],
  ["Mine Probe", { ru: "Щуп для мин", tr: "Mayın Sondası", ar: "مِسبار ألغام", zh: "探雷针" }],
  ["Water Bottle with Cover", { ru: "Фляга с чехлом", tr: "Kılıflı Matara", ar: "زجاجة ماء مع غطاء", zh: "带套水壶" }],
  ["Safety Rope", { ru: "Страховочная верёвка", tr: "Emniyet Halatı", ar: "حبل أمان", zh: "安全绳" }],
  ["Para Cord", { ru: "Паракорд", tr: "Paraşüt İpi", ar: "حبل باراكورد", zh: "伞绳" }],
  ["D-Rings", { ru: "Карабины D-образные", tr: "D-Halkalar", ar: "حلقات D", zh: "D 型环" }],
  ["Pulley", { ru: "Блок (ролик)", tr: "Makara", ar: "بكرة", zh: "滑轮" }],
  ["Fish Reel", { ru: "Катушка с леской", tr: "Olta Makarası", ar: "بكرة خيط", zh: "渔线轮" }],
  ["Windsock", { ru: "Ветроуказатель", tr: "Rüzgâr Tulumu", ar: "كُمّ الريح", zh: "风向袋" }],
  ["Backpack", { ru: "Рюкзак", tr: "Sırt Çantası", ar: "حقيبة ظهر", zh: "背包" }],
  ["Waterproof Backpack Cover", { ru: "Водонепроницаемый чехол рюкзака", tr: "Su Geçirmez Sırt Çantası Kılıfı", ar: "غطاء حقيبة ظهر مقاوم للماء", zh: "背包防水罩" }],

  /* ── Orientation items ─────────────────────────────────────────────── */
  ["Pakistan Army Weapons", { ru: "Оружие Пакистанской армии", tr: "Pakistan Ordusu Silahları", ar: "أسلحة الجيش الباكستاني", zh: "巴基斯坦陆军武器" }],
  ["Familiarisation with the weapons issued for the exercise.", { ru: "Ознакомление с оружием, выдаваемым на учение.", tr: "Tatbikat için verilen silahlarla tanışma.", ar: "التعرّف على الأسلحة المخصصة للتمرين.", zh: "熟悉本演习配发的武器。" }],
  ["Weapon Zeroing", { ru: "Пристрелка оружия", tr: "Silah Sıfırlaması", ar: "تصفير السلاح", zh: "武器校枪" }],
  ["Zeroing of issued weapons ahead of the firing serial.", { ru: "Пристрелка выданного оружия перед стрелковым этапом.", tr: "Atış serisinden önce verilen silahların sıfırlanması.", ar: "تصفير الأسلحة المخصصة قبل فعالية الرماية.", zh: "在射击科目前对配发武器进行校枪。" }],
  ["Navigation & Map Reading", { ru: "Навигация и чтение карты", tr: "Seyrüsefer ve Harita Okuma", ar: "الملاحة وقراءة الخرائط", zh: "导航与识图" }],
  ["Six-figure grids, protractor work and route planning.", { ru: "Шестизначные координаты, работа с транспортиром и планирование маршрута.", tr: "Altı haneli kılavuz kareler, iletki çalışması ve rota planlaması.", ar: "الإحداثيات من ستة أرقام، والعمل بالمنقلة، وتخطيط المسار.", zh: "六位方格坐标、量角器作业与路线计划。" }],
  ["Signal Equipment", { ru: "Аппаратура связи", tr: "Muhabere Teçhizatı", ar: "معدات الإشارة", zh: "通信器材" }],
  ["Voice procedure and handling of the Harris / wireless sets.", { ru: "Правила радиообмена и работа с радиостанциями Harris / переносными.", tr: "Telsiz konuşma usulü ve Harris / telsiz cihazlarının kullanımı.", ar: "إجراءات المحادثة والتعامل مع أجهزة Harris / اللاسلكي.", zh: "话音规程与 Harris / 无线电台的操作。" }],
  ["CBRN Procedures", { ru: "Приёмы РХБЗ (CBRN)", tr: "CBRN Usulleri", ar: "إجراءات CBRN", zh: "CBRN 程序" }],
  ["MOPP levels, decontamination and sampling drills.", { ru: "Уровни MOPP, дегазация и отбор проб.", tr: "MOPP seviyeleri, dekontaminasyon ve numune alma talimleri.", ar: "مستويات MOPP والتطهير وتمارين أخذ العينات.", zh: "MOPP 等级、洗消与采样演练。" }],
  ["AFOS / ATGP Systems", { ru: "Системы AFOS / ATGP", tr: "AFOS / ATGP Sistemleri", ar: "أنظمة AFOS / ATGP", zh: "AFOS / ATGP 系统" }],
  ["Operating the artillery observation simulator.", { ru: "Работа с симулятором артиллерийской корректировки.", tr: "Topçu gözetleme simülatörünün kullanımı.", ar: "تشغيل محاكي الرصد المدفعي.", zh: "操作火炮观察模拟器。" }],
  ["Area Orientation", { ru: "Ознакомление с районом", tr: "Bölge Oryantasyonu", ar: "التعريف بالمنطقة", zh: "地域适应" }],
  ["Terrain, climate and area brief before the competition.", { ru: "Инструктаж по местности, климату и району перед соревнованием.", tr: "Yarışmadan önce arazi, iklim ve bölge brifingi.", ar: "إحاطة عن الأرض والمناخ والمنطقة قبل المسابقة.", zh: "赛前关于地形、气候与地域的情况介绍。" }],

  /* ── Rules ─────────────────────────────────────────────────────────── */
  ["The exercise is conducted under sub-conventional operational scenarios.", { ru: "Учение проводится по неконвенциональным оперативным сценариям.", tr: "Tatbikat, konvansiyonel altı harekât senaryoları altında yürütülür.", ar: "يُجرى التمرين وفق سيناريوهات عملياتية دون تقليدية.", zh: "演习在亚常规作战想定下进行。" }],
  ["Approximately 20–22 tests are conducted for each team (from the full catalogue of events).", { ru: "Для каждой команды проводится примерно 20–22 испытания (из полного перечня этапов).", tr: "Her takım için (tüm etkinlik kataloğundan) yaklaşık 20–22 test yapılır.", ar: "تُجرى لكل فريق نحو 20–22 اختبارًا (من كامل قائمة الفعاليات).", zh: "每支队伍约进行 20–22 项测试（取自全部项目目录）。" }],
  ["Pakistan Army provides trackers to monitor teams throughout.", { ru: "Пакистанская армия предоставляет трекеры для отслеживания команд на всём протяжении.", tr: "Pakistan Ordusu, takımları baştan sona izlemek için tracker sağlar.", ar: "يوفّر الجيش الباكستاني أجهزة تتبّع لمراقبة الفرق طوال الوقت.", zh: "巴基斯坦陆军提供追踪器全程监控各队。" }],
  ["Random weight inspections are conducted at any time.", { ru: "Внеплановые проверки веса проводятся в любое время.", tr: "Rastgele ağırlık denetimleri her an yapılabilir.", ar: "تُجرى عمليات تفتيش عشوائية للوزن في أي وقت.", zh: "可随时进行随机负重检查。" }],
  ["Waste must be collected in plastic bags and presented at the finish.", { ru: "Мусор необходимо собирать в пластиковые мешки и предъявлять на финише.", tr: "Atıklar plastik torbalarda toplanmalı ve bitişte sunulmalıdır.", ar: "يجب جمع النفايات في أكياس بلاستيكية وتقديمها عند خط النهاية.", zh: "垃圾须收集于塑料袋中并在终点出示。" }],
  ["Every member must carry an Anti-Snake Bite Kit and a torch.", { ru: "Каждый участник обязан иметь набор от укуса змеи и фонарь.", tr: "Her üye bir Yılan Isırığı Seti ve bir fener taşımalıdır.", ar: "على كل فرد حمل طقم مضاد للدغات الأفاعي ومصباح.", zh: "每名成员须携带防蛇咬急救包和手电。" }],
  ["Weapons are fired without re-zeroing after the exercise.", { ru: "После учения оружие используется без повторной пристрелки.", tr: "Silahlar tatbikattan sonra yeniden sıfırlanmadan atılır.", ar: "تُطلق الأسلحة دون إعادة تصفير بعد التمرين.", zh: "演习后武器不再重新校枪即行射击。" }],
  ["This is a survival exercise — no food is supplied; teams survive on their own MREs.", { ru: "Это учение на выживание — питание не выдаётся; команды обходятся своими сухпайками MRE.", tr: "Bu bir hayatta kalma tatbikatıdır — yiyecek verilmez; takımlar kendi MRE'leriyle idare eder.", ar: "هذا تمرين بقاء — لا يُقدَّم طعام؛ وتعتمد الفرق على حصص MRE الخاصة بها.", zh: "这是一场生存演习——不供应食物；各队依靠自带的 MRE 生存。" }],
  ["A medical replacement costs 300 penalty points.", { ru: "Замена по медицинским причинам стоит 300 штрафных баллов.", tr: "Sıhhi bir değişiklik 300 ceza puanına mal olur.", ar: "الاستبدال الطبي يكلّف 300 نقطة جزائية.", zh: "一次医疗替换扣 300 罚分。" }],
  ["A second replacement costs 200 penalty points.", { ru: "Вторая замена стоит 200 штрафных баллов.", tr: "İkinci bir değişiklik 200 ceza puanına mal olur.", ar: "الاستبدال الثاني يكلّف 200 نقطة جزائية.", zh: "第二次替换扣 200 罚分。" }],
  ["Team weight exceeding 200 KG incurs a 100-point deduction.", { ru: "Превышение веса команды сверх 200 KG влечёт вычет 100 баллов.", tr: "Takım ağırlığının 200 KG'yi aşması 100 puanlık kesinti getirir.", ar: "تجاوز وزن الفريق 200 KG يستوجب خصم 100 نقطة.", zh: "队伍负重超过 200 KG 扣 100 分。" }],
  ["GPS devices, watches with GPS and mobile phones are strictly prohibited.", { ru: "Устройства GPS, часы с GPS и мобильные телефоны строго запрещены.", tr: "GPS cihazları, GPS'li saatler ve cep telefonları kesinlikle yasaktır.", ar: "تُمنع منعًا باتًا أجهزة GPS والساعات المزوّدة بـ GPS والهواتف المحمولة.", zh: "严禁携带 GPS 设备、带 GPS 的手表及手机。" }],
  ["Built-Up Areas (BUAs) are Out of Bounds.", { ru: "Застроенные районы (BUA) — вне зоны допуска.", tr: "Meskûn Mahaller (BUA) yasak bölgedir.", ar: "المناطق المبنية (BUA) محظورة الدخول.", zh: "建成区（BUA）为禁区。" }],
  ["No civilian assistance is allowed.", { ru: "Помощь со стороны гражданских не допускается.", tr: "Sivil yardım alınmasına izin verilmez.", ar: "لا يُسمح بأي مساعدة مدنية.", zh: "不得接受平民协助。" }],
  ["Swimming in rivers or water channels is prohibited.", { ru: "Плавание в реках и водных каналах запрещено.", tr: "Nehirlerde veya su kanallarında yüzmek yasaktır.", ar: "يُحظر السباحة في الأنهار أو القنوات المائية.", zh: "禁止在河流或水渠中游泳。" }],
  ["Violations result in disqualification.", { ru: "Нарушения ведут к дисквалификации.", tr: "İhlaller diskalifiyeyle sonuçlanır.", ar: "المخالفات تؤدي إلى الاستبعاد.", zh: "违规将导致取消资格。" }],
];

const TEXT: Record<string, Translations> = Object.fromEntries(
  ENTRIES.map(([english, translations]) => [norm(english), translations])
);

/**
 * Translate an Exercise Contour string. Unknown text falls back to the original
 * English so newly-added data still renders (untranslated) rather than blank.
 */
export function translateContour(text: string, locale: Locale): string {
  if (locale === "en") return text;
  return TEXT[norm(text)]?.[locale] ?? text;
}

/** Convenience for string arrays (equipment item lists). */
export function translateContourList(
  items: readonly string[],
  locale: Locale
): string[] {
  return items.map((item) => translateContour(item, locale));
}
