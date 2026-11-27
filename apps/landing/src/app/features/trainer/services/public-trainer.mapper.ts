import { FitnessGoal, PublicTrainer, TrainerProgram, TrainerVideo } from '../models/public-trainer';
import {
  FitnessGoalDto,
  PublicPreviewVideoDto,
  PublicProgramDto,
  PublicTrainerDto,
} from './public-trainer.dto';

const GOALS: Record<FitnessGoalDto, FitnessGoal> = {
  [FitnessGoalDto.LoseWeight]: 'loseWeight',
  [FitnessGoalDto.GainMuscle]: 'gainMuscle',
  [FitnessGoalDto.Maintain]: 'maintain',
  [FitnessGoalDto.Recomposition]: 'recomposition',
};

export function toPublicTrainer(dto: PublicTrainerDto, apiOrigin: string): PublicTrainer {
  return {
    slug: dto.slug,
    displayName: dto.displayName,
    bio: blankToNull(dto.bio),
    photoUrl: dto.photoFileId === null ? null : `${apiOrigin}/files/${dto.photoFileId}/content`,
    monthlyPrice: dto.monthlyPrice,
    averageRating: dto.averageRating,
    reviewCount: dto.reviewCount,
    workoutPrograms: dto.workoutPrograms.map(toTrainerProgram),
    mealPrograms: dto.mealPrograms.map(toTrainerProgram),
    videos: [...dto.previewVideos]
      .sort((first, second) => first.displayOrder - second.displayOrder)
      .map((video) => toTrainerVideo(video, apiOrigin)),
  };
}

function toTrainerProgram(dto: PublicProgramDto): TrainerProgram {
  return {
    name: blankToNull(dto.name),
    goal: dto.goal === null ? null : (GOALS[dto.goal] ?? null),
  };
}

function toTrainerVideo(dto: PublicPreviewVideoDto, apiOrigin: string): TrainerVideo {
  return {
    id: dto.id,
    mp4Url: absoluteUrl(apiOrigin, dto.videoUrl),
    hlsUrl: absoluteUrl(apiOrigin, dto.hlsUrl),
    posterUrl: absoluteUrl(apiOrigin, dto.posterUrl),
  };
}

function absoluteUrl(apiOrigin: string, path: string | null): string | null {
  return path === null ? null : `${apiOrigin}${path}`;
}

function blankToNull(text: string | null): string | null {
  return text === null || text.trim() === '' ? null : text.trim();
}
