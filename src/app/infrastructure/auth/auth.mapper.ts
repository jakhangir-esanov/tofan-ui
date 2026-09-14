import { AuthSession } from '@domain/auth/entities/auth-session';
import { UserProfile } from '@domain/auth/entities/user-profile';
import { AuthTokenResponse } from '@infrastructure/api/generated';
import { JwtPayload, decodeJwtPayload } from './jwt';

const MILLISECONDS_IN_SECOND = 1000;

/** Returns `null` when the access token does not carry the user claims. */
export function toAuthSession(
  response: AuthTokenResponse,
  issuedAt: Date = new Date(),
): AuthSession | null {
  const user = userFromAccessToken(response.accessToken);
  if (user === null) {
    return null;
  }

  return new AuthSession(
    user,
    response.accessToken,
    addSeconds(issuedAt, response.expiresIn),
    response.refreshToken,
    response.refreshExpiresIn > 0 ? addSeconds(issuedAt, response.refreshExpiresIn) : null,
  );
}

/** Keycloak access token claims: `sub`, `preferred_username`, `name`, `realm_access.roles`. */
export function userFromAccessToken(accessToken: string): UserProfile | null {
  const claims = decodeJwtPayload(accessToken);
  if (claims === null) {
    return null;
  }

  const id = stringClaim(claims, 'sub');
  const username = stringClaim(claims, 'preferred_username');
  if (!id || !username) {
    return null;
  }

  return new UserProfile(id, username, fullNameOf(claims) || username, realmRolesOf(claims));
}

function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * MILLISECONDS_IN_SECOND);
}

function fullNameOf(claims: JwtPayload): string {
  return (
    stringClaim(claims, 'name') ||
    [stringClaim(claims, 'given_name'), stringClaim(claims, 'family_name')]
      .filter(Boolean)
      .join(' ')
  );
}

function realmRolesOf(claims: JwtPayload): string[] {
  const realmAccess = claims['realm_access'];
  if (typeof realmAccess !== 'object' || realmAccess === null || !('roles' in realmAccess)) {
    return [];
  }
  const roles = realmAccess.roles;
  return Array.isArray(roles) ? roles.filter((role) => typeof role === 'string') : [];
}

function stringClaim(claims: JwtPayload, name: string): string {
  const value = claims[name];
  return typeof value === 'string' ? value.trim() : '';
}
