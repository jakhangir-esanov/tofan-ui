export const TRAINERS_EN = {
  page: {
    title: 'Trainers',
    tabs: {
      trainers: 'Trainers',
      subscriptions: 'Subscriptions',
    },
  },
  status: {
    published: 'Published',
    draft: 'Draft',
  },
  subscriptionStatus: {
    active: 'Active',
    ended: 'Ended',
  },
  list: {
    total: '{count} trainers in total',
    empty: 'There are no trainers yet.',
    add: 'Add trainer',
    price: '{amount} UZS',
    priceMissing: 'Not set',
    columns: {
      trainer: 'Trainer',
      userId: 'User ID',
      monthlyPrice: 'Monthly price',
      status: 'Status',
      createdOn: 'Created',
    },
    actions: {
      grant: 'Grant subscription',
      publish: 'Publish',
      unpublish: 'Unpublish',
    },
  },
  subscriptions: {
    total: '{count} subscriptions in total',
    empty: 'No subscriptions match these conditions.',
    add: 'Grant subscription',
    endedOn: 'Ended {date}',
    columns: {
      trainer: 'Trainer',
      userId: 'User',
      startsOn: 'Started',
      endsOn: 'Ends',
      status: 'Status',
    },
    actions: {
      end: 'End subscription',
    },
    confirmEnd:
      'End the subscription to "{name}"? The user goes back to their own workout and meal plan.',
  },
  filters: {
    trainer: 'Trainer',
    userId: 'User ID',
    status: 'Status',
    all: 'All',
    userIdInvalid: 'Enter a UUID.',
  },
  form: {
    header: 'Add trainer',
    userId: 'User ID (Keycloak)',
    userIdHint: 'This account must already have the trainer role in Keycloak.',
    displayName: 'Display name',
    errors: {
      userId: 'Enter the user ID as a UUID.',
      displayName: 'Enter a name.',
    },
  },
  grant: {
    header: 'Grant subscription',
    save: 'Grant subscription',
    trainer: 'Trainer',
    userId: 'User',
    soldierPlaceholder: 'Search by name or username',
    soldierEmpty: 'No soldier found.',
    soldierFailed: 'The search failed. Please try again.',
    months: 'Length',
    suffix: ' mo',
    hint: 'From 1 to 12 months. If the user already has an active subscription to this trainer, it is extended.',
    errors: {
      trainer: 'Choose a trainer.',
      userId: 'Choose a user.',
      required: 'Enter the length in months.',
      min: 'Enter at least {min} month.',
      max: 'Enter at most {max} months.',
    },
  },
  toast: {
    created: 'Trainer "{name}" was added.',
    published: 'Trainer "{name}" was published.',
    unpublished: 'Trainer "{name}" was unpublished.',
    granted: 'A subscription to "{name}" was granted.',
    ended: 'The subscription to "{name}" was ended.',
  },
};
