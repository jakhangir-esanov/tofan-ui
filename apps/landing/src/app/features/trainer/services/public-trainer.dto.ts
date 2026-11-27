export enum FitnessGoalDto {
  LoseWeight = 1,
  GainMuscle = 2,
  Maintain = 3,
  Recomposition = 4,
}

export interface PublicProgramDto {
  readonly name: string | null;
  readonly goal: FitnessGoalDto | null;
}

export interface PublicPreviewVideoDto {
  readonly id: string;
  readonly fileId: string;
  readonly name: string | null;
  readonly displayOrder: number;
  readonly videoUrl: string | null;
  readonly hlsUrl: string | null;
  readonly posterUrl: string | null;
}

export interface PublicTrainerDto {
  readonly id: string;
  readonly slug: string;
  readonly displayName: string;
  readonly bio: string | null;
  readonly photoFileId: string | null;
  readonly monthlyPrice: number;
  readonly averageRating: number | null;
  readonly reviewCount: number;
  readonly workoutPrograms: readonly PublicProgramDto[];
  readonly mealPrograms: readonly PublicProgramDto[];
  readonly previewVideos: readonly PublicPreviewVideoDto[];
}

export interface PublicTrainerEnvelopeDto {
  readonly data: PublicTrainerDto;
}
