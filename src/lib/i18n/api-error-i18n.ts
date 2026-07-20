/**
 * Localization for the English error prose returned by `src/app/api/user/**`.
 *
 * The API routes have no locale context (they are also consumed by the admin
 * and audit surfaces), so the strings stay English on the wire and are
 * translated here, at the point of display. Shape follows
 * `key-date-i18n.ts`: normalize the English source into a lookup key, map it
 * per locale, and fall back to the ORIGINAL string when unrecognised — an
 * error message the map has not seen still reaches the participant, just
 * untranslated, rather than showing a raw key or an empty toast.
 *
 * Covers both `{ error }` prose and the zod messages that arrive via
 * `{ errors: { field: [msg] } }` on a server round-trip.
 */

import type { Locale } from "@/lib/i18n/config";

type Translations = Record<Exclude<Locale, "en">, string>;

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Known server messages → per-locale text (keyed by normalized English). */
const MESSAGES: Record<string, Translations> = {
  /* —— Session / account ————————————————————————————————— */
  usernotfound: {
    ru: "Пользователь не найден",
    tr: "Kullanıcı bulunamadı",
    ar: "لم يتم العثور على المستخدم",
    zh: "未找到用户",
  },
  accountsuspended: {
    ru: "Учётная запись заблокирована",
    tr: "Hesap askıya alındı",
    ar: "الحساب موقوف",
    zh: "账户已停用",
  },
  unauthorized: {
    ru: "Нет доступа",
    tr: "Yetkiniz yok",
    ar: "غير مصرح",
    zh: "未授权",
  },
  unitnotfound: {
    ru: "Подразделение не найдено",
    tr: "Birlik bulunamadı",
    ar: "لم يتم العثور على الوحدة",
    zh: "未找到单位",
  },

  /* —— Participation ————————————————————————————————————— */
  confirmyourparticipationfirst: {
    ru: "Сначала подтвердите участие",
    tr: "Önce katılımınızı onaylayın",
    ar: "يرجى تأكيد مشاركتك أولاً",
    zh: "请先确认参加",
  },
  theregistrationconfirmationdeadlinehaspassedconfirmationisnolongerpossiblepleasecontacttheorganizers:
    {
      ru: "Срок подтверждения регистрации истёк. Подтверждение больше невозможно — пожалуйста, свяжитесь с организаторами.",
      tr: "Kayıt onay süresi doldu. Onaylama artık mümkün değildir — lütfen organizatörlerle iletişime geçin.",
      ar: "انتهى الموعد النهائي لتأكيد التسجيل. لم يعد التأكيد ممكناً — يرجى التواصل مع المنظمين.",
      zh: "报名确认截止日期已过，无法再进行确认 — 请联系主办方。",
    },

  /* —— Team registration ————————————————————————————————— */
  yourregistrationmustbeverifiedbythesdbeforeteamregistration: {
    ru: "Перед регистрацией команды ваша заявка должна быть проверена Спортивным директоратом (SD)",
    tr: "Takım kaydından önce kaydınızın Spor Direktörlüğü (SD) tarafından doğrulanması gerekir",
    ar: "يجب أن تتحقق مديرية الرياضة (SD) من تسجيلك قبل تسجيل الفريق",
    zh: "团队注册前，您的报名须经体育局（SD）核验",
  },
  yourpaymentmustbeverifiedbythemtbeforeteamregistration: {
    ru: "Перед регистрацией команды ваш платёж должен быть проверен Группой управления (MT)",
    tr: "Takım kaydından önce ödemenizin Yönetim Ekibi (MT) tarafından doğrulanması gerekir",
    ar: "يجب أن يتحقق فريق الإدارة (MT) من دفعتك قبل تسجيل الفريق",
    zh: "团队注册前，您的付款须经管理组（MT）核验",
  },
  teamregistrationhasnotopenedyet: {
    ru: "Регистрация команд ещё не открыта",
    tr: "Takım kaydı henüz açılmadı",
    ar: "لم يُفتح تسجيل الفرق بعد",
    zh: "团队注册尚未开放",
  },
  theteamregistrationperiodhasclosed: {
    ru: "Период регистрации команд закрыт",
    tr: "Takım kayıt dönemi sona erdi",
    ar: "انتهت فترة تسجيل الفرق",
    zh: "团队注册期已结束",
  },
  teamregistrationisnotavailable: {
    ru: "Регистрация команды недоступна",
    tr: "Takım kaydı kullanılamıyor",
    ar: "تسجيل الفريق غير متاح",
    zh: "团队注册不可用",
  },

  /* —— Roster ————————————————————————————————————————————— */
  teammembernotfound: {
    ru: "Участник команды не найден",
    tr: "Takım üyesi bulunamadı",
    ar: "لم يتم العثور على عضو الفريق",
    zh: "未找到队员",
  },
  teammembernotfoundonyourroster: {
    ru: "Участник не найден в составе вашей команды",
    tr: "Takım üyesi kadronuzda bulunamadı",
    ar: "لم يتم العثور على عضو الفريق في قائمتك",
    zh: "在您的名单中未找到该队员",
  },
  addatleastoneteammemberbeforecompletingtheroster: {
    ru: "Добавьте хотя бы одного участника, прежде чем завершить состав команды",
    tr: "Kadroyu tamamlamadan önce en az bir takım üyesi ekleyin",
    ar: "أضف عضو فريق واحداً على الأقل قبل إكمال القائمة",
    zh: "完成名单前请至少添加一名队员",
  },
  registeryourteambeforerequestingadditionalmembers: {
    ru: "Зарегистрируйте команду, прежде чем запрашивать дополнительных участников",
    tr: "Ek üye talep etmeden önce takımınızı kaydedin",
    ar: "سجّل فريقك قبل طلب أعضاء إضافيين",
    zh: "申请增加队员前请先注册您的团队",
  },
  youalreadyhaveapendingrequestawaitingadminreview: {
    ru: "У вас уже есть запрос, ожидающий рассмотрения администрацией",
    tr: "Yönetici incelemesini bekleyen bir talebiniz zaten var",
    ar: "لديك بالفعل طلب قيد المراجعة من قبل الإدارة",
    zh: "您已有一份等待管理员审核的申请",
  },

  /* —— Payment ———————————————————————————————————————————— */
  paymentsubmissionisnotavailableforyouraccountstatus: {
    ru: "Отправка платежа недоступна при текущем статусе вашей учётной записи",
    tr: "Hesap durumunuz ödeme göndermeye uygun değil",
    ar: "إرسال الدفع غير متاح وفقاً لحالة حسابك",
    zh: "您当前的账户状态无法提交付款",
  },
  thepaymentdeadlinehaspassed: {
    ru: "Срок оплаты истёк.",
    tr: "Ödeme son tarihi geçti.",
    ar: "انتهى الموعد النهائي للدفع.",
    zh: "付款截止日期已过。",
  },
  paymentprooffileisrequired: {
    ru: "Необходимо приложить подтверждение платежа",
    tr: "Ödeme belgesi dosyası gereklidir",
    ar: "ملف إثبات الدفع مطلوب",
    zh: "必须提供付款凭证文件",
  },
  filemustbeunder5mb: {
    ru: "Размер файла не должен превышать 5 МБ",
    tr: "Dosya 5 MB'tan küçük olmalıdır",
    ar: "يجب أن يكون حجم الملف أقل من 5 ميغابايت",
    zh: "文件大小须小于 5MB",
  },
  uploadfailed: {
    ru: "Не удалось загрузить файл",
    tr: "Yükleme başarısız oldu",
    ar: "فشل الرفع",
    zh: "上传失败",
  },

  /* —— Flights ———————————————————————————————————————————— */
  invaliddocumenttype: {
    ru: "Недопустимый тип документа",
    tr: "Geçersiz belge türü",
    ar: "نوع المستند غير صالح",
    zh: "文件类型无效",
  },
  flightrecordnotfound: {
    ru: "Запись о рейсе не найдена",
    tr: "Uçuş kaydı bulunamadı",
    ar: "لم يتم العثور على سجل الرحلة",
    zh: "未找到航班记录",
  },
  documentnotuploadedyet: {
    ru: "Документ ещё не загружен",
    tr: "Belge henüz yüklenmedi",
    ar: "لم يتم رفع المستند بعد",
    zh: "尚未上传文件",
  },
  thattraveleralreadyhasaflightrecord: {
    ru: "У этого путешественника уже есть запись о рейсе",
    tr: "Bu yolcunun zaten bir uçuş kaydı var",
    ar: "لدى هذا المسافر سجل رحلة بالفعل",
    zh: "该出行人员已有航班记录",
  },
  aflightrecordalreadyexistsforthistraveleredititinstead: {
    ru: "Для этого путешественника уже существует запись о рейсе — измените её",
    tr: "Bu yolcu için zaten bir uçuş kaydı mevcut — bunun yerine onu düzenleyin",
    ar: "يوجد سجل رحلة لهذا المسافر بالفعل — يرجى تعديله بدلاً من ذلك",
    zh: "该出行人员已存在航班记录 — 请直接编辑",
  },

  /* —— Zod messages that leak back through a server round-trip ———— */
  fullnameisrequired: {
    ru: "Укажите полное имя",
    tr: "Ad soyad gereklidir",
    ar: "الاسم الكامل مطلوب",
    zh: "请填写全名",
  },
  serialnumberisrequired: {
    ru: "Укажите личный номер",
    tr: "Sicil numarası gereklidir",
    ar: "الرقم التسلسلي مطلوب",
    zh: "请填写编号",
  },
  rankisrequired: {
    ru: "Укажите звание",
    tr: "Rütbe gereklidir",
    ar: "الرتبة مطلوبة",
    zh: "请填写军衔",
  },
  requestedteamsizemustbeatleast14: {
    ru: "Запрашиваемый размер команды должен быть не менее 14",
    tr: "Talep edilen takım mevcudu en az 14 olmalıdır",
    ar: "يجب ألا يقل حجم الفريق المطلوب عن 14",
    zh: "申请的队伍人数不得少于 14 人",
  },
  requestedsizetoolarge: {
    ru: "Запрашиваемый размер слишком велик",
    tr: "Talep edilen mevcut çok yüksek",
    ar: "الحجم المطلوب كبير جداً",
    zh: "申请的人数过多",
  },
  pleaseprovideajustificationatleast20characters: {
    ru: "Укажите обоснование (не менее 20 символов)",
    tr: "Lütfen bir gerekçe belirtin (en az 20 karakter)",
    ar: "يرجى تقديم مبرر (20 حرفاً على الأقل)",
    zh: "请提供理由（至少 20 个字符）",
  },
  selectthetravellerthisflightbelongsto: {
    ru: "Выберите пассажира, к которому относится этот рейс",
    tr: "Bu uçuşun ait olduğu yolcuyu seçin",
    ar: "اختر المسافر الذي تخصه هذه الرحلة",
    zh: "请选择此航班所属的出行人员",
  },
  passengernameisrequired: {
    ru: "Укажите имя пассажира",
    tr: "Yolcu adı gereklidir",
    ar: "اسم المسافر مطلوب",
    zh: "请填写乘客姓名",
  },
  passportnumberisrequired: {
    ru: "Укажите номер паспорта",
    tr: "Pasaport numarası gereklidir",
    ar: "رقم جواز السفر مطلوب",
    zh: "请填写护照号码",
  },
  lettersdigitsanddashesonly: {
    ru: "Только буквы, цифры и дефисы",
    tr: "Yalnızca harf, rakam ve tire",
    ar: "أحرف وأرقام وشرطات فقط",
    zh: "仅限字母、数字和连字符",
  },
  amountmustbepositive: {
    ru: "Сумма должна быть положительной",
    tr: "Tutar pozitif olmalıdır",
    ar: "يجب أن يكون المبلغ موجباً",
    zh: "金额必须为正数",
  },
  referencerequired: {
    ru: "Укажите номер транзакции",
    tr: "Referans gereklidir",
    ar: "الرقم المرجعي مطلوب",
    zh: "请填写交易参考号",
  },
  subjectistooshort: {
    ru: "Тема слишком короткая",
    tr: "Konu çok kısa",
    ar: "الموضوع قصير جداً",
    zh: "主题过短",
  },
  pleasedescribeyourissue: {
    ru: "Опишите вашу проблему",
    tr: "Lütfen sorununuzu açıklayın",
    ar: "يرجى وصف مشكلتك",
    zh: "请描述您的问题",
  },
  messagerequired: {
    ru: "Введите сообщение",
    tr: "Mesaj gereklidir",
    ar: "الرسالة مطلوبة",
    zh: "请填写留言内容",
  },

  /* —— Client form validation (RegisterSchema, UnitUpdateSchema, password) —— */
  required: {
    ru: "Обязательное поле",
    tr: "Zorunlu",
    ar: "مطلوب",
    zh: "必填",
  },
  toolong: {
    ru: "Слишком длинно",
    tr: "Çok uzun",
    ar: "طويل جدًا",
    zh: "过长",
  },
  validemailrequired: {
    ru: "Требуется действительный адрес электронной почты",
    tr: "Geçerli bir e-posta gerekli",
    ar: "يلزم بريد إلكتروني صالح",
    zh: "需要有效的电子邮件",
  },
  validmilitaryemailrequired: {
    ru: "Требуется действительная служебная электронная почта",
    tr: "Geçerli bir askerî e-posta gerekli",
    ar: "يلزم بريد إلكتروني عسكري صالح",
    zh: "需要有效的军用电子邮件",
  },
  passwordrequired: {
    ru: "Требуется пароль",
    tr: "Parola gereklidir",
    ar: "كلمة المرور مطلوبة",
    zh: "密码为必填项",
  },
  youmustaccepttheprivacypolicy: {
    ru: "Вы должны принять политику конфиденциальности",
    tr: "Gizlilik politikasını kabul etmelisiniz",
    ar: "يجب أن تقبل سياسة الخصوصية",
    zh: "您必须接受隐私政策",
  },
  passwordsdonotmatch: {
    ru: "Пароли не совпадают",
    tr: "Parolalar eşleşmiyor",
    ar: "كلمتا المرور غير متطابقتين",
    zh: "两次输入的密码不一致",
  },
  selectavalidcountry: {
    ru: "Выберите действительную страну",
    tr: "Geçerli bir ülke seçin",
    ar: "اختر دولة صالحة",
    zh: "请选择有效的国家/地区",
  },
  pleaseenteryourcountry: {
    ru: "Укажите вашу страну",
    tr: "Lütfen ülkenizi girin",
    ar: "يرجى إدخال دولتك",
    zh: "请输入您的国家/地区",
  },
  pleaseenterthecountry: {
    ru: "Укажите страну",
    tr: "Lütfen ülkeyi girin",
    ar: "يرجى إدخال الدولة",
    zh: "请输入国家/地区",
  },
  requiredforinternationalparticipants: {
    ru: "Обязательно для международных участников",
    tr: "Uluslararası katılımcılar için zorunludur",
    ar: "مطلوب للمشاركين الدوليين",
    zh: "国际参赛者必填",
  },
  requiredforparticipants: {
    ru: "Обязательно для участников",
    tr: "Katılımcılar için zorunludur",
    ar: "مطلوب للمشاركين",
    zh: "参赛者必填",
  },
  minimum8characters: {
    ru: "Минимум 8 символов",
    tr: "En az 8 karakter",
    ar: "8 أحرف على الأقل",
    zh: "至少 8 个字符",
  },
  maximum128characters: {
    ru: "Максимум 128 символов",
    tr: "En fazla 128 karakter",
    ar: "128 حرفًا كحد أقصى",
    zh: "最多 128 个字符",
  },
  mustincludealowercaseletter: {
    ru: "Должен содержать строчную букву",
    tr: "Bir küçük harf içermelidir",
    ar: "يجب أن يتضمّن حرفًا صغيرًا",
    zh: "必须包含一个小写字母",
  },
  mustincludeanuppercaseletter: {
    ru: "Должен содержать заглавную букву",
    tr: "Bir büyük harf içermelidir",
    ar: "يجب أن يتضمّن حرفًا كبيرًا",
    zh: "必须包含一个大写字母",
  },
  mustincludeanumber: {
    ru: "Должен содержать цифру",
    tr: "Bir rakam içermelidir",
    ar: "يجب أن يتضمّن رقمًا",
    zh: "必须包含一个数字",
  },
  mustincludeaspecialcharacter: {
    ru: "Должен содержать специальный символ",
    tr: "Bir özel karakter içermelidir",
    ar: "يجب أن يتضمّن رمزًا خاصًا",
    zh: "必须包含一个特殊字符",
  },
};

/** Server messages that interpolate a value — matched by pattern. */
const PATTERNS: {
  re: RegExp;
  render: Record<Exclude<Locale, "en">, (...groups: string[]) => string>;
}[] = [
  {
    // "Your current limit is already 13. Request a larger team size."
    re: /^your current limit is already (\d+)\. request a larger team size\.$/i,
    render: {
      ru: (n) => `Ваш текущий лимит уже составляет ${n}. Запросите больший размер команды.`,
      tr: (n) => `Mevcut limitiniz zaten ${n}. Daha büyük bir takım mevcudu talep edin.`,
      ar: (n) => `الحد الحالي لديك هو ${n} بالفعل. يرجى طلب حجم فريق أكبر.`,
      zh: (n) => `您当前的上限已经是 ${n} 人。请申请更大的队伍规模。`,
    },
  },
];

/**
 * Translate a server-supplied English message. Unknown messages are returned
 * unchanged so nothing is ever swallowed.
 */
export function translateApiMessage(message: string, locale: Locale): string {
  if (locale === "en") return message;
  const exact = MESSAGES[norm(message)]?.[locale];
  if (exact) return exact;

  const trimmed = message.trim();
  for (const { re, render } of PATTERNS) {
    const m = trimmed.match(re);
    if (m) return render[locale](...m.slice(1));
  }
  return message;
}

/**
 * Pull a displayable, localized message out of a failed JSON API response
 * body. Prefers the first field-level zod message, then the top-level `error`,
 * then the caller's localized generic fallback.
 */
export function apiErrorMessage(
  body: unknown,
  locale: Locale,
  fallback: string
): string {
  const data = (body ?? {}) as {
    error?: unknown;
    errors?: Record<string, unknown>;
  };
  if (data.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors).flat()[0];
    if (typeof first === "string") return translateApiMessage(first, locale);
  }
  if (typeof data.error === "string") {
    return translateApiMessage(data.error, locale);
  }
  return fallback;
}
