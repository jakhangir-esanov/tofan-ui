import { Benefit } from '@shared/models/benefit';
import { mealTypes } from '@shared/models/meal-type.dto';
import { enumMap } from '@shared/utils/enum-map';
import { Tariff } from '../models/tariff';
import { TariffDraft } from '../models/tariff-draft';
import { TariffType, compareTariffTypes } from '../models/tariff-type';
import {
  ChangeTariffBenefitsRequest,
  ChangeTariffRequest,
  TariffBenefitResponse,
  TariffResponse,
  TariffType as ApiTariffType,
} from './tariff.dto';

export const tariffTypes = enumMap<TariffType, ApiTariffType>(ApiTariffType);

export function toTariff(response: TariffResponse): Tariff {
  return {
    id: response.id,
    type: tariffTypes.toDomain(response.type),
    monthlyPrice: response.monthlyPrice,
    totalPrice: response.totalPrice,
    foodScanLimit: response.foodScanLimit,
    workoutVideoLimit: response.workoutVideoLimit,
    dietMealTypes: response.dietMealTypes?.map((type) => mealTypes.toDomain(type)) ?? null,
    workoutChangeMonths: response.workoutChangeMonths,
    dietChangeDays: response.dietChangeDays,
    hasAiTrainerChat: response.hasAiTrainerChat,
    benefits: response.benefits.map(toBenefit),
  };
}

export function toTariffs(responses: readonly TariffResponse[]): readonly Tariff[] {
  return responses.map(toTariff).sort((left, right) => compareTariffTypes(left.type, right.type));
}

export function toChangeTariffRequest(draft: TariffDraft): ChangeTariffRequest {
  return {
    monthlyPrice: draft.monthlyPrice,
    foodScanLimit: draft.foodScanLimit,
    workoutVideoLimit: draft.workoutVideoLimit,
    dietMealTypes: draft.dietMealTypes?.map((type) => mealTypes.toApi(type)) ?? null,
    workoutChangeMonths: draft.workoutChangeMonths,
    dietChangeDays: draft.dietChangeDays,
    hasAiTrainerChat: draft.hasAiTrainerChat,
  };
}

export function toChangeTariffBenefitsRequest(
  benefits: readonly Benefit[],
): ChangeTariffBenefitsRequest {
  return { benefits: benefits.map(toBenefitText) };
}

function toBenefit(text: TariffBenefitResponse): Benefit {
  return { en: text.name, ru: text.nameRu, uz: text.nameUz };
}

function toBenefitText(benefit: Benefit): TariffBenefitResponse {
  return { name: benefit.en, nameRu: benefit.ru, nameUz: benefit.uz };
}
