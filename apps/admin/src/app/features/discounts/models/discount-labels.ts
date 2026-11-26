import { TranslationKey } from '@core/i18n/dictionary';
import { SelectOption, toSelectOptions } from '@shared/models/select-option';
import { PERIOD_DISCOUNT_MODES, PeriodDiscountMode } from './discount-period';
import { TIMER_TRIGGERS, TimerTrigger } from './discount-timer';

export const TIMER_TRIGGER_LABELS: Record<TimerTrigger, TranslationKey> = {
  eachTrainer: 'discounts.timer.trigger.eachTrainer',
  anyTrainer: 'discounts.timer.trigger.anyTrainer',
};

export const TIMER_TRIGGER_OPTIONS: readonly SelectOption<TimerTrigger, TranslationKey>[] =
  toSelectOptions(TIMER_TRIGGERS, TIMER_TRIGGER_LABELS);

export const PERIOD_MODE_LABELS: Record<PeriodDiscountMode, TranslationKey> = {
  own: 'discounts.periods.mode.own',
  promotions: 'discounts.periods.mode.promotions',
};

export const PERIOD_MODE_OPTIONS: readonly SelectOption<PeriodDiscountMode, TranslationKey>[] =
  toSelectOptions(PERIOD_DISCOUNT_MODES, PERIOD_MODE_LABELS);
