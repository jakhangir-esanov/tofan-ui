import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { APP_DOWNLOAD_PATH } from '@landing/core/config/app-download';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { localeHomeUrl } from '@landing/core/i18n/locale-paths';
import { Icon } from '@landing/shared/icon/icon';
import { PreviewVideos } from '../../components/preview-videos/preview-videos';
import { ProgramList } from '../../components/program-list/program-list';
import { TrainerHero } from '../../components/trainer-hero/trainer-hero';
import { PublicTrainer } from '../../models/public-trainer';

const NOT_FOUND_STATUS = 404;

@Component({
  selector: 'landing-trainer-page',
  imports: [RouterLink, LandingTranslatePipe, Icon, TrainerHero, ProgramList, PreviewVideos],
  templateUrl: './trainer-page.html',
  styleUrl: './trainer-page.css',
})
export class TrainerPage {
  private readonly localeStore = inject(LocaleStore);

  readonly trainer = input<PublicTrainer | null>(null);

  protected readonly status = NOT_FOUND_STATUS;
  protected readonly downloadUrl = APP_DOWNLOAD_PATH;
  protected readonly homeUrl = computed(() => localeHomeUrl(this.localeStore.locale()));
}
