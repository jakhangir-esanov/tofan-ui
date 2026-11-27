export const ACCESS_GRANT_KINDS = ['card', 'gift', 'test'] as const;
export type AccessGrantKind = (typeof ACCESS_GRANT_KINDS)[number];
