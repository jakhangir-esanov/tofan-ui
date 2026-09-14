import { AuthSession } from '../entities/auth-session';
import { Credentials } from '../value-objects/credentials';

/**
 * Port to the identity provider. Declared as an abstract class (not an interface)
 * so it can be used as an Angular DI token without leaking Angular into the domain.
 */
export abstract class AuthRepository {
  /** @throws InvalidCredentialsError when the credentials are rejected. */
  abstract login(credentials: Credentials): Promise<AuthSession>;

  /** @throws SessionExpiredError when the refresh token is no longer accepted. */
  abstract refresh(session: AuthSession): Promise<AuthSession>;

  /** Revokes the session on the server side. */
  abstract logout(session: AuthSession): Promise<void>;
}
