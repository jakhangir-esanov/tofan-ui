import { Component, input } from '@angular/core';
import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';

@Component({
  selector: 'landing-section-heading',
  imports: [LandingTranslatePipe],
  template: `
    <h2 class="display section-title reveal">{{ title() | t }}</h2>
    @if (text(); as text) {
      <p class="section-text reveal" [style.--i]="1">{{ text | t }}</p>
    }
  `,
  styleUrl: './section-heading.css',
})
export class SectionHeading {
  readonly title = input.required<LandingKey>();
  readonly text = input<LandingKey>();
}
