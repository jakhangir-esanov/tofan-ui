export const TRAINERS_UZ = {
  page: {
    title: 'Trenerlar',
    tabs: {
      trainers: 'Trenerlar',
      subscriptions: 'Obunalar',
    },
  },
  status: {
    published: "E'lon qilingan",
    draft: 'Qoralama',
  },
  subscriptionStatus: {
    active: 'Faol',
    ended: 'Tugagan',
  },
  list: {
    total: 'Jami {count} ta trener',
    empty: "Hozircha trener yo'q.",
    add: "Trener qo'shish",
    price: "{amount} so'm",
    priceMissing: 'Belgilanmagan',
    columns: {
      trainer: 'Trener',
      userId: 'Foydalanuvchi ID',
      monthlyPrice: 'Oylik narx',
      status: 'Holati',
      createdOn: 'Yaratilgan',
    },
    actions: {
      grant: 'Obuna berish',
      publish: "E'lon qilish",
      unpublish: "Ro'yxatdan olish",
    },
  },
  subscriptions: {
    total: 'Jami {count} ta obuna',
    empty: 'Bu shartlarga mos obuna topilmadi.',
    add: 'Obuna berish',
    endedOn: '{date} da tugatilgan',
    columns: {
      trainer: 'Trener',
      userId: 'Foydalanuvchi',
      startsOn: 'Boshlangan',
      endsOn: 'Tugaydi',
      status: 'Holati',
    },
    actions: {
      end: 'Obunani tugatish',
    },
    confirmEnd:
      '"{name}" trenerining obunasi tugatilsinmi? Foydalanuvchi o\'z mashq va ovqatlanish rejasiga qaytadi.',
  },
  filters: {
    trainer: 'Trener',
    userId: 'Foydalanuvchi ID',
    status: 'Holati',
    all: 'Hammasi',
    userIdInvalid: "UUID ko'rinishida kiriting.",
  },
  form: {
    header: "Trener qo'shish",
    userId: 'Foydalanuvchi ID (Keycloak)',
    userIdHint: "Keycloak'da shu hisobga trainer roli oldindan berilgan bo'lishi kerak.",
    displayName: "Ko'rinadigan ism",
    errors: {
      userId: "Foydalanuvchi ID ni UUID ko'rinishida kiriting.",
      displayName: 'Ismni kiriting.',
    },
  },
  grant: {
    header: 'Obuna berish',
    save: 'Obuna berish',
    trainer: 'Trener',
    userId: 'Foydalanuvchi',
    soldierPlaceholder: "Ism yoki username bo'yicha qidiring",
    soldierEmpty: 'Soldier topilmadi.',
    soldierFailed: "Qidirib bo'lmadi. Qayta urinib ko'ring.",
    months: 'Muddat',
    suffix: ' oy',
    hint: "1 dan 12 oygacha. Shu trenerga faol obuna bo'lsa muddat uzayadi.",
    errors: {
      trainer: 'Trenerni tanlang.',
      userId: 'Foydalanuvchini tanlang.',
      required: 'Necha oyga berishni kiriting.',
      min: 'Kamida {min} oy kiriting.',
      max: "Ko'pi bilan {max} oy kiriting.",
    },
  },
  toast: {
    created: '"{name}" treneri qo\'shildi.',
    published: '"{name}" e\'lon qilindi.',
    unpublished: '"{name}" ro\'yxatdan olindi.',
    granted: '"{name}" trenerining obunasi berildi.',
    ended: '"{name}" trenerining obunasi tugatildi.',
  },
};
