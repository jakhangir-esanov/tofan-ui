import { Component, computed, input } from '@angular/core';
import { TranslationParams } from '@core/i18n/dictionary';
import { APP_DOWNLOAD_PATH } from '@landing/core/config/app-download';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { Icon } from '@landing/shared/icon/icon';
import { PublicTrainer } from '../../models/public-trainer';
import { formatRating, formatSum, initialsOf } from '../../models/trainer-text';

@Component({
  selector: 'landing-trainer-hero',
  imports: [LandingTranslatePipe, Icon],
  templateUrl: './trainer-hero.html',
  styleUrl: './trainer-hero.css',
})
export class TrainerHero {
  readonly trainer = input.required<PublicTrainer>();

  protected readonly downloadUrl = APP_DOWNLOAD_PATH;
  protected readonly initials = computed(() => initialsOf(this.trainer().displayName));
  protected readonly price = computed<TranslationParams>(() => ({
    price: formatSum(this.trainer().monthlyPrice),
  }));
  protected readonly rating = computed<TranslationParams | null>(() => {
    const { averageRating, reviewCount } = this.trainer();
    if (averageRating === null || reviewCount === 0) {
      return null;
    }
    return { rating: formatRating(averageRating), count: reviewCount };
  });
}
