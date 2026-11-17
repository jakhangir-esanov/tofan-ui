import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpStatusCode,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { firstValueFrom } from 'rxjs';
import { Ga4CredentialsResponse } from './ga4-credentials.dto';
import { GA4_JWT_GRANT_TYPE, GA4_TOKEN_URL, ga4JwtClaims, signGa4Jwt } from './ga4-jwt';

export type Ga4Method = 'runReport' | 'batchRunReports' | 'runRealtimeReport';

interface GoogleTokenResponse {
  readonly access_token: string;
  readonly expires_in: number;
}

interface CachedToken {
  readonly value: string;
  readonly expiresAt: number;
}

const CREDENTIALS = '/admin/analytics/ga4-credentials';
const GA4_PROPERTIES_URL = 'https://analyticsdata.googleapis.com/v1beta/properties';
const UNAVAILABLE_CODE = 'Analytics.Unavailable';
const MS_PER_SECOND = 1000;
const REFRESH_MARGIN_MS = 300_000;

@Injectable({ providedIn: 'root' })
export class Ga4ClientService {
  private readonly apiClient = inject(ApiClient);
  private readonly google = new HttpClient(inject(HttpBackend));
  private credentials: Promise<Ga4CredentialsResponse> | null = null;
  private token: CachedToken | null = null;
  private pendingToken: Promise<string> | null = null;

  async post<TResponse>(method: Ga4Method, body: unknown): Promise<TResponse> {
    try {
      return await this.send<TResponse>(method, body);
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw toUnavailable(error);
      }
      this.token = null;
      return this.send<TResponse>(method, body).catch((retryError: unknown) => {
        throw toUnavailable(retryError);
      });
    }
  }

  private async send<TResponse>(method: Ga4Method, body: unknown): Promise<TResponse> {
    const { propertyId } = await this.loadCredentials();
    const headers = new HttpHeaders({ authorization: `Bearer ${await this.accessToken()}` });
    const url = `${GA4_PROPERTIES_URL}/${propertyId}:${method}`;
    return firstValueFrom(this.google.post<TResponse>(url, body, { headers }));
  }

  private accessToken(): Promise<string> {
    if (this.token !== null && this.token.expiresAt - REFRESH_MARGIN_MS > Date.now()) {
      return Promise.resolve(this.token.value);
    }
    this.pendingToken ??= this.requestToken().finally(() => {
      this.pendingToken = null;
    });
    return this.pendingToken;
  }

  private async requestToken(): Promise<string> {
    const { clientEmail, privateKey } = await this.loadCredentials();
    const issuedAt = Math.floor(Date.now() / MS_PER_SECOND);
    const claims = ga4JwtClaims(clientEmail, issuedAt);
    const assertion = await signGa4Jwt(claims, privateKey, crypto.subtle);
    const form = new URLSearchParams({ grant_type: GA4_JWT_GRANT_TYPE, assertion }).toString();
    const headers = new HttpHeaders({ 'content-type': 'application/x-www-form-urlencoded' });
    const answer = await firstValueFrom(
      this.google.post<GoogleTokenResponse>(GA4_TOKEN_URL, form, { headers }),
    );
    this.token = {
      value: answer.access_token,
      expiresAt: Date.now() + answer.expires_in * MS_PER_SECOND,
    };
    return this.token.value;
  }

  private loadCredentials(): Promise<Ga4CredentialsResponse> {
    this.credentials ??= this.apiClient
      .get<Ga4CredentialsResponse>(CREDENTIALS)
      .catch((error: unknown) => {
        this.credentials = null;
        throw error;
      });
    return this.credentials;
  }
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized;
}

function toUnavailable(error: unknown): unknown {
  if (!(error instanceof HttpErrorResponse)) {
    return error;
  }
  return new ServiceUnavailableError(error.message, UNAVAILABLE_CODE);
}
