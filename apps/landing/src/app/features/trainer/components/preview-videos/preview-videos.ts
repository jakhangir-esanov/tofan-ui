import { Component, input } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { TrainerVideo } from '../../models/public-trainer';

@Component({
  selector: 'landing-preview-videos',
  imports: [LandingTranslatePipe],
  template: `
    <section class="section">
      <div class="container">
        <h2 class="display section-title">{{ 'trainer.videos' | t }}</h2>
        <div class="grid">
          @for (video of videos(); track video.id; let index = $index) {
            <video
              class="video"
              controls
              playsinline
              preload="none"
              [attr.poster]="video.posterUrl"
              [attr.aria-label]="'trainer.video' | t: { number: index + 1 }"
            >
              @if (video.hlsUrl; as hlsUrl) {
                <source [src]="hlsUrl" type="application/vnd.apple.mpegurl" />
              }
              @if (video.mp4Url; as mp4Url) {
                <source [src]="mp4Url" type="video/mp4" />
              }
            </video>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './preview-videos.css',
})
export class PreviewVideos {
  readonly videos = input.required<readonly TrainerVideo[]>();
}
