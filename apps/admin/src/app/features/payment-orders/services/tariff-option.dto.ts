export enum TariffTypeDto {
  Free = 1,
  Standard = 2,
  Vip = 3,
}

export interface TariffOptionResponse {
  id: string;
  type: TariffTypeDto;
  monthlyPrice: number;
}
