import { Injectable, inject } from '@angular/core';
import { Drop } from '../models/drop';
import { DropDraft, DropVariantDraft } from '../models/drop-draft';
import { ApiClient } from '@core/http/api-client';
import { DropResponse } from './drop.dto';
import { toAddDropVariantRequest, toCreateDropRequest, toDrop } from './drop.mapper';

const DROPS = '/admin/drops';
const FILES = '/files';

@Injectable({ providedIn: 'root' })
export class DropsService {
  private readonly apiClient = inject(ApiClient);

  async list(): Promise<readonly Drop[]> {
    const drops = await this.apiClient.get<DropResponse[]>(DROPS);
    return drops.map((drop) => toDrop(drop, (fileId) => this.imageUrl(fileId)));
  }

  create(draft: DropDraft): Promise<string> {
    return this.apiClient.post<string>(DROPS, toCreateDropRequest(draft));
  }

  addVariant(dropId: string, draft: DropVariantDraft): Promise<string> {
    return this.apiClient.post<string>(
      `${DROPS}/${encodeURIComponent(dropId)}/variants`,
      toAddDropVariantRequest(draft),
    );
  }

  private imageUrl(fileId: string): string {
    return this.apiClient.url(`${FILES}/${encodeURIComponent(fileId)}/content`);
  }
}
