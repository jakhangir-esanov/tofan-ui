import { Dictionary } from '../../dictionary';

export const TARIFFS_RU: Dictionary['tariffs'] = {
  page: {
    title: 'Тарифы Tofan',
    subtitle: 'Цена, лимиты и преимущества тарифов Free, Standard и VIP',
    empty: 'Тарифы не найдены.',
    loading: 'Загрузка тарифов...',
  },
  type: {
    free: 'Free',
    standard: 'Standard',
    vip: 'VIP',
  },
  card: {
    userPays: 'Soldier платит в месяц',
    noPlatformFee: 'Комиссия, налог и сбор провайдера не добавляются.',
    price: '{amount} сум',
    limits: 'Лимиты',
    benefits: 'Преимущества',
    noBenefits: 'Преимущества пока не добавлены.',
    editBenefits: 'Преимущества',
  },
  benefits: {
    dialogHeader: 'Преимущества тарифа {tariff}',
  },
  limits: {
    foodScan: {
      label: 'Сканирование еды',
      unlimited: 'Без ограничений',
      closed: 'Сканирование закрыто',
      some: '{count} в месяц',
    },
    workoutVideo: {
      label: 'Видео тренировок',
      unlimited: 'Все открыты',
      closed: 'Все видео закрыты',
      some: 'Открыты видео первых {count} упражнений плана',
    },
    mealTypes: {
      label: 'Приёмы пищи',
      all: 'Все приёмы пищи открыты',
      some: 'Открыты только выбранные',
    },
    workoutChange: {
      label: 'Смена программы тренировок',
      never: 'Не меняется',
      every: 'Раз в {count} мес.',
    },
    dietChange: {
      label: 'Смена программы питания',
      never: 'Не меняется',
      every: 'Раз в {count} дн.',
    },
    aiChat: {
      label: 'Чат с AI-тренером',
      included: 'Есть',
      excluded: 'Нет',
    },
  },
  form: {
    header: 'Редактирование тарифа: {name}',
    monthlyPrice: 'Цена в месяц',
    priceSuffix: ' сум',
    freeHint: 'Free всегда бесплатный',
    totalPriceHint:
      'Soldier платит ровно эту цену: к тарифам Tofan не добавляются комиссия, налог и сбор провайдера.',
    foodScan: {
      label: 'Лимит сканирования еды',
      unlimited: 'Без ограничений',
      value: 'Сканирований в месяц',
      hint: 'При значении 0 сканирование закрыто.',
    },
    workoutVideo: {
      label: 'Лимит видео тренировок',
      unlimited: 'Все открыты',
      value: 'Упражнений с открытым видео',
      hint: 'Открыты видео первых N упражнений плана. При значении 0 все видео закрыты.',
    },
    mealTypes: {
      label: 'Приёмы пищи',
      all: 'Все приёмы пищи открыты',
      placeholder: 'Выберите приёмы пищи',
    },
    workoutChange: {
      label: 'Смена программы тренировок',
      never: 'Не меняется',
      value: 'Раз в сколько месяцев',
      suffix: ' мес.',
    },
    dietChange: {
      label: 'Смена программы питания',
      never: 'Не меняется',
      value: 'Раз в сколько дней',
      suffix: ' дн.',
    },
    aiChat: {
      label: 'Чат с AI-тренером',
      enabled: 'Входит в тариф',
    },
    errors: {
      price: 'Цена должна быть больше 0.',
      scanLimit: 'Введите целое число от 0.',
      videoLimit: 'Введите целое число от 0.',
      changeMonths: 'Введите целое число от 1.',
      changeDays: 'Введите целое число от 1.',
      mealTypes: 'Выберите хотя бы один приём пищи.',
    },
  },
  toast: {
    saved: 'Тариф сохранён',
    benefitsSaved: 'Преимущества сохранены',
  },
};
