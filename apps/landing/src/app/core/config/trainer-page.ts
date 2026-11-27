const TRAINER_PAGE_SEGMENT = 't';

export const TRAINER_PAGE_ROUTE = `${TRAINER_PAGE_SEGMENT}/:slug`;

export function trainerPagePath(slug: string): string {
  return `${TRAINER_PAGE_SEGMENT}/${encodeURIComponent(slug)}`;
}
