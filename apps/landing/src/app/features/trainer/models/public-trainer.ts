export const FITNESS_GOALS = ['loseWeight', 'gainMuscle', 'maintain', 'recomposition'] as const;

export type FitnessGoal = (typeof FITNESS_GOALS)[number];

export interface TrainerProgram {
  readonly name: string | null;
  readonly goal: FitnessGoal | null;
}

export interface TrainerVideo {
  readonly id: string;
  readonly mp4Url: string | null;
  readonly hlsUrl: string | null;
  readonly posterUrl: string | null;
}

export interface PublicTrainer {
  readonly slug: string;
  readonly displayName: string;
  readonly bio: string | null;
  readonly photoUrl: string | null;
  readonly monthlyPrice: number;
  readonly averageRating: number | null;
  readonly reviewCount: number;
  readonly workoutPrograms: readonly TrainerProgram[];
  readonly mealPrograms: readonly TrainerProgram[];
  readonly videos: readonly TrainerVideo[];
}
