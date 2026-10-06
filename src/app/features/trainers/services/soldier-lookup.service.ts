import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { SoldierOption } from '../models/soldier-option';
import { SoldierLookupResponse } from './soldier-lookup.dto';
import { toSoldierOption, toSoldierSearchQuery } from './soldier-lookup.mapper';

const SOLDIERS = '/admin/soldiers';

@Injectable({ providedIn: 'root' })
export class SoldierLookupService {
  private readonly apiClient = inject(ApiClient);

  async search(text: string, limit: number): Promise<readonly SoldierOption[]> {
    const list = await this.apiClient.get<PagedList<SoldierLookupResponse>>(
      SOLDIERS,
      toSoldierSearchQuery(text, limit),
    );
    return (list.data ?? []).map(toSoldierOption);
  }
}
