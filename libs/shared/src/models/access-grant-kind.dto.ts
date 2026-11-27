import { enumMap } from '@shared/utils/enum-map';
import { AccessGrantKind } from './access-grant-kind';

export enum AccessGrantKindDto {
  Card = 1,
  Gift = 2,
  Test = 3,
}

export const accessGrantKinds = enumMap<AccessGrantKind, AccessGrantKindDto>(AccessGrantKindDto);
