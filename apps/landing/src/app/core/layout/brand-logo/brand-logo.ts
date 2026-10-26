import { Component, input } from '@angular/core';
import { Icon } from '@landing/shared/icon/icon';

export type BrandLogoVariant = 'header' | 'footer';

const WORDMARK = 'TOFAN';

@Component({
  selector: 'landing-brand-logo',
  imports: [Icon],
  template: `
    <landing-icon class="mark" name="mark" />
    <span class="wordmark">{{ wordmark }}</span>
  `,
  styleUrl: './brand-logo.css',
  host: { '[class.footer-logo]': "variant() === 'footer'" },
})
export class BrandLogo {
  readonly variant = input<BrandLogoVariant>('header');

  protected readonly wordmark = WORDMARK;
}
