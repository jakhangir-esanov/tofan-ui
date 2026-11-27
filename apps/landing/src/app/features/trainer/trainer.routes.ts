import { Routes } from '@angular/router';
import { TrainerPage } from './pages/trainer-page/trainer-page';
import { trainerResolver } from './trainer.resolver';

export const TRAINER_ROUTES: Routes = [
  { path: '', resolve: { trainer: trainerResolver }, component: TrainerPage },
];
