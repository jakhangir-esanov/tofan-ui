export enum PaymentOrderStatusDto {
  Pending = 1,
  Paid = 2,
  Refunded = 3,
}

export interface EarningPaymentResponse {
  id: string;
  userId: string;
  status: PaymentOrderStatusDto;
  paidOnUtc: string | null;
  refundedOnUtc: string | null;
  netAmount: number;
  months: number;
}
