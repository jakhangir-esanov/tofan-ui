export type DashboardSection = 'overview' | 'behaviour' | 'technology' | 'retention';

export const DASHBOARD_SECTIONS: readonly DashboardSection[] = [
  'overview',
  'behaviour',
  'technology',
  'retention',
];

export const DEFAULT_DASHBOARD_SECTION: DashboardSection = 'overview';

export function isDashboardSection(value: unknown): value is DashboardSection {
  return (DASHBOARD_SECTIONS as readonly unknown[]).includes(value);
}
