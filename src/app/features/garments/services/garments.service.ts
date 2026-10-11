import { Injectable, inject } from '@angular/core';
import { CreatedGarment } from '../models/created-garment';
import { Garment } from '../models/garment';
import { GarmentDraft } from '../models/garment-draft';
import { GarmentFilter } from '../models/garment-filter';
import { AssignableGarmentStatus } from '../models/garment-status';
import { DownloadedFile } from '@shared/models/downloaded-file';
import { Page, PageRequest } from '@shared/models/page';
import { ApiClient } from '@core/http/api-client';
import { PagedList, Query } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import {
  ChangeGarmentStatusRequest,
  CreateGarmentResponse,
  ExtendGarmentRequest,
  GarmentResponse,
} from './garment.dto';
import {
  garmentStatuses,
  toCreateGarmentRequest,
  toCreatedGarment,
  toGarment,
} from './garment.mapper';

const GARMENTS = '/admin/garments';
const EXPORT_LINKS = `${GARMENTS}/export-links`;
const EXPORT_FILE_NAME = 'garment-links.xlsx';

@Injectable({ providedIn: 'root' })
export class GarmentsService {
  private readonly apiClient = inject(ApiClient);

  async list(filter: GarmentFilter, page: PageRequest): Promise<Page<Garment>> {
    const list = await this.apiClient.get<PagedList<GarmentResponse>>(GARMENTS, {
      ...toPagedQuery(page),
      ...toFilterQuery(filter),
    });
    return toPage(list, toGarment);
  }

  async create(draft: GarmentDraft): Promise<readonly CreatedGarment[]> {
    const response = await this.apiClient.post<CreateGarmentResponse[]>(
      GARMENTS,
      toCreateGarmentRequest(draft),
    );
    return response.map(toCreatedGarment);
  }

  async changeStatus(id: string, status: AssignableGarmentStatus): Promise<void> {
    const body: ChangeGarmentStatusRequest = { status: garmentStatuses.toApi(status) };
    await this.apiClient.post(`${garmentPath(id)}/status`, body);
  }

  async extend(id: string, months: number): Promise<Date> {
    const body: ExtendGarmentRequest = { months };
    return new Date(await this.apiClient.post<string>(`${garmentPath(id)}/extend`, body));
  }

  async delete(id: string): Promise<void> {
    await this.apiClient.delete(garmentPath(id));
  }

  exportLinks(filter: GarmentFilter): Promise<DownloadedFile> {
    return this.apiClient.download(EXPORT_LINKS, toFilterQuery(filter), EXPORT_FILE_NAME);
  }
}

function garmentPath(id: string): string {
  return `${GARMENTS}/${encodeURIComponent(id)}`;
}

function toFilterQuery(filter: GarmentFilter): Query {
  return {
    SerialNumber: filter.serialNumber,
    Status: filter.status === undefined ? undefined : garmentStatuses.toApi(filter.status),
    OwnerId: filter.ownerId,
    DropId: filter.dropId,
  };
}
