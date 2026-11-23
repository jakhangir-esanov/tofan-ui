import { TranslationKey } from '@core/i18n/dictionary';
import { toSelectOptions } from '@shared/models/select-option';

export const FOOD_SCAN_PERIODS = ['day', 'month'] as const;
export type FoodScanPeriod = (typeof FOOD_SCAN_PERIODS)[number];

export const FOOD_SCAN_PERIOD_LABELS: Record<FoodScanPeriod, TranslationKey> = {
  day: 'tariffs.form.foodScan.periods.day',
  month: 'tariffs.form.foodScan.periods.month',
};

export const FOOD_SCAN_PERIOD_OPTIONS = toSelectOptions(FOOD_SCAN_PERIODS, FOOD_SCAN_PERIOD_LABELS);
