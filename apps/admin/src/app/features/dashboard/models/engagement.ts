import { Usage } from './usage';

export interface ScreenUsage extends Usage {
  readonly users: number;
}

export interface EventUsage extends Usage {
  readonly users: number;
}

export interface WorkoutSummary {
  readonly finished: number;
  readonly averageMinutes: number;
  readonly averageSets: number;
  readonly personalRecords: number;
  readonly bySource: readonly Usage[];
}

export interface FoodSummary {
  readonly logged: number;
  readonly bySource: readonly Usage[];
  readonly byMealType: readonly Usage[];
}

export interface Engagement {
  readonly screens: readonly ScreenUsage[];
  readonly events: readonly EventUsage[];
  readonly workouts: WorkoutSummary | null;
  readonly foods: FoodSummary | null;
}

export const KEY_EVENTS = ['sign_up', 'login', 'workout_finished', 'food_logged'] as const;

export type KeyEvent = (typeof KEY_EVENTS)[number];

export function keyEventCount(events: readonly EventUsage[], name: KeyEvent): number {
  return events.find((event) => event.label === name)?.value ?? 0;
}
