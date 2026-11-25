import { Routes } from '@angular/router';
import { pageTitle } from '@core/i18n/page-title';
import { DiscountAudience } from './models/discount-audience';
import { DiscountsPage } from './pages/discounts-page/discounts-page';
import { DISCOUNT_API } from './services/discount-api';
import { TariffDiscountsService } from './services/tariff-discounts.service';
import { TrainerDiscountsService } from './services/trainer-discounts.service';

const TARIFFS: DiscountAudience = 'tariffs';
const TRAINERS: DiscountAudience = 'trainers';

export const DISCOUNT_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: TARIFFS },
  {
    path: TARIFFS,
    title: pageTitle('layout.titles.tariffDiscounts'),
    component: DiscountsPage,
    data: { audience: TARIFFS },
    providers: [{ provide: DISCOUNT_API, useExisting: TariffDiscountsService }],
  },
  {
    path: TRAINERS,
    title: pageTitle('layout.titles.trainerDiscounts'),
    component: DiscountsPage,
    data: { audience: TRAINERS },
    providers: [{ provide: DISCOUNT_API, useExisting: TrainerDiscountsService }],
  },
];
