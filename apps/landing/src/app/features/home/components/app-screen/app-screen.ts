import { Component, input } from '@angular/core';
import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { SizedImage } from '../../models/sized-image';

export type AppScreenLoading = 'eager' | 'lazy';

@Component({
  selector: 'landing-app-screen',
  imports: [LandingTranslatePipe],
  template: `
    <div class="frame">
      <img
        class="screen"
        [src]="image().src"
        [width]="image().width"
        [height]="image().height"
        [alt]="alt() | t"
        [attr.loading]="loading()"
        [attr.fetchpriority]="loading() === 'eager' ? 'high' : null"
        decoding="async"
      />
    </div>
  `,
  styleUrl: './app-screen.css',
})
export class AppScreen {
  readonly image = input.required<SizedImage>();
  readonly alt = input.required<LandingKey>();
  readonly loading = input<AppScreenLoading>('lazy');
}
