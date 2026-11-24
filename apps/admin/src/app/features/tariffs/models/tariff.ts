import { Benefit } from '@shared/models/benefit';
import { MealType } from '@shared/models/meal-type';
import { TariffType } from './tariff-type';

export interface Tariff {
  readonly id: string;
  readonly type: TariffType;
  readonly monthlyPrice: number;
  readonly totalPrice: number;
  readonly foodScanLimit: number | null;
  readonly workoutVideoLimit: number | null;
  readonly dietMealTypes: readonly MealType[] | null;
  readonly workoutChangeMonths: number | null;
  readonly dietChangeDays: number | null;
  readonly hasAiTrainerChat: boolean;
  readonly benefits: readonly Benefit[];
}
