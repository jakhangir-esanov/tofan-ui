import { TranslationKey } from '@core/i18n/dictionary';
import { SelectOption, toSelectOptions } from '@shared/models/select-option';
import { isUuid } from '@shared/utils/identifiers';
import { Drop } from '../../models/drop';
import { GarmentSize } from '../../models/garment-catalog';
import { GarmentFilter } from '../../models/garment-filter';
import { GarmentStatus } from '../../models/garment-status';

export const CLAIM_STATES = ['claimed', 'unclaimed'] as const;
export type ClaimState = (typeof CLAIM_STATES)[number];

export const CLAIM_STATE_OPTIONS: readonly SelectOption<ClaimState, TranslationKey>[] =
  toSelectOptions(CLAIM_STATES, {
    claimed: 'garments.filters.claimed',
    unclaimed: 'garments.filters.unclaimed',
  });

export interface GarmentFilterValue {
  serialNumber: string;
  status: GarmentStatus | null;
  ownerId: string;
  dropId: string | null;
  variantId: string | null;
  size: GarmentSize | null;
  claim: ClaimState | null;
  editionFrom: number | null;
  editionTo: number | null;
}

export function emptyGarmentFilterValue(): GarmentFilterValue {
  return {
    serialNumber: '',
    status: null,
    ownerId: '',
    dropId: null,
    variantId: null,
    size: null,
    claim: null,
    editionFrom: null,
    editionTo: null,
  };
}

export function toGarmentFilter(value: GarmentFilterValue, drops: readonly Drop[]): GarmentFilter {
  const serialNumber = value.serialNumber.trim();
  const ownerId = value.ownerId.trim();
  const drop = drops.find((candidate) => candidate.id === value.dropId) ?? null;
  const variantId =
    drop !== null && value.variantId !== null && drop.variant(value.variantId) !== null
      ? value.variantId
      : null;
  return {
    ...(serialNumber.length === 0 ? {} : { serialNumber }),
    ...(value.status === null ? {} : { status: value.status }),
    ...(isUuid(ownerId) ? { ownerId } : {}),
    ...(value.dropId === null ? {} : { dropId: value.dropId }),
    ...(variantId === null ? {} : { variantId }),
    ...(value.size === null ? {} : { size: value.size }),
    ...(value.claim === null ? {} : { isClaimed: value.claim === 'claimed' }),
    ...(value.editionFrom === null ? {} : { editionFrom: value.editionFrom }),
    ...(value.editionTo === null ? {} : { editionTo: value.editionTo }),
  };
}
