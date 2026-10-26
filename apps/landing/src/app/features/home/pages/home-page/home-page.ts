import { Component } from '@angular/core';
import { ApparelSection } from '../../components/apparel-section/apparel-section';
import { CapabilitiesSection } from '../../components/capabilities-section/capabilities-section';
import { CoachSection } from '../../components/coach-section/coach-section';
import { DownloadSection } from '../../components/download-section/download-section';
import { FaqSection } from '../../components/faq-section/faq-section';
import { HeroSection } from '../../components/hero-section/hero-section';
import { MarqueeBand } from '../../components/marquee-band/marquee-band';
import { StepsSection } from '../../components/steps-section/steps-section';

@Component({
  selector: 'landing-home-page',
  imports: [
    HeroSection,
    MarqueeBand,
    CapabilitiesSection,
    StepsSection,
    ApparelSection,
    CoachSection,
    FaqSection,
    DownloadSection,
  ],
  template: `
    <landing-hero-section />
    <landing-marquee-band />
    <landing-capabilities-section />
    <landing-steps-section />
    <landing-apparel-section />
    <landing-coach-section />
    <landing-faq-section />
    <landing-download-section />
  `,
})
export class HomePage {}
