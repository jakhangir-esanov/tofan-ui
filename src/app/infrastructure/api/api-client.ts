import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Api } from './generated';
import { ApiFnOptional, ApiFnRequired } from './generated/api';
import { ApiProblem } from './api-problem';

/** Successful responses wrap the payload in `{ isSuccess, error, data }`; paged lists come bare. */
export type ApiData<R> = R extends { isSuccess: boolean }
  ? R extends { data: infer T }
    ? T
    : void
  : R;

export interface ApiCallOptions {
  readonly context?: HttpContext;
  /** Turns an endpoint-specific error code into a domain error; return `null` to fall through. */
  readonly translate?: (problem: ApiProblem) => Error | null;
}

/** Calls generated API functions, unwraps the result envelope and throws domain errors. */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly api = inject(Api);

  send<P, R>(fn: ApiFnRequired<P, R>, params: P, options?: ApiCallOptions): Promise<ApiData<R>>;
  send<P, R>(fn: ApiFnOptional<P, R>, params?: P, options?: ApiCallOptions): Promise<ApiData<R>>;
  async send<P, R>(
    fn: ApiFnRequired<P, R>,
    params: P,
    options: ApiCallOptions = {},
  ): Promise<ApiData<R>> {
    try {
      const body = await this.api.invoke(fn, params, options.context);
      return unwrapResult(body) as ApiData<R>;
    } catch (error) {
      const problem = ApiProblem.from(error);
      if (problem === null) {
        throw error;
      }
      throw options.translate?.(problem) ?? problem.toDomainError();
    }
  }
}

export function unwrapResult(body: unknown): unknown {
  if (typeof body === 'object' && body !== null && 'isSuccess' in body) {
    return 'data' in body ? body.data : undefined;
  }
  return body;
}
