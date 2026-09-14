import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { RefreshSessionUseCase } from '@application/auth/refresh-session.use-case';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { ApiConfiguration } from '@infrastructure/api/generated';
import { Observable, catchError, from, of, switchMap, throwError } from 'rxjs';
import { ANONYMOUS_REQUEST, EXPLICIT_ACCESS_TOKEN } from './auth-context';

/**
 * Attaches the bearer token to requests addressed to our own API. An expired access token is
 * refreshed before sending; a 401 triggers one refresh and one retry. When the session cannot
 * be renewed the original error is passed on, so the UI can send the user to login.
 */
export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const apiRootUrl = inject(ApiConfiguration).rootUrl;
  if (!request.url.startsWith(apiRootUrl) || request.context.get(ANONYMOUS_REQUEST)) {
    return next(request);
  }

  const explicitToken = request.context.get(EXPLICIT_ACCESS_TOKEN);
  if (explicitToken !== null) {
    return next(withBearer(request, explicitToken));
  }

  const sessionRepository = inject(SessionRepository);
  const refreshSession = inject(RefreshSessionUseCase);

  const renew = (rejected: AuthSession): Observable<AuthSession | null> => {
    const latest = sessionRepository.get();
    const alreadyRenewed =
      latest !== null && latest.accessToken !== rejected.accessToken && !latest.isExpired();
    return alreadyRenewed ? of(latest) : from(refreshSession.execute());
  };

  const current = sessionRepository.get();
  const session$ = current?.isExpired() ? from(refreshSession.execute()) : of(current);

  return session$.pipe(
    switchMap((session) => {
      if (session === null) {
        return next(request);
      }
      return next(withBearer(request, session.accessToken)).pipe(
        catchError((error: unknown) =>
          isUnauthorized(error)
            ? renew(session).pipe(
                switchMap((renewed) =>
                  renewed === null
                    ? throwError(() => error)
                    : next(withBearer(request, renewed.accessToken)),
                ),
              )
            : throwError(() => error),
        ),
      );
    }),
  );
};

function withBearer<T>(request: HttpRequest<T>, accessToken: string): HttpRequest<T> {
  return request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized;
}
