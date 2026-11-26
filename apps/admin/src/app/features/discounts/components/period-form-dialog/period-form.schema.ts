import { TranslationKey } from '@core/i18n/dictionary';
import { Schema, disabled, max, min, minLength, required, schema } from '@angular/forms/signals';
import { PERCENT_MAX, PERCENT_MIN } from '../../models/discount-rules';
import {
  BASE_PERIOD_MONTHS,
  DiscountPeriod,
  PERIOD_MONTHS_MAX,
  PeriodDiscountMode,
  isBasePeriod,
} from '../../models/discount-period';
import { DiscountPeriodDraft } from '../../models/discount-period-draft';

const ERRORS = {
  months: 'discounts.periods.form.errors.months',
  percent: 'discounts.form.errors.percent',
  trainers: 'discounts.form.errors.trainers',
} as const satisfies Record<string, TranslationKey>;

export interface PeriodFormValue {
  months: number | null;
  mode: PeriodDiscountMode;
  standardPercent: number | null;
  vipPercent: number | null;
  appliesTimer: boolean;
  appliesCampaign: boolean;
  allTrainers: boolean;
  trainerIds: string[];
}

export function emptyPeriodFormValue(): PeriodFormValue {
  return {
    months: null,
    mode: 'own',
    standardPercent: PERCENT_MIN,
    vipPercent: PERCENT_MIN,
    appliesTimer: false,
    appliesCampaign: false,
    allTrainers: true,
    trainerIds: [],
  };
}

export function periodFormValue(period: DiscountPeriod): PeriodFormValue {
  const takesPromotions = period.appliesTimer || period.appliesCampaign;
  return {
    months: period.months,
    mode: takesPromotions ? 'promotions' : 'own',
    standardPercent: period.standardPercent,
    vipPercent: period.vipPercent,
    appliesTimer: period.appliesTimer,
    appliesCampaign: period.appliesCampaign,
    allTrainers: period.trainerIds === null,
    trainerIds: [...(period.trainerIds ?? [])],
  };
}

export function toPeriodDraft(
  value: PeriodFormValue,
  choosesTrainers: boolean,
  offersVip: boolean,
): DiscountPeriodDraft | null {
  const { months, standardPercent, vipPercent } = value;
  if (months === null || standardPercent === null || vipPercent === null) {
    return null;
  }
  const ownDiscount = value.mode === 'own';
  return {
    months,
    standardPercent: ownDiscount ? standardPercent : PERCENT_MIN,
    vipPercent: ownDiscount && offersVip ? vipPercent : PERCENT_MIN,
    appliesTimer: !ownDiscount && value.appliesTimer,
    appliesCampaign: !ownDiscount && value.appliesCampaign,
    trainerIds: !choosesTrainers || value.allTrainers ? null : [...value.trainerIds],
  };
}

export function periodFormSchema(
  choosesTrainers: () => boolean,
  editing: () => DiscountPeriod | null,
): Schema<PeriodFormValue> {
  const editsBase = (): boolean => {
    const period = editing();
    return period !== null && isBasePeriod(period);
  };
  return schema<PeriodFormValue>((path) => {
    required(path.months, { message: ERRORS.months });
    min(path.months, BASE_PERIOD_MONTHS, { message: ERRORS.months });
    max(path.months, PERIOD_MONTHS_MAX, { message: ERRORS.months });
    disabled(path.months, { when: editsBase });
    for (const percent of [path.standardPercent, path.vipPercent]) {
      required(percent, { message: ERRORS.percent });
      min(percent, PERCENT_MIN, { message: ERRORS.percent });
      max(percent, PERCENT_MAX, { message: ERRORS.percent });
    }
    disabled(path.allTrainers, { when: () => !choosesTrainers() || editsBase() });
    disabled(path.trainerIds, {
      when: ({ valueOf }) => !choosesTrainers() || editsBase() || valueOf(path.allTrainers),
    });
    minLength(path.trainerIds, 1, { message: ERRORS.trainers });
  });
}
