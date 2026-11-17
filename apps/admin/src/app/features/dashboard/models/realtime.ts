import { Usage } from './usage';

export const REALTIME_MINUTES = 30;

export interface Realtime {
  readonly activeUsers: number;
  readonly perMinute: readonly number[];
  readonly platforms: readonly Usage[];
}
