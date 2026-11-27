import { PaymentOrderStatusDto } from '@coach/core/payments/payment.dto';

export interface EarningsTotalResponse {
  paymentCount: number;
  netAmount: number;
}

export interface TrainerEarningsSummaryResponse {
  currencyCode: string;
  today: EarningsTotalResponse;
  thisWeek: EarningsTotalResponse;
  thisMonth: EarningsTotalResponse;
  thisYear: EarningsTotalResponse;
  renewedThisMonth: number;
}

export interface SubscriberStatsResponse {
  total: number;
  active: number;
  expiring: number;
  renewedThisMonth: number;
  churnedThisMonth: number;
  activeUsers: number;
  lowActivity: number;
}

export interface ProgramUsageResponse {
  workoutUsers: number;
  workoutPercent: number;
  mealUsers: number;
  mealPercent: number;
}

export interface DashboardClientResponse {
  userId: string;
  firstName: string;
  lastName: string;
  subscriptionEndsOnUtc: string;
  lastWorkoutOnUtc: string | null;
}

export interface DashboardPaymentResponse {
  userId: string;
  firstName: string;
  lastName: string;
  status: PaymentOrderStatusDto;
  paidOnUtc: string | null;
  netAmount: number;
  months: number;
}

export interface DashboardResponse {
  earnings: TrainerEarningsSummaryResponse | null;
  subscribers: SubscriberStatsResponse | null;
  programs: ProgramUsageResponse | null;
  expiring: DashboardClientResponse[] | null;
  lowActivity: DashboardClientResponse[] | null;
  recentPayments: DashboardPaymentResponse[] | null;
}
