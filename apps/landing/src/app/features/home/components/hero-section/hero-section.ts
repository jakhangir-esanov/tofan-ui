import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleStore } from '@core/i18n/locale.store';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { SITE_SECTIONS } from '@landing/core/config/site-sections';
import { localeHomeUrl } from '@landing/core/i18n/locale-paths';
import { APP_SCREENS } from '../../models/app-screens';
import { pointerTilt, RESTING_TILT } from '../../models/pointer-tilt';
import { AppScreen } from '../app-screen/app-screen';
import { StoreBadges } from '../store-badges/store-badges';

const MOUSE_POINTER = 'mouse';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

@Component({
  selector: 'landing-hero-section',
  imports: [RouterLink, LandingTranslatePipe, AppScreen, StoreBadges],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
  host: {
    '[style.--pointer-x]': 'tilt().x + "px"',
    '[style.--pointer-y]': 'tilt().y + "px"',
    '[style.--tilt-x]': 'tilt().tiltX + "deg"',
    '[style.--tilt-y]': 'tilt().tiltY + "deg"',
    '[class.tracking]': 'tracking()',
  },
})
export class HeroSection {
  private readonly localeStore = inject(LocaleStore);
  private readonly window = inject(DOCUMENT).defaultView;

  protected readonly screen = APP_SCREENS.home;
  protected readonly coachesSection = SITE_SECTIONS.coaches;
  protected readonly homeUrl = computed(() => localeHomeUrl(this.localeStore.locale()));
  protected readonly tilt = signal(RESTING_TILT);
  protected readonly tracking = signal(false);

  protected track(event: PointerEvent): void {
    if (event.pointerType !== MOUSE_POINTER || this.prefersReducedMotion()) {
      return;
    }
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    this.tilt.set(pointerTilt(event.clientX, event.clientY, target.getBoundingClientRect()));
    this.tracking.set(true);
  }

  protected rest(): void {
    this.tilt.set(RESTING_TILT);
    this.tracking.set(false);
  }

  private prefersReducedMotion(): boolean {
    return this.window?.matchMedia(REDUCED_MOTION_QUERY).matches ?? false;
  }
}
