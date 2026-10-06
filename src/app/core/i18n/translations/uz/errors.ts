export const ERRORS_UZ = {
  backend: {
    Authentication: {
      InvalidCredentials: "Login yoki parol noto'g'ri.",
      InvalidRefreshToken: 'Sessiya tugadi. Qaytadan kiring.',
    },
    IdentityProvider: {
      UserNotFound: 'Bunday foydalanuvchi topilmadi.',
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
    },
    WorkoutPlan: {
      TrainerProgramMissing: "Trener hali mashq dasturini e'lon qilmagan.",
    },
    MealPlan: {
      TrainerProgramMissing: "Trener hali ovqatlanish dasturini e'lon qilmagan.",
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
