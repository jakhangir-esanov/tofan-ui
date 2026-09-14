import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from './auth.store';

/** Signs the user out when the session is rejected and could not be refreshed. */
export const unauthorizedInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (isUnauthorized(error) && authStore.currentUser() !== null) {
        void authStore.logout();
      }
      return throwError(() => error);
    }),
  );
};

function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized;
}
