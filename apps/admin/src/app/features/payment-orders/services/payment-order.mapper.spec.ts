import { TierDto } from '@shared/models/tier.dto';
import {
  PaymentOrderResponse,
  PaymentOrderStatusDto,
  PaymentProviderDto,
  PaymentPurposeDto,
} from './payment-order.dto';
import {
  toCreatePaymentOrderRequest,
  toPaymentOrder,
  toPaymentOrderStatusDto,
  toPaymentProviderDto,
  toPaymentPurposeDto,
} from './payment-order.mapper';

const subscriptionOrder: PaymentOrderResponse = {
  id: 'o1',
  userId: 'u1',
  purpose: PaymentPurposeDto.TrainerSubscription,
  referenceId: 'trainer-1',
  price: 200000,
  commissionAmount: 50000,
  taxPercent: 12,
  taxAmount: 30000,
  providerFeePercent: 2,
  providerFeeAmount: 5600,
  discountPercent: 0,
  discountAmount: 0,
  months: 1,
  amount: 285600,
  status: PaymentOrderStatusDto.Paid,
  paidWith: PaymentProviderDto.Click,
  createdOnUtc: '2026-11-06T04:56:59.917Z',
  paidOnUtc: '2026-11-06T05:00:00Z',
  refundedOnUtc: null,
  grantedBy: null,
  tier: TierDto.Vip,
  userFullName: 'Otabek Olimjonov',
  userName: 'otabek',
  referenceName: 'Stage Coach',
};

describe('toPaymentOrder', () => {
  it('should map every amount, the enums and the dates when the order is a paid subscription', () => {
    expect(toPaymentOrder(subscriptionOrder)).toEqual({
      id: 'o1',
      userId: 'u1',
      userFullName: 'Otabek Olimjonov',
      userName: 'otabek',
      purpose: 'trainerSubscription',
      referenceId: 'trainer-1',
      referenceName: 'Stage Coach',
      tier: 'vip',
      price: 200000,
      commissionAmount: 50000,
      taxPercent: 12,
      taxAmount: 30000,
      providerFeePercent: 2,
      providerFeeAmount: 5600,
      discountPercent: 0,
      discountAmount: 0,
      months: 1,
      amount: 285600,
      status: 'paid',
      paidWith: 'click',
      createdAt: new Date('2026-11-06T04:56:59.917Z'),
      paidAt: new Date('2026-11-06T05:00:00Z'),
      refundedAt: null,
      grantedBy: null,
    });
  });

  it('should keep the tariff kind as the tier when the order is for a Tofan tariff', () => {
    const order = toPaymentOrder({
      ...subscriptionOrder,
      purpose: PaymentPurposeDto.Tariff,
      tier: TierDto.Vip,
    });

    expect(order.purpose).toBe('tariff');
    expect(order.tier).toBe('vip');
  });

  it('should keep the provider and the dates empty when the order is still pending', () => {
    const order = toPaymentOrder({
      ...subscriptionOrder,
      status: PaymentOrderStatusDto.Pending,
      paidWith: null,
      paidOnUtc: null,
    });

    expect(order.status).toBe('pending');
    expect(order.paidWith).toBeNull();
    expect(order.paidAt).toBeNull();
  });

  it('should read the refund date when the order was refunded', () => {
    const order = toPaymentOrder({
      ...subscriptionOrder,
      status: PaymentOrderStatusDto.Refunded,
      paidWith: PaymentProviderDto.Payme,
      refundedOnUtc: '2026-11-07T10:00:00Z',
    });

    expect(order.status).toBe('refunded');
    expect(order.paidWith).toBe('payme');
    expect(order.refundedAt).toEqual(new Date('2026-11-07T10:00:00Z'));
  });

  it('should keep the names empty when the payer has no profile', () => {
    const order = toPaymentOrder({
      ...subscriptionOrder,
      userFullName: null,
      userName: null,
      referenceName: null,
    });

    expect(order.userFullName).toBeNull();
    expect(order.userName).toBeNull();
    expect(order.referenceName).toBeNull();
  });
});

describe('toPaymentOrderStatusDto', () => {
  it('should send the backend number when a status filter is chosen', () => {
    expect(toPaymentOrderStatusDto('pending')).toBe(1);
    expect(toPaymentOrderStatusDto('paid')).toBe(2);
    expect(toPaymentOrderStatusDto('refunded')).toBe(3);
  });
});

describe('toPaymentPurposeDto and toPaymentProviderDto', () => {
  it('should send the backend numbers when a purpose or a provider filter is chosen', () => {
    expect(toPaymentPurposeDto('trainerSubscription')).toBe(1);
    expect(toPaymentPurposeDto('tariff')).toBe(2);
    expect(toPaymentProviderDto('payme')).toBe(1);
    expect(toPaymentProviderDto('click')).toBe(2);
  });
});

describe('toCreatePaymentOrderRequest', () => {
  it('should send a trainer subscription with the trainer as the reference when an order is drafted', () => {
    expect(
      toCreatePaymentOrderRequest({ userId: 'u1', trainerId: 'trainer-1', price: 150000 }),
    ).toEqual({
      userId: 'u1',
      purpose: PaymentPurposeDto.TrainerSubscription,
      referenceId: 'trainer-1',
      price: 150000,
    });
  });
});
