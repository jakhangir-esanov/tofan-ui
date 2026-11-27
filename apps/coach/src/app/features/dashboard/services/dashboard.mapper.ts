import { initialsOf } from '@coach/core/clients/client-activity';
import { PaymentOrderStatusDto } from '@coach/core/payments/payment.dto';
import { Payment } from '@coach/core/payments/payment';
import { toDateOrNull } from '@coach/core/payments/payment.mapper';
import { Dashboard, DashboardEarnings, DashboardPerson } from '../models/dashboard';
import {
  DashboardClientResponse,
  DashboardPaymentResponse,
  DashboardResponse,
  TrainerEarningsSummaryResponse,
} from './dashboard.dto';

export function toDashboard(response: DashboardResponse): Dashboard {
  return {
    earnings: response.earnings === null ? null : toEarnings(response.earnings),
    subscribers: response.subscribers,
    programs: response.programs,
    expiring: (response.expiring ?? []).map(toPerson),
    lowActivity: (response.lowActivity ?? []).map(toPerson),
    recentPayments: (response.recentPayments ?? []).map(toDashboardPayment),
  };
}

function toEarnings(response: TrainerEarningsSummaryResponse): DashboardEarnings {
  return {
    currencyCode: response.currencyCode,
    totals: {
      today: response.today,
      week: response.thisWeek,
      month: response.thisMonth,
      year: response.thisYear,
    },
    renewedThisMonth: response.renewedThisMonth,
  };
}

function toPerson(response: DashboardClientResponse): DashboardPerson {
  return {
    userId: response.userId,
    fullName: fullNameOf(response.firstName, response.lastName),
    initials: initialsOf(response.firstName, response.lastName),
    subscriptionEndsOn: new Date(response.subscriptionEndsOnUtc),
    lastWorkoutOn: toDateOrNull(response.lastWorkoutOnUtc),
  };
}

function toDashboardPayment(response: DashboardPaymentResponse, index: number): Payment {
  return {
    id: `${response.userId}-${response.paidOnUtc ?? index}`,
    name: fullNameOf(response.firstName, response.lastName) || null,
    paidOn: toDateOrNull(response.paidOnUtc),
    netAmount: response.netAmount,
    months: response.months,
    refunded: response.status === PaymentOrderStatusDto.Refunded,
  };
}

function fullNameOf(firstName: string | null, lastName: string | null): string {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}
