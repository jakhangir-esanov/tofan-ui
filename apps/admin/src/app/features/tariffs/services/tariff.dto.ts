import { MealTypeDto } from '@shared/models/meal-type.dto';

export enum TariffType {
  Free = 1,
  Standard = 2,
  Vip = 3,
}

export enum FoodScanPeriod {
  Day = 1,
  Month = 2,
}

export interface TariffBenefitResponse {
  name: string;
  nameRu: string;
  nameUz: string;
}

export interface TariffResponse {
  id: string;
  type: TariffType;
  monthlyPrice: number;
  totalPrice: number;
  foodScanLimit: number | null;
  foodScanPeriod: FoodScanPeriod;
  workoutVideoLimit: number | null;
  dietMealTypes: MealTypeDto[] | null;
  workoutChangeMonths: number | null;
  dietChangeDays: number | null;
  hasAiTrainerChat: boolean;
  benefits: TariffBenefitResponse[];
}

export interface ChangeTariffRequest {
  monthlyPrice: number;
  foodScanLimit: number | null;
  foodScanPeriod: FoodScanPeriod;
  workoutVideoLimit: number | null;
  dietMealTypes: MealTypeDto[] | null;
  workoutChangeMonths: number | null;
  dietChangeDays: number | null;
  hasAiTrainerChat: boolean;
}

export interface ChangeTariffBenefitsRequest {
  benefits: TariffBenefitResponse[];
}
