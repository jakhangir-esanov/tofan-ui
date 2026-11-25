import { TranslationKey } from '@core/i18n/dictionary';

export const DISCOUNT_AUDIENCES = ['tariffs', 'trainers'] as const;
export type DiscountAudience = (typeof DISCOUNT_AUDIENCES)[number];

export interface DiscountAudienceTexts {
  readonly title: TranslationKey;
  readonly subtitle: TranslationKey;
  readonly choosesTrainers: boolean;
  readonly offersVip: boolean;
}

export const DISCOUNT_AUDIENCE_TEXTS: Record<DiscountAudience, DiscountAudienceTexts> = {
  tariffs: {
    title: 'discounts.page.tariffsTitle',
    subtitle: 'discounts.page.tariffsSubtitle',
    choosesTrainers: false,
    offersVip: false,
  },
  trainers: {
    title: 'discounts.page.trainersTitle',
    subtitle: 'discounts.page.trainersSubtitle',
    choosesTrainers: true,
    offersVip: true,
  },
};
