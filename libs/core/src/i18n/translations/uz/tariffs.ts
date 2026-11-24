export const TARIFFS_UZ = {
  page: {
    title: 'Tofan tariflari',
    subtitle: 'Free, Standard va VIP tariflarining narxi, limitlari va imtiyozlari',
    empty: 'Tariflar topilmadi.',
    loading: 'Tariflar yuklanmoqda...',
  },
  type: {
    free: 'Free',
    standard: 'Standard',
    vip: 'VIP',
  },
  card: {
    userPays: "O'quvchi oyiga to'laydi",
    noPlatformFee: "Komissiya, soliq va provayder foizi qo'shilmaydi.",
    price: "{amount} so'm",
    limits: 'Limitlar',
    benefits: 'Imtiyozlar',
    noBenefits: 'Imtiyozlar hali kiritilmagan.',
    editBenefits: 'Imtiyozlar',
  },
  benefits: {
    dialogHeader: '{tariff} tarifi imtiyozlari',
  },
  limits: {
    foodScan: {
      label: 'Ovqat scan',
      unlimited: 'Cheksiz',
      closed: 'Scan yopiq',
      some: 'Oyiga {count} ta',
    },
    workoutVideo: {
      label: 'Mashq videolari',
      unlimited: 'Hammasi ochiq',
      closed: 'Hamma video yopiq',
      some: 'Rejadagi birinchi {count} ta mashq videosi ochiq',
    },
    mealTypes: {
      label: 'Ovqat turlari',
      all: 'Hamma ovqat ochiq',
      some: 'Faqat tanlanganlar ochiq',
    },
    workoutChange: {
      label: 'Mashq dasturini almashtirish',
      never: 'Almashmaydi',
      every: 'Har {count} oyda',
    },
    dietChange: {
      label: 'Ovqat dasturini almashtirish',
      never: 'Almashmaydi',
      every: 'Har {count} kunda',
    },
    aiChat: {
      label: 'AI trener chati',
      included: 'Bor',
      excluded: "Yo'q",
    },
  },
  form: {
    header: 'Tarifni tahrirlash: {name}',
    monthlyPrice: 'Oylik narx',
    priceSuffix: " so'm",
    freeHint: 'Free doim bepul',
    totalPriceHint:
      "O'quvchi aynan shu narxni to'laydi: Tofan tariflariga komissiya, soliq va provayder foizi qo'shilmaydi.",
    foodScan: {
      label: 'Ovqat scan limiti',
      unlimited: 'Cheksiz',
      value: 'Oyiga nechta scan',
      hint: "0 kiritilsa scan yopiq bo'ladi.",
    },
    workoutVideo: {
      label: 'Mashq videolari limiti',
      unlimited: 'Hammasi ochiq',
      value: 'Videosi ochiq mashqlar soni',
      hint: "Rejadagi birinchi N ta mashq videosi ochiq bo'ladi. 0 kiritilsa hamma video yopiq.",
    },
    mealTypes: {
      label: 'Ovqat turlari',
      all: 'Hamma ovqat ochiq',
      placeholder: 'Ovqat turlarini tanlang',
    },
    workoutChange: {
      label: 'Mashq dasturini almashtirish',
      never: 'Almashmaydi',
      value: 'Necha oyda bir marta',
      suffix: ' oy',
    },
    dietChange: {
      label: 'Ovqat dasturini almashtirish',
      never: 'Almashmaydi',
      value: 'Necha kunda bir marta',
      suffix: ' kun',
    },
    aiChat: {
      label: 'AI trener chati',
      enabled: 'Tarifga kiritilgan',
    },
    errors: {
      price: "Narx 0 dan katta bo'lishi kerak.",
      scanLimit: '0 yoki undan katta butun son kiriting.',
      videoLimit: '0 yoki undan katta butun son kiriting.',
      changeMonths: '1 yoki undan katta butun son kiriting.',
      changeDays: '1 yoki undan katta butun son kiriting.',
      mealTypes: 'Kamida bitta ovqat turini tanlang.',
    },
  },
  toast: {
    saved: 'Tarif saqlandi',
    benefitsSaved: 'Imtiyozlar saqlandi',
  },
};
