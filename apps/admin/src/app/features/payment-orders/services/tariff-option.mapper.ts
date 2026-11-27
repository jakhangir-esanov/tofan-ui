import { TariffOption } from '../models/tariff-option';
import { TariffOptionResponse, TariffTypeDto } from './tariff-option.dto';

const PAID_TYPES: Partial<Record<TariffTypeDto, TariffOption['type']>> = {
  [TariffTypeDto.Standard]: 'standard',
  [TariffTypeDto.Vip]: 'vip',
};

export function toTariffOptions(responses: readonly TariffOptionResponse[]): TariffOption[] {
  return responses.flatMap((response) => {
    const type = PAID_TYPES[response.type];
    return type === undefined
      ? []
      : [{ id: response.id, type, monthlyPrice: response.monthlyPrice }];
  });
}
