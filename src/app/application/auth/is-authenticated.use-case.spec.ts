import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { IsAuthenticatedUseCase } from './is-authenticated.use-case';

describe('IsAuthenticatedUseCase', () => {
  const now = new Date('2026-01-01T12:00:00Z');
  const user = new UserProfile('1', 'admin', 'Admin', ['admin']);

  function useCaseWith(session: AuthSession | null): IsAuthenticatedUseCase {
    const sessionRepository: SessionRepository = {
      get: () => session,
      save: vi.fn(),
      clear: vi.fn(),
    };
    return new IsAuthenticatedUseCase(sessionRepository);
  }

  function sessionExpiring(accessAt: string, refreshAt: string): AuthSession {
    return new AuthSession(user, 'token', new Date(accessAt), 'refresh', new Date(refreshAt));
  }

  it('is false without a session', () => {
    expect(useCaseWith(null).execute(now)).toBe(false);
  });

  it('is true for a live session', () => {
    const session = sessionExpiring('2026-01-01T13:00:00Z', '2026-01-02T00:00:00Z');

    expect(useCaseWith(session).execute(now)).toBe(true);
  });

  it('is true for an expired access token that can still be refreshed', () => {
    const session = sessionExpiring('2026-01-01T11:00:00Z', '2026-01-02T00:00:00Z');

    expect(useCaseWith(session).execute(now)).toBe(true);
  });

  it('is false once the refresh token has expired too', () => {
    const session = sessionExpiring('2026-01-01T10:00:00Z', '2026-01-01T11:00:00Z');

    expect(useCaseWith(session).execute(now)).toBe(false);
  });
});
