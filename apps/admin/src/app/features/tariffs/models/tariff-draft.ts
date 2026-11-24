import { ValidationError, ValidationIssue } from '@shared/models/errors/validation.error';
import { MealType } from '@shared/models/meal-type';
import { TariffType, isFreeTariff } from './tariff-type';

export const MIN_FOOD_SCAN_LIMIT = 0;
export const MIN_WORKOUT_VIDEO_LIMIT = 0;
export const MIN_WORKOUT_CHANGE_MONTHS = 1;
export const MIN_DIET_CHANGE_DAYS = 1;

export interface TariffDraft {
  readonly monthlyPrice: number;
  readonly foodScanLimit: number | null;
  readonly workoutVideoLimit: number | null;
  readonly dietMealTypes: readonly MealType[] | null;
  readonly workoutChangeMonths: number | null;
  readonly dietChangeDays: number | null;
  readonly hasAiTrainerChat: boolean;
}

export function createTariffDraft(type: TariffType, draft: TariffDraft): TariffDraft {
  const issues: ValidationIssue[] = [
    ...priceIssues(type, draft.monthlyPrice),
    ...limitIssues('FoodScanLimit', draft.foodScanLimit, MIN_FOOD_SCAN_LIMIT),
    ...limitIssues('WorkoutVideoLimit', draft.workoutVideoLimit, MIN_WORKOUT_VIDEO_LIMIT),
    ...mealTypeIssues(draft.dietMealTypes),
    ...limitIssues('WorkoutChangeMonths', draft.workoutChangeMonths, MIN_WORKOUT_CHANGE_MONTHS),
    ...limitIssues('DietChangeDays', draft.dietChangeDays, MIN_DIET_CHANGE_DAYS),
  ];
  if (issues.length > 0) {
    throw new ValidationError('The tariff is not valid.', issues);
  }
  return draft;
}

function priceIssues(type: TariffType, price: number): ValidationIssue[] {
  if (isFreeTariff(type)) {
    return price === 0
      ? []
      : [{ code: 'Tariff.FreeMustStayFree', message: 'The Free tariff must stay free.' }];
  }
  return price > 0
    ? []
    : [{ code: 'Tariff.PaidPriceRequired', message: 'A paid tariff needs a price above zero.' }];
}

function limitIssues(name: string, limit: number | null, minimum: number): ValidationIssue[] {
  if (limit === null || (Number.isInteger(limit) && limit >= minimum)) {
    return [];
  }
  return [
    {
      code: `${name}.Invalid`,
      message: `${name} must be a whole number of at least ${minimum}.`,
    },
  ];
}

function mealTypeIssues(mealTypes: readonly MealType[] | null): ValidationIssue[] {
  if (mealTypes === null || mealTypes.length > 0) {
    return [];
  }
  return [{ code: 'DietMealTypes.Empty', message: 'Choose at least one meal type.' }];
}
