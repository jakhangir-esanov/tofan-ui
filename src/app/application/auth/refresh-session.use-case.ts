import { AuthSession } from '@domain/auth/entities/auth-session';
import { SessionExpiredError } from '@domain/auth/errors/session-expired.error';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';

/**
 * Renews the stored session. Concurrent callers share one request, so a burst of 401s
 * does not spend the refresh token several times. Resolves to `null` when the user has
 * to sign in again; the stored session is cleared in that case.
 */
export class RefreshSessionUseCase {
  private inFlight: Promise<AuthSession | null> | null = null;

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  execute(now: Date = new Date()): Promise<AuthSession | null> {
    this.inFlight ??= this.refresh(now).finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private async refresh(now: Date): Promise<AuthSession | null> {
    const session = this.sessionRepository.get();
    if (session === null || !session.canRefresh(now)) {
      this.sessionRepository.clear();
      return null;
    }

    try {
      const renewed = await this.authRepository.refresh(session);
      if (!renewed.user.isAdmin()) {
        this.sessionRepository.clear();
        return null;
      }
      this.sessionRepository.save(renewed);
      return renewed;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        this.sessionRepository.clear();
        return null;
      }
      throw error;
    }
  }
}
