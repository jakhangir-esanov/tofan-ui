export const TRAINERS_RU = {
  page: {
    title: 'Тренеры',
    tabs: {
      trainers: 'Тренеры',
      subscriptions: 'Подписки',
    },
  },
  status: {
    published: 'Опубликован',
    draft: 'Черновик',
  },
  subscriptionStatus: {
    active: 'Активна',
    ended: 'Завершена',
  },
  list: {
    total: 'Всего тренеров: {count}',
    empty: 'Тренеров пока нет.',
    add: 'Добавить тренера',
    price: '{amount} сум',
    priceMissing: 'Не задана',
    columns: {
      trainer: 'Тренер',
      userId: 'ID пользователя',
      monthlyPrice: 'Цена в месяц',
      status: 'Статус',
      createdOn: 'Создан',
    },
    actions: {
      grant: 'Выдать подписку',
      publish: 'Опубликовать',
      unpublish: 'Снять с публикации',
    },
  },
  subscriptions: {
    total: 'Всего подписок: {count}',
    empty: 'Подписок по этим условиям не найдено.',
    add: 'Выдать подписку',
    endedOn: 'Завершена {date}',
    columns: {
      trainer: 'Тренер',
      userId: 'Пользователь',
      startsOn: 'Начало',
      endsOn: 'Окончание',
      status: 'Статус',
    },
    actions: {
      end: 'Завершить подписку',
    },
    confirmEnd:
      'Завершить подписку на тренера «{name}»? Пользователь вернётся к своему плану тренировок и питания.',
  },
  filters: {
    trainer: 'Тренер',
    userId: 'ID пользователя',
    status: 'Статус',
    all: 'Все',
    userIdInvalid: 'Введите UUID.',
  },
  form: {
    header: 'Добавить тренера',
    userId: 'ID пользователя (Keycloak)',
    userIdHint: 'В Keycloak этому аккаунту заранее должна быть выдана роль trainer.',
    displayName: 'Отображаемое имя',
    errors: {
      userId: 'Введите ID пользователя в формате UUID.',
      displayName: 'Введите имя.',
    },
  },
  grant: {
    header: 'Выдать подписку',
    save: 'Выдать подписку',
    trainer: 'Тренер',
    userId: 'Пользователь',
    soldierPlaceholder: 'Поиск по имени или username',
    soldierEmpty: 'Soldier не найден.',
    soldierFailed: 'Не удалось выполнить поиск. Попробуйте ещё раз.',
    months: 'Срок',
    suffix: ' мес.',
    hint: 'От 1 до 12 месяцев. Если у пользователя уже есть активная подписка на этого тренера, срок продлится.',
    errors: {
      trainer: 'Выберите тренера.',
      userId: 'Выберите пользователя.',
      required: 'Укажите срок в месяцах.',
      min: 'Минимум {min} мес.',
      max: 'Максимум {max} мес.',
    },
  },
  toast: {
    created: 'Тренер «{name}» добавлен.',
    published: 'Тренер «{name}» опубликован.',
    unpublished: 'Тренер «{name}» снят с публикации.',
    granted: 'Подписка на тренера «{name}» выдана.',
    ended: 'Подписка на тренера «{name}» завершена.',
  },
};
