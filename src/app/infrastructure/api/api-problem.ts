import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { AccessDeniedError } from '@domain/shared/errors/access-denied.error';
import { ConflictError } from '@domain/shared/errors/conflict.error';
import { NotFoundError } from '@domain/shared/errors/not-found.error';
import { ValidationError } from '@domain/shared/errors/validation.error';

const VALIDATION_CODE = 'General.Validation';

/**
 * An error response from the Tofan API. Failed results arrive as RFC 7807 problem details
 * where `title` carries the backend error code (e.g. `Authentication.InvalidCredentials`).
 */
export class ApiProblem extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly detail: string,
    readonly errors: readonly string[] = [],
  ) {
    super(`${status} ${code}: ${detail}`);
    this.name = 'ApiProblem';
  }

  /** Returns `null` for anything that is not an HTTP response, including network failures. */
  static from(error: unknown): ApiProblem | null {
    if (!(error instanceof HttpErrorResponse) || error.status === 0) {
      return null;
    }
    const body: unknown = error.error;
    const problem = isRecord(body) ? body : {};
    return new ApiProblem(
      error.status,
      stringOr(problem['title'], ''),
      stringOr(problem['detail'], error.message),
      Array.isArray(problem['errors']) ? problem['errors'].flatMap(errorMessage) : [],
    );
  }

  /** Maps the statuses every module shares; anything else stays an `ApiProblem`. */
  toDomainError(): Error {
    switch (this.status) {
      case HttpStatusCode.BadRequest:
        return this.code === VALIDATION_CODE
          ? new ValidationError(this.errors.length > 0 ? this.errors.join('\n') : this.detail)
          : this;
      case HttpStatusCode.Forbidden:
        return new AccessDeniedError();
      case HttpStatusCode.NotFound:
        return new NotFoundError(this.detail);
      case HttpStatusCode.Conflict:
        return new ConflictError(this.detail);
      default:
        return this;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function errorMessage(item: unknown): string[] {
  return isRecord(item) && typeof item['message'] === 'string' ? [item['message']] : [];
}
