import { Injectable, inject, signal } from '@angular/core';
import { SOLDIER_SUGGESTION_LIMIT, SoldierOption } from './models/soldier-option';
import { SoldierLookupService } from './services/soldier-lookup.service';

@Injectable()
export class SoldierSearchStore {
  private readonly soldierLookup = inject(SoldierLookupService);

  private readonly optionList = signal<readonly SoldierOption[]>([]);
  private latestRequest = 0;

  readonly options = this.optionList.asReadonly();
  readonly loading = signal(false);
  readonly failed = signal(false);

  async search(text: string): Promise<void> {
    const request = ++this.latestRequest;
    this.loading.set(true);
    this.failed.set(false);
    try {
      const found = await this.soldierLookup.search(text.trim(), SOLDIER_SUGGESTION_LIMIT);
      if (request === this.latestRequest) {
        this.optionList.set(found);
      }
    } catch {
      if (request === this.latestRequest) {
        this.optionList.set([]);
        this.failed.set(true);
      }
    } finally {
      if (request === this.latestRequest) {
        this.loading.set(false);
      }
    }
  }
}
