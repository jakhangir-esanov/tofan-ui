import { Query } from '@core/http/api.dto';
import { toPagedQuery } from '@core/http/paging.mapper';
import { SoldierOption } from '../models/soldier-option';
import { SoldierLookupResponse } from './soldier-lookup.dto';

export function toSoldierOption(response: SoldierLookupResponse): SoldierOption {
  const fullName = `${response.firstName} ${response.lastName}`.trim();
  return {
    userId: response.userId,
    label: fullName.length > 0 ? fullName : response.userName,
    userName: response.userName,
  };
}

export function toSoldierSearchQuery(text: string, limit: number): Query {
  return {
    ...toPagedQuery({ first: 0, rows: limit }),
    Search: text.length === 0 ? undefined : text,
  };
}
