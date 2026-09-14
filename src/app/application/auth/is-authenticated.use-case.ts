import { SessionRepository } from '@domain/auth/repositories/session.repository';

export class IsAuthenticatedUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  /** An expired access token still counts while it can be refreshed on the next request. */
  execute(now: Date = new Date()): boolean {
    const session = this.sessionRepository.get();
    return session !== null && (!session.isExpired(now) || session.canRefresh(now));
  }
}
