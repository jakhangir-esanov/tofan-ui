import { TranslationKey } from '@core/i18n/dictionary';
import {
  Schema,
  disabled,
  max,
  min,
  minLength,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import {
  DURATION_MINUTES_MAX,
  DURATION_MINUTES_MIN,
  PERCENT_MAX,
  PERCENT_MIN,
  STARTS_ON_VISIT_MIN,
  givesDiscount,
} from '../../models/discount-rules';
import { DiscountTimer, TimerTrigger } from '../../models/discount-timer';
import { DiscountTimerDraft } from '../../models/discount-timer-draft';

const ERRORS = {
  startsOnVisit: 'discounts.timer.errors.startsOnVisit',
  duration: 'discounts.timer.errors.duration',
  percent: 'discounts.form.errors.percent',
  noDiscount: 'discounts.timer.errors.noDiscount',
  trainers: 'discounts.form.errors.trainers',
} as const satisfies Record<string, TranslationKey>;

export interface TimerFormValue {
  isEnabled: boolean;
  trigger: TimerTrigger | null;
  startsOnVisit: number | null;
  durationMinutes: number | null;
  standardPercent: number | null;
  vipPercent: number | null;
  newBuyersOnly: boolean;
  allTrainers: boolean;
  trainerIds: string[];
}

export function timerFormValue(timer: DiscountTimer): TimerFormValue {
  return {
    isEnabled: timer.isEnabled,
    trigger: timer.trigger,
    startsOnVisit: timer.startsOnVisit,
    durationMinutes: timer.durationMinutes,
    standardPercent: timer.standardPercent,
    vipPercent: timer.vipPercent,
    newBuyersOnly: timer.newBuyersOnly,
    allTrainers: timer.trainerIds === null,
    trainerIds: [...(timer.trainerIds ?? [])],
  };
}

export function toTimerDraft(
  value: TimerFormValue,
  choosesTrainers: boolean,
): DiscountTimerDraft | null {
  const { trigger, startsOnVisit, durationMinutes, standardPercent, vipPercent } = value;
  if (
    trigger === null ||
    startsOnVisit === null ||
    durationMinutes === null ||
    standardPercent === null ||
    vipPercent === null
  ) {
    return null;
  }
  return {
    isEnabled: value.isEnabled,
    trigger,
    startsOnVisit,
    durationMinutes,
    standardPercent,
    vipPercent,
    newBuyersOnly: value.newBuyersOnly,
    trainerIds: !choosesTrainers || value.allTrainers ? null : [...value.trainerIds],
  };
}

export function timerFormSchema(choosesTrainers: () => boolean): Schema<TimerFormValue> {
  return schema<TimerFormValue>((path) => {
    required(path.trigger);
    required(path.startsOnVisit, { message: ERRORS.startsOnVisit });
    min(path.startsOnVisit, STARTS_ON_VISIT_MIN, { message: ERRORS.startsOnVisit });
    required(path.durationMinutes, { message: ERRORS.duration });
    min(path.durationMinutes, DURATION_MINUTES_MIN, { message: ERRORS.duration });
    max(path.durationMinutes, DURATION_MINUTES_MAX, { message: ERRORS.duration });
    for (const percent of [path.standardPercent, path.vipPercent]) {
      required(percent, { message: ERRORS.percent });
      min(percent, PERCENT_MIN, { message: ERRORS.percent });
      max(percent, PERCENT_MAX, { message: ERRORS.percent });
    }
    validate(path.vipPercent, ({ value, valueOf }) =>
      !valueOf(path.isEnabled) ||
      givesDiscount(valueOf(path.standardPercent) ?? PERCENT_MIN, value() ?? PERCENT_MIN)
        ? null
        : { kind: 'noDiscount', message: ERRORS.noDiscount },
    );
    disabled(path.trainerIds, {
      when: ({ valueOf }) => !choosesTrainers() || valueOf(path.allTrainers),
    });
    minLength(path.trainerIds, 1, { message: ERRORS.trainers });
  });
}
