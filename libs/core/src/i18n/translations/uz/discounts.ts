export const DISCOUNTS_UZ = {
  page: {
    tariffsTitle: 'Tofan tarif chegirmalari',
    tariffsSubtitle:
      'Standard tarifiga bayram kampaniyalari va "N daqiqada oling" taymeri. Free\'ga chegirma bo\'lmaydi.',
    trainersTitle: 'Coach chegirmalari',
    trainersSubtitle:
      "Coach obunalariga kampaniya va taymer. Chegirmani Tofan to'laydi: coach o'z narxini to'liq oladi, foiz foydalanuvchi to'laydigan jami summadan olinadi.",
    loading: 'Yuklanmoqda...',
    priority:
      'Kampaniya ketayotganda taymer chegirmasi emas, kampaniya chegirmasi olinadi va taymer boshlanmaydi.',
  },
  campaigns: {
    title: 'Kampaniyalar',
    subtitle: "Boshlanish va tugash vaqti bor chegirmalar: bayramlar va e'lon qilingan aksiyalar.",
    create: 'Yangi kampaniya',
    empty: "Hali kampaniya yo'q.",
  },
  card: {
    running: 'Hozir ketmoqda',
    audience: 'Kimga',
    newBuyers: 'Faqat yangi xaridorlarga',
    everyone: 'Hammaga',
  },
  form: {
    createHeader: 'Yangi kampaniya',
    editHeader: 'Kampaniyani tahrirlash',
    name: 'Nomi',
    namePlaceholder: "Masalan: Navro'z 2027",
    nameHint: "Faqat admin panelda ko'rinadi, ilovaga chiqmaydi.",
    startsOn: 'Boshlanadi',
    endsOn: 'Tugaydi',
    timeHint: 'Vaqt kompyuteringiz vaqt mintaqasida (Toshkent) kiritiladi.',
    standardPercent: 'Standard chegirmasi',
    vipPercent: 'VIP chegirmasi',
    percentSuffix: '%',
    percentHint: "0 dan 99 gacha butun son. 0 — shu darajaga chegirma yo'q.",
    newBuyersOnly: 'Faqat hech qachon Tofan tarifini olmaganlarga',
    newBuyersOnlyTrainer: "Faqat shu coach'ga hech obuna bo'lmaganlarga",
    trainers: "Coach'lar",
    allTrainers: "Hamma coach'lar",
    trainersPlaceholder: "Coach'larni tanlang",
    errors: {
      name: 'Nomni kiriting (200 belgigacha).',
      startsOn: 'Boshlanish vaqtini tanlang.',
      endsOn: "Tugash vaqti boshlanishdan keyin bo'lsin.",
      percent: '0 dan 99 gacha butun son kiriting.',
      noDiscount: 'Kamida bitta darajaga chegirma bering.',
      trainers: 'Kamida bitta coach tanlang yoki "Hamma coach\'lar"ni yoqing.',
    },
  },
  timer: {
    title: 'Taymer',
    subtitle:
      'Foydalanuvchi sahifani N-chi ochganda shaxsiy teskari sanoq boshlanadi. Har foydalanuvchiga bir marta.',
    enabled: 'Taymer yoqilgan',
    trigger: {
      label: 'Qachon boshlanadi',
      hint: 'Har coach alohida: shu coach sahifasini N-chi ochganda shu coach uchun. Istalgan coach: coach sahifalarini jami N-chi ochganda, bitta taymer hammasiga.',
      eachTrainer: 'Har coach alohida',
      anyTrainer: 'Istalgan coach',
    },
    startsOnVisit: 'Tariflar ekranini nechanchi ochganda',
    startsOnVisitTrainer: 'Coach sahifasini nechanchi ochganda',
    duration: 'Davomiyligi',
    minutesSuffix: ' daq',
    liveHint:
      "O'chirsangiz, ketayotgan taymerlar ham darhol to'xtaydi. Foiz darhol ta'sir qiladi, davomiylik faqat yangi taymerlarga.",
    errors: {
      startsOnVisit: '1 yoki undan katta butun son kiriting.',
      duration: '1 dan 10080 gacha (7 kun) daqiqa kiriting.',
      noDiscount: 'Yoqilgan taymer kamida bitta darajaga chegirma berishi kerak.',
    },
  },
  toast: {
    campaignCreated: "Kampaniya qo'shildi.",
    campaignSaved: 'Kampaniya saqlandi.',
    campaignRemoved: "Kampaniya o'chirildi.",
    timerSaved: 'Taymer saqlandi.',
  },
};
