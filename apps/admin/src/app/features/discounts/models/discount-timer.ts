export const TIMER_TRIGGERS = ['eachTrainer', 'anyTrainer'] as const;
export type TimerTrigger = (typeof TIMER_TRIGGERS)[number];

export const DEFAULT_TIMER_TRIGGER: TimerTrigger = 'eachTrainer';

export interface DiscountTimer {
  readonly isEnabled: boolean;
  readonly trigger: TimerTrigger;
  readonly startsOnVisit: number;
  readonly durationMinutes: number;
  readonly standardPercent: number;
  readonly vipPercent: number;
  readonly newBuyersOnly: boolean;
  readonly trainerIds: readonly string[] | null;
}
