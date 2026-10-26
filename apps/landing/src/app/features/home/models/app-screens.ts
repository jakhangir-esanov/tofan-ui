import { SizedImage } from './sized-image';

export const APP_SCREENS = {
  home: { src: '/images/app/home.webp', width: 720, height: 1466 },
  workouts: { src: '/images/app/workouts.webp', width: 720, height: 1366 },
  nutrition: { src: '/images/app/nutrition.webp', width: 720, height: 1429 },
  profile: { src: '/images/app/profile.webp', width: 720, height: 1387 },
} as const satisfies Record<string, SizedImage>;
