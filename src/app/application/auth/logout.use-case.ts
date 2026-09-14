import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';

export class LogoutUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  /** Signs out locally first; revoking on the server is best effort. */
  async execute(): Promise<void> {
    const session = this.sessionRepository.get();
    this.sessionRepository.clear();

    if (session !== null) {
      await this.authRepository.logout(session).catch(() => undefined);
    }
  }
}
