import { toGrantAccessRequest } from './payment-order.mapper';
import { TariffTypeDto } from './tariff-option.dto';
import { toTariffOptions } from './tariff-option.mapper';

describe('toTariffOptions', () => {
  it('should keep only the paid tariffs when the catalog includes Free', () => {
    expect(
      toTariffOptions([
        { id: 'free', type: TariffTypeDto.Free, monthlyPrice: 0 },
        { id: 'standard', type: TariffTypeDto.Standard, monthlyPrice: 67000 },
      ]),
    ).toEqual([{ id: 'standard', type: 'standard', monthlyPrice: 67000 }]);
  });
});

describe('toGrantAccessRequest', () => {
  it('should send the backend integers when a card payment for a coach is granted', () => {
    expect(
      toGrantAccessRequest({
        userId: 'u1',
        purpose: 'trainerSubscription',
        referenceId: 't1',
        tier: 'vip',
        months: 6,
        kind: 'card',
      }),
    ).toEqual({ userId: 'u1', purpose: 1, referenceId: 't1', tier: 2, months: 6, kind: 1 });
  });

  it('should send the test kind when a tariff is granted for testing', () => {
    expect(
      toGrantAccessRequest({
        userId: 'u1',
        purpose: 'tariff',
        referenceId: 'tariff-2',
        tier: 'standard',
        months: 1,
        kind: 'test',
      }),
    ).toEqual({ userId: 'u1', purpose: 2, referenceId: 'tariff-2', tier: 1, months: 1, kind: 3 });
  });
});
