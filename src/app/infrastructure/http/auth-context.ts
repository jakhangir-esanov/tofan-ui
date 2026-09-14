import { HttpContextToken } from '@angular/common/http';

/** Sends the request without a bearer token and without refreshing the session (login, refresh). */
export const ANONYMOUS_REQUEST = new HttpContextToken<boolean>(() => false);

/** Sends this exact access token instead of the stored one (revoking a discarded session). */
export const EXPLICIT_ACCESS_TOKEN = new HttpContextToken<string | null>(() => null);
