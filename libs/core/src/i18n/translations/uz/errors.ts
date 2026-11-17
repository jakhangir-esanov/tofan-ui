export const ERRORS_UZ = {
  backend: {
    Authentication: {
      InvalidCredentials: "Login yoki parol noto'g'ri.",
      InvalidRefreshToken: 'Sessiya tugadi. Qaytadan kiring.',
    },
    IdentityProvider: {
      UserNotFound: 'Bunday foydalanuvchi topilmadi.',
    },
    Chat: {
      ConversationNotFound: 'Suhbat topilmadi. Chatlar ro‘yxatini yangilab ko‘ring.',
      MessageNotFound: 'Xabar topilmadi. U allaqachon o‘chirilgan bo‘lishi mumkin.',
      SubscriptionRequired: 'Chat faqat faol VIP obunali sportchilar uchun ochiq.',
    },
    NotificationTemplate: {
      Conflict: 'Bu tur va uslub uchun faol shablon allaqachon bor. Avval uni faolsizlantiring.',
      NoActiveTemplate: 'Bu tur uchun foydalanuvchi uslubiga mos faol shablon topilmadi.',
    },
    NotificationPreference: {
      Disabled: "Foydalanuvchi bu turdagi bildirishnomalarni o'chirib qo'ygan.",
    },
    PushNotification: {
      NoActiveDevice: "Foydalanuvchining push qabul qiladigan faol qurilmasi yo'q.",
      DispatchFailed: 'Push xizmati bildirishnomani yetkaza olmadi.',
      Disabled: "Bu muhitda push bildirishnomalar o'chirilgan.",
      ConfigurationInvalid:
        'Push xizmati sozlanmagan (Firebase kalitlari yo‘q). Administratorga murojaat qiling.',
    },
    UserId: {
      Empty: 'Foydalanuvchi ID kiritilishi shart.',
      Invalid: 'Foydalanuvchi ID UUID ko‘rinishida bo‘lishi kerak.',
    },
    Data: {
      KeyEmpty: 'Qo‘shimcha ma’lumotdagi har bir qiymatning kaliti bo‘lishi kerak.',
      KeyDuplicate: 'Qo‘shimcha ma’lumotda kalitlar takrorlanmasligi kerak.',
    },
    StoredFile: {
      InUse: 'Fayl mashq videosi sifatida ishlatilmoqda. Avval uni mashqdan olib tashlang.',
      NotFound: 'Fayl topilmadi — u allaqachon o‘chirilgan bo‘lishi mumkin.',
      Empty: 'Tanlangan fayl bo‘sh.',
      UnsupportedContent: 'Bu fayl turi tanlangan kategoriya uchun qabul qilinmaydi.',
      TooLarge: 'Fayl bu kategoriya uchun ruxsat etilgan hajmdan katta.',
    },
    Exercise: {
      VideoAlreadyAttached:
        'Bu mashqqa boshqa video biriktirib bo‘lingan. Yuklangan fayl o‘chirildi — ro‘yxatni yangilang.',
    },
    User: {
      NotFound: 'Hisob topilmadi — u Keycloak’dan o‘chirilgan bo‘lishi mumkin.',
      AlreadyBlocked: 'Hisob allaqachon bloklangan.',
      NotBlocked: 'Hisob bloklanmagan.',
      CannotBlockSelf: 'O‘z hisobingizni bloklay olmaysiz.',
      InvalidUsername:
        'Username faqat lotin harflari, raqamlar va . _ - @ belgilaridan iborat bo‘lishi mumkin.',
    },
    Garment: {
      NotFound: "Futbolka topilmadi — u o'chirilgan bo'lishi mumkin.",
      ManufacturedInFuture: "Ishlab chiqarilgan sana kelajakda bo'lishi mumkin emas.",
      NotClaimed: 'Muddatni faqat aktivatsiya qilingan futbolkaga uzaytirish mumkin.',
      CannotDeleteClaimed: "Aktivatsiya qilingan futbolkani o'chirib bo'lmaydi. Uni bekor qiling.",
      StatusNotAllowed:
        "Futbolkani faqat faol, yashirilgan yoki bekor qilingan holatga o'tkazish mumkin.",
      MonthsOutOfRange: "Muddat 1 oydan 24 oygacha bo'lishi kerak.",
    },
    Trainer: {
      PriceNotSet:
        "Trener narxni hali belgilamagan. Avval trener o'z profilida narxni kiritishi kerak.",
      NotFound: 'Trener topilmadi.',
      DisplayNameEmpty: 'Trener ismi kiritilishi shart.',
    },
    TrainerSubscription: {
      OtherTrainerActive: 'Foydalanuvchida boshqa trenerga faol obuna bor — avval uni tugating.',
      MonthsOutOfRange: "Obuna muddati 1 oydan 12 oygacha bo'lishi kerak.",
      NotFound: "Obuna topilmadi. Ro'yxatni yangilab, qayta urinib ko'ring.",
      NotActive: "Obuna faol emas, shuning uchun uning darajasini o'zgartirib bo'lmaydi.",
    },
    WorkoutPlan: {
      TrainerProgramMissing: "Trener hali mashq dasturini e'lon qilmagan.",
    },
    MealPlan: {
      TrainerProgramMissing: "Trener hali ovqatlanish dasturini e'lon qilmagan.",
    },
    TrainerPost: {
      NotFound: 'Post topilmadi. Ro‘yxatni yangilab, qayta urinib ko‘ring.',
    },
    TrainerVideoCollection: {
      NotFound: 'To‘plam topilmadi. Ro‘yxatni yangilab, qayta urinib ko‘ring.',
      VideoNotFound: 'Video topilmadi. Sahifani yangilab, qayta urinib ko‘ring.',
      Empty: 'To‘plamni e’lon qilish uchun kamida bitta video qo‘shing.',
      LimitReached: 'Bu 20 ta to‘plam - yangisini yaratish uchun bittasini o‘chiring.',
      VideoLimitReached: 'Bu 50 ta video - yangisini qo‘shish uchun bittasini olib tashlang.',
      OrderMismatch: 'Tartib eskirgan. Sahifani yangilab, qayta urinib ko‘ring.',
      VideoOrderMismatch: 'Videolar tartibi eskirgan. Sahifani yangilab, qayta urinib ko‘ring.',
    },
    Tariff: {
      FreeMustStayFree: "Free tarif doim bepul bo'lishi kerak. Narxni 0 qoldiring.",
      PaidPriceRequired: "Standard va VIP tariflarning narxi 0 dan katta bo'lishi kerak.",
      NotFound: 'Tarif topilmadi.',
    },
    GetUsersQuery:
      'Hisoblarni Keycloak’dan o‘qib bo‘lmadi. Rol filtri tanlangan bo‘lsa, u hozircha ishlamasligi mumkin (Keycloak sozlamasi kerak).',
  },
  classes: {
    network: "Serverga ulanib bo'lmadi. Keyinroq qayta urinib ko'ring.",
    invalidCredentials: "Login yoki parol noto'g'ri.",
    sessionExpired: 'Sessiya tugadi. Qaytadan kiring.',
    accessDenied: "Bu amal uchun ruxsatingiz yo'q.",
    notFound: "Ma'lumot topilmadi — u o'chirilgan bo'lishi mumkin.",
    conflict: "Bunday ma'lumot allaqachon mavjud.",
    validationFallback: "Ma'lumotlar to'g'ri to'ldirilmagan.",
    generic: "Amalni bajarib bo'lmadi. Keyinroq qayta urinib ko'ring.",
  },
};
