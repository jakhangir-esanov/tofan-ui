import { TranslationKey } from '@core/i18n/dictionary';
import { SelectOption, toSelectOptions } from '@shared/models/select-option';
import { TIMER_TRIGGERS, TimerTrigger } from './discount-timer';

export const TIMER_TRIGGER_LABELS: Record<TimerTrigger, TranslationKey> = {
  eachTrainer: 'discounts.timer.trigger.eachTrainer',
  anyTrainer: 'discounts.timer.trigger.anyTrainer',
};

export const TIMER_TRIGGER_OPTIONS: readonly SelectOption<TimerTrigger, TranslationKey>[] =
  toSelectOptions(TIMER_TRIGGERS, TIMER_TRIGGER_LABELS);
