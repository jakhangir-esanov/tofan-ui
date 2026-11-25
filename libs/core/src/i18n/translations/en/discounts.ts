import { Dictionary } from '../../dictionary';

export const DISCOUNTS_EN: Dictionary['discounts'] = {
  page: {
    tariffsTitle: 'Tofan tariff discounts',
    tariffsSubtitle:
      'Holiday campaigns and a "buy within N minutes" timer for Standard and VIP. Free is never discounted.',
    trainersTitle: 'Coach discounts',
    trainersSubtitle:
      'Campaigns and a timer for coach subscriptions. Tofan pays the discount: the coach keeps the full price, the percent comes off the total the user pays.',
    loading: 'Loading...',
    priority:
      'While a campaign runs, its discount applies instead of the timer, and no timer starts.',
  },
  campaigns: {
    title: 'Campaigns',
    subtitle: 'Discounts with a start and an end: holidays and announced sales.',
    create: 'New campaign',
    empty: 'No campaigns yet.',
  },
  card: {
    running: 'Running now',
    audience: 'Who gets it',
    newBuyers: 'New buyers only',
    everyone: 'Everyone',
  },
  form: {
    createHeader: 'New campaign',
    editHeader: 'Edit campaign',
    name: 'Name',
    namePlaceholder: 'For example: Navruz 2027',
    nameHint: 'Shown only in the admin panel, never in the app.',
    startsOn: 'Starts',
    endsOn: 'Ends',
    timeHint: "Times are in your computer's time zone (Tashkent).",
    standardPercent: 'Standard discount',
    vipPercent: 'VIP discount',
    percentSuffix: '%',
    percentHint: 'A whole number from 0 to 99. 0 means no discount for that tier.',
    newBuyersOnly: 'Only users who never bought a Tofan tariff',
    newBuyersOnlyTrainer: 'Only users who never subscribed to this coach',
    trainers: 'Coaches',
    allTrainers: 'All coaches',
    trainersPlaceholder: 'Choose coaches',
    errors: {
      name: 'Enter a name (up to 200 characters).',
      startsOn: 'Choose a start time.',
      endsOn: 'The end must be after the start.',
      percent: 'Enter a whole number from 0 to 99.',
      noDiscount: 'Discount at least one tier.',
      trainers: 'Choose at least one coach or turn on "All coaches".',
    },
  },
  timer: {
    title: 'Timer',
    subtitle:
      'A personal countdown starts when the user opens the page for the Nth time. Once per user.',
    enabled: 'Timer enabled',
    trigger: {
      label: 'When it starts',
      hint: "Each coach: on the Nth opening of that coach's page, for that coach. Any coach: on the Nth opening of coach pages in total, one timer for all.",
      eachTrainer: 'Each coach',
      anyTrainer: 'Any coach',
    },
    startsOnVisit: 'Which opening of the tariffs screen',
    startsOnVisitTrainer: "Which opening of a coach's page",
    duration: 'Duration',
    minutesSuffix: ' min',
    liveHint:
      'Turning it off stops running timers at once. Percents apply at once; the duration only to new timers.',
    errors: {
      startsOnVisit: 'Enter a whole number from 1.',
      duration: 'Enter 1 to 10080 minutes (7 days).',
      noDiscount: 'An enabled timer must discount at least one tier.',
    },
  },
  toast: {
    campaignCreated: 'Campaign added.',
    campaignSaved: 'Campaign saved.',
    campaignRemoved: 'Campaign deleted.',
    timerSaved: 'Timer saved.',
  },
};
