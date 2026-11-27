import { PaymentOrderStatusDto } from './payment.dto';
import { toPayment } from './payment.mapper';

describe('toPayment', () => {
  it('should mark a refunded payment and parse its date', () => {
    expect(
      toPayment({
        id: 'p1',
        userId: 'u1',
        status: PaymentOrderStatusDto.Refunded,
        paidOnUtc: '2026-10-01T10:00:00Z',
        refundedOnUtc: '2026-10-02T10:00:00Z',
        netAmount: 450000,
        months: 1,
      }),
    ).toEqual({
      id: 'p1',
      name: null,
      paidOn: new Date('2026-10-01T10:00:00Z'),
      netAmount: 450000,
      months: 1,
      refunded: true,
    });
  });

  it('should keep a missing paid date empty when the payment is pending', () => {
    const payment = toPayment({
      id: 'p2',
      userId: 'u1',
      status: PaymentOrderStatusDto.Pending,
      paidOnUtc: null,
      refundedOnUtc: null,
      netAmount: 0,
      months: 1,
    });

    expect(payment.paidOn).toBeNull();
    expect(payment.refunded).toBe(false);
  });
});
