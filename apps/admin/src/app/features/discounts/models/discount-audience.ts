import { TranslationKey } from '@core/i18n/dictionary';

export const DISCOUNT_AUDIENCES = ['tariffs', 'trainers'] as const;
export type DiscountAudience = (typeof DISCOUNT_AUDIENCES)[number];

export interface DiscountAudienceTexts {
  readonly title: TranslationKey;
  readonly subtitle: TranslationKey;
  readonly choosesTrainers: boolean;
}

export const DISCOUNT_AUDIENCE_TEXTS: Record<DiscountAudience, DiscountAudienceTexts> = {
  tariffs: {
    title: 'discounts.page.tariffsTitle',
    subtitle: 'discounts.page.tariffsSubtitle',
    choosesTrainers: false,
  },
  trainers: {
    title: 'discounts.page.trainersTitle',
    subtitle: 'discounts.page.trainersSubtitle',
    choosesTrainers: true,
  },
};
