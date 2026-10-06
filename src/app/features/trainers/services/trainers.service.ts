import { Injectable, inject } from '@angular/core';
import { Trainer } from '../models/trainer';
import { TrainerDraft } from '../models/trainer-draft';
import { Page, PageRequest } from '@shared/models/page';
import { ApiClient } from '@core/http/api-client';
import { PagedList } from '@core/http/api.dto';
import { toPage, toPagedQuery } from '@core/http/paging.mapper';
import { TrainerResponse } from './trainer.dto';
import { toCreateTrainerRequest, toTrainer } from './trainer.mapper';

const TRAINERS = '/admin/trainers';
const FILES = '/files';

@Injectable({ providedIn: 'root' })
export class TrainersService {
  private readonly apiClient = inject(ApiClient);

  async list(page: PageRequest): Promise<Page<Trainer>> {
    const list = await this.apiClient.get<PagedList<TrainerResponse>>(TRAINERS, toPagedQuery(page));
    return toPage(list, (response) => toTrainer(response, (fileId) => this.photoUrl(fileId)));
  }

  create(draft: TrainerDraft): Promise<string> {
    return this.apiClient.post<string>(TRAINERS, toCreateTrainerRequest(draft));
  }

  async publish(id: string): Promise<void> {
    await this.apiClient.post(`${trainerPath(id)}/publish`);
  }

  async unpublish(id: string): Promise<void> {
    await this.apiClient.post(`${trainerPath(id)}/unpublish`);
  }

  private photoUrl(fileId: string): string {
    return this.apiClient.url(`${FILES}/${encodeURIComponent(fileId)}/content`);
  }
}

function trainerPath(id: string): string {
  return `${TRAINERS}/${encodeURIComponent(id)}`;
}
