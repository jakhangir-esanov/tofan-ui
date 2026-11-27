export const PAID_TARIFF_TYPES = ['standard', 'vip'] as const;
export type PaidTariffType = (typeof PAID_TARIFF_TYPES)[number];

export interface TariffOption {
  readonly id: string;
  readonly type: PaidTariffType;
  readonly monthlyPrice: number;
}
