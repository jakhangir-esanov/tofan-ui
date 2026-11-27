import { InjectionToken } from '@angular/core';

export const API_ORIGIN = new InjectionToken<string>('API_ORIGIN', {
  providedIn: 'root',
  factory: () => 'https://api.peaktofan.com',
});
