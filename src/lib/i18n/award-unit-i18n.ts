/**
 * Display localization for the awards roll's unit column.
 *
 * Entries are either a bare country ("KAZAKHSTAN"), a "COUNTRY - Unit
 * designation" pair ("PAKISTAN - 21 Punjab Regiment"), or a bare designation
 * ("9 Regiment RLC"). The country segment resolves through the curated,
 * ISO2-keyed `translateCountryName`; the designation resolves through the
 * table below. Anything unrecognised falls back to the ORIGINAL English string,
 * matching the rest of the i18n layer.
 *
 * ── Conventions used in the table ───────────────────────────────────────────
 * • Numerals stay Western ("16", not "١٦") — they are the unit's identifier and
 *   are quoted that way in results reporting.
 * • Organisational acronyms are NOT translated: RLC, REME, RA, RSME, RGR, ARRC,
 *   UOTC, OTR, SWOTR, DCSp, MMR, IBS, MOD. They are identifiers rather than
 *   descriptions, and expanding them mid-label would not match how the unit is
 *   referred to anywhere else.
 * • Honorifics and place/person names inside a title are transliterated where
 *   that is conventional in the target script (Gurkha, Punjab, Kuperjanov,
 *   Mindaugas, Slesvig, Blueridge) and left in Latin for Turkish, which uses
 *   Latin script for foreign proper nouns.
 * • Word order follows each locale rather than English: "16 Signal Regiment"
 *   → ru "16-й полк связи", tr "16. Muhabere Alayı", ar "فوج الإشارة 16",
 *   zh "第16通信团".
 *
 * These are translations of military unit titles, not certified renderings.
 * They should be reviewed by someone who knows the terminology in each
 * language before this page is treated as an official record.
 */

import type { Locale } from "@/lib/i18n/config";
import { translateCountryName } from "@/lib/i18n/international-i18n";

type NonEn = Exclude<Locale, "en">;

/** Unit designation (country prefix already stripped) → per-locale title. */
const DESIGNATIONS: Record<string, Record<NonEn, string>> = {
  "1 Bn Scots Guards": {
    ru: "1-й батальон, Шотландская гвардия",
    tr: "İskoç Muhafızları 1. Tabur",
    ar: "الكتيبة 1 - الحرس الاسكتلندي",
    zh: "苏格兰卫队第1营",
  },
  "1 Bn The Princess of Wales Royal Regiment": {
    ru: "1-й батальон, Королевский полк принцессы Уэльской",
    tr: "Galler Prensesi Kraliyet Alayı 1. Tabur",
    ar: "الكتيبة 1 - الفوج الملكي لأميرة ويلز",
    zh: "威尔士王妃皇家团第1营",
  },
  "1 Bn The RIFLES": {
    ru: "1-й батальон, полк «Стрелки»",
    tr: "Tüfekliler Alayı 1. Tabur",
    ar: "الكتيبة 1 - فوج البنادق",
    zh: "步枪团第1营",
  },
  "1 Logistic Regiment RLC": {
    ru: "1-й логистический полк RLC",
    tr: "1. Lojistik Alayı RLC",
    ar: "فوج اللوجستيات 1 - RLC",
    zh: "第1后勤团 RLC",
  },
  "1 RGR": {
    ru: "1-й батальон Королевских гуркхских стрелков",
    tr: "Kraliyet Gurkha Tüfekleri 1. Tabur",
    ar: "الكتيبة 1 - بنادق الغوركا الملكية",
    zh: "皇家廓尔喀步枪团第1营",
  },
  "1 RSME Regiment": {
    ru: "1-й полк RSME",
    tr: "1. RSME Alayı",
    ar: "فوج RSME 1",
    zh: "第1 RSME 团",
  },
  "1 Regiment Royal Horse Artillery": {
    ru: "1-й полк Королевской конной артиллерии",
    tr: "1. Kraliyet At Topçu Alayı",
    ar: "فوج المدفعية الفرسية الملكية 1",
    zh: "皇家骑炮兵第1团",
  },
  "1 Regiment d'Infanterie de marine": {
    ru: "1-й полк морской пехоты",
    tr: "1. Deniz Piyade Alayı",
    ar: "فوج مشاة البحرية 1",
    zh: "第1海军步兵团",
  },
  "10 Queen's Own Gurkha Logistic Regiment": {
    ru: "10-й гуркхский логистический полк «Собственный Её Величества»",
    tr: "10. Kraliçe'nin Gurkha Lojistik Alayı",
    ar: "فوج الغوركا اللوجستي الملكي 10",
    zh: "女王直属廓尔喀后勤团第10团",
  },
  "12 Regiment Royal Artillery": {
    ru: "12-й полк Королевской артиллерии",
    tr: "12. Kraliyet Topçu Alayı",
    ar: "فوج المدفعية الملكية 12",
    zh: "皇家炮兵第12团",
  },
  "13 Air Assault Support Regiment RLC": {
    ru: "13-й полк воздушно-штурмовой поддержки RLC",
    tr: "13. Hava Taarruz Destek Alayı RLC",
    ar: "فوج دعم الهجوم الجوي 13 - RLC",
    zh: "第13空中突击支援团 RLC",
  },
  "13 Garhwal Rifles": {
    ru: "13-й Гархвальский стрелковый полк",
    tr: "13. Garhwal Tüfek Alayı",
    ar: "فوج غاروال للبنادق 13",
    zh: "第13加瓦尔步枪团",
  },
  "14 Regiment RA (Kings Gurkha Artillery)": {
    ru: "14-й полк RA (Королевская гуркхская артиллерия)",
    tr: "14. RA Alayı (Kral'ın Gurkha Topçusu)",
    ar: "فوج RA 14 (مدفعية الغوركا الملكية)",
    zh: "第14 RA 团（国王廓尔喀炮兵）",
  },
  "14 Signal Regiment": {
    ru: "14-й полк связи",
    tr: "14. Muhabere Alayı",
    ar: "فوج الإشارة 14",
    zh: "第14通信团",
  },
  "16 Regiment Royal Artillery": {
    ru: "16-й полк Королевской артиллерии",
    tr: "16. Kraliyet Topçu Alayı",
    ar: "فوج المدفعية الملكية 16",
    zh: "皇家炮兵第16团",
  },
  "16 Signal Regiment": {
    ru: "16-й полк связи",
    tr: "16. Muhabere Alayı",
    ar: "فوج الإشارة 16",
    zh: "第16通信团",
  },
  "17 Port & Maritime Regiment RLC": {
    ru: "17-й портовый и морской полк RLC",
    tr: "17. Liman ve Denizcilik Alayı RLC",
    ar: "فوج الموانئ والبحرية 17 - RLC",
    zh: "第17港口与海运团 RLC",
  },
  "187 Airborne Regiment": {
    ru: "187-й воздушно-десантный полк",
    tr: "187. Hava İndirme Alayı",
    ar: "الفوج المحمول جواً 187",
    zh: "第187空降团",
  },
  "1st Australian Regiment": {
    ru: "1-й Австралийский полк",
    tr: "1. Avustralya Alayı",
    ar: "الفوج الأسترالي 1",
    zh: "澳大利亚第1团",
  },
  "1st Battalion The Queens Dragoon Guards/AUSTRIA - Joint": {
    ru: "1-й батальон, Королевские драгунские гвардейцы / Австрия — совместная команда",
    tr: "Kraliçe'nin Ejderha Muhafızları 1. Tabur / Avusturya — Ortak",
    ar: "الكتيبة 1 - حرس الملكة الفرسان / النمسا — مشتركة",
    zh: "女王龙骑兵卫队第1营／奥地利联合队",
  },
  "1st Battalion, Royal New Zealand Infantry Regt": {
    ru: "1-й батальон, Королевский новозеландский пехотный полк",
    tr: "Kraliyet Yeni Zelanda Piyade Alayı 1. Tabur",
    ar: "الكتيبة 1 - فوج مشاة نيوزيلندا الملكي",
    zh: "皇家新西兰步兵团第1营",
  },
  "2 Bn The RIFLES": {
    ru: "2-й батальон, полк «Стрелки»",
    tr: "Tüfekliler Alayı 2. Tabur",
    ar: "الكتيبة 2 - فوج البنادق",
    zh: "步枪团第2营",
  },
  "2 Bn The Royal Anglian Regiment": {
    ru: "2-й батальон, Королевский английский полк",
    tr: "Kraliyet Anglian Alayı 2. Tabur",
    ar: "الكتيبة 2 - الفوج الأنجلي الملكي",
    zh: "皇家盎格利亚团第2营",
  },
  "2 Bn The Royal Irish Regiment": {
    ru: "2-й батальон, Королевский ирландский полк",
    tr: "Kraliyet İrlanda Alayı 2. Tabur",
    ar: "الكتيبة 2 - الفوج الأيرلندي الملكي",
    zh: "皇家爱尔兰团第2营",
  },
  "2 Light Infantry Company - Slesvig Regt of Foot": {
    ru: "2-я рота лёгкой пехоты, Шлезвигский пехотный полк",
    tr: "2. Hafif Piyade Bölüğü - Slesvig Piyade Alayı",
    ar: "سرية المشاة الخفيفة 2 - فوج سليسفيغ للمشاة",
    zh: "第2轻步兵连 — 石勒苏益格步兵团",
  },
  "2 The Royal Gurkha Rifles": {
    ru: "2-й полк Королевских гуркхских стрелков",
    tr: "2. Kraliyet Gurkha Tüfek Alayı",
    ar: "فوج بنادق الغوركا الملكية 2",
    zh: "皇家廓尔喀步枪团第2营",
  },
  "21 Engineer Regiment": {
    ru: "21-й инженерный полк",
    tr: "21. İstihkâm Alayı",
    ar: "فوج الهندسة 21",
    zh: "第21工兵团",
  },
  "21 Punjab Regiment": {
    ru: "21-й Пенджабский полк",
    tr: "21. Pencap Alayı",
    ar: "فوج البنجاب 21",
    zh: "第21旁遮普团",
  },
  "214 MMR": {
    ru: "214 MMR",
    tr: "214 MMR",
    ar: "214 MMR",
    zh: "214 MMR",
  },
  "22 Signal Regiment": {
    ru: "22-й полк связи",
    tr: "22. Muhabere Alayı",
    ar: "فوج الإشارة 22",
    zh: "第22通信团",
  },
  "23 Parachute Engineer Regiment": {
    ru: "23-й парашютно-инженерный полк",
    tr: "23. Paraşüt İstihkâm Alayı",
    ar: "فوج المظليين الهندسي 23",
    zh: "第23伞兵工兵团",
  },
  "27 Theatre Logistic Regiment RLC": {
    ru: "27-й полк тылового обеспечения театра военных действий RLC",
    tr: "27. Harekât Alanı Lojistik Alayı RLC",
    ar: "فوج اللوجستيات الميدانية 27 - RLC",
    zh: "第27战区后勤团 RLC",
  },
  "2RGR (The Gurkha Staff and Personnel Support)": {
    ru: "2 RGR (гуркхское штабное и кадровое обеспечение)",
    tr: "2 RGR (Gurkha Karargâh ve Personel Desteği)",
    ar: "2 RGR (دعم الأركان والأفراد الغوركا)",
    zh: "2 RGR（廓尔喀参谋与人事保障）",
  },
  "3 Bn The Rifles": {
    ru: "3-й батальон, полк «Стрелки»",
    tr: "Tüfekliler Alayı 3. Tabur",
    ar: "الكتيبة 3 - فوج البنادق",
    zh: "步枪团第3营",
  },
  "30 Signal Regiment": {
    ru: "30-й полк связи",
    tr: "30. Muhabere Alayı",
    ar: "فوج الإشارة 30",
    zh: "第30通信团",
  },
  "32 Engineer Regiment": {
    ru: "32-й инженерный полк",
    tr: "32. İstihkâm Alayı",
    ar: "فوج الهندسة 32",
    zh: "第32工兵团",
  },
  "36 Engineer Regiment": {
    ru: "36-й инженерный полк",
    tr: "36. İstihkâm Alayı",
    ar: "فوج الهندسة 36",
    zh: "第36工兵团",
  },
  "39 Engineer Regiment": {
    ru: "39-й инженерный полк",
    tr: "39. İstihkâm Alayı",
    ar: "فوج الهندسة 39",
    zh: "第39工兵团",
  },
  "3rd Bn Infantry": {
    ru: "3-й пехотный батальон",
    tr: "3. Piyade Taburu",
    ar: "كتيبة المشاة 3",
    zh: "第3步兵营",
  },
  "4 Bn The Mercian Regiment": {
    ru: "4-й батальон, Мерсийский полк",
    tr: "Mercian Alayı 4. Tabur",
    ar: "الكتيبة 4 - فوج ميرسيا",
    zh: "麦西亚团第4营",
  },
  "4 Bn The Princess of Wales Royal Regiment": {
    ru: "4-й батальон, Королевский полк принцессы Уэльской",
    tr: "Galler Prensesi Kraliyet Alayı 4. Tabur",
    ar: "الكتيبة 4 - الفوج الملكي لأميرة ويلز",
    zh: "威尔士王妃皇家团第4营",
  },
  "4 Bn The Royal Yorkshire Regiment": {
    ru: "4-й батальон, Королевский Йоркширский полк",
    tr: "Kraliyet Yorkshire Alayı 4. Tabur",
    ar: "الكتيبة 4 - فوج يوركشاير الملكي",
    zh: "皇家约克郡团第4营",
  },
  "4 Bn, 6th Infantry Regiment": {
    ru: "4-й батальон, 6-й пехотный полк",
    tr: "6. Piyade Alayı 4. Tabur",
    ar: "الكتيبة 4 - فوج المشاة 6",
    zh: "第6步兵团第4营",
  },
  "4 Logistic Regiment RLC": {
    ru: "4-й логистический полк RLC",
    tr: "4. Lojistik Alayı RLC",
    ar: "فوج اللوجستيات 4 - RLC",
    zh: "第4后勤团 RLC",
  },
  "4 Military Intelligence Battalion": {
    ru: "4-й батальон военной разведки",
    tr: "4. Askerî İstihbarat Taburu",
    ar: "كتيبة الاستخبارات العسكرية 4",
    zh: "第4军事情报营",
  },
  "4 Regiment Royal Artillery": {
    ru: "4-й полк Королевской артиллерии",
    tr: "4. Kraliyet Topçu Alayı",
    ar: "فوج المدفعية الملكية 4",
    zh: "皇家炮兵第4团",
  },
  "41 Mechanised Battalion": {
    ru: "41-й механизированный батальон",
    tr: "41. Mekanize Tabur",
    ar: "الكتيبة الميكانيكية 41",
    zh: "第41机械化营",
  },
  "5 Bn The Royal Regiment of Fusiliers": {
    ru: "5-й батальон, Королевский фузилёрный полк",
    tr: "Kraliyet Fişekçiler Alayı 5. Tabur",
    ar: "الكتيبة 5 - فوج الفيوسيلير الملكي",
    zh: "皇家燧发枪团第5营",
  },
  "5 Regiment Royal Artillery": {
    ru: "5-й полк Королевской артиллерии",
    tr: "5. Kraliyet Topçu Alayı",
    ar: "فوج المدفعية الملكية 5",
    zh: "皇家炮兵第5团",
  },
  "5 eme Groupe Brogade Mecanise du Canada": {
    ru: "5-я механизированная бригадная группа Канады",
    tr: "5. Kanada Mekanize Tugay Grubu",
    ar: "المجموعة اللوائية الميكانيكية الكندية 5",
    zh: "加拿大第5机械化旅群",
  },
  "6 Bn The Royal Regiment of Scotland": {
    ru: "6-й батальон, Королевский полк Шотландии",
    tr: "Kraliyet İskoçya Alayı 6. Tabur",
    ar: "الكتيبة 6 - الفوج الاسكتلندي الملكي",
    zh: "皇家苏格兰团第6营",
  },
  "6 Inf Bde": {
    ru: "6-я пехотная бригада",
    tr: "6. Piyade Tugayı",
    ar: "لواء المشاة 6",
    zh: "第6步兵旅",
  },
  "7 Bn The Royal Regiment of Scotland": {
    ru: "7-й батальон, Королевский полк Шотландии",
    tr: "Kraliyet İskoçya Alayı 7. Tabur",
    ar: "الكتيبة 7 - الفوج الاسكتلندي الملكي",
    zh: "皇家苏格兰团第7营",
  },
  "7 Coy, Coldstream Guards": {
    ru: "7-я рота, Колдстримская гвардия",
    tr: "Coldstream Muhafızları 7. Bölük",
    ar: "السرية 7 - حرس كولدستريم",
    zh: "科尔德斯特里姆卫队第7连",
  },
  "7th Territorial Defence Forces Brigade": {
    ru: "7-я бригада войск территориальной обороны",
    tr: "7. Bölgesel Savunma Kuvvetleri Tugayı",
    ar: "لواء قوات الدفاع الإقليمي 7",
    zh: "第7领土防卫部队旅",
  },
  "8 Bn The Rifles": {
    ru: "8-й батальон, полк «Стрелки»",
    tr: "Tüfekliler Alayı 8. Tabur",
    ar: "الكتيبة 8 - فوج البنادق",
    zh: "步枪团第8营",
  },
  "8 Training Battalion REME": {
    ru: "8-й учебный батальон REME",
    tr: "8. Eğitim Taburu REME",
    ar: "كتيبة التدريب 8 - REME",
    zh: "第8训练营 REME",
  },
  "9 Regiment RLC": {
    ru: "9-й полк RLC",
    tr: "9. Alay RLC",
    ar: "الفوج 9 - RLC",
    zh: "第9团 RLC",
  },
  "Armenian Armed Forces": {
    ru: "Вооружённые силы Армении",
    tr: "Ermenistan Silahlı Kuvvetleri",
    ar: "القوات المسلحة الأرمينية",
    zh: "亚美尼亚武装部队",
  },
  "Army Special Operations Brigade": {
    ru: "Бригада специальных операций сухопутных войск",
    tr: "Kara Kuvvetleri Özel Harekât Tugayı",
    ar: "لواء العمليات الخاصة للجيش",
    zh: "陆军特种作战旅",
  },
  "Birmingham UOTC": {
    ru: "Бирмингемский UOTC",
    tr: "Birmingham UOTC",
    ar: "UOTC برمنغهام",
    zh: "伯明翰 UOTC",
  },
  "Brigada Galicia VII 'Brilat'": {
    ru: "VII бригада «Галисия» (Brilat)",
    tr: "VII. Galiçya Tugayı 'Brilat'",
    ar: "لواء غاليسيا السابع 'بريلات'",
    zh: "加利西亚第七旅 'Brilat'",
  },
  "Cambridge UOTC": {
    ru: "Кембриджский UOTC",
    tr: "Cambridge UOTC",
    ar: "UOTC كامبريدج",
    zh: "剑桥 UOTC",
  },
  "Commando Logistic Regiment": {
    ru: "Логистический полк коммандос",
    tr: "Komando Lojistik Alayı",
    ar: "فوج الكوماندوز اللوجستي",
    zh: "突击队后勤团",
  },
  "Cyprus National Guard": {
    ru: "Национальная гвардия Кипра",
    tr: "Kıbrıs Milli Muhafız Ordusu",
    ar: "الحرس الوطني القبرصي",
    zh: "塞浦路斯国民警卫队",
  },
  "Defence College of Support (DCSp)": {
    ru: "Колледж обеспечения обороны (DCSp)",
    tr: "Savunma Destek Koleji (DCSp)",
    ar: "كلية الدعم الدفاعي (DCSp)",
    zh: "国防保障学院（DCSp）",
  },
  "East Midlands UOTC": {
    ru: "UOTC Восточного Мидленда",
    tr: "East Midlands UOTC",
    ar: "UOTC إيست ميدلاندز",
    zh: "东米德兰兹 UOTC",
  },
  "F Coy, Scots Guards": {
    ru: "Рота F, Шотландская гвардия",
    tr: "İskoç Muhafızları F Bölüğü",
    ar: "السرية F - الحرس الاسكتلندي",
    zh: "苏格兰卫队 F 连",
  },
  "Glasgow & Strathclyde UOTC": {
    ru: "UOTC Глазго и Стратклайда",
    tr: "Glasgow & Strathclyde UOTC",
    ar: "UOTC غلاسكو وستراثكلايد",
    zh: "格拉斯哥与斯特拉斯克莱德 UOTC",
  },
  "Gurkha ARRC Support Battalion": {
    ru: "Гуркхский батальон обеспечения ARRC",
    tr: "Gurkha ARRC Destek Taburu",
    ar: "كتيبة دعم ARRC الغوركية",
    zh: "廓尔喀 ARRC 支援营",
  },
  "Gurkha Company (Sittang)": {
    ru: "Гуркхская рота «Ситтанг»",
    tr: "Gurkha Bölüğü (Sittang)",
    ar: "سرية الغوركا (سيتانغ)",
    zh: "廓尔喀连（锡当）",
  },
  "Gurkha Company (Tavoleto) Waterloo Lines": {
    ru: "Гуркхская рота «Таволето», Waterloo Lines",
    tr: "Gurkha Bölüğü (Tavoleto) Waterloo Lines",
    ar: "سرية الغوركا (تافوليتو) - Waterloo Lines",
    zh: "廓尔喀连（塔沃莱托）Waterloo Lines",
  },
  "Gurkha Wing (Mandalay) IBS": {
    ru: "Гуркхское крыло «Мандалай», IBS",
    tr: "Gurkha Kanadı (Mandalay) IBS",
    ar: "جناح الغوركا (ماندالاي) IBS",
    zh: "廓尔喀联队（曼德勒）IBS",
  },
  "Irish Guards": {
    ru: "Ирландская гвардия",
    tr: "İrlanda Muhafızları",
    ar: "الحرس الأيرلندي",
    zh: "爱尔兰卫队",
  },
  "King Mindaugas Hussar Battalion": {
    ru: "Гусарский батальон имени короля Миндаугаса",
    tr: "Kral Mindaugas Hafif Süvari Taburu",
    ar: "كتيبة الفرسان الملك مينداوغاس",
    zh: "明道加斯国王轻骑兵营",
  },
  "Kosovo Security Force": {
    ru: "Силы безопасности Косово",
    tr: "Kosova Güvenlik Gücü",
    ar: "قوة أمن كوسوفو",
    zh: "科索沃安全部队",
  },
  "Kuperjanov Infantry Battalion": {
    ru: "Пехотный батальон имени Куперьянова",
    tr: "Kuperjanov Piyade Taburu",
    ar: "كتيبة كوبريانوف للمشاة",
    zh: "库佩尔亚诺夫步兵营",
  },
  "Land Forces Mechanized Infantry Brigade": {
    ru: "Механизированная пехотная бригада сухопутных войск",
    tr: "Kara Kuvvetleri Mekanize Piyade Tugayı",
    ar: "لواء المشاة الميكانيكي للقوات البرية",
    zh: "陆军机械化步兵旅",
  },
  "London UOTC": {
    ru: "Лондонский UOTC",
    tr: "Londra UOTC",
    ar: "UOTC لندن",
    zh: "伦敦 UOTC",
  },
  "Nepali Army": {
    ru: "Армия Непала",
    tr: "Nepal Ordusu",
    ar: "الجيش النيبالي",
    zh: "尼泊尔陆军",
  },
  "Netherlands Marine Corps": {
    ru: "Корпус морской пехоты Нидерландов",
    tr: "Hollanda Deniz Piyadeleri",
    ar: "سلاح مشاة البحرية الهولندي",
    zh: "荷兰海军陆战队",
  },
  "North West OTR": {
    ru: "Северо-Западный OTR",
    tr: "North West OTR",
    ar: "OTR الشمال الغربي",
    zh: "西北 OTR",
  },
  "Northumbria UOTC": {
    ru: "Нортумбрийский UOTC",
    tr: "Northumbria UOTC",
    ar: "UOTC نورثمبريا",
    zh: "诺森比亚 UOTC",
  },
  "Operations Directorate Chilean Army": {
    ru: "Оперативное управление Сухопутных войск Чили",
    tr: "Şili Ordusu Harekât Dairesi",
    ar: "مديرية العمليات في الجيش التشيلي",
    zh: "智利陆军作战局",
  },
  "Oxford UOTC": {
    ru: "Оксфордский UOTC",
    tr: "Oxford UOTC",
    ar: "UOTC أكسفورد",
    zh: "牛津 UOTC",
  },
  "Phillippine Marine Corps": {
    ru: "Корпус морской пехоты Филиппин",
    tr: "Filipinler Deniz Piyadeleri",
    ar: "سلاح مشاة البحرية الفلبيني",
    zh: "菲律宾海军陆战队",
  },
  "Qatar Armed Forces": {
    ru: "Вооружённые силы Катара",
    tr: "Katar Silahlı Kuvvetleri",
    ar: "القوات المسلحة القطرية",
    zh: "卡塔尔武装部队",
  },
  "Queens Own Yeomanry/Albania": {
    ru: "Собственный Её Величества йоменри / Албания",
    tr: "Queen's Own Yeomanry / Arnavutluk",
    ar: "فرسان الملكة / ألبانيا",
    zh: "女王直属义勇骑兵／阿尔巴尼亚",
  },
  "Queens UOTC": {
    ru: "UOTC Королевского университета",
    tr: "Queen's UOTC",
    ar: "UOTC كوينز",
    zh: "女王大学 UOTC",
  },
  "Reconnaissance & Intelligence Bn": {
    ru: "Батальон разведки и военной информации",
    tr: "Keşif ve İstihbarat Taburu",
    ar: "كتيبة الاستطلاع والاستخبارات",
    zh: "侦察与情报营",
  },
  "Royal Saudi Land Forces": {
    ru: "Королевские сухопутные войска Саудовской Аравии",
    tr: "Suudi Kraliyet Kara Kuvvetleri",
    ar: "القوات البرية الملكية السعودية",
    zh: "沙特皇家陆军",
  },
  "South West Officer Training Regiment (SWOTR)": {
    ru: "Юго-Западный полк подготовки офицеров (SWOTR)",
    tr: "Güney Batı Subay Eğitim Alayı (SWOTR)",
    ar: "فوج تدريب الضباط في الجنوب الغربي (SWOTR)",
    zh: "西南军官训练团（SWOTR）",
  },
  "Southampton UOTC": {
    ru: "Саутгемптонский UOTC",
    tr: "Southampton UOTC",
    ar: "UOTC ساوثهامبتون",
    zh: "南安普顿 UOTC",
  },
  "The Kings Royal Hussars": {
    ru: "Королевские гусары короля",
    tr: "Kral'ın Kraliyet Hafif Süvarileri",
    ar: "فرسان الملك الملكيون",
    zh: "国王皇家轻骑兵团",
  },
  "The Light Dragoons": {
    ru: "Лёгкие драгуны",
    tr: "Hafif Ejderha Süvarileri",
    ar: "الفرسان الخفيفة",
    zh: "轻龙骑兵团",
  },
  "The MOD of The Republic of Uzbekistan": {
    ru: "Министерство обороны Республики Узбекистан",
    tr: "Özbekistan Cumhuriyeti Savunma Bakanlığı",
    ar: "وزارة دفاع جمهورية أوزبكستان",
    zh: "乌兹别克斯坦共和国国防部",
  },
  "The Royal Dragoon Guards": {
    ru: "Королевские драгунские гвардейцы",
    tr: "Kraliyet Ejderha Muhafızları",
    ar: "حرس الفرسان الملكي",
    zh: "皇家龙骑兵卫队",
  },
  "The Royal Lancers": {
    ru: "Королевские уланы",
    tr: "Kraliyet Mızraklı Süvarileri",
    ar: "الرماحون الملكيون",
    zh: "皇家枪骑兵团",
  },
  "The Royal Yeomanry": {
    ru: "Королевский йоменри",
    tr: "Kraliyet Yeomanry",
    ar: "اليومانري الملكي",
    zh: "皇家义勇骑兵团",
  },
  "Turkmenistan MOD": {
    ru: "Министерство обороны Туркменистана",
    tr: "Türkmenistan Savunma Bakanlığı",
    ar: "وزارة الدفاع التركمانية",
    zh: "土库曼斯坦国防部",
  },
  "US Army Cadet Command, Blueridge Battalion": {
    ru: "Кадетское командование Армии США, батальон «Блю-Ридж»",
    tr: "ABD Ordusu Öğrenci Komutanlığı, Blueridge Taburu",
    ar: "قيادة طلاب الجيش الأمريكي، كتيبة بلو ريدج",
    zh: "美国陆军学员司令部蓝岭营",
  },
  "Wales UOTC": {
    ru: "Уэльский UOTC",
    tr: "Galler UOTC",
    ar: "UOTC ويلز",
    zh: "威尔士 UOTC",
  },
  "Yorkshire OTR": {
    ru: "Йоркширский OTR",
    tr: "Yorkshire OTR",
    ar: "OTR يوركشاير",
    zh: "约克郡 OTR",
  },
  "bataillon de Chasseurs a Cheval": {
    ru: "Батальон конных егерей",
    tr: "Atlı Avcı Taburu",
    ar: "كتيبة الصيادين الفرسان",
    zh: "骑兵猎兵营",
  },
};

/** Localized designation, or the original English when unlisted. */
function designation(text: string, locale: NonEn): string {
  return DESIGNATIONS[text]?.[locale] ?? text;
}

export function translateAwardUnit(unit: string, locale: Locale): string {
  if (locale === "en") return unit;

  const trimmed = unit.trim();
  if (!trimmed) return unit;

  // Whole value is a country (rows that carry no unit designation).
  const whole = translateCountryName(trimmed, locale);
  if (whole !== trimmed) return whole;

  // "COUNTRY - Unit". Non-greedy up to the first " - " so the split lands on
  // the country rather than a hyphen inside the designation itself.
  const match = trimmed.match(/^(.+?)\s+-\s+(.+)$/);
  if (match) {
    const [, head, rest] = match;
    const country = translateCountryName(head, locale);
    if (country !== head) {
      return `${country} - ${designation(rest, locale)}`;
    }
  }

  // No country prefix (or an unresolved one, e.g. a joint entry naming the
  // nation mid-string) — translate the whole label as a designation.
  return designation(trimmed, locale);
}
