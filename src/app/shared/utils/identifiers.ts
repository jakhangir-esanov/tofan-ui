export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SHORT_ID_LENGTH = 8;

export function shortId(id: string): string {
  return id.slice(0, SHORT_ID_LENGTH);
}

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
