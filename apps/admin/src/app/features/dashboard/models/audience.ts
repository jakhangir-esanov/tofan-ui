export interface AudienceTotals {
  readonly activeUsers: number;
  readonly newUsers: number;
  readonly sessions: number;
  readonly engagementRate: number;
  readonly engagementSecondsPerUser: number;
  readonly sessionsPerUser: number;
}

export interface AudienceDay {
  readonly date: Date;
  readonly activeUsers: number;
  readonly newUsers: number;
}

export interface Stickiness {
  readonly daily: number;
  readonly weekly: number;
  readonly monthly: number;
  readonly dauPerMau: number;
}

export interface Audience {
  readonly current: AudienceTotals;
  readonly previous: AudienceTotals;
  readonly days: readonly AudienceDay[];
  readonly stickiness: Stickiness;
}
