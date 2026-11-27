import { InjectionToken, TransferState, inject, makeStateKey } from '@angular/core';

export const DEFAULT_API_ORIGIN = 'https://api.peaktofan.com';
export const API_ORIGIN_STATE = makeStateKey<string>('apiOrigin');

export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN', {
  providedIn: 'root',
  factory: () => inject(TransferState).get(API_ORIGIN_STATE, DEFAULT_API_ORIGIN),
});
