import { AuthSession } from '@domain/auth/entities/auth-session';
import { AuthRepository } from '@domain/auth/repositories/auth.repository';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { Credentials } from '@domain/auth/value-objects/credentials';
import { AccessDeniedError } from '@domain/shared/errors/access-denied.error';

export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  /** @throws AccessDeniedError when the account has no admin role. */
  async execute(username: string, password: string): Promise<AuthSession> {
    const credentials = Credentials.create(username, password);
    const session = await this.authRepository.login(credentials);

    if (!session.user.isAdmin()) {
      await this.authRepository.logout(session).catch(() => undefined);
      throw new AccessDeniedError();
    }

    this.sessionRepository.save(session);
    return session;
  }
}
