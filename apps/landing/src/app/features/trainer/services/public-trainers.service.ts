import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { API_ORIGIN } from '@landing/core/config/api-origin';
import { PublicTrainer } from '../models/public-trainer';
import { PublicTrainerEnvelopeDto } from './public-trainer.dto';
import { toPublicTrainer } from './public-trainer.mapper';

const PUBLIC_TRAINERS_PATH = '/public/trainers';

@Injectable({ providedIn: 'root' })
export class PublicTrainersService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(API_ORIGIN);

  findBySlug(slug: string): Observable<PublicTrainer | null> {
    const url = `${this.apiOrigin}${PUBLIC_TRAINERS_PATH}/${encodeURIComponent(slug)}`;
    return this.http.get<PublicTrainerEnvelopeDto>(url).pipe(
      map((envelope) => toPublicTrainer(envelope.data, this.apiOrigin)),
      catchError((error: unknown) => (isNotFound(error) ? of(null) : throwError(() => error))),
    );
  }
}

function isNotFound(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === HttpStatusCode.NotFound;
}
