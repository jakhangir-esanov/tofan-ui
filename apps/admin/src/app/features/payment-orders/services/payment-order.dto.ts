import { AccessGrantKindDto } from '@shared/models/access-grant-kind.dto';
import { TierDto } from '@shared/models/tier.dto';

export enum PaymentOrderStatusDto {
  Pending = 1,
  Paid = 2,
  Refunded = 3,
  Gifted = 4,
  Test = 5,
}

export enum PaymentPurposeDto {
  TrainerSubscription = 1,
  Tariff = 2,
}

export enum PaymentProviderDto {
  Payme = 1,
  Click = 2,
  Card = 3,
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
  grantedBy: string | null;
  userFullName: string | null;
  userName: string | null;
  referenceName: string | null;
}

export interface GrantAccessRequest {
  userId: string;
  purpose: PaymentPurposeDto;
  referenceId: string;
  tier: TierDto;
  months: number;
  kind: AccessGrantKindDto;
}

export interface CreatePaymentOrderRequest {
  userId: string;
  purpose: PaymentPurposeDto;
  referenceId: string;
  price: number;
}
