import { TranslationKey, TranslationParams } from '@core/i18n/dictionary';
import { MealType } from '@shared/models/meal-type';
import { Tariff } from './tariff';

export interface TariffLimitLine {
  readonly label: TranslationKey;
  readonly value: TranslationKey;
  readonly params: TranslationParams;
  readonly mealTypes: readonly MealType[];
}

export function tariffLimitLines(tariff: Tariff): readonly TariffLimitLine[] {
  return [
    foodScanLine(tariff.foodScanLimit),
    workoutVideoLine(tariff.workoutVideoLimit),
    mealTypesLine(tariff.dietMealTypes),
    workoutChangeLine(tariff.workoutChangeMonths),
    dietChangeLine(tariff.dietChangeDays),
    aiChatLine(tariff.hasAiTrainerChat),
  ];
}

function line(
  label: TranslationKey,
  value: TranslationKey,
  params: TranslationParams = {},
  mealTypes: readonly MealType[] = [],
): TariffLimitLine {
  return { label, value, params, mealTypes };
}

function foodScanLine(limit: number | null): TariffLimitLine {
  const label = 'tariffs.limits.foodScan.label';
  if (limit === null) {
    return line(label, 'tariffs.limits.foodScan.unlimited');
  }
  if (limit === 0) {
    return line(label, 'tariffs.limits.foodScan.closed');
  }
  return line(label, 'tariffs.limits.foodScan.some', { count: limit });
}

function workoutVideoLine(limit: number | null): TariffLimitLine {
  const label = 'tariffs.limits.workoutVideo.label';
  if (limit === null) {
    return line(label, 'tariffs.limits.workoutVideo.unlimited');
  }
  if (limit === 0) {
    return line(label, 'tariffs.limits.workoutVideo.closed');
  }
  return line(label, 'tariffs.limits.workoutVideo.some', { count: limit });
}

function mealTypesLine(mealTypes: readonly MealType[] | null): TariffLimitLine {
  const label = 'tariffs.limits.mealTypes.label';
  return mealTypes === null
    ? line(label, 'tariffs.limits.mealTypes.all')
    : line(label, 'tariffs.limits.mealTypes.some', {}, mealTypes);
}

function workoutChangeLine(months: number | null): TariffLimitLine {
  const label = 'tariffs.limits.workoutChange.label';
  return months === null
    ? line(label, 'tariffs.limits.workoutChange.never')
    : line(label, 'tariffs.limits.workoutChange.every', { count: months });
}

function dietChangeLine(days: number | null): TariffLimitLine {
  const label = 'tariffs.limits.dietChange.label';
  return days === null
    ? line(label, 'tariffs.limits.dietChange.never')
    : line(label, 'tariffs.limits.dietChange.every', { count: days });
}

function aiChatLine(included: boolean): TariffLimitLine {
  const label = 'tariffs.limits.aiChat.label';
  return line(
    label,
    included ? 'tariffs.limits.aiChat.included' : 'tariffs.limits.aiChat.excluded',
  );
}
