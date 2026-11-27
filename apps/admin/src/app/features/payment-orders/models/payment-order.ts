import { Tier } from '@shared/models/tier';

export const PAYMENT_ORDER_STATUSES = ['pending', 'paid', 'refunded'] as const;
export type PaymentOrderStatus = (typeof PAYMENT_ORDER_STATUSES)[number];

export const PAYMENT_PURPOSES = ['trainerSubscription', 'tariff'] as const;
export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[number];

export const PAYMENT_PROVIDERS = ['payme', 'click'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export interface PaymentOrder {
  readonly id: string;
  readonly userId: string;
  readonly userFullName: string | null;
  readonly userName: string | null;
  readonly purpose: PaymentPurpose;
  readonly referenceId: string;
  readonly referenceName: string | null;
  readonly tier: Tier | null;
  readonly price: number;
  readonly commissionAmount: number;
  readonly taxPercent: number;
  readonly taxAmount: number;
  readonly providerFeePercent: number;
  readonly providerFeeAmount: number;
  readonly discountPercent: number;
  readonly discountAmount: number;
  readonly months: number;
  readonly amount: number;
  readonly status: PaymentOrderStatus;
  readonly paidWith: PaymentProvider | null;
  readonly createdAt: Date;
  readonly paidAt: Date | null;
  readonly refundedAt: Date | null;
}
