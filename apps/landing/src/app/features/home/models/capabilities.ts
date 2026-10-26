import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { APP_SCREENS } from './app-screens';
import { SizedImage } from './sized-image';

export interface AppChapter {
  readonly title: LandingKey;
  readonly text: LandingKey;
  readonly alt: LandingKey;
  readonly screen: SizedImage;
}

export interface MoreFeature {
  readonly title: LandingKey;
  readonly text: LandingKey;
  readonly comingSoon: boolean;
}

export const APP_CHAPTERS: readonly AppChapter[] = [
  {
    title: 'features.workouts.title',
    text: 'features.workouts.text',
    alt: 'features.workouts.alt',
    screen: APP_SCREENS.workouts,
  },
  {
    title: 'features.nutrition.title',
    text: 'features.nutrition.text',
    alt: 'features.nutrition.alt',
    screen: APP_SCREENS.nutrition,
  },
  {
    title: 'features.progress.title',
    text: 'features.progress.text',
    alt: 'features.progress.alt',
    screen: APP_SCREENS.profile,
  },
];

export const MORE_FEATURES: readonly MoreFeature[] = [
  { title: 'features.trainers.title', text: 'features.trainers.text', comingSoon: false },
  { title: 'features.aiCoach.title', text: 'features.aiCoach.text', comingSoon: true },
  { title: 'features.community.title', text: 'features.community.text', comingSoon: true },
  { title: 'features.store.title', text: 'features.store.text', comingSoon: true },
];
