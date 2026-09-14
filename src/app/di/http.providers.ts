import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideApiConfiguration } from '@infrastructure/api/generated/api-configuration';
import { authTokenInterceptor } from '@infrastructure/http/auth-token.interceptor';
import { unauthorizedInterceptor } from '@presentation/auth/unauthorized.interceptor';

export function provideHttp(apiBaseUrl: string): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideApiConfiguration(apiBaseUrl),
    provideHttpClient(
      withFetch(),
      // Order matters: responses pass back through interceptors in reverse, so the token
      // interceptor gets a chance to refresh and retry before a 401 signs the user out.
      withInterceptors([unauthorizedInterceptor, authTokenInterceptor]),
    ),
  ]);
}
