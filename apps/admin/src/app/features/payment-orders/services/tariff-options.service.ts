import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { TariffOption } from '../models/tariff-option';
import { TariffOptionResponse } from './tariff-option.dto';
import { toTariffOptions } from './tariff-option.mapper';

const TARIFFS = '/tariffs';

@Injectable({ providedIn: 'root' })
export class TariffOptionsService {
  private readonly apiClient = inject(ApiClient);

  async list(): Promise<readonly TariffOption[]> {
    return toTariffOptions(await this.apiClient.get<TariffOptionResponse[]>(TARIFFS));
  }
}
