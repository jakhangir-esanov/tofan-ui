import { TranslationKey } from '@core/i18n/dictionary';

export interface Usage {
  readonly label: string;
  readonly value: number;
}

export interface UsageRow {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly caption: string;
  readonly share: number;
  readonly placeholder: TranslationKey | null;
}

export interface UsageRowText<TUsage extends Usage> {
  readonly label: (usage: TUsage) => string;
  readonly value: (usage: TUsage) => string;
  readonly caption?: (usage: TUsage) => string;
}

export function toUsageRows<TUsage extends Usage>(
  usages: readonly TUsage[],
  text: UsageRowText<TUsage>,
): readonly UsageRow[] {
  return usages.map((usage, index) => ({
    key: `${index}-${usage.label}`,
    label: text.label(usage),
    value: text.value(usage),
    caption: text.caption?.(usage) ?? '',
    share: shareOf(usage.value, usages),
    placeholder: placeholderOf(usage.label),
  }));
}

const NOT_SET = '(not set)';
const OTHER = '(other)';

export function placeholderOf(label: string): TranslationKey | null {
  if (label === '' || label === NOT_SET) {
    return 'dashboard.states.unknown';
  }
  return label === OTHER ? 'dashboard.states.other' : null;
}

export function shareOf(value: number, rows: readonly Usage[]): number {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return total === 0 ? 0 : value / total;
}

export const MIN_COMPARABLE_USERS = 30;

export function relativeChange(current: number, previous: number): number | null {
  return previous === 0 ? null : (current - previous) / previous;
}

export function isComparable(previousUsers: number): boolean {
  return previousUsers >= MIN_COMPARABLE_USERS;
}
