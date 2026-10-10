import { FILE_CATEGORIES, FileCategory } from '@shared/models/file-category';
import { toSelectOptions } from '@shared/models/select-option';
import { TranslationKey } from '@core/i18n/dictionary';

export const FILE_CATEGORY_LABELS: Record<FileCategory, TranslationKey> = {
  exerciseVideo: 'media.categories.exerciseVideo',
  exerciseThumbnail: 'media.categories.exerciseThumbnail',
  avatar: 'media.categories.avatar',
  foodImage: 'media.categories.foodImage',
  productImage: 'media.categories.productImage',
  document: 'media.categories.document',
  garmentImage: 'media.categories.garmentImage',
};

export const FILE_CATEGORY_OPTIONS = toSelectOptions(FILE_CATEGORIES, FILE_CATEGORY_LABELS);
