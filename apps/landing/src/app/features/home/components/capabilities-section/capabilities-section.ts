import { Component } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { SITE_SECTIONS } from '@landing/core/config/site-sections';
import { APP_CHAPTERS, MORE_FEATURES } from '../../models/capabilities';
import { AppScreen } from '../app-screen/app-screen';
import { SectionHeading } from '../section-heading/section-heading';

@Component({
  selector: 'landing-capabilities-section',
  imports: [LandingTranslatePipe, AppScreen, SectionHeading],
  templateUrl: './capabilities-section.html',
  styleUrl: './capabilities-section.css',
})
export class CapabilitiesSection {
  protected readonly sectionId = SITE_SECTIONS.features;
  protected readonly chapters = APP_CHAPTERS;
  protected readonly moreFeatures = MORE_FEATURES;
}
