import { EarningPaymentResponse, PaymentOrderStatusDto } from './payment.dto';
import { Payment } from './payment';

export function toPayment(response: EarningPaymentResponse): Payment {
  return {
    id: response.id,
    name: null,
    paidOn: toDateOrNull(response.paidOnUtc),
    netAmount: response.netAmount,
    months: response.months,
    refunded: response.status === PaymentOrderStatusDto.Refunded,
  };
}

export function toDateOrNull(value: string | null | undefined): Date | null {
  return value === null || value === undefined ? null : new Date(value);
}
