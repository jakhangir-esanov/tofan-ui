import { TransferState, inject } from '@angular/core';
import { API_ORIGIN_STATE, DEFAULT_API_ORIGIN } from './api-origin';

export const API_ORIGIN_ENV = 'API_ORIGIN';

export function serverApiOrigin(): string {
  const origin = process.env[API_ORIGIN_ENV] || DEFAULT_API_ORIGIN;
  inject(TransferState).set(API_ORIGIN_STATE, origin);
  return origin;
}
