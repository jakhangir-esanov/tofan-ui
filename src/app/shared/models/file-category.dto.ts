import { enumMap } from '@shared/utils/enum-map';
import { FileCategory } from './file-category';

export enum FileCategoryDto {
  ExerciseVideo = 1,
  ExerciseThumbnail = 2,
  Avatar = 3,
  FoodImage = 4,
  ProductImage = 5,
  Document = 6,
  GarmentImage = 7,
}

export const fileCategories = enumMap<FileCategory, FileCategoryDto>(FileCategoryDto);
