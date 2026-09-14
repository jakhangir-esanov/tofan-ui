import { HttpContext, HttpStatusCode } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { InvalidCredentialsError } from '@domain/auth/errors/invalid-credentials.error';
import { SessionExpiredError } from '@domain/auth/errors/session-expired.error';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { Credentials } from '@domain/auth/value-objects/credentials';
import { ApiClient } from '@infrastructure/api/api-client';
import {
  AuthTokenResponse,
  postAuthLogin,
  postAuthLogout,
  postAuthRefresh,
} from '@infrastructure/api/generated';
import { ANONYMOUS_REQUEST, EXPLICIT_ACCESS_TOKEN } from '@infrastructure/http/auth-context';
import { toAuthSession } from './auth.mapper';

const INVALID_CREDENTIALS_CODE = 'Authentication.InvalidCredentials';

@Injectable()
export class HttpAuthRepository implements AuthRepository {
  private readonly apiClient = inject(ApiClient);

  async login(credentials: Credentials): Promise<AuthSession> {
    const response = await this.apiClient.send(
      postAuthLogin,
      { body: { username: credentials.username, password: credentials.password } },
      {
        context: anonymousContext(),
        translate: (problem) =>
          problem.code === INVALID_CREDENTIALS_CODE ? new InvalidCredentialsError() : null,
      },
    );
    return toSessionOrThrow(response);
  }

  async refresh(session: AuthSession): Promise<AuthSession> {
    const response = await this.apiClient.send(
      postAuthRefresh,
      { body: { refreshToken: session.refreshToken } },
      {
        context: anonymousContext(),
        translate: (problem) =>
          problem.status === HttpStatusCode.BadRequest ? new SessionExpiredError() : null,
      },
    );
    return toSessionOrThrow(response);
  }

  async logout(session: AuthSession): Promise<void> {
    await this.apiClient.send(
      postAuthLogout,
      { body: { refreshToken: session.refreshToken } },
      { context: new HttpContext().set(EXPLICIT_ACCESS_TOKEN, session.accessToken) },
    );
  }
}

function anonymousContext(): HttpContext {
  return new HttpContext().set(ANONYMOUS_REQUEST, true);
}

function toSessionOrThrow(response: AuthTokenResponse): AuthSession {
  const session = toAuthSession(response);
  if (session === null) {
    throw new Error('The access token carries no user claims.');
  }
  return session;
}
