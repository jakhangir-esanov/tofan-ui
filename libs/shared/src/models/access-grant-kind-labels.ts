import { TranslationKey } from '@core/i18n/dictionary';
import { ACCESS_GRANT_KINDS, AccessGrantKind } from './access-grant-kind';
import { toSelectOptions } from './select-option';

export const ACCESS_GRANT_KIND_LABELS: Record<AccessGrantKind, TranslationKey> = {
  card: 'enums.accessGrantKind.card',
  gift: 'enums.accessGrantKind.gift',
  test: 'enums.accessGrantKind.test',
};

export const ACCESS_GRANT_KIND_HINTS: Record<AccessGrantKind, TranslationKey> = {
  card: 'enums.accessGrantKindHint.card',
  gift: 'enums.accessGrantKindHint.gift',
  test: 'enums.accessGrantKindHint.test',
};

export const ACCESS_GRANT_KIND_OPTIONS = toSelectOptions(
  ACCESS_GRANT_KINDS,
  ACCESS_GRANT_KIND_LABELS,
);
