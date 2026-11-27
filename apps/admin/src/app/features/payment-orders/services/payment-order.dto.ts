import { TierDto } from '@shared/models/tier.dto';

export enum PaymentOrderStatusDto {
  Pending = 1,
  Paid = 2,
  Refunded = 3,
}

export enum PaymentPurposeDto {
  TrainerSubscription = 1,
  Tariff = 2,
}

export enum PaymentProviderDto {
  Payme = 1,
  Click = 2,
}

export interface PaymentOrderResponse {
  id: string;
  userId: string;
  purpose: PaymentPurposeDto;
  referenceId: string;
  price: number;
  commissionAmount: number;
  taxPercent: number;
  taxAmount: number;
  providerFeePercent: number;
  providerFeeAmount: number;
  discountPercent: number;
  discountAmount: number;
  amount: number;
  status: PaymentOrderStatusDto;
  paidWith: PaymentProviderDto | null;
  createdOnUtc: string;
  paidOnUtc: string | null;
  refundedOnUtc: string | null;
  tier: TierDto | null;
  months: number;
  userFullName: string | null;
  userName: string | null;
  referenceName: string | null;
}

export interface CreatePaymentOrderRequest {
  userId: string;
  purpose: PaymentPurposeDto;
  referenceId: string;
  price: number;
}
