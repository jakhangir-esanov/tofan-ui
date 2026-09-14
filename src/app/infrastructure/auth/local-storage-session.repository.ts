import { Injectable, InjectionToken, inject } from '@angular/core';
import { AuthSession } from '@domain/auth/entities/auth-session';
import { SessionRepository } from '@domain/auth/repositories/session.repository';
import { userFromAccessToken } from './auth.mapper';

export const SESSION_STORAGE = new InjectionToken<Storage>('SESSION_STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});

const STORAGE_KEY = 'tofan.session';

interface StoredSession {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string | null;
}

/** Persists the tokens only; the user is read back from the access token claims. */
@Injectable()
export class LocalStorageSessionRepository implements SessionRepository {
  private readonly storage = inject(SESSION_STORAGE);

  get(): AuthSession | null {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const stored = parseStoredSession(raw);
    const user = stored === null ? null : userFromAccessToken(stored.accessToken);
    if (stored === null || user === null) {
      this.clear();
      return null;
    }

    return new AuthSession(
      user,
      stored.accessToken,
      new Date(stored.expiresAt),
      stored.refreshToken,
      stored.refreshExpiresAt === null ? null : new Date(stored.refreshExpiresAt),
    );
  }

  save(session: AuthSession): void {
    const stored: StoredSession = {
      accessToken: session.accessToken,
      expiresAt: session.expiresAt.toISOString(),
      refreshToken: session.refreshToken,
      refreshExpiresAt: session.refreshExpiresAt?.toISOString() ?? null,
    };
    this.storage.setItem(STORAGE_KEY, JSON.stringify(stored));
  }

  clear(): void {
    this.storage.removeItem(STORAGE_KEY);
  }
}

function parseStoredSession(raw: string): StoredSession | null {
  try {
    const value: unknown = JSON.parse(raw);
    return isStoredSession(value) ? value : null;
  } catch {
    return null;
  }
}

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['accessToken'] === 'string' &&
    typeof candidate['refreshToken'] === 'string' &&
    isDateString(candidate['expiresAt']) &&
    (candidate['refreshExpiresAt'] === null || isDateString(candidate['refreshExpiresAt']))
  );
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}
