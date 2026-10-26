import { Component } from '@angular/core';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { EXTERNAL_LINKS } from '@landing/core/config/external-links';
import { SITE_SECTIONS } from '@landing/core/config/site-sections';
import { Icon } from '@landing/shared/icon/icon';
import { APPAREL_PHOTO, APPAREL_POINTS } from '../../models/apparel-points';

@Component({
  selector: 'landing-apparel-section',
  imports: [LandingTranslatePipe, Icon],
  templateUrl: './apparel-section.html',
  styleUrl: './apparel-section.css',
})
export class ApparelSection {
  protected readonly sectionId = SITE_SECTIONS.apparel;
  protected readonly points = APPAREL_POINTS;
  protected readonly shopUrl = EXTERNAL_LINKS.apparelShop;
  protected readonly photo = APPAREL_PHOTO;
}
