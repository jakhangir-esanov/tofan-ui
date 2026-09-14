import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { SessionExpiredError } from '@domain/auth/errors/session-expired.error';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { RefreshSessionUseCase } from './refresh-session.use-case';

describe('RefreshSessionUseCase', () => {
  const now = new Date('2026-01-01T12:00:00Z');
  const admin = new UserProfile('1', 'admin', 'Admin', ['admin']);

  function session(user: UserProfile, token: string, refreshExpiresAt: string): AuthSession {
    return new AuthSession(user, token, now, `refresh-${token}`, new Date(refreshExpiresAt));
  }

  const stale = session(admin, 'old', '2026-01-02T00:00:00Z');
  const renewed = session(admin, 'new', '2026-01-03T00:00:00Z');

  let authRepository: AuthRepository;
  let sessionRepository: SessionRepository;
  let useCase: RefreshSessionUseCase;

  beforeEach(() => {
    authRepository = {
      login: vi.fn(),
      refresh: vi.fn().mockResolvedValue(renewed),
      logout: vi.fn(),
    };
    sessionRepository = { get: vi.fn().mockReturnValue(stale), save: vi.fn(), clear: vi.fn() };
    useCase = new RefreshSessionUseCase(authRepository, sessionRepository);
  });

  it('stores and returns the renewed session', async () => {
    await expect(useCase.execute(now)).resolves.toBe(renewed);

    expect(authRepository.refresh).toHaveBeenCalledWith(stale);
    expect(sessionRepository.save).toHaveBeenCalledWith(renewed);
  });

  it('shares one request between concurrent callers', async () => {
    const results = await Promise.all([useCase.execute(now), useCase.execute(now)]);

    expect(results).toEqual([renewed, renewed]);
    expect(authRepository.refresh).toHaveBeenCalledTimes(1);
  });

  it('signs out when the refresh token has expired locally', async () => {
    vi.mocked(sessionRepository.get).mockReturnValue(session(admin, 'old', '2026-01-01T00:00:00Z'));

    await expect(useCase.execute(now)).resolves.toBeNull();

    expect(authRepository.refresh).not.toHaveBeenCalled();
    expect(sessionRepository.clear).toHaveBeenCalled();
  });

  it('signs out when the server rejects the refresh token', async () => {
    vi.mocked(authRepository.refresh).mockRejectedValue(new SessionExpiredError());

    await expect(useCase.execute(now)).resolves.toBeNull();

    expect(sessionRepository.clear).toHaveBeenCalled();
  });

  it('signs out when the admin role was taken away', async () => {
    const demoted = session(new UserProfile('1', 'admin', 'Admin', []), 'new', '2026-01-03');
    vi.mocked(authRepository.refresh).mockResolvedValue(demoted);

    await expect(useCase.execute(now)).resolves.toBeNull();

    expect(sessionRepository.save).not.toHaveBeenCalled();
    expect(sessionRepository.clear).toHaveBeenCalled();
  });

  it('keeps the session on a network failure', async () => {
    vi.mocked(authRepository.refresh).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(useCase.execute(now)).rejects.toThrow(TypeError);

    expect(sessionRepository.clear).not.toHaveBeenCalled();
  });
});
