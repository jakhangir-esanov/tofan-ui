export const FILE_CATEGORIES = [
  'exerciseVideo',
  'exerciseThumbnail',
  'avatar',
  'foodImage',
  'productImage',
  'document',
  'garmentImage',
] as const;
export type FileCategory = (typeof FILE_CATEGORIES)[number];
