import { PaymentOrderStatusDto } from '@coach/core/payments/payment.dto';
import { DashboardResponse } from './dashboard.dto';
import { toDashboard } from './dashboard.mapper';

const total = (netAmount: number) => ({ paymentCount: 1, netAmount });

const response: DashboardResponse = {
  earnings: {
    currencyCode: 'UZS',
    today: total(1),
    thisWeek: total(2),
    thisMonth: total(3),
    thisYear: total(4),
    renewedThisMonth: 5,
  },
  subscribers: null,
  programs: null,
  expiring: [
    {
      userId: 'u1',
      firstName: 'Aziz',
      lastName: 'Karimov',
      subscriptionEndsOnUtc: '2026-10-25T00:00:00Z',
      lastWorkoutOnUtc: null,
    },
  ],
  lowActivity: null,
  recentPayments: [
    {
      userId: 'u2',
      firstName: 'Lola',
      lastName: '',
      status: PaymentOrderStatusDto.Refunded,
      paidOnUtc: '2026-10-20T10:00:00Z',
      netAmount: 450000,
      months: 1,
    },
  ],
};

describe('toDashboard', () => {
  it('should key the earnings totals by dashboard period', () => {
    expect(toDashboard(response).earnings?.totals.week.netAmount).toBe(2);
    expect(toDashboard(response).earnings?.totals.year.netAmount).toBe(4);
  });

  it('should build names and initials for people and payments', () => {
    const dashboard = toDashboard(response);

    expect(dashboard.expiring[0]).toMatchObject({
      fullName: 'Aziz Karimov',
      initials: 'AK',
      lastWorkoutOn: null,
    });
    expect(dashboard.recentPayments[0]).toMatchObject({
      name: 'Lola',
      refunded: true,
      netAmount: 450000,
      months: 1,
    });
  });

  it('should treat missing lists as empty when the backend omits them', () => {
    expect(toDashboard(response).lowActivity).toEqual([]);
  });

  it('should keep earnings empty when the payout card is not set up', () => {
    expect(toDashboard({ ...response, earnings: null }).earnings).toBeNull();
  });
});
