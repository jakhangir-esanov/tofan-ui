import { UserProfile } from './user-profile';

export class AuthSession {
  constructor(
    readonly user: UserProfile,
    readonly accessToken: string,
    readonly expiresAt: Date,
    readonly refreshToken: string,
    /** `null` when the identity provider did not limit the refresh token's lifetime. */
    readonly refreshExpiresAt: Date | null,
  ) {}

  isExpired(now: Date = new Date()): boolean {
    return now.getTime() >= this.expiresAt.getTime();
  }

  canRefresh(now: Date = new Date()): boolean {
    return this.refreshExpiresAt === null || now.getTime() < this.refreshExpiresAt.getTime();
  }
}
