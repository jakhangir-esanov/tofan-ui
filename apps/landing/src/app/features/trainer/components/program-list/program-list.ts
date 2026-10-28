import { Component, input } from '@angular/core';
import { LandingKey } from '@landing/core/i18n/landing-dictionary';
import { LandingTranslatePipe } from '@landing/core/i18n/landing-translate.pipe';
import { Icon } from '@landing/shared/icon/icon';
import { IconName } from '@landing/shared/icon/icon-name';
import { GOAL_LABELS } from '../../models/goal-labels';
import { TrainerProgram } from '../../models/public-trainer';

@Component({
  selector: 'landing-program-list',
  imports: [LandingTranslatePipe, Icon],
  template: `
    <h2 class="title">
      <landing-icon [name]="icon()" />
      {{ title() | t }}
    </h2>
    @if (programs().length === 0) {
      <p class="empty">{{ 'trainer.noPrograms' | t }}</p>
    } @else {
      <ul class="list">
        @for (program of programs(); track $index) {
          <li class="row">
            <span class="program">{{ program.name ?? ('trainer.untitledProgram' | t) }}</span>
            @if (program.goal; as goal) {
              <span class="goal">{{ goalLabels[goal] | t }}</span>
            }
          </li>
        }
      </ul>
    }
  `,
  styleUrl: './program-list.css',
})
export class ProgramList {
  readonly title = input.required<LandingKey>();
  readonly icon = input.required<IconName>();
  readonly programs = input.required<readonly TrainerProgram[]>();

  protected readonly goalLabels = GOAL_LABELS;
}
