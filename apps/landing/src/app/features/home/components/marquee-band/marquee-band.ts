import { Component } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { Icon } from '@landing/shared/icon/icon';
import { MARQUEE_COPIES, MARQUEE_WORDS } from '../../models/marquee-words';

@Component({
  selector: 'landing-marquee-band',
  imports: [LandingTranslatePipe, Icon],
  template: `
    <div class="track">
      @for (copy of copies; track copy) {
        <ul class="row" [attr.aria-hidden]="copy > 0 ? 'true' : null">
          @for (word of words; track word) {
            <li class="display item">
              {{ word | t }}
              <landing-icon class="mark" name="mark" />
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: './marquee-band.css',
})
export class MarqueeBand {
  protected readonly words = MARQUEE_WORDS;
  protected readonly copies = MARQUEE_COPIES;
}
